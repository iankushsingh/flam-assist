import { motion } from "motion/react";
import { Brain, CheckCircle2, Loader2, TrendingUp } from "lucide-react";

const cards = [
  {
    title: "Flashcard",
    body: "What is the mitochondrion's primary role?",
    footer: "Tap to flip",
    icon: <Brain className="h-4 w-4" />,
    pos: "left-[6%] top-[8%] rotate-[-6deg]",
    delay: 0,
  },
  {
    title: "Quiz",
    body: "Which of these best describes Big-O?",
    footer: "4 options",
    icon: <CheckCircle2 className="h-4 w-4" />,
    pos: "right-[8%] top-[4%] rotate-[5deg]",
    delay: 0.8,
  },
  {
    title: "AI Processing",
    body: "Extracting concepts…",
    footer: "Gemini · streaming",
    icon: <Loader2 className="h-4 w-4 animate-spin" />,
    pos: "left-[14%] bottom-[10%] rotate-[3deg]",
    delay: 1.6,
  },
  {
    title: "Progress",
    body: "12 / 20 mastered",
    footer: "+8 today",
    icon: <TrendingUp className="h-4 w-4" />,
    pos: "right-[10%] bottom-[6%] rotate-[-4deg]",
    delay: 2.2,
  },
];

export function FloatingCards() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 hidden lg:block">
      {cards.map((c, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 + i * 0.15, duration: 0.6, ease: "easeOut" }}
          className={`absolute ${c.pos}`}
        >
          <div
            className="glass-card w-[210px] rounded-2xl p-4 animate-float"
            style={{ animationDelay: `${c.delay}s` }}
          >
            <div className="flex items-center gap-2 text-[12px] font-medium text-muted-foreground">
              <span className="grid h-6 w-6 place-items-center rounded-lg bg-primary/10 text-primary">
                {c.icon}
              </span>
              {c.title}
            </div>
            <div className="mt-3 text-[13px] font-medium text-foreground leading-snug">
              {c.body}
            </div>
            <div className="mt-3 text-[11px] text-muted-foreground">{c.footer}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
