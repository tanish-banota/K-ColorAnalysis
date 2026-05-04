"use client";

import type { RecommendationItem } from "@/lib/k-color-analysis";
import { useProductImage } from "@/lib/useProductImage";

type EditorialCardProps = {
  item: RecommendationItem;
};

export function EditorialCard({ item }: EditorialCardProps) {
  const category =
    item.category === "Clothing"
      ? "clothing"
      : item.category === "Jewelry"
        ? "jewelry"
        : undefined;
  const productImage = useProductImage(item.image, category);

  return (
    <div className="overflow-hidden rounded-[26px] bg-[var(--soft)]">
      <div className="h-36 w-full overflow-hidden bg-white">
        {productImage?.url ? (
          <img
            src={productImage.url}
            alt={item.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-[var(--muted)]">
            {productImage === null ? "Loading..." : "No image"}
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="text-sm font-semibold">{item.title}</div>
        <div className="mt-2 text-xs leading-5 text-[var(--muted)]">
          {item.description}
        </div>
      </div>
    </div>
  );
}
