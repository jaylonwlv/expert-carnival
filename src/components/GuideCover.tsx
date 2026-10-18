// Stand-in for a real cover photo/mockup until one exists -- styled with the
// app's own amber/stone palette instead of a generic default look.
export function GuideCover({
  title,
  subtitle,
  detail,
  credit,
}: {
  title: string;
  subtitle: string;
  detail: string;
  credit: string;
}) {
  return (
    <div
      className="relative w-64 sm:w-72 aspect-[3/4] rounded-lg shadow-2xl bg-gradient-to-br from-amber-700 via-amber-800 to-stone-900 p-6 flex flex-col justify-between text-white"
      style={{ transform: "perspective(1000px) rotateY(-8deg)" }}
    >
      <div className="w-10 h-1 bg-amber-300 rounded-full" />
      <div>
        <p className="text-lg font-bold leading-snug tracking-tight">{title}</p>
        <p className="text-xs text-amber-100 mt-3 leading-relaxed">{subtitle}</p>
        <p className="text-xs text-amber-100/90 mt-1 leading-relaxed">{detail}</p>
      </div>
      <p className="text-[11px] text-amber-200/80 uppercase tracking-wide">{credit}</p>
    </div>
  );
}
