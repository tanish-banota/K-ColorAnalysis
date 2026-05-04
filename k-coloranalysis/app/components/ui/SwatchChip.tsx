"use client";

import type { ColorSwatch } from "@/lib/k-color-analysis";

type SwatchChipProps = {
  swatch: ColorSwatch;
};

export function SwatchChip({ swatch }: SwatchChipProps) {
  return (
    <div className="flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-medium">
      <span
        className="h-4 w-4 rounded-full border border-black/6"
        style={{ backgroundColor: swatch.hex }}
      />
      {swatch.name}
    </div>
  );
}
