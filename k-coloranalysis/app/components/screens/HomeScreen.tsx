"use client";

import type { AnalysisResult } from "@/lib/k-color-analysis";
import { formatConfidence, groupRecommendations } from "@/lib/k-color-analysis";
import { AvatarCard } from "@/app/components/cards/AvatarCard";
import { EditorialCard } from "@/app/components/cards/EditorialCard";
import { ProductOrb } from "@/app/components/cards/ProductOrb";
import { RecommendationOrb } from "@/app/components/cards/RecommendationOrb";
import { PaletteWheel } from "@/app/components/ui/PaletteWheel";
import { SectionHeader } from "@/app/components/ui/SectionHeader";

type HomeScreenProps = {
  result: AnalysisResult | null;
  favorites: string[];
  onOpenAnalyze: () => void;
  onOpenRecommendations: () => void;
};

export function HomeScreen({
  result,
  favorites,
  onOpenAnalyze,
  onOpenRecommendations,
}: HomeScreenProps) {
  const groups = result ? groupRecommendations(result) : null;
  const savedCount = favorites.length;

  return (
    <div className="space-y-6">
      <div className="space-y-3 pt-2">
        <div className="rounded-[30px] bg-[var(--soft)] p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-[2rem] font-semibold leading-[1.05] tracking-[-0.04em]">
                {result ? "Your Matches!" : "Find your Korean color palette."}
              </h1>
              <p className="mt-3 max-w-[14rem] text-sm leading-6 text-[var(--muted)]">
                {result
                  ? `${result.primarySeason} primary palette with ${result.secondarySeason.toLowerCase()} as your backup season.`
                  : "Analyze your selfie for seasonal colors, styling direction, and near-face recommendations."}
              </p>
            </div>
            <PaletteWheel palette={result?.bestColors ?? []} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onOpenAnalyze}
          className="rounded-[24px] bg-black px-4 py-4 text-left text-white"
        >
          <div className="text-xs uppercase tracking-[0.24em] text-white/60">
            Analysis
          </div>
          <div className="mt-2 text-lg font-semibold">Start a new scan</div>
          <div className="mt-2 text-sm text-white/70">
            Camera capture or upload
          </div>
        </button>
        <button
          type="button"
          onClick={onOpenRecommendations}
          className="rounded-[24px] bg-[var(--sand)] px-4 py-4 text-left"
        >
          <div className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
            Saved
          </div>
          <div className="mt-2 text-lg font-semibold">
            {savedCount} favorites
          </div>
          <div className="mt-2 text-sm text-[var(--muted)]">
            Clothing, jewelry, and colors
          </div>
        </button>
      </div>

      {result ? (
        <>
          <section className="rounded-[28px] border border-black/5 bg-white p-5 shadow-[0_14px_40px_rgba(18,18,18,0.05)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
                  Primary palette
                </div>
                <div className="mt-1 text-2xl font-semibold">
                  {result.primarySeason}
                </div>
                <div className="text-sm text-[var(--muted)]">
                  {result.toneSubtype} with {formatConfidence(result.confidence)}
                  {" "}confidence
                </div>
              </div>
              <div className="rounded-full bg-[var(--soft)] px-3 py-2 text-sm font-medium">
                {result.secondarySeason} secondary
              </div>
            </div>
            <div className="mt-4 rounded-[24px] bg-[var(--soft)] p-4">
              <div className="text-sm leading-6 text-[var(--muted)]">
                {result.paletteSummary}
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <SectionHeader
              title="Your Recommendations"
              actionLabel="View all"
              onAction={onOpenRecommendations}
            />
            <div className="grid grid-cols-3 gap-3">
              <ProductOrb
                label="Jewelry"
                item={groups?.jewelry[0]}
                category="jewelry"
              />
              <ProductOrb
                label="Clothing"
                item={groups?.clothing[0]}
                category="clothing"
              />
              <RecommendationOrb
                label="Colors"
                subtitle={result.bestColors[0]?.name ?? "Palette"}
                swatchHex={result.bestColors[0]?.hex}
              />
            </div>
          </section>

          <section className="space-y-3">
            <SectionHeader title="For your closet" actionLabel="For you" />
            <div className="grid grid-cols-2 gap-3">
              {groups?.clothing.slice(0, 2).map((item) => (
                <EditorialCard key={item.id} item={item} />
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <SectionHeader title="Your visual" actionLabel="Tone map" />
            <AvatarCard result={result} />
          </section>
        </>
      ) : (
        <section className="rounded-[28px] bg-[var(--soft)] p-6">
          <div className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
            Before you start
          </div>
          <div className="mt-2 text-2xl font-semibold">
            Use bright natural light and keep your full face centered.
          </div>
          <ul className="mt-4 space-y-2 text-sm leading-6 text-[var(--muted)]">
            <li>Face the light instead of standing under it.</li>
            <li>Keep hats, hands, and heavy shadows away from your face.</li>
            <li>Upload a front-facing image if your browser blocks the camera.</li>
          </ul>
        </section>
      )}
    </div>
  );
}
