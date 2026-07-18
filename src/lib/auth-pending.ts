// Persist an in-progress generation across sign-in redirects.
export type PendingGeneration = {
  notes: string;
  mode: "flashcards" | "quiz" | "both";
};

const KEY = "studyai:pending";

export function savePending(p: PendingGeneration) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {}
}

export function readPending(): PendingGeneration | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const v = JSON.parse(raw);
    if (
      typeof v?.notes === "string" &&
      (v.mode === "flashcards" || v.mode === "quiz" || v.mode === "both")
    ) {
      return v;
    }
    return null;
  } catch {
    return null;
  }
}

export function clearPending() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
}
