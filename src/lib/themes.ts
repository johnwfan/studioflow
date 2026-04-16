export const themeCookieName = "studioflow-theme";

export const themes = [
  {
    id: "standard",
    label: "Standard",
    description: "The current Studioflow look. Clean, neutral, and focused.",
    preview: ["#18181b", "#f4f4f5", "#ffffff", "#a1a1aa"],
  },
  {
    id: "dark",
    label: "Dark",
    description: "A polished dark workspace with strong contrast.",
    preview: ["#09090b", "#18181b", "#fafafa", "#71717a"],
  },
  {
    id: "light-blue",
    label: "Light Blue",
    description: "Cool, airy, and calm with soft blue surfaces.",
    preview: ["#1d4ed8", "#eff6ff", "#ffffff", "#7c93c8"],
  },
  {
    id: "neon",
    label: "Neon",
    description: "Playful, high-energy accents with a cyber feel.",
    preview: ["#0f172a", "#0f766e", "#f8fafc", "#22d3ee"],
  },
  {
    id: "sage",
    label: "Sage",
    description: "Muted green, soft, earthy, and composed.",
    preview: ["#4d5d53", "#f4f8f2", "#ffffff", "#7a8b7e"],
  },
  {
    id: "pink",
    label: "Pink",
    description: "Soft rose tones with a modern, refined finish.",
    preview: ["#9d174d", "#fff1f6", "#ffffff", "#dba4bc"],
  },
  {
    id: "amber",
    label: "Amber",
    description: "Warm editorial tones with a subtle amber accent.",
    preview: ["#b45309", "#fff7ed", "#ffffff", "#d6a777"],
  },
  {
    id: "lavender",
    label: "Lavender",
    description: "A gentle violet theme that still feels professional.",
    preview: ["#6d28d9", "#f5f3ff", "#ffffff", "#b5a3df"],
  },
  {
    id: "monochrome",
    label: "Monochrome",
    description: "Minimal grayscale with a crisp editorial vibe.",
    preview: ["#111111", "#ededed", "#ffffff", "#9b9b9b"],
  },
] as const;

export type ThemeId = (typeof themes)[number]["id"];

export const defaultTheme: ThemeId = "standard";

export function isThemeId(value: string): value is ThemeId {
  return themes.some((theme) => theme.id === value);
}
