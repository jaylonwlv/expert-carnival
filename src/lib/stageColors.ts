export type StageColor = {
  badgeBg: string;
  badgeText: string;
  solidBg: string;
  solidText: string;
  ring: string;
};

// A single linear light-green -> dark-green progression, so the client
// journey reads as "further along" rather than a rainbow of unrelated hues.
export const STAGE_COLORS: StageColor[] = [
  { badgeBg: "bg-green-50", badgeText: "text-green-800", solidBg: "bg-green-200", solidText: "text-green-900", ring: "ring-neutral-900" },
  { badgeBg: "bg-green-100", badgeText: "text-green-800", solidBg: "bg-green-300", solidText: "text-green-900", ring: "ring-neutral-900" },
  { badgeBg: "bg-green-200", badgeText: "text-green-900", solidBg: "bg-green-400", solidText: "text-green-950", ring: "ring-neutral-900" },
  { badgeBg: "bg-green-300", badgeText: "text-green-950", solidBg: "bg-green-500", solidText: "text-white", ring: "ring-neutral-900" },
  { badgeBg: "bg-green-400", badgeText: "text-green-950", solidBg: "bg-green-600", solidText: "text-white", ring: "ring-neutral-900" },
  { badgeBg: "bg-green-500", badgeText: "text-white", solidBg: "bg-green-700", solidText: "text-white", ring: "ring-neutral-900" },
  { badgeBg: "bg-green-600", badgeText: "text-white", solidBg: "bg-green-800", solidText: "text-white", ring: "ring-neutral-900" },
  { badgeBg: "bg-green-700", badgeText: "text-white", solidBg: "bg-green-900", solidText: "text-white", ring: "ring-neutral-900" },
];

export function stageColor(index: number): StageColor {
  return STAGE_COLORS[index] ?? STAGE_COLORS[0];
}

const AVATAR_PALETTE = [
  "bg-teal-500",
  "bg-cyan-500",
  "bg-sky-500",
  "bg-blue-500",
  "bg-indigo-500",
  "bg-violet-500",
  "bg-purple-500",
  "bg-fuchsia-500",
  "bg-emerald-500",
  "bg-lime-600",
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
