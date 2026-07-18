import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "light" | "dark";
const KEY = "studyai:theme";

const Ctx = createContext<{ theme: Theme; toggle: () => void; setTheme: (t: Theme) => void }>({
  theme: "light",
  toggle: () => {},
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = (typeof localStorage !== "undefined" && localStorage.getItem(KEY)) as Theme | null;
    const prefers = typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial: Theme = stored ?? (prefers ? "dark" : "light");
    setThemeState(initial);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem(KEY, theme);
  }, [theme, mounted]);

  return (
    <Ctx.Provider
      value={{
        theme,
        toggle: () => setThemeState((t) => (t === "dark" ? "light" : "dark")),
        setTheme: setThemeState,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useTheme = () => useContext(Ctx);
