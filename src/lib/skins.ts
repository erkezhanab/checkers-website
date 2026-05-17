export interface SkinStyle {
  background: string;
  borderColor: string;
  shimmerColor: string;
}

export interface Skin {
  id: string;
  name: string;
  description: string;
  isPro: boolean;
  blackStyle: SkinStyle;
  redStyle: SkinStyle;
  boardLight: string;
  boardDark: string;
  preview: [string, string];
}

export const SKINS: Skin[] = [
  {
    id: "classic",
    name: "Classic",
    description: "The original checkers look.",
    isPro: false,
    blackStyle: {
      background: "linear-gradient(135deg, #374151, #111827)",
      borderColor: "#030712",
      shimmerColor: "#9ca3af",
    },
    redStyle: {
      background: "linear-gradient(135deg, #f87171, #b91c1c)",
      borderColor: "#7f1d1d",
      shimmerColor: "#fca5a5",
    },
    boardLight: "#F0D9B5",
    boardDark: "#B58863",
    preview: ["#1f2937", "#dc2626"],
  },
  {
    id: "ocean",
    name: "Ocean",
    description: "Deep sea blues and teals.",
    isPro: false,
    blackStyle: {
      background: "linear-gradient(135deg, #1d4ed8, #1e3a8a)",
      borderColor: "#172554",
      shimmerColor: "#93c5fd",
    },
    redStyle: {
      background: "linear-gradient(135deg, #2dd4bf, #0f766e)",
      borderColor: "#134e4a",
      shimmerColor: "#99f6e4",
    },
    boardLight: "#B8D4E3",
    boardDark: "#5B8FA8",
    preview: ["#1d4ed8", "#0d9488"],
  },
  {
    id: "forest",
    name: "Forest",
    description: "Earthy greens and browns.",
    isPro: false,
    blackStyle: {
      background: "linear-gradient(135deg, #166534, #052e16)",
      borderColor: "#052e16",
      shimmerColor: "#86efac",
    },
    redStyle: {
      background: "linear-gradient(135deg, #d97706, #92400e)",
      borderColor: "#78350f",
      shimmerColor: "#fcd34d",
    },
    boardLight: "#C8D8A8",
    boardDark: "#7A9458",
    preview: ["#166534", "#92400e"],
  },
  {
    id: "gold",
    name: "Gold & Silver",
    description: "Premium metallic finish.",
    isPro: true,
    blackStyle: {
      background: "linear-gradient(135deg, #d1d5db, #6b7280)",
      borderColor: "#4b5563",
      shimmerColor: "#f3f4f6",
    },
    redStyle: {
      background: "linear-gradient(135deg, #fde68a, #ca8a04)",
      borderColor: "#92400e",
      shimmerColor: "#fef9c3",
    },
    boardLight: "#F5E6C8",
    boardDark: "#C8A96E",
    preview: ["#9ca3af", "#eab308"],
  },
  {
    id: "crystal",
    name: "Crystal",
    description: "Translucent purple and cyan.",
    isPro: true,
    blackStyle: {
      background: "linear-gradient(135deg, #a855f7, #6d28d9)",
      borderColor: "#4c1d95",
      shimmerColor: "#e9d5ff",
    },
    redStyle: {
      background: "linear-gradient(135deg, #67e8f9, #0891b2)",
      borderColor: "#164e63",
      shimmerColor: "#cffafe",
    },
    boardLight: "#E8D8F8",
    boardDark: "#A888D8",
    preview: ["#7c3aed", "#06b6d4"],
  },
  {
    id: "neon",
    name: "Neon Night",
    description: "Glowing neon on dark board.",
    isPro: true,
    blackStyle: {
      background: "linear-gradient(135deg, #4ade80, #15803d)",
      borderColor: "#14532d",
      shimmerColor: "#bbf7d0",
    },
    redStyle: {
      background: "linear-gradient(135deg, #f472b6, #be185d)",
      borderColor: "#831843",
      shimmerColor: "#fce7f3",
    },
    boardLight: "#2a2a3a",
    boardDark: "#1a1a2a",
    preview: ["#4ade80", "#f472b6"],
  },
];

export function getSkin(id?: string): Skin {
  return SKINS.find((s) => s.id === id) ?? SKINS[0];
}
