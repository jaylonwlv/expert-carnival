export function timeAgo(date: Date): string {
  const seconds = Math.max(0, (Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function isImageFile(contentType: string | null, filename: string): boolean {
  if (contentType?.startsWith("image/")) return true;
  return /\.(png|jpe?g|gif|webp|svg|avif)$/i.test(filename);
}

const SHORT_EXT: Record<string, string> = { DOCX: "DOC", XLSX: "XLS", PPTX: "PPT" };

export function fileKindLabel(contentType: string | null, filename: string): string {
  if (isImageFile(contentType, filename)) return "IMG";
  const ext = filename.split(".").pop()?.toUpperCase() ?? "";
  return SHORT_EXT[ext] ?? (ext ? ext.slice(0, 4) : "FILE");
}

// Appointment date/times are stored and displayed as plain wall-clock values
// (no timezone math) — whatever Paulin types is exactly what the client sees,
// on the assumption everyone involved is in the same local time.

export function parseAppointmentInput(value: string): Date {
  return new Date(`${value}:00.000Z`);
}

export function toAppointmentInputValue(date: Date): string {
  return date.toISOString().slice(0, 16);
}

export function formatAppointment(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}
