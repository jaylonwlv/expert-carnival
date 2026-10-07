const KIND_COLORS: Record<string, string> = {
  PDF: "bg-red-100 text-red-700",
  DOC: "bg-blue-100 text-blue-700",
  XLS: "bg-emerald-100 text-emerald-700",
  PPT: "bg-orange-100 text-orange-700",
  CSV: "bg-emerald-100 text-emerald-700",
  TXT: "bg-neutral-200 text-neutral-700",
  ZIP: "bg-amber-100 text-amber-700",
  IMG: "bg-violet-100 text-violet-700",
};

export function FileTypeIcon({ kind, size = "md" }: { kind: string; size?: "sm" | "md" | "lg" }) {
  const colorClass = KIND_COLORS[kind] ?? "bg-neutral-200 text-neutral-700";
  const sizeClass = size === "sm" ? "h-9 w-9 text-[10px]" : size === "lg" ? "h-16 w-16 text-sm" : "h-12 w-12 text-xs";

  return (
    <div className={`flex items-center justify-center rounded-lg font-semibold ${colorClass} ${sizeClass}`}>
      {kind}
    </div>
  );
}
