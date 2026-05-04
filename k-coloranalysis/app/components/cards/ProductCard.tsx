"use client";

import type { RecommendationItem } from "@/lib/k-color-analysis";
import { useProductImage } from "@/lib/useProductImage";

type ProductCardProps = {
  item: RecommendationItem;
  category: "clothing" | "jewelry";
  saved: boolean;
  onToggle: () => void;
};

export function ProductCard({
  item,
  category,
  saved,
  onToggle,
}: ProductCardProps) {
  const productImage = useProductImage(item.image, category);

  return (
    <div className="relative flex w-60 shrink-0 flex-col overflow-hidden rounded-[22px] border border-black/5 bg-white shadow-[0_8px_24px_rgba(18,18,18,0.06)]">
      <div className="relative h-60 w-full bg-[var(--soft)]">
        {productImage?.url ? (
          <img src={productImage.url} alt={item.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-[var(--muted)]">
            {productImage === null ? "Loading..." : "No image yet"}
          </div>
        )}
        <button
          type="button"
          onClick={onToggle}
          className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-medium ${
            saved ? "bg-black text-white" : "bg-white/90 text-black"
          }`}
        >
          {saved ? "Saved" : "Save"}
        </button>
      </div>
      <div className="space-y-1 px-4 py-3">
        <div className="text-sm font-semibold">{item.title}</div>
        <div className="text-xs leading-5 text-[var(--muted)]">{item.reason}</div>
        {productImage?.price && (
          <div className="pt-1 text-sm font-semibold text-black">
            {productImage.price}
          </div>
        )}
        {productImage?.itemUrl && (
          <a
            href={productImage.itemUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-block rounded-full bg-black px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-white"
          >
            View on eBay
          </a>
        )}
      </div>
    </div>
  );
}
