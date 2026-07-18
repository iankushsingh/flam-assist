import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bookmark, Star, StickyNote, Mail, User as UserIcon, Check, ArrowRight, Loader2 } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { supabase } from "@/integrations/supabase/client";
import { history, type Session } from "@/lib/history";
import type { User } from "@supabase/supabase-js";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile | StudyAI" },
      { name: "description", content: "Manage your StudyAI profile, bookmarks, important flashcards, and notes." },
      { property: "og:title", content: "Profile | StudyAI" },
      { property: "og:description", content: "Manage your StudyAI profile, bookmarks, important flashcards, and notes." },
    ],
  }),
  component: ProfilePage,
});

type CollectedItem = {
  sessionId: string;
  sessionTitle: string;
  cardIdx: number;
  question: string;
  answer: string;
};

type CollectedNote = CollectedItem & { note: string };

function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [name, setName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [tab, setTab] = useState<"bookmarks" | "important" | "notes">("bookmarks");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      const u = data.session?.user ?? null;
      if (!u) {
        navigate({ to: "/auth", replace: true });
        return;
      }
      setUser(u);
      setName((u.user_metadata?.full_name as string) ?? (u.user_metadata?.name as string) ?? "");
      setChecking(false);
      setSessions(await history.list());
    })();
  }, [navigate]);

  const saveName = async () => {
    setSavingName(true);
    const { data, error } = await supabase.auth.updateUser({ data: { full_name: name, name } });
    setSavingName(false);
    if (!error && data.user) {
      setUser(data.user);
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1600);
    }
  };

  const bookmarks: CollectedItem[] = [];
  const important: CollectedItem[] = [];
  const notes: CollectedNote[] = [];
  for (const s of sessions) {
    for (const i of s.bookmarks ?? []) {
      const c = s.pack.flashcards?.[i];
      if (c) bookmarks.push({ sessionId: s.id, sessionTitle: s.title, cardIdx: i, question: c.question, answer: c.answer });
    }
    for (const i of s.important ?? []) {
      const c = s.pack.flashcards?.[i];
      if (c) important.push({ sessionId: s.id, sessionTitle: s.title, cardIdx: i, question: c.question, answer: c.answer });
    }
    for (const [k, v] of Object.entries(s.personalNotes ?? {})) {
      const i = Number(k);
      const c = s.pack.flashcards?.[i];
      if (c && v) notes.push({ sessionId: s.id, sessionTitle: s.title, cardIdx: i, question: c.question, answer: c.answer, note: v });
    }
  }

  const openSession = (id: string) => {
    history.setActive(id);
    navigate({ to: "/study", search: { view: "flashcards" } });
  };

  if (checking) {
    return (
      <div className="page-gradient min-h-screen">
        <Navbar />
        <div className="container-app pt-32 pb-24">
          <div className="mx-auto max-w-2xl surface-card rounded-3xl p-10 text-center text-muted-foreground">
            <Loader2 className="mx-auto h-5 w-5 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  const created = user?.created_at ? new Date(user.created_at).toLocaleDateString() : "—";
  const initial = (name || user?.email || "?").slice(0, 1).toUpperCase();

  const counts = { bookmarks: bookmarks.length, important: important.length, notes: notes.length };
  const active = tab === "bookmarks" ? bookmarks : tab === "important" ? important : notes;

  return (
    <div className="page-gradient min-h-screen">
      <Navbar />
      <main className="container-app pt-28 pb-16 md:pt-32">
        <div className="mx-auto max-w-4xl">
          {/* Header card */}
          <div className="surface-card rounded-3xl p-6 md:p-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:gap-6">
              <div className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-foreground text-background text-2xl font-semibold">
                {initial}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[12px] font-medium uppercase tracking-wider text-muted-foreground">Your profile</div>
                <h1 className="mt-1 truncate text-2xl font-bold tracking-tight md:text-3xl">
                  {name || user?.email?.split("@")[0]}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> {user?.email}</span>
                  <span>Member since {created}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-[12px] font-medium text-muted-foreground">Email (locked)</label>
                <div className="mt-1.5 flex h-11 items-center gap-2 rounded-xl border border-border bg-muted/40 px-3 text-[14px] text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" /> {user?.email}
                </div>
              </div>
              <div>
                <label className="text-[12px] font-medium text-muted-foreground">Display name</label>
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="relative flex-1">
                    <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="h-11 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-[14px] focus:border-primary/40 focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={saveName}
                    disabled={savingName}
                    className="inline-flex h-11 items-center gap-1.5 rounded-xl bg-foreground px-4 text-[13px] font-medium text-background disabled:opacity-60 hover:scale-[1.03] transition-transform"
                  >
                    {savingName ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : savedFlash ? <Check className="h-3.5 w-3.5" /> : null}
                    {savedFlash ? "Saved" : "Save"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats + Tabs */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            {([
              { key: "bookmarks", label: "Bookmarks", icon: Bookmark, count: counts.bookmarks },
              { key: "important", label: "Important", icon: Star, count: counts.important },
              { key: "notes", label: "Notes", icon: StickyNote, count: counts.notes },
            ] as const).map(({ key, label, icon: Icon, count }) => {
              const on = tab === key;
              return (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`surface-card rounded-2xl p-4 text-left transition-all ${on ? "ring-2 ring-primary/40" : "hover:bg-muted/40"}`}
                >
                  <div className="flex items-center justify-between">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-2xl font-bold tracking-tight">{count}</span>
                  </div>
                  <div className="mt-1 text-[12.5px] font-medium text-muted-foreground">{label}</div>
                </button>
              );
            })}
          </div>

          {/* List */}
          <div className="mt-6 space-y-3">
            {active.length === 0 ? (
              <div className="surface-card rounded-2xl p-8 text-center text-[14px] text-muted-foreground">
                Nothing here yet. Open a study pack and {tab === "notes" ? "add a note" : `mark cards as ${tab === "bookmarks" ? "bookmarks" : "important"}`}.
                <div className="mt-4">
                  <Link to="/" className="inline-flex h-10 items-center gap-1.5 rounded-full bg-foreground px-4 text-[13px] font-medium text-background hover:scale-[1.03] transition-transform">
                    Generate a pack <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              active.map((item, i) => (
                <button
                  key={`${item.sessionId}-${item.cardIdx}-${i}`}
                  onClick={() => openSession(item.sessionId)}
                  className="surface-card w-full rounded-2xl p-5 text-left transition-all hover:bg-muted/30"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground truncate">
                      {item.sessionTitle}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-primary">
                      Open <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                  <div className="mt-2 text-[15px] font-semibold leading-snug">{item.question}</div>
                  <div className="mt-1 text-[13.5px] text-muted-foreground line-clamp-2">{item.answer}</div>
                  {"note" in item && (
                    <div className="mt-3 rounded-xl border border-border bg-muted/40 p-3 text-[13px] text-foreground">
                      <div className="mb-1 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                        <StickyNote className="h-3 w-3" /> Your note
                      </div>
                      {(item as CollectedNote).note}
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
