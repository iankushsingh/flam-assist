import { z } from "zod";

export const InputSchema = z.object({
  notes: z.string().min(20).max(20000),
  mode: z.enum(["flashcards", "quiz", "both"]),
});

const FlashcardSchema = z.object({
  question: z.string(),
  answer: z.string(),
});

const QuizItemSchema = z.object({
  question: z.string(),
  options: z.array(z.string()),
  correctIndex: z.number(),
  explanation: z.string().optional().default(""),
});

export const OutputSchema = z.object({
  title: z.string(),
  flashcards: z.array(FlashcardSchema),
  quiz: z.array(QuizItemSchema),
});

export type StudyPack = z.infer<typeof OutputSchema>;

function unwrap(raw: any): any {
  // Models sometimes wrap the object in an array, or nest it under `data`/`pack`/`result`.
  if (Array.isArray(raw)) return unwrap(raw[0] ?? {});
  if (raw && typeof raw === "object") {
    if (!raw.flashcards && !raw.quiz && !raw.title) {
      for (const key of ["data", "pack", "result", "studyPack", "output"]) {
        if (raw[key]) return unwrap(raw[key]);
      }
    }
  }
  return raw ?? {};
}

function pickString(obj: any, keys: string[]): string {
  for (const k of keys) {
    const v = obj?.[k];
    if (typeof v === "string" && v.trim()) return v;
  }
  return "";
}

function normalizeCorrectIndex(q: any, options: string[]): number {
  const raw = q?.correctIndex ?? q?.correct_index ?? q?.answerIndex ?? q?.answer_index ?? q?.correct;
  let idx = Number(raw);
  if (!Number.isInteger(idx)) {
    // Try matching a string answer against options.
    if (typeof raw === "string") {
      const match = options.findIndex((o) => o.trim().toLowerCase() === raw.trim().toLowerCase());
      if (match >= 0) return match;
    }
    idx = 0;
  }
  if (idx < 0 || idx >= options.length) idx = 0;
  return idx;
}

export function normalizeStudyPackOutput(raw: any): StudyPack {
  const root = unwrap(raw);
  const flashcards = Array.isArray(root?.flashcards)
    ? root.flashcards
    : Array.isArray(root?.cards)
      ? root.cards
      : [];
  const quiz = Array.isArray(root?.quiz)
    ? root.quiz
    : Array.isArray(root?.questions)
      ? root.questions
      : [];

  return {
    title:
      typeof root?.title === "string" && root.title.trim()
        ? root.title.trim()
        : "Study Pack",
    flashcards: flashcards
      .map((f: any) => ({
        question: pickString(f, ["question", "front", "q", "prompt", "term"]),
        answer: pickString(f, ["answer", "back", "a", "response", "definition"]),
      }))
      .filter((f: { question: string; answer: string }) => f.question && f.answer)
      .slice(0, 24),
    quiz: quiz
      .map((q: any) => {
        const question = pickString(q, ["question", "q", "prompt"]);
        const rawOpts = Array.isArray(q?.options)
          ? q.options
          : Array.isArray(q?.choices)
            ? q.choices
            : [];
        const options = rawOpts.slice(0, 4).map((o: any) =>
          typeof o === "string" ? o : String(o?.text ?? o?.label ?? o ?? ""),
        );
        while (options.length < 4) options.push("—");
        return {
          question,
          options,
          correctIndex: normalizeCorrectIndex(q, options),
          explanation: pickString(q, ["explanation", "rationale", "reason"]),
        };
      })
      .filter((q: { question: string }) => q.question)
      .slice(0, 12),
  };
}
