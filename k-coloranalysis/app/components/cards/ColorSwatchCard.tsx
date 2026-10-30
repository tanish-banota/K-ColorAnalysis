"use client";

import type { ColorSwatch } from "@/lib/k-color-analysis";

type ColorSwatchCardProps = {
  swatch: ColorSwatch & { id: string };
  saved: boolean;
  onToggle: () => void;
};

export function ColorSwatchCard({
  swatch,
  saved,
  onToggle,
}: ColorSwatchCardProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="relative flex w-36 shrink-0 flex-col overflow-hidden rounded-[22px] border border-black/5 bg-white shadow-[0_8px_24px_rgba(18,18,18,0.06)]"
    >
      <div className="h-36 w-full" style={{ backgroundColor: swatch.hex }} />
      <div className="flex items-center justify-between gap-2 px-3 py-3 text-left">
        <div>
          <div className="text-sm font-semibold">{swatch.name}</div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">
            {swatch.hex}
          </div>
        </div>
        <span
          className={`h-5 w-5 shrink-0 rounded-full border ${
            saved ? "border-black bg-black" : "border-black/20 bg-white"
          }`}
        />
      </div>
    </button>
  );
}
