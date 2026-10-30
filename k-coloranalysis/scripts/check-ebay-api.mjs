const appId = process.env.EBAY_APP_ID;
const certId = process.env.EBAY_CERT_ID;

if (!appId || !certId) {
  console.log("eBay credentials: missing");
  process.exitCode = 1;
} else {
  try {
    const credentials = Buffer.from(`${appId}:${certId}`).toString("base64");
    const tokenResponse = await fetch("https://api.ebay.com/identity/v1/oauth2/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        scope: "https://api.ebay.com/oauth/api_scope",
      }),
    });
    const tokenData = await tokenResponse.json();
    console.log("OAuth HTTP status:", tokenResponse.status);

    if (!tokenResponse.ok) {
      console.log("OAuth error code:", tokenData.error ?? "unknown");
      process.exitCode = 1;
    } else {
      const browseResponse = await fetch(
        "https://api.ebay.com/buy/browse/v1/item_summary/search?q=blue%20shirt&limit=3",
        {
          headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
            "X-EBAY-C-MARKETPLACE-ID": "EBAY_US",
          },
        },
      );
      const browseData = await browseResponse.json();
      console.log("Browse HTTP status:", browseResponse.status);
      if (browseResponse.ok) {
        console.log("Returned items:", browseData.itemSummaries?.length ?? 0);
      } else {
        console.log("Browse error codes:",
          browseData.errors?.map((error) => error.errorId) ?? []);
        process.exitCode = 1;
      }
    }
  } catch (error) {
    console.log("Network error code:", error.cause?.code ?? "unknown");
    process.exitCode = 1;
  }
}
