"use client";

import type { RefObject } from "react";
import type { CaptureIssue } from "@/lib/k-color-analysis";
import { ANALYSIS_STEPS } from "@/lib/analysisConstants";
import { GuideCorners } from "@/app/components/ui/GuideCorners";
import { ToggleCard } from "@/app/components/ui/ToggleCard";

type AnalyzeScreenProps = {
  cameraEnabled: boolean;
  cameraError: string | null;
  issues: CaptureIssue[];
  isAnalyzing: boolean;
  analysisStep: number;
  hairDyed: boolean;
  wearingMakeup: boolean;
  capturedPreview: string | null;
  videoRef: RefObject<HTMLVideoElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  onStartCamera: () => void;
  onStopCamera: () => void;
  onCapture: () => void;
  onUpload: () => void;
  onSetHairDyed: (value: boolean) => void;
  onSetWearingMakeup: (value: boolean) => void;
};

export function AnalyzeScreen({
  cameraEnabled,
  cameraError,
  issues,
  isAnalyzing,
  analysisStep,
  hairDyed,
  wearingMakeup,
  capturedPreview,
  videoRef,
  canvasRef,
  onStartCamera,
  onStopCamera,
  onCapture,
  onUpload,
  onSetHairDyed,
  onSetWearingMakeup,
}: AnalyzeScreenProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-[36px] bg-black p-5 text-white">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.24em] text-white/55">
          <span>Analyze</span>
          <span>
            {isAnalyzing
              ? `${analysisStep + 1}/${ANALYSIS_STEPS.length}`
              : "Ready"}
          </span>
        </div>

        <div className="relative mt-4 overflow-hidden rounded-[32px] border border-white/10 bg-[#050505]">
          <div className="absolute inset-0 z-10 rounded-[32px] border border-white/8" />
          <GuideCorners />

          <div className="absolute left-5 right-5 top-5 z-20 text-center text-sm text-white/80">
            Please align your full face within the screen.
            <div className="text-white/55">Please ensure there is good lighting.</div>
          </div>

          <div className="aspect-[3/5]">
            {cameraEnabled ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover opacity-90"
              />
            ) : capturedPreview ? (
              <img
                src={capturedPreview}
                alt="Captured preview"
                className="h-full w-full object-cover opacity-85"
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-5 bg-[radial-gradient(circle_at_top,rgba(63,63,70,0.6),transparent_40%),#020202]">
                <div className="flex h-28 w-28 items-center justify-center rounded-full bg-white/20">
                  <div className="h-14 w-14 animate-spin rounded-full border-4 border-white/15 border-t-white/90" />
                </div>
                <div className="h-40 w-64 rounded-t-full bg-white/35" />
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 flex gap-3">
          {!cameraEnabled ? (
            <button
              type="button"
              onClick={onStartCamera}
              className="flex-1 rounded-full bg-[var(--signal)] px-4 py-3 text-sm font-semibold text-black"
            >
              Open camera
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={onCapture}
                disabled={isAnalyzing}
                className="flex-1 rounded-full bg-white px-4 py-3 text-sm font-semibold text-black disabled:opacity-60"
              >
                Capture & analyze
              </button>
              <button
                type="button"
                onClick={onStopCamera}
                className="rounded-full border border-white/15 px-4 py-3 text-sm font-medium text-white/85"
              >
                Stop
              </button>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={onUpload}
          className="mt-3 w-full rounded-full border border-white/10 px-4 py-3 text-sm font-medium text-white/80"
        >
          Upload a front-facing photo instead
        </button>

        {cameraError && (
          <div className="mt-4 rounded-[22px] bg-white/7 px-4 py-3 text-sm text-white/72">
            {cameraError}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <ToggleCard
          title="Hair currently dyed"
          value={hairDyed}
          description="Hair gets weighted less in the final score."
          onToggle={() => onSetHairDyed(!hairDyed)}
        />
        <ToggleCard
          title="Wearing visible makeup"
          value={wearingMakeup}
          description="Skin undertone gets treated more cautiously."
          onToggle={() => onSetWearingMakeup(!wearingMakeup)}
        />
      </div>

      <div className="rounded-[28px] bg-[var(--soft)] p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
              Analysis progress
            </div>
            <div className="mt-1 text-xl font-semibold">
              {isAnalyzing ? ANALYSIS_STEPS[analysisStep] : "Ready to scan"}
            </div>
          </div>
          <div className="text-sm text-[var(--muted)]">
            {isAnalyzing
              ? `${Math.round(
                  ((analysisStep + 1) / ANALYSIS_STEPS.length) * 100,
                )}%`
              : "100% prep"}
          </div>
        </div>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-white">
          <div
            className="h-full rounded-full bg-[var(--signal)] transition-all duration-300"
            style={{
              width: `${
                isAnalyzing
                  ? ((analysisStep + 1) / ANALYSIS_STEPS.length) * 100
                  : 100
              }%`,
            }}
          />
        </div>
      </div>

      {!!issues.length && (
        <div className="space-y-3">
          {issues.map((issue) => (
            <div
              key={`${issue.code}-${issue.message}`}
              className="rounded-[22px] border border-black/5 bg-white px-4 py-4 shadow-[0_12px_28px_rgba(18,18,18,0.05)]"
            >
              <div className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
                {issue.severity}
              </div>
              <div className="mt-1 text-sm leading-6">{issue.message}</div>
            </div>
          ))}
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
