"use client";

type RecommendationRowProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

export function RecommendationRow({
  title,
  subtitle,
  children,
}: RecommendationRowProps) {
  return (
    <section className="space-y-3">
      <div>
        <div className="text-xl font-semibold">{title}</div>
        <div className="text-sm text-[var(--muted)]">{subtitle}</div>
      </div>
      <div className="-mx-5 overflow-x-auto scrollbar-hide">
        <div className="flex gap-3 px-5 pb-2">{children}</div>
      </div>
    </section>
  );
}
