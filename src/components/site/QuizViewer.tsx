import { motion, AnimatePresence } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, XCircle, Trophy, Timer, RotateCw, ChevronRight, ListChecks } from "lucide-react";
import confetti from "canvas-confetti";
import type { StudyPack } from "@/lib/study.functions";

type Result = { qi: number; picked: number; correct: boolean; ms: number };

export function QuizViewer({ quiz, onFinish }: { quiz: StudyPack["quiz"]; onFinish?: (score: number) => void }) {
  const items = useMemo(
    () =>
      (Array.isArray(quiz) ? quiz : [])
        .filter((item) => item?.question && Array.isArray(item?.options) && item.options.length > 0)
        .map((item) => {
          const options = item.options.slice(0, 4).map(String);
          while (options.length < 4) options.push("—");
          const correctIndex = Number.isInteger(item.correctIndex) && item.correctIndex >= 0 && item.correctIndex < options.length ? item.correctIndex : 0;
          return {
            question: String(item.question),
            options,
            correctIndex,
            explanation: String(item.explanation ?? ""),
          };
        }),
    [quiz],
  );
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [done, setDone] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef<number>(Date.now());
  const questionStartRef = useRef<number>(Date.now());

  const q = items[idx];
  const total = items.length;
  const progress = total > 0 ? ((idx + (picked !== null ? 1 : 0)) / total) * 100 : 0;

  useEffect(() => {
    if (total > 0 && idx >= total) {
      setIdx(0);
      setPicked(null);
      setResults([]);
      setDone(false);
    }
  }, [idx, total]);

  useEffect(() => {
    if (done) return;
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startRef.current) / 1000)), 1000);
    return () => clearInterval(t);
  }, [done]);

  useEffect(() => {
    questionStartRef.current = Date.now();
  }, [idx]);

  const pick = (i: number) => {
    if (picked !== null || !q) return;
    setPicked(i);
    const ms = Date.now() - questionStartRef.current;
    setResults((r) => [...r, { qi: idx, picked: i, correct: i === q.correctIndex, ms }]);
  };

  const next = () => {
    if (!q || picked === null) return;
    if (idx + 1 >= total) {
      setDone(true);
      const finalResults = results.some((r) => r.qi === idx)
        ? results
        : [...results, { qi: idx, picked, correct: picked === q.correctIndex, ms: Date.now() - questionStartRef.current }];
      if (finalResults.length !== results.length) setResults(finalResults);
      const score = finalResults.filter((r) => r.correct).length;
      onFinish?.(score);
      if (score === total) {
        setTimeout(() => {
          confetti({ particleCount: 140, spread: 80, origin: { y: 0.6 }, colors: ["#7C5CFF", "#22C55E", "#F59E0B"] });
        }, 250);
      }
      return;
    }
    setIdx((v) => v + 1);
    setPicked(null);
  };

  const restart = () => {
    setIdx(0);
    setPicked(null);
    setResults([]);
    setDone(false);
    setElapsed(0);
    startRef.current = Date.now();
    questionStartRef.current = Date.now();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (done || !q) return;
      const num = Number(e.key);
      if (num >= 1 && num <= q.options.length && picked === null) pick(num - 1);
      else if (e.key === "Enter" && picked !== null) next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [picked, idx, done, q]);

  const score = useMemo(() => results.filter((r) => r.correct).length, [results]);
  const avgTime = results.length ? Math.round(results.reduce((s, r) => s + r.ms, 0) / results.length / 100) / 10 : 0;

  const mmss = `${String(Math.floor(elapsed / 60)).padStart(2, "0")}:${String(elapsed % 60).padStart(2, "0")}`;

  if (!q || total === 0) {
    return (
      <div className="mx-auto w-full max-w-2xl">
        <div className="surface-card rounded-3xl p-10 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-accent text-primary">
            <ListChecks className="h-6 w-6" />
          </div>
          <h3 className="mt-5 text-lg font-semibold tracking-tight">No quiz questions in this pack</h3>
          <p className="mt-2 text-[14px] text-muted-foreground">
            Generate this topic again from the home page and StudyAI will create both quiz questions and flashcards.
          </p>
        </div>
      </div>
    );
  }

  if (done) {
    const pct = Math.round((score / total) * 100);
    const perfect = score === total;
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-2xl">
        <div className="surface-card rounded-3xl p-8 md:p-10 text-center">
          <div className="relative mx-auto grid h-20 w-20 place-items-center">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 to-transparent blur-2xl" />
            <div className="relative grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-primary to-primary-soft text-primary-foreground shadow-[0_10px_30px_rgba(124,92,255,0.35)]">
              <Trophy className="h-8 w-8" />
            </div>
          </div>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight">
            {perfect ? "Perfect score!" : pct >= 70 ? "Nice work!" : "Good try — review & retake."}
          </h2>
          <p className="mt-2 text-muted-foreground">
            You scored <span className="font-semibold text-foreground">{score} / {total}</span> ({pct}%)
          </p>
          <div className="mt-6 grid grid-cols-3 gap-3">
            <Stat label="Correct" value={score} />
            <Stat label="Time" value={mmss} />
            <Stat label="Avg / Q" value={`${avgTime}s`} />
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <button
              onClick={restart}
              className="inline-flex h-11 items-center gap-1.5 rounded-full bg-foreground px-5 text-[14px] font-medium text-background hover:scale-[1.03] transition-transform"
            >
              <RotateCw className="h-4 w-4" /> Retake quiz
            </button>
          </div>
        </div>

        <div className="mt-6 space-y-2">
          {items.map((qq, i) => {
            const r = results.find((x) => x.qi === i);
            const ok = r?.correct;
            return (
              <div key={i} className="surface-card rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  {ok ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-success" />
                  ) : (
                    <XCircle className="mt-0.5 h-5 w-5 flex-none text-destructive" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="text-[14px] font-medium">{qq.question}</div>
                    <div className="mt-1 text-[13px] text-muted-foreground">
                      Answer: <span className="text-foreground">{qq.options[qq.correctIndex]}</span>
                    </div>
                    {qq.explanation && <div className="mt-1 text-[12.5px] text-muted-foreground">{qq.explanation}</div>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-4 flex items-center justify-between text-[13px] text-muted-foreground">
        <div>
          Question <span className="text-foreground font-medium">{idx + 1}</span> of {total}
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1">
          <Timer className="h-3.5 w-3.5" /> {mmss}
        </div>
      </div>
      <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <motion.div className="h-full bg-gradient-to-r from-primary to-primary-soft" animate={{ width: `${progress}%` }} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          className="surface-card rounded-3xl p-8 md:p-10"
        >
          <h3 className="text-xl md:text-2xl font-semibold leading-snug tracking-tight">{q.question}</h3>
          <div className="mt-6 space-y-2.5">
            {q.options.map((o, i) => {
              const isCorrect = picked !== null && i === q.correctIndex;
              const isWrong = picked === i && i !== q.correctIndex;
              const dim = picked !== null && !isCorrect && !isWrong;
              return (
                <motion.button
                  key={i}
                  onClick={() => pick(i)}
                  whileHover={picked === null ? { scale: 1.01 } : undefined}
                  whileTap={picked === null ? { scale: 0.99 } : undefined}
                  disabled={picked !== null}
                  className={`flex w-full min-h-12 items-center gap-3 rounded-2xl border p-4 text-left text-[14.5px] transition-all ${
                    isCorrect
                      ? "border-success/40 bg-success/10 text-foreground"
                      : isWrong
                        ? "border-destructive/40 bg-destructive/10 text-foreground"
                        : dim
                          ? "border-border bg-card text-muted-foreground opacity-60"
                          : "border-border bg-card hover:border-primary/30 hover:bg-muted"
                  }`}
                >
                  <span
                    className={`grid h-7 w-7 flex-none place-items-center rounded-full text-[12px] font-medium ${
                      isCorrect
                        ? "bg-success text-white"
                        : isWrong
                          ? "bg-destructive text-white"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className="flex-1">{o}</span>
                  {isCorrect && <CheckCircle2 className="h-5 w-5 text-success" />}
                  {isWrong && <XCircle className="h-5 w-5 text-destructive" />}
                </motion.button>
              );
            })}
          </div>

          <AnimatePresence>
            {picked !== null && q.explanation && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-5 rounded-2xl border border-border bg-muted/60 p-4 text-[13.5px] text-muted-foreground"
              >
                <span className="font-medium text-foreground">Why: </span>
                {q.explanation}
              </motion.div>
            )}
          </AnimatePresence>

          {picked !== null && (
            <div className="mt-6 flex justify-end">
              <button
                onClick={next}
                className="inline-flex h-11 items-center gap-1.5 rounded-full bg-foreground px-5 text-[14px] font-medium text-background hover:scale-[1.03] transition-transform"
              >
                {idx + 1 === total ? "See results" : "Next"} <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
      <div className="mt-3 hidden text-center text-[11.5px] text-muted-foreground lg:block">Tip: press 1–{q.options.length} to answer, Enter for next</div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-xl font-semibold tracking-tight">{value}</div>
    </div>
  );
}
