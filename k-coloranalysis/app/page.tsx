"use client";

import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import type { ChangeEvent } from "react";
import { useEffect, useRef, useState } from "react";
import {
  analyzePortrait,
  type AnalysisResult,
  type CaptureIssue,
  type ScreenTab,
} from "@/lib/k-color-analysis";
import { ANALYSIS_STEPS } from "@/lib/analysisConstants";
import {
  getSavedState,
  type SavedState,
  persistState,
  stripSnapshot,
  wait,
} from "@/lib/analysisState";
import { AnalyzeScreen } from "@/app/components/screens/AnalyzeScreen";
import { HomeScreen } from "@/app/components/screens/HomeScreen";
import { RecommendationsScreen } from "@/app/components/screens/RecommendationsScreen";
import { ProfileScreen } from "@/app/components/screens/ProfileScreen";
import { BottomNav } from "@/app/components/navigation/BottomNav";

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
  const [hairDyed, setHairDyed] = useState(initialState.preferences.hairDyed);
  const [wearingMakeup, setWearingMakeup] = useState(
    initialState.preferences.wearingMakeup,
  );
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

  useEffect(() => {
    const slimHistory = history.map(stripSnapshot);

    // Best: keep the current snapshot, strip history snapshots
    if (
      persistState({
        result,
        favorites,
        history: slimHistory,
        preferences: { hairDyed, wearingMakeup },
      })
    )
      return;

    // Fallback: also drop the current snapshot
    if (
      persistState({
        result: result ? stripSnapshot(result) : null,
        favorites,
        history: slimHistory,
        preferences: { hairDyed, wearingMakeup },
      })
    )
      return;

    // Last resort: keep favorites only
    persistState({
      result: null,
      favorites,
      history: [],
      preferences: { hairDyed, wearingMakeup },
    });
  }, [favorites, hairDyed, history, result, wearingMakeup]);


  useEffect(() => {
    if (!cameraEnabled || !videoRef.current || !streamRef.current) {
      return;
    }

    videoRef.current.srcObject = streamRef.current;
    void videoRef.current.play();
  }, [cameraEnabled]);

  useEffect(() => {
    if (activeTab !== "analyze" && cameraEnabled) {
      stopCamera();
    }
  }, [activeTab, cameraEnabled]);

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
  
      await hydrateUserData(user.id);
      setAuthLoading(false);
    };
  
    checkUser();
  }, []);

  const mergeSnapshots = (
    remote: AnalysisResult[],
    local: AnalysisResult[],
  ): AnalysisResult[] => {
    const localById = new Map(local.map((item) => [item.analysisId, item]));
    return remote.map((item) => {
      const localMatch = localById.get(item.analysisId);
      if (localMatch?.snapshotDataUrl) {
        return { ...item, snapshotDataUrl: localMatch.snapshotDataUrl };
      }
      return item;
    });
  };

  const buildSeedAnalyses = (items: AnalysisResult[], userId: string) =>
    items.map((item) => ({
      user_id: userId,
      analysis_id: item.analysisId,
      result: stripSnapshot(item),
    }));

  async function hydrateUserData(userId: string) {
    const [{ data: favoritesRows }, { data: analysesRows }, preferencesResult] =
      await Promise.all([
        supabase
          .from("favorites")
          .select("item_id")
          .eq("user_id", userId),
        supabase
          .from("analyses")
          .select("result, created_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(6),
        supabase
          .from("preferences")
          .select("hair_dyed, wearing_makeup")
          .eq("user_id", userId)
          .limit(1),
      ]);

    const remoteFavorites = favoritesRows?.map((row) => row.item_id) ?? [];
    if (remoteFavorites.length) {
      setFavorites(remoteFavorites);
    } else if (initialState.favorites.length) {
      setFavorites(initialState.favorites);
      await supabase.from("favorites").upsert(
        initialState.favorites.map((itemId) => ({
          user_id: userId,
          item_id: itemId,
        })),
        { onConflict: "user_id,item_id" },
      );
    }

    const remoteResults =
      analysesRows?.map((row) => row.result as AnalysisResult) ?? [];
    if (remoteResults.length) {
      const merged = mergeSnapshots(remoteResults, initialState.history);
      setHistory(merged);
      setResult(merged[0] ?? null);
    } else if (initialState.history.length || initialState.result) {
      const seedItems = [
        ...(initialState.result ? [initialState.result] : []),
        ...initialState.history,
      ];
      const uniqueSeed = Array.from(
        new Map(seedItems.map((item) => [item.analysisId, item])).values(),
      ).slice(0, 6);
      setHistory(uniqueSeed);
      setResult(uniqueSeed[0] ?? null);
      await supabase
        .from("analyses")
        .upsert(buildSeedAnalyses(uniqueSeed, userId), {
          onConflict: "user_id,analysis_id",
        });
    }

    const prefRow = preferencesResult.data?.[0];
    if (prefRow) {
      setHairDyed(prefRow.hair_dyed);
      setWearingMakeup(prefRow.wearing_makeup);
    } else {
      const defaults = initialState.preferences;
      setHairDyed(defaults.hairDyed);
      setWearingMakeup(defaults.wearingMakeup);
      await supabase.from("preferences").upsert({
        user_id: userId,
        hair_dyed: defaults.hairDyed,
        wearing_makeup: defaults.wearingMakeup,
      });
    }
  }

  async function openAnalyze() {
    setCapturedPreview(null);
    setActiveTab("analyze");
    if (!cameraEnabled) {
      await startCamera();
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

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

  async function toggleFavorite(itemId: string) {
    const nextFavorites = favorites.includes(itemId)
      ? favorites.filter((value) => value !== itemId)
      : favorites.concat(itemId);
    setFavorites(nextFavorites);

    if (user) {
      if (nextFavorites.includes(itemId)) {
        await supabase.from("favorites").upsert(
          {
            user_id: user.id,
            item_id: itemId,
          },
          { onConflict: "user_id,item_id" },
        );
      } else {
        await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("item_id", itemId);
      }
    }
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
      await supabase.from("analyses").upsert(
        {
          user_id: user.id,
          analysis_id: nextResult.analysisId,
          result: stripSnapshot(nextResult),
        },
        { onConflict: "user_id,analysis_id" },
      );
    }
    setActiveTab("home");
  }

  if (authLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[var(--app-canvas)] text-[var(--ink)]">
      <div className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col bg-white shadow-[0_0_0_1px_rgba(18,18,18,0.04),0_24px_80px_rgba(18,18,18,0.08)]">
        <header className="sticky top-0 z-20 border-b border-black/6 bg-white/95 px-5 py-4 backdrop-blur">
          <div className="text-2xl font-semibold tracking-[-0.03em]">
            K-Color Analysis
          </div>
        </header>
        <div className="flex-1 overflow-y-auto px-5 pb-28 pt-5">
          {activeTab === "home" && (
            <HomeScreen
              result={result}
              favorites={favorites}
              onOpenRecommendations={() => setActiveTab("recommendations")}
              onOpenAnalyze={openAnalyze}
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
              onSetHairDyed={(value) => {
                setHairDyed(value);
                if (user) {
                  void supabase.from("preferences").upsert({
                    user_id: user.id,
                    hair_dyed: value,
                    wearing_makeup: wearingMakeup,
                  });
                }
              }}
              onSetWearingMakeup={(value) => {
                setWearingMakeup(value);
                if (user) {
                  void supabase.from("preferences").upsert({
                    user_id: user.id,
                    hair_dyed: hairDyed,
                    wearing_makeup: value,
                  });
                }
              }}
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
              onRetake={openAnalyze}
              onLogout={handleLogout}
            />
          )}
        </div>

        <BottomNav
          activeTab={activeTab}
          onSelect={(value) => {
            if (value === "analyze") {
              void openAnalyze();
              return;
            }
            setActiveTab(value);
          }}
        />
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
