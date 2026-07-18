import { useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Home,
  Layers,
  ListChecks,
  History,
  RotateCw,
  Settings,
  Moon,
  Sun,
  Download,
  Info,
  Search,
  ArrowRight,
} from "lucide-react";
import { useTheme } from "@/lib/theme";

type Cmd = {
  id: string;
  label: string;
  group: string;
  icon: ReactNode;
  run: () => void;
  keywords?: string;
};

export function CommandPalette({
  open,
  onOpenChange,
  onOpenExport,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onOpenExport?: () => void;
}) {
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);

  const commands: Cmd[] = useMemo(
    () => [
      { id: "home", label: "Home", group: "Navigate", icon: <Home className="h-4 w-4" />, run: () => navigate({ to: "/" }) },
      {
        id: "flashcards",
        label: "Generate flashcards",
        group: "Create",
        icon: <Layers className="h-4 w-4" />,
        run: () => navigate({ to: "/", hash: "generate" }),
      },
      {
        id: "quiz",
        label: "Generate quiz",
        group: "Create",
        icon: <ListChecks className="h-4 w-4" />,
        run: () => navigate({ to: "/", hash: "generate" }),
      },
      { id: "history", label: "History", group: "Navigate", icon: <History className="h-4 w-4" />, run: () => navigate({ to: "/history" }) },
      {
        id: "retry",
        label: "Retry wrong answers",
        group: "Study",
        icon: <RotateCw className="h-4 w-4" />,
        run: () => navigate({ to: "/study", search: { view: "quiz" } }),
      },
      { id: "settings", label: "Settings", group: "App", icon: <Settings className="h-4 w-4" />, run: () => navigate({ to: "/history" }) },
      {
        id: "theme",
        label: theme === "dark" ? "Switch to light mode" : "Switch to dark mode",
        group: "App",
        icon: theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />,
        run: toggle,
      },
      {
        id: "export",
        label: "Export study pack",
        group: "App",
        icon: <Download className="h-4 w-4" />,
        run: () => onOpenExport?.(),
      },
      { id: "about", label: "About StudyAI", group: "App", icon: <Info className="h-4 w-4" />, run: () => navigate({ to: "/", hash: "about" }) },
    ],
    [navigate, theme, toggle, onOpenExport],
  );

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return commands;
    return commands.filter((c) => (c.label + " " + c.group + " " + (c.keywords ?? "")).toLowerCase().includes(s));
  }, [q, commands]);

  useEffect(() => setActive(0), [q, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((v) => Math.min(filtered.length - 1, v + 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((v) => Math.max(0, v - 1));
      }
      if (e.key === "Enter") {
        e.preventDefault();
        const cmd = filtered[active];
        if (cmd) {
          onOpenChange(false);
          cmd.run();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, filtered, active, onOpenChange]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[100] flex items-start justify-center bg-background/60 backdrop-blur-md p-4 pt-[15vh]"
          onClick={() => onOpenChange(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
        >
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ type: "spring", damping: 22, stiffness: 260 }}
            onClick={(e) => e.stopPropagation()}
            className="surface-card w-full max-w-xl overflow-hidden rounded-3xl"
          >
            <div className="flex items-center gap-2 border-b border-border px-4">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Type a command or search…"
                className="h-12 flex-1 bg-transparent text-[14px] placeholder:text-muted-foreground focus:outline-none"
              />
              <kbd className="rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                ESC
              </kbd>
            </div>
            <div className="max-h-[50vh] overflow-y-auto p-2">
              {filtered.length === 0 ? (
                <div className="px-3 py-6 text-center text-[13px] text-muted-foreground">No commands match.</div>
              ) : (
                filtered.map((c, i) => {
                  const isActive = i === active;
                  return (
                    <button
                      key={c.id}
                      onClick={() => {
                        onOpenChange(false);
                        c.run();
                      }}
                      onMouseEnter={() => setActive(i)}
                      className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                        isActive ? "bg-primary/10 text-foreground" : "text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <span
                        className={`grid h-7 w-7 place-items-center rounded-lg ${
                          isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {c.icon}
                      </span>
                      <span className="min-w-0 flex-1 text-[13.5px] font-medium text-foreground">{c.label}</span>
                      <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{c.group}</span>
                      <ArrowRight
                        className={`h-3.5 w-3.5 shrink-0 transition-opacity ${isActive ? "opacity-100 text-primary" : "opacity-0"}`}
                      />
                    </button>
                  );
                })
              )}
            </div>
            <div className="flex items-center justify-between border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
              <span>↑↓ navigate · ↵ run</span>
              <span>StudyAI</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function useCommandPalette() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return { open, setOpen };
}
