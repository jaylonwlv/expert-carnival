import { Stage } from "@/lib/stages";

export function Stepper({ stages, currentIndex }: { stages: Stage[]; currentIndex: number }) {
  return (
    <ol>
      {stages.map((stage, index) => {
        const isDone = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isLast = index === stages.length - 1;

        return (
          <li key={stage.title} className="relative flex gap-4 pb-8 last:pb-0">
            {!isLast && (
              <span
                aria-hidden
                className={`absolute left-[15px] top-8 w-0.5 h-full ${
                  isDone ? "bg-emerald-500" : "bg-neutral-200"
                }`}
              />
            )}
            <span
              className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                isDone
                  ? "bg-emerald-500 text-white"
                  : isCurrent
                    ? "bg-neutral-900 text-white ring-4 ring-neutral-200"
                    : "bg-neutral-100 text-neutral-400 border border-neutral-200"
              }`}
            >
              {isDone ? "✓" : index + 1}
            </span>
            <div className="pt-0.5">
              <p
                className={`text-sm font-semibold ${
                  isCurrent ? "text-neutral-900" : isDone ? "text-neutral-700" : "text-neutral-400"
                }`}
              >
                {stage.title}
                {isCurrent && (
                  <span className="ml-2 inline-block rounded-full bg-amber-100 text-amber-700 text-[11px] font-medium px-2 py-0.5 align-middle">
                    In progress
                  </span>
                )}
              </p>
              {(isCurrent || isDone) && (
                <p className="text-sm text-neutral-500 mt-1">{stage.summary}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
