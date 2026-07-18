import { motion, AnimatePresence, PanInfo } from "motion/react";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Shuffle, RotateCw, Bookmark, Star, StickyNote, X } from "lucide-react";
import type { StudyPack } from "@/lib/study.functions";

type Difficulty = "easy" | "medium" | "hard" | null;

export function FlashcardViewer({
  cards,
  bookmarks = [],
  important = [],
  personalNotes = {},
  onBookmark,
  onImportant,
  onNote,
}: {
  cards: StudyPack["flashcards"];
  bookmarks?: number[];
  important?: number[];
  personalNotes?: Record<number, string>;
  onBookmark?: (idx: number, on: boolean) => void;
  onImportant?: (idx: number, on: boolean) => void;
  onNote?: (idx: number, text: string) => void;
}) {
  const [order, setOrder] = useState(() => cards.map((_, i) => i));
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [marks, setMarks] = useState<Record<number, Difficulty>>({});
  const [noteOpen, setNoteOpen] = useState(false);
  const [draft, setDraft] = useState("");

  const hasCards = cards.length > 0;
  const cardIdx = order[idx] ?? 0;
  const current = cards[cardIdx];
  const progress = hasCards ? ((idx + 1) / cards.length) * 100 : 0;
  const currentMark = marks[cardIdx] ?? null;
  const isBookmarked = bookmarks.includes(cardIdx);
  const isImportant = important.includes(cardIdx);
  const savedNote = personalNotes[cardIdx] ?? "";

  useEffect(() => {
    setDraft(savedNote);
  }, [cardIdx, savedNote]);

  if (!hasCards || !current) {
    return (
      <div className="mx-auto w-full max-w-2xl">
        <div className="surface-card rounded-3xl p-10 text-center">
          <h3 className="text-lg font-semibold tracking-tight">No flashcards in this pack</h3>
          <p className="mt-2 text-[14px] text-muted-foreground">
            This study pack was generated as a quiz only. Generate a new pack with flashcards from the home page.
          </p>
        </div>
      </div>
    );
  }

  const go = (dir: 1 | -1) => {
    setFlipped(false);
    setNoteOpen(false);
    setIdx((v) => Math.min(cards.length - 1, Math.max(0, v + dir)));
  };
  const shuffle = () => {
    setOrder((o) => [...o].sort(() => Math.random() - 0.5));
    setIdx(0);
    setFlipped(false);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "TEXTAREA" || (e.target as HTMLElement)?.tagName === "INPUT") return;
      if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (e.key.toLowerCase() === "s") shuffle();
      else if (e.key.toLowerCase() === "b") onBookmark?.(cardIdx, !isBookmarked);
      else if (e.key.toLowerCase() === "i") onImportant?.(cardIdx, !isImportant);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cardIdx, isBookmarked, isImportant, cards.length]);

  const onSwipe = (_: any, info: PanInfo) => {
    if (info.offset.x < -80) go(1);
    else if (info.offset.x > 80) go(-1);
  };

  const ringSize = 44;
  const r = 18;
  const circ = 2 * Math.PI * r;

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-4 flex items-center justify-between gap-3 text-[13px] text-muted-foreground">
        <div className="flex items-center gap-3">
          {/* Progress ring */}
          <svg width={ringSize} height={ringSize} className="-rotate-90" aria-hidden>
            <circle cx={ringSize / 2} cy={ringSize / 2} r={r} fill="none" stroke="var(--muted)" strokeWidth="4" />
            <motion.circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={r}
              fill="none"
              stroke="var(--primary)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circ}
              animate={{ strokeDashoffset: circ - (progress / 100) * circ }}
              transition={{ type: "spring", damping: 20 }}
            />
          </svg>
          <div>
            <div className="text-[12px] text-muted-foreground">
              {idx + 1} of {cards.length} · {cards.length - idx - 1} remaining
            </div>
            <div className="text-[11px] text-muted-foreground">↑←→ · Space to flip · S shuffle</div>
          </div>
        </div>
        <button
          onClick={shuffle}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 hover:bg-muted transition-colors"
        >
          <Shuffle className="h-3.5 w-3.5" /> Shuffle
        </button>
      </div>

      <div className="mt-4 relative mx-auto" style={{ perspective: "1400px" }}>
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={onSwipe}
          className={`relative w-full aspect-[5/3] ${currentMark === "hard" ? "drop-shadow-[0_0_40px_rgba(124,92,255,0.45)]" : ""}`}
        >
          <motion.button
            onClick={() => setFlipped((f) => !f)}
            className="relative h-full w-full rounded-3xl text-left focus:outline-none focus:ring-4 focus:ring-primary/20"
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformStyle: "preserve-3d" }}
            aria-label="Flip card"
          >
            <div
              className="surface-card absolute inset-0 flex flex-col justify-between rounded-3xl p-8 md:p-10"
              style={{ backfaceVisibility: "hidden" }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-medium uppercase tracking-wider text-muted-foreground">
                  Question
                </span>
                <div className="flex gap-1">
                  {isImportant && <span className="rounded-full bg-warning/15 px-2 py-0.5 text-[10px] font-medium text-warning">Important</span>}
                  {isBookmarked && <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium text-primary">Bookmarked</span>}
                </div>
              </div>
              <div className="text-2xl md:text-[28px] font-semibold leading-snug tracking-tight">
                {current.question}
              </div>
              <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                <RotateCw className="h-3.5 w-3.5" /> Tap card or press Space to flip
              </div>
            </div>
            <div
              className="surface-card absolute inset-0 flex flex-col justify-between rounded-3xl p-8 md:p-10 bg-gradient-to-br from-card to-accent"
              style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
            >
              <span className="text-[12px] font-medium uppercase tracking-wider text-primary">Answer</span>
              <div className="text-xl md:text-2xl font-medium leading-snug text-foreground">{current.answer}</div>
              <div className="text-[12px] text-muted-foreground">Tap again to flip back</div>
            </div>
          </motion.button>
        </motion.div>
      </div>

      {/* Action toolbar */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <button
          onClick={() => onBookmark?.(cardIdx, !isBookmarked)}
          aria-pressed={isBookmarked}
          aria-label="Bookmark"
          className={`inline-flex h-10 items-center gap-1.5 rounded-full border px-3.5 text-[12.5px] font-medium transition-all ${
            isBookmarked ? "border-primary/40 bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:bg-muted"
          }`}
        >
          <Bookmark className={`h-3.5 w-3.5 ${isBookmarked ? "fill-current" : ""}`} /> Bookmark
        </button>
        <button
          onClick={() => onImportant?.(cardIdx, !isImportant)}
          aria-pressed={isImportant}
          aria-label="Mark important"
          className={`inline-flex h-10 items-center gap-1.5 rounded-full border px-3.5 text-[12.5px] font-medium transition-all ${
            isImportant ? "border-warning/40 bg-warning/10 text-warning" : "border-border bg-card text-muted-foreground hover:bg-muted"
          }`}
        >
          <Star className={`h-3.5 w-3.5 ${isImportant ? "fill-current" : ""}`} /> Important
        </button>
        <button
          onClick={() => setNoteOpen((v) => !v)}
          aria-expanded={noteOpen}
          className={`inline-flex h-10 items-center gap-1.5 rounded-full border px-3.5 text-[12.5px] font-medium transition-all ${
            savedNote ? "border-primary/40 bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:bg-muted"
          }`}
        >
          <StickyNote className="h-3.5 w-3.5" /> {savedNote ? "Note added" : "Add note"}
        </button>
      </div>

      <AnimatePresence>
        {noteOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="surface-card mt-3 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div className="text-[12px] font-medium text-muted-foreground">Personal note</div>
                <button
                  onClick={() => setNoteOpen(false)}
                  aria-label="Close note"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Anything you want to remember about this card..."
                className="mt-2 min-h-[80px] w-full resize-y rounded-xl border border-border bg-background p-3 text-[13.5px] placeholder:text-muted-foreground/70 focus:border-primary/40 focus:outline-none"
              />
              <div className="mt-3 flex items-center justify-end gap-2">
                {savedNote && (
                  <button
                    onClick={() => { onNote?.(cardIdx, ""); setDraft(""); }}
                    className="inline-flex h-9 items-center rounded-full border border-border bg-card px-4 text-[12.5px] font-medium text-muted-foreground hover:bg-muted transition-colors"
                  >
                    Delete
                  </button>
                )}
                <button
                  onClick={() => { onNote?.(cardIdx, draft.trim()); setNoteOpen(false); }}
                  className="inline-flex h-9 items-center rounded-full bg-foreground px-4 text-[12.5px] font-medium text-background hover:scale-[1.03] transition-transform"
                >
                  Save note
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={() => go(-1)}
          disabled={idx === 0}
          className="inline-flex h-11 items-center gap-1.5 rounded-full border border-border bg-card px-5 text-[14px] font-medium disabled:opacity-40 hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Previous
        </button>
        <button
          onClick={() => go(1)}
          disabled={idx === cards.length - 1}
          className="inline-flex h-11 items-center gap-1.5 rounded-full bg-foreground px-5 text-[14px] font-medium text-background disabled:opacity-40 hover:scale-[1.03] transition-transform"
        >
          Next <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-6 flex justify-center gap-2">
        {(["easy", "medium", "hard"] as const).map((d) => {
          const active = currentMark === d;
          const color =
            d === "easy"
              ? "text-success border-success/30 bg-success/10"
              : d === "medium"
                ? "text-warning border-warning/30 bg-warning/10"
                : "text-primary border-primary/40 bg-primary/10";
          return (
            <button
              key={d}
              onClick={() => setMarks((m) => ({ ...m, [cardIdx]: active ? null : d }))}
              className={`min-h-10 rounded-full border px-4 text-[13px] font-medium capitalize transition-all ${
                active ? color + " scale-105" : "border-border bg-card text-muted-foreground hover:bg-muted"
              }`}
            >
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
}
