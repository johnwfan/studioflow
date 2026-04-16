"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  defaultTheme,
  isThemeId,
  themeCookieName,
  themes,
  type ThemeId,
} from "@/lib/themes";

type ThemeContextValue = {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
  themes: typeof themes;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyTheme(theme: ThemeId) {
  const root = document.documentElement;

  root.dataset.theme = theme;
  root.style.colorScheme = theme === "dark" ? "dark" : "light";

  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

export default function ThemeProvider({
  children,
  initialTheme,
}: {
  children: ReactNode;
  initialTheme: ThemeId;
}) {
  const [theme, setThemeState] = useState<ThemeId>(() => {
    if (typeof window === "undefined") {
      return initialTheme;
    }

    const storedTheme = window.localStorage.getItem(themeCookieName);
    return storedTheme && isThemeId(storedTheme) ? storedTheme : initialTheme;
  });

  useEffect(() => {
    window.localStorage.setItem(themeCookieName, theme);
    document.cookie = `${themeCookieName}=${theme}; path=/; max-age=31536000; samesite=lax`;
    applyTheme(theme);
  }, [theme]);

  const setTheme = (nextTheme: ThemeId) => {
    setThemeState(nextTheme);
  };

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      themes,
    }),
    [theme],
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    return {
      theme: defaultTheme,
      setTheme: () => undefined,
      themes,
    };
  }

  return context;
}
