import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import {
  Sparkles,
  Layers,
  ListChecks,
  TrendingUp,
  ArrowRight,
  FileText,
  Brain,
  BookOpen,
  AlertCircle,
} from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { FloatingCards } from "@/components/site/FloatingCards";
import { LoadingScreen } from "@/components/site/LoadingScreen";
import { useServerFn } from "@tanstack/react-start";
import { generateStudyPack } from "@/lib/study.functions";
import { supabase } from "@/integrations/supabase/client";
import { savePending, readPending, clearPending } from "@/lib/auth-pending";
import { history } from "@/lib/history";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Home | StudyAI" },
      { name: "description", content: "Turn any notes into beautiful flashcards and quizzes with StudyAI." },
      { property: "og:title", content: "Home | StudyAI" },
      { property: "og:description", content: "Turn any notes into beautiful flashcards and quizzes with StudyAI." },
    ],
  }),
  component: Home,
});

function Home() {
  const navigate = useNavigate();
  const generate = useServerFn(generateStudyPack);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const autoRan = useRef(false);

  const MIN = 20;
  const MAX = 20000;
  const count = notes.length;
  const canGenerate = count >= MIN && count <= MAX && !loading;

  const runGenerate = async (payloadNotes: string, mode: "flashcards" | "quiz" | "both") => {
    setError(null);
    setLoading(true);
    try {
      const pack = await generate({ data: { notes: payloadNotes.trim(), mode } });
      sessionStorage.setItem("studyai:pack", JSON.stringify(pack));
      sessionStorage.setItem("studyai:mode", mode);
      const session = await history.create(pack);
      history.setActive(session.id);
      clearPending();
      navigate({ to: "/study", search: { view: mode === "quiz" ? "quiz" : "flashcards" } });
    } catch (e: any) {
      console.error(e);
      const msg = String(e?.message ?? "");
      if (msg.includes("429")) setError("Rate limit reached. Try again in a moment.");
      else if (msg.includes("402")) setError("AI credits exhausted. Add credits to continue.");
      else setError("We couldn't understand the AI response. Please retry.");
      setLoading(false);
    }
  };

  const run = async (mode: "flashcards" | "quiz" | "both") => {
    if (!canGenerate) return;
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      // Save what the user typed so we can pick up after sign-in.
      savePending({ notes, mode });
      navigate({ to: "/auth", search: { redirect: "/" } });
      return;
    }
    await runGenerate(notes, mode);
  };

  // After sign-in, restore pending notes and auto-generate.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const pending = readPending();
      if (!pending) return;
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      if (!data.session) {
        // Not signed in yet — just restore the text so it's not lost.
        setNotes((prev) => (prev ? prev : pending.notes));
        return;
      }
      if (autoRan.current) return;
      autoRan.current = true;
      setNotes(pending.notes);
      await runGenerate(pending.notes, pending.mode);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  if (loading) return <LoadingScreen />;

  return (
    <div className="page-gradient relative min-h-screen">
      <Navbar />


      <main className="pt-20">
        {/* Hero */}
        <section className="relative">
          <FloatingCards />
          <div className="container-app relative pt-8 pb-16 md:pt-12 md:pb-24">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="mx-auto flex max-w-3xl flex-col items-center text-center"
            >
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/70 backdrop-blur px-3 py-1 text-[12px] font-medium text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                AI-powered learning, in seconds
              </span>
              <h1 className="mt-6 text-[40px] leading-[1.05] font-bold tracking-[-0.02em] md:text-[56px]">
                Turn your notes into <br className="hidden md:block" />
                <span className="text-gradient-primary">interactive learning</span>
              </h1>
              <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted-foreground md:text-[17px]">
                Paste any notes, textbook chapter, lecture transcript, or topic.
                Generate beautiful flashcards and quizzes powered by AI.
              </p>
            </motion.div>

            {/* Input */}
            <motion.div
              id="generate"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.6, ease: "easeOut" }}
              className="mx-auto mt-12 max-w-3xl"
            >
              <div className="surface-card rounded-3xl p-3 shadow-[0_20px_60px_rgba(17,17,17,0.06)]">
                <div className="rounded-2xl bg-card">
                  <label htmlFor="notes" className="sr-only">
                    Study notes
                  </label>
                  <div className="flex items-center gap-2 px-5 pt-4 text-[12px] text-muted-foreground">
                    <FileText className="h-3.5 w-3.5" />
                    Your notes
                  </div>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value.slice(0, MAX))}
                    placeholder="Paste your study notes here..."
                    className="min-h-[200px] w-full resize-y bg-transparent px-5 pt-2 pb-4 text-[15px] leading-relaxed placeholder:text-muted-foreground/70 focus:outline-none"
                  />
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-3">
                    <div className="flex items-center gap-3 text-[12px] text-muted-foreground">
                      <span>
                        <span className={count > MAX * 0.9 ? "text-warning" : "text-foreground font-medium"}>
                          {count.toLocaleString()}
                        </span>{" "}
                        / {MAX.toLocaleString()} chars
                      </span>
                      {count > 0 && count < MIN && (
                        <span className="text-muted-foreground">Min {MIN} chars</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={canGenerate ? { scale: 1.03 } : {}}
                        whileTap={canGenerate ? { scale: 0.97 } : {}}
                        onClick={() => run("flashcards")}
                        disabled={!canGenerate}
                        className="inline-flex h-10 items-center gap-1.5 rounded-full border border-border bg-card text-foreground px-4 text-[14px] font-medium disabled:opacity-40 hover:bg-muted transition-colors"
                      >
                        <Layers className="h-4 w-4" />
                        Flashcards
                      </motion.button>
                      <motion.button
                        whileHover={canGenerate ? { scale: 1.03 } : {}}
                        whileTap={canGenerate ? { scale: 0.97 } : {}}
                        onClick={() => run("quiz")}
                        disabled={!canGenerate}
                        className="inline-flex h-10 items-center gap-1.5 rounded-full bg-foreground px-4 text-[14px] font-medium text-background disabled:opacity-40 hover:scale-[1.03] transition-transform"
                      >
                        <ListChecks className="h-4 w-4" />
                        Quiz
                        <ArrowRight className="h-3.5 w-3.5" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 flex items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-[14px] text-destructive"
                  role="alert"
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span className="min-w-0">{error}</span>
                </motion.div>
              )}

              {loading && (
                <div className="mt-6 grid gap-3">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="skeleton h-14 rounded-2xl" />
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="container-app mt-16 md:mt-24">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-2xl text-center"
          >
            <h2 className="text-3xl md:text-[34px] font-bold tracking-tight">
              Built for how you actually learn
            </h2>
            <p className="mt-3 text-[15px] text-muted-foreground">
              Three focused surfaces. Zero clutter. Instant, high-quality material from your notes.
            </p>
          </motion.div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              {
                icon: <Layers className="h-5 w-5" />,
                title: "Generate flashcards",
                body: "Instantly turn notes into crisp Q&A cards with smooth 3D flips.",
              },
              {
                icon: <ListChecks className="h-5 w-5" />,
                title: "Interactive quiz",
                body: "Four-option questions with plausible distractors and immediate feedback.",
              },
              {
                icon: <TrendingUp className="h-5 w-5" />,
                title: "Track progress",
                body: "Score, accuracy, and time — retry only the ones you got wrong.",
              },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="surface-card rounded-3xl p-7"
              >
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-primary to-primary-soft text-white shadow-[0_10px_30px_rgba(124,92,255,0.35)]">
                  {f.icon}
                </span>
                <h3 className="mt-5 text-[18px] font-semibold tracking-tight">{f.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">{f.body}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="container-app mt-20 md:mt-28">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl md:text-[34px] font-bold tracking-tight">How it works</h2>
            <p className="mt-3 text-[15px] text-muted-foreground">
              From raw notes to a mastered topic in three steps.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3 md:gap-6">
            {[
              { n: "01", icon: <FileText className="h-4 w-4" />, title: "Paste notes", body: "Any format — lecture, textbook, transcript, or a rough dump." },
              { n: "02", icon: <Brain className="h-4 w-4" />, title: "AI processing", body: "We extract key concepts and craft accurate Q&A material." },
              { n: "03", icon: <BookOpen className="h-4 w-4" />, title: "Study smarter", body: "Flip flashcards, take a quiz, and track what to review." },
            ].map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="relative surface-card rounded-3xl p-7"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[12px] font-mono font-medium text-primary">{s.n}</span>
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-accent text-foreground">
                    {s.icon}
                  </span>
                </div>
                <h3 className="mt-5 text-[18px] font-semibold tracking-tight">{s.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">{s.body}</p>
                {i < 2 && (
                  <ArrowRight className="hidden md:block absolute -right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-border" />
                )}
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
