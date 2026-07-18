import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { fromStudySessionRow, SessionSchema, toStudySessionRow } from "./study-history.server";

export const listSessions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("study_sessions")
      .select("*")
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map(fromStudySessionRow);
  });

export const upsertSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => SessionSchema.parse(d))
  .handler(async ({ data, context }) => {
    const row = { ...toStudySessionRow(data), user_id: context.userId };
    const { data: saved, error } = await context.supabase
      .from("study_sessions")
      .upsert(row, { onConflict: "id" })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return fromStudySessionRow(saved);
  });

export const renameSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ id: z.string(), title: z.string().min(1).max(200) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("study_sessions")
      .update({ title: data.title })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("study_sessions")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const duplicateSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: src, error: e1 } = await context.supabase
      .from("study_sessions")
      .select("*")
      .eq("id", data.id)
      .single();
    if (e1 || !src) throw new Error(e1?.message ?? "Not found");
    const copy = {
      user_id: context.userId,
      title: `${src.title} (copy)`,
      pack: src.pack,
      quiz_score: src.quiz_score,
      time_studied_ms: 0,
      bookmarks: src.bookmarks,
      important: src.important,
      personal_notes: src.personal_notes,
    };
    const { data: saved, error } = await context.supabase
      .from("study_sessions")
      .insert(copy)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return fromStudySessionRow(saved);
  });
