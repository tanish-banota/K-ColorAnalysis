"use client";

type RecommendationOrbProps = {
  label: string;
  subtitle: string;
  imageUrl?: string | null;
  swatchHex?: string;
};

export function RecommendationOrb({
  label,
  subtitle,
  imageUrl,
  swatchHex,
}: RecommendationOrbProps) {
  return (
    <div className="rounded-[24px] bg-[var(--soft)] p-3 text-center">
      <div className="mx-auto h-16 w-16 overflow-hidden rounded-full bg-white shadow-[0_8px_20px_rgba(18,18,18,0.06)]">
        {swatchHex ? (
          <div className="h-full w-full" style={{ backgroundColor: swatchHex }} />
        ) : imageUrl ? (
          <img src={imageUrl} alt="" className="h-full w-full object-cover" />
        ) : null}
      </div>
      <div className="mt-3 text-sm font-semibold">{label}</div>
      <div className="mt-1 text-xs leading-5 text-[var(--muted)]">{subtitle}</div>
    </div>
  );
}
