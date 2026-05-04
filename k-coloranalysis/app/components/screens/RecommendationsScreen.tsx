"use client";

import type { AnalysisResult } from "@/lib/k-color-analysis";
import {
  buildClothingByColor,
  buildJewelryItems,
} from "@/lib/k-color-analysis";
import { ColorSwatchCard } from "@/app/components/cards/ColorSwatchCard";
import { ProductCard } from "@/app/components/cards/ProductCard";
import { RecommendationRow } from "@/app/components/cards/RecommendationRow";
import { EmptyState } from "@/app/components/ui/EmptyState";

type RecommendationsScreenProps = {
  result: AnalysisResult | null;
  selectedFeed: "For you" | "Favorites";
  onFeedChange: (value: "For you" | "Favorites") => void;
  favorites: string[];
  onToggleFavorite: (value: string) => void;
};

export function RecommendationsScreen({
  result,
  selectedFeed,
  onFeedChange,
  favorites,
  onToggleFavorite,
}: RecommendationsScreenProps) {
  if (!result) {
    return (
      <EmptyState
        title="Run your first analysis"
        body="Your clothing, jewelry, and color feed appears here after a scan."
      />
    );
  }

  const clothingItems = buildClothingByColor(result);
  const jewelryItems = buildJewelryItems(result);

  const filterSaved = <T extends { id: string }>(list: T[]) =>
    selectedFeed === "Favorites"
      ? list.filter((item) => favorites.includes(item.id))
      : list;

  const primaryColors = filterSaved(
    result.bestColors.map((swatch) => ({ ...swatch, id: `color:${swatch.hex}` })),
  );
  const secondaryColors = filterSaved(
    result.secondaryBestColors.map((swatch) => ({
      ...swatch,
      id: `color:${swatch.hex}`,
    })),
  );
  const clothing = filterSaved(clothingItems);
  const jewelry = filterSaved(jewelryItems);

  const hasAny =
    primaryColors.length || secondaryColors.length || clothing.length || jewelry.length;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
          Recommendations
        </div>
        <h2 className="mt-2 text-[2rem] font-semibold tracking-[-0.04em]">
          {selectedFeed}
        </h2>
      </div>

      <div className="flex justify-center gap-6 border-b border-black/6 pb-3">
        {(["For you", "Favorites"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onFeedChange(option)}
            className={`pb-2 text-sm font-medium ${
              selectedFeed === option
                ? "border-b-2 border-black text-black"
                : "text-[var(--muted)]"
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      {!hasAny && (
        <EmptyState
          title={selectedFeed === "Favorites" ? "No favorites yet" : "Nothing to show"}
          body="Save pieces from your feed and they will appear here."
        />
      )}

      {primaryColors.length > 0 && (
        <RecommendationRow
          title={`${result.primarySeason} palette`}
          subtitle={`Your primary ${result.toneSubtype} colors`}
        >
          {primaryColors.map((swatch) => (
            <ColorSwatchCard
              key={swatch.id}
              swatch={swatch}
              saved={favorites.includes(swatch.id)}
              onToggle={() => onToggleFavorite(swatch.id)}
            />
          ))}
        </RecommendationRow>
      )}

      {secondaryColors.length > 0 && (
        <RecommendationRow
          title={`${result.secondarySeason} palette`}
          subtitle="Your secondary season colors"
        >
          {secondaryColors.map((swatch) => (
            <ColorSwatchCard
              key={swatch.id}
              swatch={swatch}
              saved={favorites.includes(swatch.id)}
              onToggle={() => onToggleFavorite(swatch.id)}
            />
          ))}
        </RecommendationRow>
      )}

      {clothing.length > 0 && (
        <RecommendationRow title="Clothing" subtitle="Pieces that flatter your palette">
          {clothing.map((item) => (
            <ProductCard
              key={item.id}
              item={item}
              category="clothing"
              saved={favorites.includes(item.id)}
              onToggle={() => onToggleFavorite(item.id)}
            />
          ))}
        </RecommendationRow>
      )}

      {jewelry.length > 0 && (
        <RecommendationRow title="Jewelry" subtitle="Metals and finishes that suit you">
          {jewelry.map((item) => (
            <ProductCard
              key={item.id}
              item={item}
              category="jewelry"
              saved={favorites.includes(item.id)}
              onToggle={() => onToggleFavorite(item.id)}
            />
          ))}
        </RecommendationRow>
      )}
    </div>
  );
}
