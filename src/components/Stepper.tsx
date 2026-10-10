import { Stage } from "@/lib/stages";
import { stageColor } from "@/lib/stageColors";

export function Stepper({ stages, currentIndex }: { stages: Stage[]; currentIndex: number }) {
  return (
    <ol>
      {stages.map((stage, index) => {
        const color = stageColor(index);
        const isDone = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isLast = index === stages.length - 1;

        return (
          <li key={stage.title} className="relative flex gap-4 pb-8 last:pb-0">
            {!isLast && (
              <span
                aria-hidden
                className={`absolute left-[15px] top-8 w-0.5 h-full ${
                  isDone ? color.solidBg : "bg-stone-200"
                }`}
              />
            )}
            <span
              className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                isDone
                  ? `${color.solidBg} ${color.solidText} shadow-sm`
                  : isCurrent
                    ? "bg-stone-900 text-white ring-4 ring-stone-200 shadow-md"
                    : "bg-stone-100 text-stone-400 border border-stone-200"
              }`}
            >
              {isDone ? "✓" : index + 1}
            </span>
            <div className="pt-0.5">
              <p
                className={`text-sm font-semibold ${
                  isCurrent ? "text-stone-900" : isDone ? "text-stone-700" : "text-stone-400"
                }`}
              >
                {stage.title}
                {isCurrent && (
                  <span className="ml-2 inline-block rounded-full bg-green-100 text-green-800 text-[11px] font-medium px-2 py-0.5 align-middle">
                    In progress
                  </span>
                )}
              </p>
              {(isCurrent || isDone) && (
                <p className="text-sm text-stone-500 mt-1">{stage.summary}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
