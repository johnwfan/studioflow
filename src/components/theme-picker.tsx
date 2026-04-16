"use client";

import { Check } from "lucide-react";

import { useTheme } from "@/components/theme-provider";

export default function ThemePicker() {
  const { theme, setTheme, themes } = useTheme();

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {themes.map((themeOption) => {
        const isActive = themeOption.id === theme;

        return (
          <button
            key={themeOption.id}
            type="button"
            onClick={() => setTheme(themeOption.id)}
            className={[
              "rounded-3xl border p-5 text-left transition",
              isActive
                ? "border-[color:var(--primary)] bg-card shadow-sm ring-2 ring-[color:var(--ring)]/20"
                : "border-border bg-card hover:border-[color:var(--ring)] hover:shadow-sm",
            ].join(" ")}
            aria-pressed={isActive}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-base font-semibold text-card-foreground">
                  {themeOption.label}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {themeOption.description}
                </p>
              </div>

              {isActive ? (
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                  <Check className="h-4 w-4" />
                </span>
              ) : null}
            </div>

            <div className="mt-5 grid grid-cols-4 gap-2">
              {themeOption.preview.map((color) => (
                <span
                  key={color}
                  className="h-9 rounded-2xl border border-black/5"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </button>
        );
      })}
    </div>
  );
}
