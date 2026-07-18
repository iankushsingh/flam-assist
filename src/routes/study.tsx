import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { ArrowLeft, Layers, ListChecks } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { FlashcardViewer } from "@/components/site/FlashcardViewer";
import { QuizViewer } from "@/components/site/QuizViewer";
import type { StudyPack } from "@/lib/study.functions";
import { history, type Session } from "@/lib/history";
import { motion } from "motion/react";

export const Route = createFileRoute("/study")({
  validateSearch: z.object({
    view: z.enum(["flashcards", "quiz"]).catch("flashcards"),
  }),
  head: () => ({
    meta: [
      { title: "Study | StudyAI" },
      { name: "description", content: "Review your AI-generated flashcards and quizzes." },
      { property: "og:title", content: "Study | StudyAI" },
      { property: "og:description", content: "Review your AI-generated flashcards and quizzes." },
    ],
  }),
  component: StudyPage,
});

function StudyPage() {
  const { view } = Route.useSearch();
  const navigate = useNavigate();
  const [pack, setPack] = useState<StudyPack | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const active = await history.getActive();
        if (cancelled) return;
        if (active) {
          const safePack = normalizeStudyPack(active.pack);
          if (safePack) {
            setSession({ ...active, pack: safePack });
            setPack(safePack);
          }
        } else if (typeof sessionStorage !== "undefined") {
          const raw = sessionStorage.getItem("studyai:pack");
          if (raw) {
            setPack(normalizeStudyPack(JSON.parse(raw)));
          }
        }
      } catch (error) {
        console.warn("Unable to load active study pack", error);
        history.setActive(null);
        try {
          const raw = typeof sessionStorage !== "undefined" ? sessionStorage.getItem("studyai:pack") : null;
          if (raw && !cancelled) {
            setPack(normalizeStudyPack(JSON.parse(raw)));
          }
        } catch {
          // Invalid browser cache should never crash the study route.
        }
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = async (patch: Partial<Session>) => {
    if (!session) return;
    const updated = await history.update(session.id, patch);
    if (updated) setSession(updated);
  };

  const handleBookmark = (idx: number, on: boolean) => {
    const cur = session?.bookmarks ?? [];
    const next = on ? Array.from(new Set([...cur, idx])) : cur.filter((i) => i !== idx);
    persist({ bookmarks: next });
  };
  const handleImportant = (idx: number, on: boolean) => {
    const cur = session?.important ?? [];
    const next = on ? Array.from(new Set([...cur, idx])) : cur.filter((i) => i !== idx);
    persist({ important: next });
  };
  const handleNote = (idx: number, text: string) => {
    const cur = { ...(session?.personalNotes ?? {}) };
    if (text) cur[idx] = text;
    else delete cur[idx];
    persist({ personalNotes: cur });
  };


  if (!hydrated) {
    return (
      <div className="page-gradient min-h-screen">
        <Navbar />
        <div className="container-app pt-28">
          <div className="mx-auto max-w-2xl space-y-3">
            <div className="skeleton h-6 w-40 rounded-full" />
            <div className="skeleton aspect-[5/3] rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!pack) {
    return (
      <div className="page-gradient min-h-screen">
        <Navbar />
        <div className="container-app pt-32 pb-24">
          <div className="mx-auto max-w-md surface-card rounded-3xl p-10 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-accent">
              <Layers className="h-6 w-6 text-primary" />
            </div>
            <h2 className="mt-5 text-xl font-semibold tracking-tight">No study pack yet</h2>
            <p className="mt-2 text-[14px] text-muted-foreground">
              Paste your notes on the home page to get started.
            </p>
            <Link
              to="/"
              className="mt-6 inline-flex h-11 items-center gap-1.5 rounded-full bg-foreground px-5 text-[14px] font-medium text-background hover:scale-[1.03] transition-transform"
            >
              <ArrowLeft className="h-4 w-4" />
              Back home
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const flashcards = Array.isArray(pack.flashcards) ? pack.flashcards : [];
  const quiz = Array.isArray(pack.quiz) ? pack.quiz : [];

  return (
    <div className="page-gradient min-h-screen">
      <Navbar />
      <main className="container-app pt-28 pb-12 md:pt-32 md:pb-16">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-2xl"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[12px] font-medium uppercase tracking-wider text-muted-foreground">
                Study pack
              </div>
              <h1 className="truncate text-2xl font-bold tracking-tight md:text-3xl">
                {pack.title}
              </h1>
            </div>
            <Link
              to="/"
              className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border border-border bg-card text-foreground px-4 text-[13px] font-medium hover:bg-muted transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Home
            </Link>
          </div>

          <div className="mt-6 inline-flex rounded-full border border-border bg-card p-1">
            {(["flashcards", "quiz"] as const).map((v) => {
              const active = v === view;
              return (
                <button
                  key={v}
                  onClick={() => navigate({ to: "/study", search: { view: v } })}
                  className={`inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-[13px] font-medium capitalize transition-all ${
                    active ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {v === "flashcards" ? <Layers className="h-3.5 w-3.5" /> : <ListChecks className="h-3.5 w-3.5" />}
                  {v}
                </button>
              );
            })}
          </div>
        </motion.div>

        <div className="mt-10">
          {view === "flashcards" ? (
            <FlashcardViewer
              cards={flashcards}
              bookmarks={session?.bookmarks ?? []}
              important={session?.important ?? []}
              personalNotes={session?.personalNotes ?? {}}
              onBookmark={handleBookmark}
              onImportant={handleImportant}
              onNote={handleNote}
            />
          ) : (
            <QuizViewer quiz={quiz} />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function normalizeStudyPack(raw: unknown): StudyPack | null {
  if (!raw || typeof raw !== "object") return null;
  const pack = raw as Partial<StudyPack>;
  return {
    title: typeof pack.title === "string" && pack.title.trim() ? pack.title : "Study Pack",
    flashcards: Array.isArray(pack.flashcards)
      ? pack.flashcards
          .filter((card) => card?.question && card?.answer)
          .map((card) => ({ question: String(card.question), answer: String(card.answer) }))
      : [],
    quiz: Array.isArray(pack.quiz)
      ? pack.quiz
          .filter((item) => item?.question && Array.isArray(item?.options))
          .map((item) => ({
            question: String(item.question),
            options: item.options.slice(0, 4).map(String),
            correctIndex: Number.isInteger(item.correctIndex) ? item.correctIndex : 0,
            explanation: String(item.explanation ?? ""),
          }))
      : [],
  };
}
