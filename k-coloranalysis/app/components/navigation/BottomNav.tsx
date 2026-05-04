"use client";

import type { ScreenTab } from "@/lib/k-color-analysis";

type BottomNavProps = {
  activeTab: ScreenTab;
  onSelect: (value: ScreenTab) => void;
};

export function BottomNav({ activeTab, onSelect }: BottomNavProps) {
  const items: Array<{ key: ScreenTab; label: string; icon: string }> = [
    { key: "home", label: "Home", icon: "\u2302" },
    { key: "analyze", label: "Analyze", icon: "\u25d4" },
    { key: "recommendations", label: "Looks", icon: "\u25a3" },
    { key: "profile", label: "Profile", icon: "\u25e6" },
  ];

  return (
    <div className="fixed bottom-0 left-1/2 z-30 flex w-full max-w-[430px] -translate-x-1/2 items-center justify-around border-t border-black/6 bg-white/95 px-4 py-3 backdrop-blur">
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={() => onSelect(item.key)}
          className={`flex flex-col items-center gap-1 rounded-full px-4 py-2 text-xs font-medium ${
            item.key === activeTab ? "text-black" : "text-[var(--muted)]"
          }`}
        >
          <span className="text-[1.35rem] leading-none">{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
}
