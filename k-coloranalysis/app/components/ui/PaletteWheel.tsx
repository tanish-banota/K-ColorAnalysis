"use client";

import type { ColorSwatch } from "@/lib/k-color-analysis";

type PaletteWheelProps = {
  palette: ColorSwatch[];
};

export function PaletteWheel({ palette }: PaletteWheelProps) {
  const colors = palette.length
    ? palette.map((item) => item.hex)
    : ["#FFC9A8", "#F0E688", "#A8E1D1", "#91B8FF"];

  return (
    <div
      className="h-28 w-28 rounded-full"
      style={{
        background: `conic-gradient(${colors.join(", ")}, ${colors.join(", ")})`,
      }}
    >
      <div className="m-[18px] h-[76px] rounded-full bg-[var(--soft)]" />
    </div>
  );
}
