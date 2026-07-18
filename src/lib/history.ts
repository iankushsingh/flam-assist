import type { StudyPack } from "./study.functions";
import { supabase } from "@/integrations/supabase/client";
import {
  listSessions,
  upsertSession,
  renameSession,
  deleteSession,
  duplicateSession,
} from "./study-history.functions";

export type Session = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  pack: StudyPack;
  quizScore?: { correct: number; total: number };
  timeStudiedMs: number;
  bookmarks?: number[];
  important?: number[];
  personalNotes?: Record<number, string>;
};

const KEY = "studyai:sessions";
const ACTIVE = "studyai:active";

function safeUUID() {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
  } catch {}
  return `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function readLocal(): Session[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.map(normalize).filter(Boolean) : [];
  } catch {
    return [];
  }
}
function writeLocal(list: Session[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {}
}

async function isSignedIn() {
  try {
    const { data } = await supabase.auth.getSession();
    return !!data.session;
  } catch {
    return false;
  }
}

function normalize(s: any): Session {
  const pack = s?.pack && typeof s.pack === "object" ? s.pack : {};
  const notes: Record<number, string> = {};
  const src = s?.personalNotes && typeof s.personalNotes === "object" ? s.personalNotes : {};
  for (const k of Object.keys(src)) {
    const idx = Number(k);
    if (Number.isFinite(idx)) notes[idx] = String(src[k]);
  }
  return {
    id: typeof s?.id === "string" && s.id ? s.id : safeUUID(),
    title: typeof s?.title === "string" && s.title ? s.title : "Study Pack",
    createdAt: Number.isFinite(Number(s?.createdAt)) ? Number(s.createdAt) : Date.now(),
    updatedAt: Number.isFinite(Number(s?.updatedAt)) ? Number(s.updatedAt) : Date.now(),
    pack: {
      title: typeof pack.title === "string" && pack.title ? pack.title : typeof s?.title === "string" ? s.title : "Study Pack",
      flashcards: Array.isArray(pack.flashcards) ? pack.flashcards : [],
      quiz: Array.isArray(pack.quiz) ? pack.quiz : [],
    },
    quizScore: s?.quizScore ?? undefined,
    timeStudiedMs: Number.isFinite(Number(s?.timeStudiedMs)) ? Number(s.timeStudiedMs) : 0,
    bookmarks: Array.isArray(s?.bookmarks) ? s.bookmarks.map(Number).filter(Number.isFinite) : [],
    important: Array.isArray(s?.important) ? s.important.map(Number).filter(Number.isFinite) : [],
    personalNotes: notes,
  };
}

export const history = {
  async list(): Promise<Session[]> {
    if (await isSignedIn()) {
      try {
        const rows = await listSessions();
        const sessions = rows.map(normalize);
        writeLocal(sessions); // cache
        return sessions;
      } catch (e) {
        console.warn("history.list DB failed, using local", e);
      }
    }
    return readLocal().sort((a, b) => b.updatedAt - a.updatedAt);
  },

  async get(id: string): Promise<Session | null> {
    const all = await this.list();
    return all.find((s) => s.id === id) ?? null;
  },

  async create(pack: StudyPack): Promise<Session> {
    const s: Session = {
      id: safeUUID(),
      title: pack.title || "Untitled study pack",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      pack,
      timeStudiedMs: 0,
      bookmarks: [],
      important: [],
      personalNotes: {},
    };
    // Optimistic local write
    writeLocal([s, ...readLocal()]);
    if (await isSignedIn()) {
      try {
        const saved = await upsertSession({ data: s as any });
        const norm = normalize(saved);
        writeLocal([norm, ...readLocal().filter((x) => x.id !== s.id)]);
        return norm;
      } catch (e) {
        console.warn("history.create DB failed", e);
      }
    }
    return s;
  },

  async update(id: string, patch: Partial<Session>): Promise<Session | null> {
    const list = readLocal();
    const idx = list.findIndex((s) => s.id === id);
    if (idx < 0) return null;
    const next: Session = { ...list[idx], ...patch, updatedAt: Date.now() };
    list[idx] = next;
    writeLocal(list);
    if (await isSignedIn()) {
      try {
        const saved = await upsertSession({ data: next as any });
        return normalize(saved);
      } catch (e) {
        console.warn("history.update DB failed", e);
      }
    }
    return next;
  },

  async remove(id: string): Promise<void> {
    writeLocal(readLocal().filter((s) => s.id !== id));
    if (await isSignedIn()) {
      try {
        await deleteSession({ data: { id } });
      } catch (e) {
        console.warn("history.remove DB failed", e);
      }
    }
  },

  async duplicate(id: string): Promise<Session | null> {
    if (await isSignedIn()) {
      try {
        const copy = normalize(await duplicateSession({ data: { id } }));
        writeLocal([copy, ...readLocal()]);
        return copy;
      } catch (e) {
        console.warn("history.duplicate DB failed", e);
      }
    }
    const s = readLocal().find((x) => x.id === id);
    if (!s) return null;
    const copy: Session = {
      ...s,
      id: safeUUID(),
      title: `${s.title} (copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    writeLocal([copy, ...readLocal()]);
    return copy;
  },

  async rename(id: string, title: string): Promise<Session | null> {
    const list = readLocal();
    const idx = list.findIndex((s) => s.id === id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], title, updatedAt: Date.now() };
      writeLocal(list);
    }
    if (await isSignedIn()) {
      try {
        await renameSession({ data: { id, title } });
      } catch (e) {
        console.warn("history.rename DB failed", e);
      }
    }
    return list[idx] ?? null;
  },

  setActive(id: string | null) {
    if (typeof localStorage === "undefined") return;
    if (id) localStorage.setItem(ACTIVE, id);
    else localStorage.removeItem(ACTIVE);
  },

  async getActive(): Promise<Session | null> {
    if (typeof localStorage === "undefined") return null;
    const id = localStorage.getItem(ACTIVE);
    return id ? this.get(id) : null;
  },
};
