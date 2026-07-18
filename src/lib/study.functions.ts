import { createServerFn } from "@tanstack/react-start";
import { generateText, Output, NoObjectGeneratedError } from "ai";
import { getStudyModels } from "./ai-gateway.server";
import { InputSchema, OutputSchema, normalizeStudyPackOutput, type StudyPack } from "./study-pack.server";

export type { StudyPack } from "./study-pack.server";

export const generateStudyPack = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }) => {
    const { primary, fallback, hasPrimary } = getStudyModels();

    const wantFlashcards = data.mode === "flashcards" || data.mode === "both";
    const wantQuiz = data.mode === "quiz" || data.mode === "both";

    const system =
      "You are an expert study coach. Turn the user's notes into precise, high-signal study material. Questions must be answerable strictly from the notes. Keep each question focused and each answer concise (1-3 sentences). For quizzes, craft plausible distractors and set correctIndex accurately. Every quiz item MUST have exactly 4 options and correctIndex MUST be an integer 0, 1, 2, or 3.";
    const prompt = [
      `Create a study pack from these notes.`,
      `Include ${wantFlashcards ? "between 8 and 12" : "between 4 and 6"} flashcards and ${wantQuiz ? "between 6 and 8" : "between 4 and 5"} quiz questions.`,
      `Each quiz question must have exactly 4 options.`,
      `Also provide a short 3-6 word title summarising the topic.`,
      ``,
      `Return a SINGLE JSON OBJECT (not an array) with EXACTLY this shape:`,
      `{ "title": string, "flashcards": [{ "question": string, "answer": string }], "quiz": [{ "question": string, "options": [string, string, string, string], "correctIndex": 0|1|2|3, "explanation": string }] }`,
      `Use the field names "question" and "answer" for flashcards — never "front"/"back". Do not wrap the object in an array.`,
      ``,
      `NOTES:`,
      data.notes,
    ].join("\n");

    const attempt = async (model: typeof primary) => {
      try {
        const { output } = await generateText({
          model,
          output: Output.object({ schema: OutputSchema }),
          system,
          prompt,
        });
        return normalizeStudyPackOutput(output);
      } catch (error) {
        if (NoObjectGeneratedError.isInstance(error)) {
          try {
            return normalizeStudyPackOutput(JSON.parse(error.text ?? "{}"));
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
      console.warn("[study] Primary AI failed, falling back to backup provider:", err);
      return await attempt(fallback);
    }
  });

