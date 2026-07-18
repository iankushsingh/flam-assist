CREATE TABLE public.study_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  pack jsonb NOT NULL,
  quiz_score jsonb,
  time_studied_ms bigint NOT NULL DEFAULT 0,
  bookmarks integer[] NOT NULL DEFAULT '{}',
  important integer[] NOT NULL DEFAULT '{}',
  personal_notes jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.study_sessions TO authenticated;
GRANT ALL ON public.study_sessions TO service_role;

ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own sessions"
  ON public.study_sessions FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX study_sessions_user_updated_idx
  ON public.study_sessions (user_id, updated_at DESC);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER study_sessions_set_updated_at
  BEFORE UPDATE ON public.study_sessions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();