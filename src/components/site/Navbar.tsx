import { Link, useNavigate } from "@tanstack/react-router";
import { Sparkles, Moon, Sun, History, Command, LogOut, User as UserIcon } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useTheme } from "@/lib/theme";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export function Navbar({ onOpenCommand }: { onOpenCommand?: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggle } = useTheme();
  const [isMac, setIsMac] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsMac(typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform));
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      window.removeEventListener("scroll", onScroll);
      sub.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    setMenuOpen(false);
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  };


  return (
    <header
      className={`fixed top-4 left-1/2 z-50 w-[calc(100%-3rem)] max-w-[1232px] -translate-x-1/2 rounded-xl border border-border/60 bg-background/85 shadow-[0_8px_30px_rgba(0,0,0,0.08)] backdrop-blur-2xl transition-all duration-300 ${
        scrolled ? "bg-background/95 shadow-[0_12px_40px_rgba(0,0,0,0.12)]" : "bg-background/85"
      }`}
    >
      <nav className="flex h-14 items-center justify-between gap-2 px-4" aria-label="Primary">
        <Link to="/" className="group flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-foreground text-background">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="text-[15px] font-semibold tracking-tight">StudyAI</span>
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          <a href="/#features" className="text-[14px] text-muted-foreground transition-colors hover:text-foreground">
            Features
          </a>
          <a href="/#how" className="text-[14px] text-muted-foreground transition-colors hover:text-foreground">
            How it Works
          </a>
          <a href="/#about" className="text-[14px] text-muted-foreground transition-colors hover:text-foreground">
            About
          </a>
        </div>

        <div className="flex items-center gap-1.5">
          {onOpenCommand && (
            <button
              onClick={onOpenCommand}
              aria-label="Open command palette"
              className="hidden h-9 items-center gap-2 rounded-full border border-border bg-card/60 px-3 text-[12px] text-muted-foreground transition-colors hover:text-foreground md:inline-flex"
            >
              <Command className="h-3.5 w-3.5" />
              <span>Search</span>
              <kbd className="ml-1 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium">
                {isMac ? "⌘" : "Ctrl"}K
              </kbd>
            </button>
          )}
          <Link
            to="/history"
            aria-label="History"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card/60 text-muted-foreground transition-colors hover:text-foreground"
          >
            <History className="h-4 w-4" />
          </Link>
          <button
            onClick={toggle}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card/60 text-muted-foreground transition-colors hover:text-foreground"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <motion.a
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            href="/#generate"
            className="hidden items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-[14px] font-medium text-background shadow-[0_6px_20px_rgba(17,17,17,0.2)] sm:inline-flex"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Generate
          </motion.a>
          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="Account menu"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card/60 text-foreground transition-colors hover:bg-muted"
              >
                <span className="text-[12px] font-semibold uppercase">
                  {(user.email ?? "?").slice(0, 1)}
                </span>
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-11 z-50 w-56 overflow-hidden rounded-xl border border-border bg-card shadow-lg">
                    <div className="border-b border-border px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <UserIcon className="h-3.5 w-3.5 text-muted-foreground" />
                        <div className="truncate text-[12px] text-muted-foreground">Signed in as</div>
                      </div>
                    <div className="mt-0.5 truncate text-[13px] font-medium text-foreground">
                        {user.email}
                      </div>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[13px] text-foreground hover:bg-muted"
                    >
                      <UserIcon className="h-3.5 w-3.5" /> Profile
                    </Link>
                    <button
                      onClick={signOut}
                      className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[13px] text-foreground hover:bg-muted"
                    >
                      <LogOut className="h-3.5 w-3.5" /> Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              to="/auth"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-3 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-muted"
            >
              Sign in
            </Link>
          )}
        </div>
      </nav>

    </header>
  );
}
