import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { motion } from "motion/react";
import { Sparkles, Mail, Lock, ArrowRight, AlertCircle, Loader2, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  validateSearch: z.object({
    redirect: z.string().optional().catch(undefined),
  }),
  head: () => ({
    meta: [
      { title: "Login | StudyAI" },
      { name: "description", content: "Sign in or create your StudyAI account." },
      { property: "og:title", content: "Login | StudyAI" },
      { property: "og:description", content: "Sign in or create your StudyAI account." },
    ],
  }),
  component: AuthPage,
});

function safeRedirect(raw?: string): string {
  if (!raw) return "/";
  // Only allow same-origin relative paths.
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/";
  return raw;
}

function AuthPage() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const dest = safeRedirect(redirect);

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);


  // If already signed in, bounce to destination.
  useEffect(() => {
    let cancelled = false;
    supabase.auth.getSession().then(({ data }) => {
      if (!cancelled && data.session) {
        navigate({ to: dest as "/", replace: true });
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        navigate({ to: dest as "/", replace: true });
      }
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [dest, navigate]);

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (!email || !password) {
      setError("Enter your email and password.");
      return;
    }
    if (mode === "signup" && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + dest },
        });
        if (error) throw error;
        setInfo("Check your inbox to confirm your email, then sign in.");
        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // onAuthStateChange handles navigation
      }
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-gradient flex min-h-screen items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-foreground text-background">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="text-[17px] font-semibold tracking-tight">StudyAI</span>
        </Link>

        <div className="surface-card rounded-3xl p-8 shadow-[0_20px_60px_rgba(17,17,17,0.06)]">
          <h1 className="text-[24px] font-bold tracking-tight text-center">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-2 text-center text-[14px] text-muted-foreground">
            {mode === "signin"
              ? "Sign in to generate flashcards & quizzes."
              : "Save your notes and pick up right where you left off."}
          </p>

          <button
            disabled
            className="mt-6 inline-flex h-11 w-full cursor-not-allowed items-center justify-center gap-2 rounded-full border border-border bg-card text-foreground text-[14px] font-medium transition-colors select-none blur-[1px]"
          >
            <Lock className="h-4 w-4" /> Continue with Google — Coming soon
          </button>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleEmail} className="space-y-3">
            <label className="block">
              <span className="mb-1.5 flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground">
                <Mail className="h-3.5 w-3.5" /> Email
              </span>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="h-11 w-full rounded-xl border border-border bg-card px-4 text-[14px] placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground">
                <Lock className="h-3.5 w-3.5" /> Password
              </span>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="h-11 w-full rounded-xl border border-border bg-card pl-4 pr-11 text-[14px] placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>

            {mode === "signup" && (
              <label className="block">
                <span className="mb-1.5 flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground">
                  <Lock className="h-3.5 w-3.5" /> Re-enter password
                </span>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="h-11 w-full rounded-xl border border-border bg-card pl-4 pr-11 text-[14px] placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                    className="absolute right-2 top-1/2 -translate-y-1/2 grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <span className="mt-1 block text-[12px] text-destructive">Passwords do not match.</span>
                )}
              </label>
            )}


            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-[13px] text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {info && (
              <div className="rounded-xl border border-primary/30 bg-primary/5 px-3 py-2 text-[13px] text-foreground">
                {info}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-1 inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-full bg-foreground text-background text-[14px] font-medium hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  {mode === "signin" ? "Sign in" : "Create account"}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-[13px] text-muted-foreground">
            {mode === "signin" ? "New here?" : "Already have an account?"}{" "}
            <button
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin");
                setConfirmPassword("");

                setError(null);
                setInfo(null);
              }}
              className="font-medium text-foreground hover:underline"
            >
              {mode === "signin" ? "Create an account" : "Sign in"}
            </button>
          </p>
        </div>

        <p className="mt-6 text-center text-[12px] text-muted-foreground">
          <Link to="/" className="hover:text-foreground">← Back to home</Link>
        </p>
      </motion.div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.4-1.66 4.1-5.5 4.1-3.3 0-6-2.74-6-6.1s2.7-6.1 6-6.1c1.88 0 3.14.8 3.86 1.48l2.63-2.53C16.86 3.34 14.66 2.4 12 2.4 6.9 2.4 2.8 6.5 2.8 11.6S6.9 20.8 12 20.8c6.92 0 9.4-4.86 9.4-7.36 0-.5-.06-.88-.14-1.24H12z"/>
    </svg>
  );
}
