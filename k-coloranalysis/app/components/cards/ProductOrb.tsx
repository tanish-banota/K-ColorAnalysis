"use client";

import type { RecommendationItem } from "@/lib/k-color-analysis";
import { useProductImage } from "@/lib/useProductImage";
import { RecommendationOrb } from "@/app/components/cards/RecommendationOrb";

type ProductOrbProps = {
  label: string;
  item: RecommendationItem | undefined;
  category: "clothing" | "jewelry";
};

export function ProductOrb({ label, item, category }: ProductOrbProps) {
  const productImage = useProductImage(item?.image, category);

  return (
    <RecommendationOrb
      label={label}
      subtitle={item?.title ?? "\u2014"}
      imageUrl={productImage?.url}
    />
  );
}
