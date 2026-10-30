"use client";

type ToggleCardProps = {
  title: string;
  description: string;
  value: boolean;
  onToggle: () => void;
};

export function ToggleCard({
  title,
  description,
  value,
  onToggle,
}: ToggleCardProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`rounded-[26px] border px-4 py-4 text-left ${
        value
          ? "border-black bg-black text-white"
          : "border-black/6 bg-white text-black"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold">{title}</div>
        <div
          className={`h-6 w-11 rounded-full p-1 ${
            value ? "bg-white/20" : "bg-[var(--soft)]"
          }`}
        >
          <div
            className={`h-4 w-4 rounded-full transition-transform ${
              value
                ? "translate-x-5 bg-white"
                : "translate-x-0 bg-[var(--muted)]"
            }`}
          />
        </div>
      </div>
      <div
        className={`mt-3 text-xs leading-5 ${
          value ? "text-white/70" : "text-[var(--muted)]"
        }`}
      >
        {description}
      </div>
    </button>
  );
}
