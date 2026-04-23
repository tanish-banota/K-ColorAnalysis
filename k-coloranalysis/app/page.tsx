"use client";

import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import type { ChangeEvent, RefObject } from "react";
import { useEffect, useRef, useState } from "react";
import {
  analyzePortrait,
  formatConfidence,
  groupRecommendations,
  type AnalysisResult,
  type CaptureIssue,
  type ColorSwatch,
  type RecommendationItem,
  type ScreenTab,
} from "@/lib/k-color-analysis";
import { useProductImage } from "@/lib/useProductImage";


type SavedState = {
  result: AnalysisResult | null;
  favorites: string[];
  history: AnalysisResult[];
};

const STORAGE_KEY = "k-color-analysis-state";
const ANALYSIS_STEPS = [
  "Checking image quality",
  "Estimating face placement",
  "Sampling skin, eye, and hair tones",
  "Scoring your seasonal palette",
  "Building recommendations",
];

export default function Home() {
  const [initialState] = useState<SavedState>(() => getSavedState());
  const [activeTab, setActiveTab] = useState<ScreenTab>("home");
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(initialState.result);
  const [issues, setIssues] = useState<CaptureIssue[]>([]);
  const [favorites, setFavorites] = useState<string[]>(initialState.favorites);
  const [history, setHistory] = useState<AnalysisResult[]>(initialState.history);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [hairDyed, setHairDyed] = useState(false);
  const [wearingMakeup, setWearingMakeup] = useState(false);
  const [selectedFeed, setSelectedFeed] = useState<"For you" | "Favorites">(
    "For you",
  );

  const [user, setUser] = useState<any>(null);
  type Profile = {
    first_name: string;
    last_name: string;
  };
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const router = useRouter();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const recommendationGroups = result ? groupRecommendations(result) : null;

  useEffect(() => {
    const state: SavedState = { result, favorites, history };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [favorites, history, result]);

  useEffect(() => {
    if (!cameraEnabled || !videoRef.current || !streamRef.current) {
      return;
    }

    videoRef.current.srcObject = streamRef.current;
    void videoRef.current.play();
  }, [cameraEnabled]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
  
      if (!user) {
        router.push("/login");
        setAuthLoading(false);
        return;
      }
  
      setUser(user);
  
      const { data: existingProfile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
  
      if (error || !existingProfile) {

        const fullName = user.user_metadata?.full_name || "";
        const nameParts = fullName.split(" ");
  
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";
  
        const { data: newProfile } = await supabase
          .from("profiles")
          .insert([
            {
              id: user.id,
              first_name: firstName,
              last_name: lastName,
            },
          ])
          .select()
          .single();
  
        setProfile(newProfile);
      } else {
        setProfile(existingProfile);
      }
  
      setAuthLoading(false);
    };
  
    checkUser();
  }, []);

  async function startCamera() {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1080 },
          height: { ideal: 1440 },
        },
        audio: false,
      });

      streamRef.current = stream;
      setCameraEnabled(true);
    } catch {
      setCameraEnabled(false);
      setCameraError(
        "Camera access is unavailable. You can still upload a selfie to analyze.",
      );
      setIssues([
        {
          code: "camera_permission_denied",
          message:
            "Camera permission was denied. Upload a front-facing photo instead.",
          severity: "error",
        },
      ]);
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraEnabled(false);
  }

  function toggleFavorite(itemId: string) {
    setFavorites((current) =>
      current.includes(itemId)
        ? current.filter((value) => value !== itemId)
        : current.concat(itemId),
    );
  }

  function triggerFileInput() {
    fileInputRef.current?.click();
  }

  async function handleCapture() {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) return;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const previewUrl = canvas.toDataURL("image/jpeg", 0.92);
    setCapturedPreview(previewUrl);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((value) => resolve(value), "image/jpeg", 0.92),
    );

    if (!blob) return;

    const file = new File([blob], "camera-capture.jpg", {
      type: "image/jpeg",
    });

    await runAnalysis(file, previewUrl);
  }

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);
    setCapturedPreview(preview);
    await runAnalysis(file, preview);
  }

  async function runAnalysis(file: File, previewUrl: string) {
    setActiveTab("analyze");
    setIsAnalyzing(true);
    setAnalysisStep(0);
    setIssues([]);

    for (let index = 0; index < ANALYSIS_STEPS.length - 1; index += 1) {
      await wait(250);
      setAnalysisStep(index);
    }

    const analysis = await analyzePortrait(file, { hairDyed, wearingMakeup });
    await wait(300);
    setAnalysisStep(ANALYSIS_STEPS.length - 1);
    await wait(250);

    setIssues(analysis.issues);
    setIsAnalyzing(false);

    if (!analysis.result) return;

    const nextResult = {
      ...analysis.result,
      snapshotDataUrl: analysis.result.snapshotDataUrl || previewUrl,
    };

    setResult(nextResult);
    setHistory((current) =>
      [nextResult, ...current.filter((item) => item.analysisId !== nextResult.analysisId)].slice(
        0,
        6,
      ),
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await supabase.from("analyses").insert([
        {
          user_id: user.id,
          result: nextResult,
        },
      ]);
    }
    setActiveTab("home");
  }

  const recommendationFeed = selectedFeed === "Favorites"
    ? recommendationGroups
      ? [
          ...recommendationGroups.clothing,
          ...recommendationGroups.jewelry,
          ...recommendationGroups.colors,
        ].filter((item) => favorites.includes(item.id))
      : []
    : recommendationGroups
      ? [
          ...recommendationGroups.clothing,
          ...recommendationGroups.jewelry,
          ...recommendationGroups.colors,
        ]
      : [];

  if (authLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[var(--app-canvas)] text-[var(--ink)]">
      <div className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col bg-white shadow-[0_0_0_1px_rgba(18,18,18,0.04),0_24px_80px_rgba(18,18,18,0.08)]">
        <div className="flex-1 overflow-y-auto px-5 pb-28 pt-5">
          {activeTab === "home" && (
            <HomeScreen
              result={result}
              favorites={favorites}
              onOpenRecommendations={() => setActiveTab("recommendations")}
              onOpenAnalyze={() => setActiveTab("analyze")}
            />
          )}

          {activeTab === "analyze" && (
            <AnalyzeScreen
              cameraEnabled={cameraEnabled}
              cameraError={cameraError}
              issues={issues}
              isAnalyzing={isAnalyzing}
              analysisStep={analysisStep}
              hairDyed={hairDyed}
              wearingMakeup={wearingMakeup}
              capturedPreview={capturedPreview}
              videoRef={videoRef}
              canvasRef={canvasRef}
              onStartCamera={startCamera}
              onStopCamera={stopCamera}
              onCapture={handleCapture}
              onUpload={triggerFileInput}
              onSetHairDyed={setHairDyed}
              onSetWearingMakeup={setWearingMakeup}
            />
          )}

          {activeTab === "recommendations" && (
            <RecommendationsScreen
              result={result}
              selectedFeed={selectedFeed}
              onFeedChange={setSelectedFeed}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
            />
          )}

          {activeTab === "profile" && (
            <ProfileScreen
              user={user}
              profile={profile}
              result={result}
              history={history}
              hairDyed={hairDyed}
              wearingMakeup={wearingMakeup}
              onRetake={() => setActiveTab("analyze")}
            />
          )}
        </div>

        <BottomNav activeTab={activeTab} onSelect={setActiveTab} />
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="user"
        className="hidden"
        onChange={handleUpload}
      />
    </div>
  );
}

