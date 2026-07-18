import { createServerFn } from "@tanstack/react-start";
import { generateText, Output, NoObjectGeneratedError } from "ai";
import { z } from "zod";
import { getStudyModels } from "./ai-gateway.server";

const FlashcardSchema = z.object({
  question: z.string(),
  answer: z.string(),
});
const QuizItemSchema = z.object({
  question: z.string(),
  options: z.array(z.string()),
  correctIndex: z.number(),
  explanation: z.string(),
});

const RegenSchema = z.object({
  mode: z.enum([
    "harder-questions",
    "more-flashcards",
    "practice-test",
    "simplify-notes",
    "regen-difficult",
  ]),
  title: z.string(),
  notes: z.string().optional(),
  flashcards: z.array(FlashcardSchema).optional(),
  quiz: z.array(QuizItemSchema).optional(),
  difficultQuestions: z.array(z.string()).optional(),
});

// Constraint-free output schema; normalized in code.
const OutSchema = z.object({
  flashcards: z.array(FlashcardSchema),
  quiz: z.array(QuizItemSchema),
  notes: z.string(),
});

export type RegenResult = {
  flashcards: Array<{ question: string; answer: string }>;
  quiz: Array<{
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }>;
  notes?: string;
};

function normalize(raw: any): RegenResult {
  const flashcards = Array.isArray(raw?.flashcards) ? raw.flashcards : [];
  const quiz = Array.isArray(raw?.quiz) ? raw.quiz : [];
  return {
    flashcards: flashcards
      .filter((f: any) => f?.question && f?.answer)
      .slice(0, 24)
      .map((f: any) => ({
        question: String(f.question),
        answer: String(f.answer),
      })),
    quiz: quiz
      .filter(
        (q: any) =>
          q?.question && Array.isArray(q?.options) && q.options.length >= 2,
      )
      .slice(0, 12)
      .map((q: any) => {
        const options = q.options.slice(0, 4).map((o: any) => String(o));
        while (options.length < 4) options.push("—");
        let idx = Number(q.correctIndex);
        if (!Number.isInteger(idx) || idx < 0 || idx > 3) idx = 0;
        return {
          question: String(q.question),
          options,
          correctIndex: idx,
          explanation: String(q.explanation ?? ""),
        };
      }),
    notes: typeof raw?.notes === "string" && raw.notes.trim() ? raw.notes : undefined,
  };
}

const PROMPTS: Record<string, (i: any) => string> = {
  "harder-questions": (i) =>
    `Rewrite these quiz questions to be significantly harder — more nuanced, add trickier distractors, and require deeper understanding. Keep exactly 4 options each and set correctIndex (0-3) accurately. Topic: ${i.title}\n\nExisting quiz:\n${JSON.stringify(i.quiz)}`,
  "more-flashcards": (i) =>
    `Generate 8 additional flashcards on the topic "${i.title}", covering aspects NOT in the existing set. Do not repeat existing questions.\n\nExisting flashcards:\n${JSON.stringify(i.flashcards?.map((f: any) => f.question))}`,
  "practice-test": (i) =>
    `Create a comprehensive practice test of 8-10 questions on "${i.title}", mixing conceptual and applied questions. Each question must have exactly 4 options with correctIndex 0-3. Include explanations.\n\nBase it on:\n${JSON.stringify({ flashcards: i.flashcards, quiz: i.quiz })}`,
  "simplify-notes": (i) =>
    `Rewrite the user's notes in clear, simple language a beginner could understand. Then produce 6 beginner-friendly flashcards. Return the simplified explanation in the "notes" field.\n\nOriginal topic: ${i.title}\nSource material:\n${JSON.stringify({ flashcards: i.flashcards })}`,
  "regen-difficult": (i) =>
    `The user struggled with these questions. Create a NEW quiz of ${i.difficultQuestions?.length ?? 4} questions that reinforce the same concepts from a different angle, with clear explanations. Each question needs exactly 4 options with correctIndex 0-3. Topic: ${i.title}\n\nStruggled questions:\n${JSON.stringify(i.difficultQuestions)}\nContext:\n${JSON.stringify(i.flashcards)}`,
};

export const regenerateStudy = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => RegenSchema.parse(data))
  .handler(async ({ data }) => {
    const { primary, fallback, hasPrimary } = getStudyModels();
    const system =
      "You are an expert study coach. Return only the fields relevant to the requested operation (leave others as empty arrays or empty string). Never invent facts outside the provided context. Quiz items MUST have exactly 4 options and correctIndex 0-3.";
    const prompt = PROMPTS[data.mode](data);

    const attempt = async (model: typeof primary) => {
      try {
        const { output } = await generateText({
          model,
          output: Output.object({ schema: OutSchema }),
          system,
          prompt,
        });
        return normalize(output);
      } catch (error) {
        if (NoObjectGeneratedError.isInstance(error)) {
          try {
            return normalize(JSON.parse(error.text ?? "{}"));
          } catch {
            throw new Error("The AI returned an invalid response.");
          }
        }
        throw error;
      }
    };

    try {
      return await attempt(primary);
    } catch (err) {
      if (!hasPrimary) throw err;
      console.warn("[regen] Primary AI failed, falling back to backup provider:", err);
      return await attempt(fallback);
    }
  });

