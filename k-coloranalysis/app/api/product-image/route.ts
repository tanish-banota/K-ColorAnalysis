type UnsplashSearchResponse = {
  results: Array<{
    id: string;
    urls: { regular: string; small: string };
    alt_description: string | null;
    user: { name: string; links: { html: string } };
  }>;
};

type ImagePayload = {
  url: string | null;
  attribution?: { photographer: string; photographerUrl: string };
  reason?: "missing_key" | "no_results" | "unsplash_error";
};

const cache = new Map<string, ImagePayload>();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");

  const category = searchParams.get("category");

  if (!query) {
    return Response.json({ error: "query required" }, { status: 400 });
  }
  const enriched =
  category === "clothing"
    ? `${query} clothing garment`
    : category === "jewelry"
    ? `${query} jewelry accessory`
    : query;

  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    return Response.json({ url: null, reason: "missing_key" } satisfies ImagePayload);
  }

  const cacheKey = `${category ?? "none"}:${query.toLowerCase().trim()}`;

  const cached = cache.get(cacheKey);
  if (cached) return Response.json(cached);

  const response = await fetch(
    `https://api.unsplash.com/search/photos?query=${encodeURIComponent(enriched)}&per_page=3&orientation=portrait&content_filter=high`,
    { headers: { Authorization: `Client-ID ${accessKey}` } },
  );

  if (!response.ok) {
    return Response.json({ url: null, reason: "unsplash_error" } satisfies ImagePayload);
  }

  const data = (await response.json()) as UnsplashSearchResponse;
  const first = data.results[0];
  if (!first) {
    const payload: ImagePayload = { url: null, reason: "no_results" };
    cache.set(cacheKey, payload);
    return Response.json(payload);
  }

  const payload: ImagePayload = {
    url: first.urls.regular,
    attribution: {
      photographer: first.user.name,
      photographerUrl: first.user.links.html,
    },
  };
  cache.set(cacheKey, payload);
  return Response.json(payload);
}
