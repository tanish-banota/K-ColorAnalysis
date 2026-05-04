"use client";

type ProfileLineProps = {
  label: string;
  value: string;
};

export function ProfileLine({ label, value }: ProfileLineProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="text-sm text-[var(--muted)]">{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}
