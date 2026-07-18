import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import { Check, Loader2, FileSearch, Sparkles, ShieldCheck } from "lucide-react";

const steps = [
  { key: "parse", label: "Parsing notes", icon: FileSearch },
  { key: "generate", label: "Generating flashcards", icon: Sparkles },
  { key: "validate", label: "Validating AI response", icon: ShieldCheck },
];

const messages = [
  "Understanding your notes…",
  "Extracting important concepts…",
  "Creating study material…",
  "Validating AI response…",
  "Almost ready…",
];

export function LoadingScreen() {
  const [stage, setStage] = useState(0);
  const [msg, setMsg] = useState(0);

  useEffect(() => {
    const a = setInterval(() => setStage((s) => Math.min(s + 1, steps.length - 1)), 2200);
    const b = setInterval(() => setMsg((m) => (m + 1) % messages.length), 1600);
    return () => {
      clearInterval(a);
      clearInterval(b);
    };
  }, []);

  return (
    <div className="page-gradient relative flex min-h-dvh items-center justify-center overflow-hidden px-4">
      {/* Skeleton preview cards behind the orb */}
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="container-app grid h-full grid-cols-1 items-center gap-4 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
              className="surface-card hidden rounded-3xl p-6 md:block"
            >
              <div className="skeleton h-3 w-16 rounded-full" />
              <div className="skeleton mt-4 h-4 w-full rounded-full" />
              <div className="skeleton mt-2 h-4 w-3/4 rounded-full" />
              <div className="skeleton mt-6 h-16 w-full rounded-2xl" />
            </motion.div>
          ))}
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Orb */}
        <div className="relative h-40 w-40">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-primary-soft opacity-50 blur-2xl animate-orb" />
          <div className="absolute inset-3 rounded-full bg-gradient-to-br from-primary to-primary-soft animate-orb" />
          <div className="absolute inset-8 rounded-full bg-background/40 backdrop-blur-md" />
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-primary/40"
            animate={{ scale: [1, 1.15], opacity: [0.6, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>

        {/* Rotating message */}
        <div className="mt-8 h-6 relative w-[280px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={messages[msg]}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
              className="absolute inset-0 text-[15px] font-medium text-foreground"
            >
              {messages[msg]}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Steps */}
        <div className="mt-10 flex flex-col gap-3">
          {steps.map((s, i) => {
            const done = i < stage;
            const active = i === stage;
            const Icon = s.icon;
            return (
              <motion.div
                key={s.key}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i }}
                className={`flex items-center gap-3 rounded-full border px-4 py-2 min-w-[280px] transition-all ${
                  done
                    ? "border-success/30 bg-success/10"
                    : active
                      ? "border-primary/40 bg-primary/10 shadow-[0_0_30px_rgba(124,92,255,0.25)]"
                      : "border-border bg-card/60"
                }`}
              >
                <span
                  className={`grid h-6 w-6 place-items-center rounded-full ${
                    done ? "bg-success text-white" : active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {done ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : active ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Icon className="h-3.5 w-3.5" />
                  )}
                </span>
                <span
                  className={`text-[13px] font-medium ${
                    done ? "text-success" : active ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {s.label}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
