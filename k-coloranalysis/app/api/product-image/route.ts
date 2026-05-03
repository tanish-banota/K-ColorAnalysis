type EbayTokenResponse = {
  access_token: string;
  expires_in: number;
  token_type: string;
};

type EbayItemSummary = {
  itemId: string;
  title: string;
  image?: { imageUrl: string };
  thumbnailImages?: Array<{ imageUrl: string }>;
  itemWebUrl: string;
  seller?: { username: string };
  price?: { value: string; currency: string };
};

type EbayBrowseResponse = {
  itemSummaries?: EbayItemSummary[];
};

type ImagePayload = {
  url: string | null;
  itemUrl?: string;
  seller?: string;
  price?: string;
  reason?: "missing_credentials" | "no_results" | "ebay_error" | "token_error";
};

const imageCache = new Map<string, ImagePayload>();
let tokenCache: { token: string; expiresAt: number } | null = null;

const EBAY_CATEGORY_IDS: Record<string, string> = {
  clothing: "11450", // Clothing, Shoes & Accessories
  jewelry: "281", // Jewelry & Watches
};

async function getAccessToken(): Promise<string | null> {
  if (tokenCache && tokenCache.expiresAt > Date.now()) {
    return tokenCache.token;
  }

  const appId = process.env.EBAY_APP_ID;
  const certId = process.env.EBAY_CERT_ID;
  if (!appId || !certId) return null;

  const creds = Buffer.from(`${appId}:${certId}`).toString("base64");

  const response = await fetch("https://api.ebay.com/identity/v1/oauth2/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${creds}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope",
  });

  if (!response.ok) return null;

  const data = (await response.json()) as EbayTokenResponse;
  tokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };
  return data.access_token;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");
  const category = searchParams.get("category");

  if (!query) {
    return Response.json({ error: "query required" }, { status: 400 });
  }

  const cacheKey = `${category ?? "none"}:${query.toLowerCase().trim()}`;
  const cached = imageCache.get(cacheKey);
  if (cached) return Response.json(cached);

  const token = await getAccessToken();
  if (!token) {
    return Response.json({
      url: null,
      reason: "missing_credentials",
    } satisfies ImagePayload);
  }

  const params = new URLSearchParams({ q: query, limit: "8" });
  const categoryId = category ? EBAY_CATEGORY_IDS[category] : undefined;
  if (categoryId) params.set("category_ids", categoryId);
  params.set("filter", "buyingOptions:{FIXED_PRICE}");

  const response = await fetch(
    `https://api.ebay.com/buy/browse/v1/item_summary/search?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-EBAY-C-MARKETPLACE-ID": "EBAY_US",
      },
    },
  );

  if (!response.ok) {
    return Response.json({
      url: null,
      reason: "ebay_error",
    } satisfies ImagePayload);
  }

  const data = (await response.json()) as EbayBrowseResponse;
  const firstWithImage = data.itemSummaries?.find(
    (item) => item.image?.imageUrl || item.thumbnailImages?.[0]?.imageUrl,
  );

  if (!firstWithImage) {
    const payload: ImagePayload = { url: null, reason: "no_results" };
    imageCache.set(cacheKey, payload);
    return Response.json(payload);
  }

  const imageUrl =
    firstWithImage.image?.imageUrl ??
    firstWithImage.thumbnailImages?.[0]?.imageUrl ??
    null;

  const payload: ImagePayload = {
    url: imageUrl,
    itemUrl: firstWithImage.itemWebUrl,
    seller: firstWithImage.seller?.username,
    price: firstWithImage.price
      ? `${firstWithImage.price.currency} ${firstWithImage.price.value}`
      : undefined,
  };
  imageCache.set(cacheKey, payload);
  return Response.json(payload);
}
