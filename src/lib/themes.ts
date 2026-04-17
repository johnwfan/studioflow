export const themeCookieName = "studioflow-theme";

export const themes = [
  {
    id: "standard",
    label: "Standard",
    description: "studioflow core: indigo structure, platinum surfaces, red highlights.",
    preview: ["#2b2d42", "#8d99ae", "#edf2f4", "#ef233c"],
  },
  {
    id: "coast",
    label: "Coast",
    description: "Airy coastal blues with a calm, clean workspace feel.",
    preview: ["#023047", "#219ebc", "#8ecae6", "#ffb703"],
  },
  {
    id: "grove",
    label: "Grove",
    description: "Grounded greens and dusty neutrals with an earthy rhythm.",
    preview: ["#344e41", "#588157", "#dad7cd", "#a3b18a"],
  },
  {
    id: "lagoon",
    label: "Lagoon",
    description: "Deep blue-teal tones with bright aquatic accents.",
    preview: ["#03045e", "#0077b6", "#00b4d8", "#90e0ef"],
  },
  {
    id: "bloom",
    label: "Bloom",
    description: "Soft petal and periwinkle tones with a polished editorial feel.",
    preview: ["#c8b6ff", "#b8c0ff", "#e7c6ff", "#ffd6ff"],
  },
  {
    id: "ember",
    label: "Ember",
    description: "Confident amber, orange, and violet accents with energy.",
    preview: ["#ffbe0b", "#fb5607", "#8338ec", "#3a86ff"],
  },
  {
    id: "noir",
    label: "Noir",
    description: "A dramatic dark editorial theme with ember-red highlights.",
    preview: ["#03071e", "#6a040f", "#d00000", "#ffba08"],
  },
  {
    id: "parchment",
    label: "Parchment",
    description: "Soft paper, linen, and almond tones with a quiet studio mood.",
    preview: ["#edede9", "#f5ebe0", "#e3d5ca", "#d5bdaf"],
  },
] as const;

export type ThemeId = (typeof themes)[number]["id"];

export const defaultTheme: ThemeId = "standard";

export function isThemeId(value: string): value is ThemeId {
  return themes.some((theme) => theme.id === value);
}
