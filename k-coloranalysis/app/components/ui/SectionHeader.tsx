"use client";

type SectionHeaderProps = {
  title: string;
  actionLabel: string;
  onAction?: () => void;
};

export function SectionHeader({
  title,
  actionLabel,
  onAction,
}: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="text-xl font-semibold">{title}</div>
      {onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="text-sm text-[var(--muted)] underline-offset-2 hover:underline"
        >
          {actionLabel}
        </button>
      ) : (
        <div className="text-sm text-[var(--muted)]">{actionLabel}</div>
      )}
    </div>
  );
}
