import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  History as HistoryIcon,
  Trash2,
  Copy,
  Pencil,
  Play,
  Sparkles,
  ArrowLeft,
  Check,
  X,
} from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { EmptyState } from "@/components/site/States";
import { history, type Session } from "@/lib/history";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "History | StudyAI" },
      {
        name: "description",
        content:
          "Revisit, rename, duplicate, or delete your past AI-generated study sessions.",
      },
      { property: "og:title", content: "History | StudyAI" },
      { property: "og:description", content: "Revisit, rename, duplicate, or delete your past AI-generated study sessions." },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    (async () => {
      setSessions(await history.list());
      setMounted(true);
    })();
  }, []);

  const refresh = async () => setSessions(await history.list());

  const open = (s: Session) => {
    sessionStorage.setItem("studyai:pack", JSON.stringify(s.pack));
    sessionStorage.setItem("studyai:mode", "flashcards");
    history.setActive(s.id);
    navigate({ to: "/study", search: { view: "flashcards" } });
  };

  const commitRename = async (id: string) => {
    const v = renameValue.trim();
    if (v) await history.rename(id, v);
    setRenaming(null);
    setRenameValue("");
    await refresh();
  };

  return (
    <div className="page-gradient relative min-h-screen">
      <Navbar />
      <main className="container-app pt-28 pb-20 md:pt-32">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-4xl"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back home
          </Link>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="text-[12px] font-medium uppercase tracking-wider text-muted-foreground">
                Library
              </div>
              <h1 className="mt-1 text-3xl font-bold tracking-tight md:text-[34px]">
                Your study history
              </h1>
              <p className="mt-2 text-[15px] text-muted-foreground">
                Every pack you've generated, saved on your profile.
              </p>
            </div>
            <Link
              to="/"
              className="inline-flex h-10 items-center gap-1.5 rounded-full bg-foreground px-4 text-[14px] font-medium text-background transition-transform hover:scale-[1.03]"
            >
              <Sparkles className="h-4 w-4" /> New pack
            </Link>
          </div>

          <div className="mt-10">
            {!mounted ? (
              <div className="grid gap-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="skeleton h-20 rounded-2xl" />
                ))}
              </div>
            ) : sessions.length === 0 ? (
              <EmptyState
                icon={<HistoryIcon className="h-6 w-6" />}
                title="No study sessions yet"
                description="Generate your first study pack and it'll appear here for quick access later."
                action={
                  <Link
                    to="/"
                    className="inline-flex h-10 items-center gap-1.5 rounded-full bg-foreground px-4 text-[14px] font-medium text-background transition-transform hover:scale-[1.03]"
                  >
                    <Sparkles className="h-4 w-4" /> Create your first pack
                  </Link>
                }
              />
            ) : (
              <ul className="grid gap-3">
                <AnimatePresence initial={false}>
                  {sessions.map((s) => (
                    <motion.li
                      key={s.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -12 }}
                      className="surface-card group flex flex-col gap-3 rounded-3xl p-5 md:flex-row md:items-center md:justify-between"
                    >
                      <div className="min-w-0 flex-1">
                        {renaming === s.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              autoFocus
                              value={renameValue}
                              onChange={(e) => setRenameValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") commitRename(s.id);
                                if (e.key === "Escape") setRenaming(null);
                              }}
                              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-[15px] font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                            <button
                              onClick={() => commitRename(s.id)}
                              className="grid h-9 w-9 place-items-center rounded-full bg-foreground text-background"
                              aria-label="Save"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setRenaming(null)}
                              className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted-foreground hover:text-foreground"
                              aria-label="Cancel"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <h3 className="truncate text-[16px] font-semibold tracking-tight text-foreground">
                              {s.title}
                            </h3>
                            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-muted-foreground">
                              <span>{new Date(s.updatedAt).toLocaleString()}</span>
                              <span>{s.pack.flashcards.length} flashcards</span>
                              <span>{s.pack.quiz.length} questions</span>
                              {s.quizScore && (
                                <span className="rounded-full bg-accent px-2 py-0.5 text-accent-foreground">
                                  Best: {s.quizScore.correct}/{s.quizScore.total}
                                </span>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => open(s)}
                          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-foreground px-3 text-[13px] font-medium text-background transition-transform hover:scale-[1.03]"
                        >
                          <Play className="h-3.5 w-3.5" /> Open
                        </button>
                        <button
                          onClick={() => {
                            setRenaming(s.id);
                            setRenameValue(s.title);
                          }}
                          className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
                          aria-label="Rename"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={async () => {
                            await history.duplicate(s.id);
                            await refresh();
                          }}
                          className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
                          aria-label="Duplicate"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm(`Delete "${s.title}"? This can't be undone.`)) {
                              await history.remove(s.id);
                              await refresh();
                            }
                          }}
                          className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:text-destructive"
                          aria-label="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            )}
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
