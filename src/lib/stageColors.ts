export type StageColor = {
  badgeBg: string;
  badgeText: string;
  solidBg: string;
  solidText: string;
  ring: string;
};

export const STAGE_COLORS: StageColor[] = [
  { badgeBg: "bg-slate-100", badgeText: "text-slate-700", solidBg: "bg-slate-500", solidText: "text-white", ring: "ring-slate-500" },
  { badgeBg: "bg-sky-100", badgeText: "text-sky-700", solidBg: "bg-sky-500", solidText: "text-white", ring: "ring-sky-500" },
  { badgeBg: "bg-blue-100", badgeText: "text-blue-700", solidBg: "bg-blue-500", solidText: "text-white", ring: "ring-blue-500" },
  { badgeBg: "bg-indigo-100", badgeText: "text-indigo-700", solidBg: "bg-indigo-500", solidText: "text-white", ring: "ring-indigo-500" },
  { badgeBg: "bg-violet-100", badgeText: "text-violet-700", solidBg: "bg-violet-500", solidText: "text-white", ring: "ring-violet-500" },
  { badgeBg: "bg-amber-100", badgeText: "text-amber-700", solidBg: "bg-amber-500", solidText: "text-white", ring: "ring-amber-500" },
  { badgeBg: "bg-orange-100", badgeText: "text-orange-700", solidBg: "bg-orange-500", solidText: "text-white", ring: "ring-orange-500" },
  { badgeBg: "bg-emerald-100", badgeText: "text-emerald-700", solidBg: "bg-emerald-500", solidText: "text-white", ring: "ring-emerald-500" },
];

export function stageColor(index: number): StageColor {
  return STAGE_COLORS[index] ?? STAGE_COLORS[0];
}

const AVATAR_PALETTE = [
  "bg-rose-500",
  "bg-orange-500",
  "bg-amber-500",
  "bg-lime-500",
  "bg-emerald-500",
  "bg-teal-500",
  "bg-sky-500",
  "bg-indigo-500",
  "bg-violet-500",
  "bg-fuchsia-500",
];

export function avatarColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
