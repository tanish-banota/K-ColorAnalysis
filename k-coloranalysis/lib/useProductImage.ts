"use client";

import { useEffect, useState } from "react";

export type ProductImage = {
  url: string | null;
  attribution?: { photographer: string; photographerUrl: string };
};

const memoryCache = new Map<string, ProductImage>();

export function useProductImage(
  query: string | null | undefined,
  category?: "clothing" | "jewelry",
) {
  const [data, setData] = useState<ProductImage | null>(() =>
    query ? memoryCache.get(`${category ?? "none"}:${query}`) ?? null : null,
  );

  useEffect(() => {
    if (!query) return;

    const key = `${category ?? "none"}:${query}`;
    const cached = memoryCache.get(key);
    if (cached) {
      setData(cached);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const params = new URLSearchParams({ query });
        if (category) params.set("category", category);
        const response = await fetch(`/api/product-image?${params.toString()}`);
        const payload = (await response.json()) as ProductImage;
        memoryCache.set(key, payload);
        if (!cancelled) setData(payload);
      } catch {
        if (!cancelled) setData({ url: null });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [query, category]);

  return data;
}
