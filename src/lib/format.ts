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
