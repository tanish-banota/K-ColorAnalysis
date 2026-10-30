"use client";

type EmptyStateProps = {
  title: string;
  body: string;
};

export function EmptyState({ title, body }: EmptyStateProps) {
  return (
    <div className="rounded-[30px] bg-[var(--soft)] p-6">
      <div className="text-2xl font-semibold">{title}</div>
      <div className="mt-3 text-sm leading-6 text-[var(--muted)]">{body}</div>
    </div>
  );
}
