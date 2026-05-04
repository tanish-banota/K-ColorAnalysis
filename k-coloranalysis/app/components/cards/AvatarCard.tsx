"use client";

import type { AnalysisResult } from "@/lib/k-color-analysis";
import { SwatchChip } from "@/app/components/ui/SwatchChip";

type AvatarCardProps = {
  result: AnalysisResult;
};

export function AvatarCard({ result }: AvatarCardProps) {
  return (
    <div className="rounded-[32px] bg-[var(--soft)] p-5">
      <div className="flex items-start gap-4">
        <div className="w-32 shrink-0">
          <div className="mx-auto h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-white shadow-[0_10px_24px_rgba(18,18,18,0.08)]">
            {result.snapshotDataUrl ? (
              <img
                src={result.snapshotDataUrl}
                alt="Analyzed face"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-[var(--soft)]" />
            )}
          </div>
          <div
            className="mt-4 h-32 rounded-t-[56px] border border-white/70"
            style={{
              background: `linear-gradient(180deg, ${
                result.bestColors[0]?.hex ?? "#D8C5B7"
              } 0%, ${result.neutralColors[0]?.hex ?? "#EEE2DA"} 100%)`,
            }}
          />
        </div>
        <div className="flex-1">
          <div className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
            {result.toneSubtype}
          </div>
          <div className="mt-2 text-xl font-semibold">
            Keeps your neckline and complexion balanced.
          </div>
          <div className="mt-3 text-sm leading-6 text-[var(--muted)]">
            {result.explanations[0]}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {result.bestColors.slice(0, 4).map((swatch) => (
              <SwatchChip key={swatch.hex} swatch={swatch} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