function HomeScreen({
  result,
  favorites,
  onOpenAnalyze,
  onOpenRecommendations,
}: {
  result: AnalysisResult | null;
  favorites: string[];
  onOpenAnalyze: () => void;
  onOpenRecommendations: () => void;
}) {
  const groups = result ? groupRecommendations(result) : null;
  const savedCount = favorites.length;

  return (
    <div className="space-y-6">
      <div className="space-y-3 pt-2">
        <div className="text-sm font-medium text-[var(--muted)]">K-Color Analysis</div>
        <div className="rounded-[30px] bg-[var(--soft)] p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-[2rem] font-semibold leading-[1.05] tracking-[-0.04em]">
                {result ? "Your Matches!" : "Find your Korean color palette."}
              </h1>
              <p className="mt-3 max-w-[14rem] text-sm leading-6 text-[var(--muted)]">
                {result
                  ? `${result.primarySeason} primary palette with ${result.secondarySeason.toLowerCase()} as your backup season.`
                  : "Analyze your selfie for seasonal colors, styling direction, and near-face recommendations."}
              </p>
            </div>
            <PaletteWheel palette={result?.bestColors ?? []} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onOpenAnalyze}
          className="rounded-[24px] bg-black px-4 py-4 text-left text-white"
        >
          <div className="text-xs uppercase tracking-[0.24em] text-white/60">
            Analysis
          </div>
          <div className="mt-2 text-lg font-semibold">Start a new scan</div>
          <div className="mt-2 text-sm text-white/70">
            Camera capture or upload
          </div>
        </button>
        <button
          type="button"
          onClick={onOpenRecommendations}
          className="rounded-[24px] bg-[var(--sand)] px-4 py-4 text-left"
        >
          <div className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
            Saved
          </div>
          <div className="mt-2 text-lg font-semibold">{savedCount} favorites</div>
          <div className="mt-2 text-sm text-[var(--muted)]">
            Clothing, jewelry, and colors
          </div>
        </button>
      </div>

      {result ? (
        <>
          <section className="rounded-[28px] border border-black/5 bg-white p-5 shadow-[0_14px_40px_rgba(18,18,18,0.05)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
                  Primary palette
                </div>
                <div className="mt-1 text-2xl font-semibold">
                  {result.primarySeason}
                </div>
                <div className="text-sm text-[var(--muted)]">
                  {result.toneSubtype} with {formatConfidence(result.confidence)} confidence
                </div>
              </div>
              <div className="rounded-full bg-[var(--soft)] px-3 py-2 text-sm font-medium">
                {result.secondarySeason} secondary
              </div>
            </div>
            <div className="mt-4 rounded-[24px] bg-[var(--soft)] p-4">
              <div className="text-sm leading-6 text-[var(--muted)]">
                {result.paletteSummary}
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <SectionHeader
              title="Your Recommendations"
              actionLabel="View all"
              onAction={onOpenRecommendations}
            />
            <div className="grid grid-cols-3 gap-3">
              <ProductOrb
                label="Jewelry"
                item={groups?.jewelry[0]}
                category="jewelry"
              />
              <ProductOrb
                label="Clothing"
                item={groups?.clothing[0]}
                category="clothing"
              />
              <RecommendationOrb
                label="Colors"
                subtitle={result.bestColors[0]?.name ?? "Palette"}
                swatchHex={result.bestColors[0]?.hex}
              />

            </div>
          </section>

          <section className="space-y-3">
            <SectionHeader title="For your closet" actionLabel="For you" />
            <div className="grid grid-cols-2 gap-3">
              {groups?.clothing.slice(0, 2).map((item) => (
                <EditorialCard key={item.id} item={item} />
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <SectionHeader title="Your visual" actionLabel="Tone map" />
            <AvatarCard result={result} />
          </section>
        </>
      ) : (
        <section className="rounded-[28px] bg-[var(--soft)] p-6">
          <div className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
            Before you start
          </div>
          <div className="mt-2 text-2xl font-semibold">
            Use bright natural light and keep your full face centered.
          </div>
          <ul className="mt-4 space-y-2 text-sm leading-6 text-[var(--muted)]">
            <li>Face the light instead of standing under it.</li>
            <li>Keep hats, hands, and heavy shadows away from your face.</li>
            <li>Upload a front-facing image if your browser blocks the camera.</li>
          </ul>
        </section>
      )}
    </div>
  );
}

function AnalyzeScreen({
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
}: {
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
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-[36px] bg-black p-5 text-white">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.24em] text-white/55">
          <span>Analyze</span>
          <span>{isAnalyzing ? `${analysisStep + 1}/${ANALYSIS_STEPS.length}` : "Ready"}</span>
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
            {isAnalyzing ? `${Math.round(((analysisStep + 1) / ANALYSIS_STEPS.length) * 100)}%` : "100% prep"}
          </div>
        </div>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-white">
          <div
            className="h-full rounded-full bg-[var(--signal)] transition-all duration-300"
            style={{
              width: `${isAnalyzing ? ((analysisStep + 1) / ANALYSIS_STEPS.length) * 100 : 100}%`,
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

function RecommendationsScreen({
  result,
  selectedFeed,
  onFeedChange,
  favorites,
  onToggleFavorite,
}: {
  result: AnalysisResult | null;
  selectedFeed: "For you" | "Favorites";
  onFeedChange: (value: "For you" | "Favorites") => void;
  favorites: string[];
  onToggleFavorite: (value: string) => void;
}) {
  if (!result) {
    return (
      <EmptyState
        title="Run your first analysis"
        body="Your clothing, jewelry, and color feed appears here after a scan."
      />
    );
  }

  const clothingItems = result.clothingRecommendations.filter(
    (item) => item.category === "Clothing",
  );
  const jewelryItems = result.clothingRecommendations.filter(
    (item) => item.category === "Jewelry",
  );

  const filterSaved = <T extends { id: string }>(list: T[]) =>
    selectedFeed === "Favorites"
      ? list.filter((item) => favorites.includes(item.id))
      : list;

  const primaryColors = filterSaved(
    result.bestColors.map((swatch) => ({ ...swatch, id: `color:${swatch.hex}` })),
  );
  const secondaryColors = filterSaved(
    result.secondaryBestColors.map((swatch) => ({
      ...swatch,
      id: `color:${swatch.hex}`,
    })),
  );
  const clothing = filterSaved(clothingItems);
  const jewelry = filterSaved(jewelryItems);

  const hasAny =
    primaryColors.length || secondaryColors.length || clothing.length || jewelry.length;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
          Recommendations
        </div>
        <h2 className="mt-2 text-[2rem] font-semibold tracking-[-0.04em]">
          {selectedFeed}
        </h2>
      </div>

      <div className="flex justify-center gap-6 border-b border-black/6 pb-3">
        {(["For you", "Favorites"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onFeedChange(option)}
            className={`pb-2 text-sm font-medium ${
              selectedFeed === option
                ? "border-b-2 border-black text-black"
                : "text-[var(--muted)]"
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      {!hasAny && (
        <EmptyState
          title={selectedFeed === "Favorites" ? "No favorites yet" : "Nothing to show"}
          body="Save pieces from your feed and they will appear here."
        />
      )}

      {primaryColors.length > 0 && (
        <RecommendationRow
          title={`${result.primarySeason} palette`}
          subtitle={`Your primary ${result.toneSubtype} colors`}
        >
          {primaryColors.map((swatch) => (
            <ColorSwatchCard
              key={swatch.id}
              swatch={swatch}
              saved={favorites.includes(swatch.id)}
              onToggle={() => onToggleFavorite(swatch.id)}
            />
          ))}
        </RecommendationRow>
      )}

      {secondaryColors.length > 0 && (
        <RecommendationRow
          title={`${result.secondarySeason} palette`}
          subtitle="Your secondary season colors"
        >
          {secondaryColors.map((swatch) => (
            <ColorSwatchCard
              key={swatch.id}
              swatch={swatch}
              saved={favorites.includes(swatch.id)}
              onToggle={() => onToggleFavorite(swatch.id)}
            />
          ))}
        </RecommendationRow>
      )}

      {clothing.length > 0 && (
        <RecommendationRow title="Clothing" subtitle="Pieces that flatter your palette">
          {clothing.map((item) => (
            <ProductCard
              key={item.id}
              item={item}
              category="clothing"
              saved={favorites.includes(item.id)}
              onToggle={() => onToggleFavorite(item.id)}
            />
          ))}
        </RecommendationRow>
      )}

      {jewelry.length > 0 && (
        <RecommendationRow title="Jewelry" subtitle="Metals and finishes that suit you">
          {jewelry.map((item) => (
            <ProductCard
              key={item.id}
              item={item}
              category="jewelry"
              saved={favorites.includes(item.id)}
              onToggle={() => onToggleFavorite(item.id)}
            />
          ))}
        </RecommendationRow>
      )}
    </div>
  );
}

function RecommendationRow({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
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

function ColorSwatchCard({
  swatch,
  saved,
  onToggle,
}: {
  swatch: ColorSwatch & { id: string };
  saved: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="relative flex w-36 shrink-0 flex-col overflow-hidden rounded-[22px] border border-black/5 bg-white shadow-[0_8px_24px_rgba(18,18,18,0.06)]"
    >
      <div
        className="h-36 w-full"
        style={{ backgroundColor: swatch.hex }}
      />
      <div className="flex items-center justify-between gap-2 px-3 py-3 text-left">
        <div>
          <div className="text-sm font-semibold">{swatch.name}</div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">
            {swatch.hex}
          </div>
        </div>
        <span
          className={`h-5 w-5 shrink-0 rounded-full border ${
            saved ? "border-black bg-black" : "border-black/20 bg-white"
          }`}
        />
      </div>
    </button>
  );
}

function ProductCard({
  item,
  category,
  saved,
  onToggle,
}: {
  item: RecommendationItem;
  category: "clothing" | "jewelry";
  saved: boolean;
  onToggle: () => void;
}) {
  const productImage = useProductImage(item.image, category);

  return (
    <div className="relative flex w-60 shrink-0 flex-col overflow-hidden rounded-[22px] border border-black/5 bg-white shadow-[0_8px_24px_rgba(18,18,18,0.06)]">
      <div className="relative h-60 w-full bg-[var(--soft)]">
        {productImage?.url ? (
          <img
            src={productImage.url}
            alt={item.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-[var(--muted)]">
            {productImage === null ? "Loading..." : "No image yet"}
          </div>
        )}
        <button
          type="button"
          onClick={onToggle}
          className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-medium ${
            saved ? "bg-black text-white" : "bg-white/90 text-black"
          }`}
        >
          {saved ? "Saved" : "Save"}
        </button>
      </div>
      <div className="space-y-1 px-4 py-3">
        <div className="text-sm font-semibold">{item.title}</div>
        <div className="text-xs leading-5 text-[var(--muted)]">{item.reason}</div>
        {productImage?.attribution && (
          <div className="pt-1 text-[9px] uppercase tracking-[0.18em] text-[var(--muted)]">
            Photo by{" "}
            <a
              href={`${productImage.attribution.photographerUrl}?utm_source=k-color-analysis&utm_medium=referral`}
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              {productImage.attribution.photographer}
            </a>{" "}
            / Unsplash
          </div>
        )}
      </div>
    </div>
  );
}


function ProfileScreen({
  user,
  profile,
  result,
  history,
  hairDyed,
  wearingMakeup,
  onRetake,
}: {
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
}) {
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
          <img
            src={result.snapshotDataUrl}
            alt="Profile"
            className="h-full w-full object-cover"
          />
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
          onClick={async () => {
            await supabase.auth.signOut();
            window.location.href = "/login";
          }}
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

function BottomNav({
  activeTab,
  onSelect,
}: {
  activeTab: ScreenTab;
  onSelect: (value: ScreenTab) => void;
}) {
  const items: Array<{ key: ScreenTab; label: string; icon: string }> = [
    { key: "home", label: "Home", icon: "⌂" },
    { key: "analyze", label: "Analyze", icon: "◔" },
    { key: "recommendations", label: "Looks", icon: "▣" },
    { key: "profile", label: "Profile", icon: "◦" },
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

function PaletteWheel({ palette }: { palette: ColorSwatch[] }) {
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

function AvatarCard({ result }: { result: AnalysisResult }) {
  return (
    <div className="rounded-[32px] bg-[var(--soft)] p-5">
      <div className="flex items-start gap-4">
        <div className="w-32 shrink-0">
          <div className="mx-auto h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-white shadow-[0_10px_24px_rgba(18,18,18,0.08)]">
            <img
              src={result.snapshotDataUrl}
              alt="Analyzed face"
              className="h-full w-full object-cover"
            />
          </div>
          <div
            className="mt-4 h-32 rounded-t-[56px] border border-white/70"
            style={{
              background: `linear-gradient(180deg, ${result.bestColors[0]?.hex ?? "#D8C5B7"} 0%, ${result.neutralColors[0]?.hex ?? "#EEE2DA"} 100%)`,
            }}
          />
        </div>
        <div className="flex-1">
          <div className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
            {result.toneSubtype}
          </div>
          <div className="mt-2 text-xl font-semibold">
            Keeps your neckline and complexion balanced.
          </div>
          <div className="mt-3 text-sm leading-6 text-[var(--muted)]">
            {result.explanations[0]}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {result.bestColors.slice(0, 4).map((swatch) => (
              <SwatchChip key={swatch.hex} swatch={swatch} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductOrb({
  label,
  item,
  category,
}: {
  label: string;
  item: RecommendationItem | undefined;
  category: "clothing" | "jewelry";
}) {
  const productImage = useProductImage(item?.image, category);
  return (
    <RecommendationOrb
      label={label}
      subtitle={item?.title ?? "—"}
      imageUrl={productImage?.url}
    />
  );
}

function RecommendationOrb({
  label,
  subtitle,
  imageUrl,
  swatchHex,
}: {
  label: string;
  subtitle: string;
  imageUrl?: string | null;
  swatchHex?: string;
}) {
  return (
    <div className="rounded-[24px] bg-[var(--soft)] p-3 text-center">
      <div className="mx-auto h-16 w-16 overflow-hidden rounded-full bg-white shadow-[0_8px_20px_rgba(18,18,18,0.06)]">
        {swatchHex ? (
          <div className="h-full w-full" style={{ backgroundColor: swatchHex }} />
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : null}
      </div>
      <div className="mt-3 text-sm font-semibold">{label}</div>
      <div className="mt-1 text-xs leading-5 text-[var(--muted)]">{subtitle}</div>
    </div>
  );
}


function EditorialCard({ item }: { item: RecommendationItem }) {
  const category =
    item.category === "Clothing"
      ? "clothing"
      : item.category === "Jewelry"
        ? "jewelry"
        : undefined;
  const productImage = useProductImage(item.image, category);

  return (
    <div className="overflow-hidden rounded-[26px] bg-[var(--soft)]">
      <div className="h-36 w-full overflow-hidden bg-white">
        {productImage?.url ? (
          <img
            src={productImage.url}
            alt={item.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-[var(--muted)]">
            {productImage === null ? "Loading..." : "No image"}
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="text-sm font-semibold">{item.title}</div>
        <div className="mt-2 text-xs leading-5 text-[var(--muted)]">
          {item.description}
        </div>
      </div>
    </div>
  );
}


function LookCard({
  item,
  compact = false,
}: {
  item: RecommendationItem;
  compact?: boolean;
}) {
  const paletteA = item.paletteTags.join(" ");
  const warm =
    /Spring|Autumn|gold|camel|olive|terracotta|warm/i.test(`${item.title} ${paletteA}`);
  const cool =
    /Summer|Winter|silver|blue|berry|cool|icy/i.test(`${item.title} ${paletteA}`);
  const background = warm
    ? "linear-gradient(180deg,#F6E6D5 0%,#D9B59B 100%)"
    : cool
      ? "linear-gradient(180deg,#F1F4F9 0%,#C3CEDF 100%)"
      : "linear-gradient(180deg,#F5F1EE 0%,#D7CEC6 100%)";

  return (
    <div className={`relative h-full w-full overflow-hidden rounded-[22px] ${compact ? "max-w-[10rem]" : ""}`}>
      <div
        className="absolute inset-0"
        style={{
          background,
        }}
      />
      <div className="relative flex h-full flex-col items-center justify-center p-4">
        {item.category === "Jewelry" ? (
          <div className="relative h-28 w-28">
            <div className="absolute inset-0 rounded-full border-[12px] border-[#D2B36B]/80" />
            <div className="absolute inset-6 rounded-full border-[8px] border-white/70" />
          </div>
        ) : item.category === "Colors" ? (
          <div className="grid grid-cols-2 gap-2">
            {["#F3DCC9", "#D1C1B3", "#A8C4B8", "#7E9DBB"].map((color) => (
              <div
                key={color}
                className="h-14 w-14 rounded-2xl shadow-[inset_0_0_0_1px_rgba(255,255,255,0.7)]"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        ) : (
          <>
            <div className="h-40 w-28 rounded-t-[18px] rounded-b-[8px] border border-black/5 bg-[rgba(255,255,255,0.7)] shadow-[0_10px_30px_rgba(18,18,18,0.08)]" />
            <div className="absolute top-[4.2rem] h-6 w-14 rounded-full border border-black/8 bg-transparent" />
          </>
        )}
      </div>
    </div>
  );
}

function ToggleCard({
  title,
  description,
  value,
  onToggle,
}: {
  title: string;
  description: string;
  value: boolean;
  onToggle: () => void;
}) {
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
      <div className={`mt-3 text-xs leading-5 ${value ? "text-white/70" : "text-[var(--muted)]"}`}>
        {description}
      </div>
    </button>
  );
}

function GuideCorners() {
  const positions = [
    "left-4 top-4 border-l border-t",
    "right-4 top-4 border-r border-t",
    "left-4 bottom-4 border-b border-l",
    "right-4 bottom-4 border-b border-r",
  ];

  return (
    <>
      {positions.map((position) => (
        <div
          key={position}
          className={`absolute z-20 h-12 w-12 border-[3px] border-[var(--signal)] ${position}`}
        />
      ))}
    </>
  );
}

function SectionHeader({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel: string;
  onAction?: () => void;
}) {
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

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[30px] bg-[var(--soft)] p-6">
      <div className="text-2xl font-semibold">{title}</div>
      <div className="mt-3 text-sm leading-6 text-[var(--muted)]">{body}</div>
    </div>
  );
}

function ProfileLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="text-sm text-[var(--muted)]">{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}

function SwatchChip({ swatch }: { swatch: ColorSwatch }) {
  return (
    <div className="flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-medium">
      <span
        className="h-4 w-4 rounded-full border border-black/6"
        style={{ backgroundColor: swatch.hex }}
      />
      {swatch.name}
    </div>
  );
}

function wait(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function getSavedState(): SavedState {
  if (typeof window === "undefined") {
    return {
      result: null,
      favorites: [],
      history: [],
    };
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return {
        result: null,
        favorites: [],
        history: [],
      };
    }

    const parsed = JSON.parse(saved) as SavedState;
    return {
      result: parsed.result ?? null,
      favorites: parsed.favorites ?? [],
      history: parsed.history ?? [],
    };
  } catch {
    return {
      result: null,
      favorites: [],
      history: [],
    };
  }
}
