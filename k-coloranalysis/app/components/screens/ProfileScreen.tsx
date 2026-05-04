"use client";

import type { User } from "@supabase/supabase-js";
import type { AnalysisResult } from "@/lib/k-color-analysis";
import { formatConfidence } from "@/lib/k-color-analysis";
import { EmptyState } from "@/app/components/ui/EmptyState";
import { ProfileLine } from "@/app/components/ui/ProfileLine";
import { SectionHeader } from "@/app/components/ui/SectionHeader";

type ProfileScreenProps = {
  user: User | null;
  profile: {
    first_name: string;
    last_name: string;
  } | null;
  result: AnalysisResult | null;
  history: AnalysisResult[];
  hairDyed: boolean;
  wearingMakeup: boolean;
  onRetake: () => void;
  onLogout: () => void;
};

export function ProfileScreen({
  user,
  profile,
  result,
  history,
  hairDyed,
  wearingMakeup,
  onRetake,
  onLogout,
}: ProfileScreenProps) {
  if (!result) {
    return (
      <EmptyState
        title="No profile data yet"
        body="Analyze a photo to save your palette, explanation, and recommendation history."
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4 pt-2">
        <div className="h-24 w-24 overflow-hidden rounded-full bg-[var(--soft)]">
          {result.snapshotDataUrl ? (
            <img
              src={result.snapshotDataUrl}
              alt="Profile"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-white/60" />
          )}
        </div>
        <div>
          <div className="text-4xl font-semibold tracking-[-0.04em]">
            {profile
              ? `${profile.first_name} ${profile.last_name || ""}`.trim()
              : "Your Name"}
          </div>
          <div className="mt-3 text-base text-[var(--muted)]">
            {result.primarySeason} primary
          </div>
        </div>
      </div>

      <div className="space-y-3 rounded-[28px] bg-[var(--soft)] p-5">
        <ProfileLine label="Email" value={user?.email ?? "Unknown"} />
        <ProfileLine
          label="Name"
          value={
            profile && (profile.first_name || profile.last_name)
              ? `${profile.first_name} ${profile.last_name || ""}`.trim()
              : user?.email ?? "Unknown"
          }
        />
        <ProfileLine label="Privacy" value="Ephemeral source photo" />
        <ProfileLine label="Hair dyed" value={hairDyed ? "Yes" : "No"} />
        <ProfileLine
          label="Visible makeup"
          value={wearingMakeup ? "Yes" : "No"}
        />
      </div>

      <button
        onClick={onLogout}
        className="mt-4 rounded-full bg-red-500 px-4 py-3 text-white"
      >
        Logout
      </button>

      <div className="rounded-[28px] border border-black/5 bg-white p-5 shadow-[0_12px_28px_rgba(18,18,18,0.05)]">
        <div className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
          Latest match
        </div>
        <div className="mt-2 text-xl font-semibold">
          {result.primarySeason} / {result.secondarySeason}
        </div>
        <div className="mt-3 text-sm leading-6 text-[var(--muted)]">
          {result.qualitySummary}
        </div>
        <button
          type="button"
          onClick={onRetake}
          className="mt-4 rounded-full bg-black px-4 py-3 text-sm font-semibold text-white"
        >
          Retake analysis
        </button>
      </div>

      <div className="space-y-3">
        <SectionHeader title="History" actionLabel={`${history.length} scans`} />
        {history.map((entry) => (
          <div
            key={entry.analysisId}
            className="flex items-center justify-between rounded-[24px] bg-[var(--soft)] px-4 py-4"
          >
            <div>
              <div className="text-lg font-semibold">{entry.toneSubtype}</div>
              <div className="text-sm text-[var(--muted)]">
                {new Date(entry.capturedAt).toLocaleDateString()}
              </div>
            </div>
            <div className="rounded-full bg-white px-3 py-2 text-sm font-medium">
              {formatConfidence(entry.confidence)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
