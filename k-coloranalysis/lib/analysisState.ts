import type { AnalysisResult } from "@/lib/k-color-analysis";

export type SavedState = {
  result: AnalysisResult | null;
  favorites: string[];
  history: AnalysisResult[];
  preferences: {
    hairDyed: boolean;
    wearingMakeup: boolean;
  };
};

const STORAGE_KEY = "k-color-analysis-state";

export const stripSnapshot = (item: AnalysisResult): AnalysisResult => ({
  ...item,
  snapshotDataUrl: "",
});

export function persistState(state: SavedState): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function wait(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export function getSavedState(): SavedState {
  if (typeof window === "undefined") {
    return {
      result: null,
      favorites: [],
      history: [],
      preferences: {
        hairDyed: false,
        wearingMakeup: false,
      },
    };
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return {
        result: null,
        favorites: [],
        history: [],
        preferences: {
          hairDyed: false,
          wearingMakeup: false,
        },
      };
    }

    const parsed = JSON.parse(saved) as SavedState;
    return {
      result: parsed.result ?? null,
      favorites: parsed.favorites ?? [],
      history: parsed.history ?? [],
      preferences: parsed.preferences ?? {
        hairDyed: false,
        wearingMakeup: false,
      },
    };
  } catch {
    return {
      result: null,
      favorites: [],
      history: [],
      preferences: {
        hairDyed: false,
        wearingMakeup: false,
      },
    };
  }
}
