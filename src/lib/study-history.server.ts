import { z } from "zod";

const LoosePackSchema = z.object({
  title: z.string().optional(),
  flashcards: z.array(z.object({ question: z.string(), answer: z.string() })).optional().default([]),
  quiz: z
    .array(
      z.object({
        question: z.string(),
        options: z.array(z.string()),
        correctIndex: z.number(),
        explanation: z.string().optional().default(""),
      }),
    )
    .optional()
    .default([]),
});

export const SessionSchema = z.object({
  id: z.string(),
  title: z.string(),
  pack: LoosePackSchema,
  quizScore: z.object({ correct: z.number(), total: z.number() }).nullable().optional(),
  timeStudiedMs: z.number().default(0),
  bookmarks: z.array(z.number()).default([]),
  important: z.array(z.number()).default([]),
  personalNotes: z.record(z.string(), z.string()).default({}),
  createdAt: z.number().optional(),
  updatedAt: z.number().optional(),
});

export function toStudySessionRow(s: z.infer<typeof SessionSchema>) {
  return {
    id: s.id,
    title: s.title,
    pack: {
      title: s.pack.title || s.title || "Study Pack",
      flashcards: s.pack.flashcards ?? [],
      quiz: s.pack.quiz ?? [],
    },
    quiz_score: s.quizScore ?? null,
    time_studied_ms: s.timeStudiedMs ?? 0,
    bookmarks: s.bookmarks ?? [],
    important: s.important ?? [],
    personal_notes: s.personalNotes ?? {},
  };
}

export function fromStudySessionRow(r: any) {
  const pack = LoosePackSchema.parse(r.pack ?? {});
  return {
    id: String(r.id),
    title: String(r.title ?? pack.title ?? "Study Pack"),
    pack: {
      title: pack.title || String(r.title ?? "Study Pack"),
      flashcards: pack.flashcards ?? [],
      quiz: pack.quiz ?? [],
    },
    quizScore: r.quiz_score ?? undefined,
    timeStudiedMs: Number(r.time_studied_ms ?? 0),
    bookmarks: Array.isArray(r.bookmarks) ? r.bookmarks.map(Number).filter(Number.isFinite) : [],
    important: Array.isArray(r.important) ? r.important.map(Number).filter(Number.isFinite) : [],
    personalNotes: r.personal_notes && typeof r.personal_notes === "object" ? r.personal_notes : {},
    createdAt: r.created_at ? new Date(r.created_at).getTime() : Date.now(),
    updatedAt: r.updated_at ? new Date(r.updated_at).getTime() : Date.now(),
  };
}