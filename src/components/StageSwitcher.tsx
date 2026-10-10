"use client";

import { useState } from "react";
import { stageColor } from "@/lib/stageColors";
import { SaveToast } from "@/components/ActionForm";

export function StageSwitcher({
  stages,
  currentStage,
  updateStageAction,
}: {
  stages: { title: string; summary: string }[];
  currentStage: number;
  updateStageAction: (formData: FormData) => Promise<void>;
}) {
  // Optimistic local copy, same render-time-reset pattern as
  // ChecklistAccordion: a stage click should feel instant, not wait on the
  // round trip through the server action + full page revalidation.
  const [prevStage, setPrevStage] = useState(currentStage);
  const [localStage, setLocalStage] = useState(currentStage);
  if (currentStage !== prevStage) {
    setPrevStage(currentStage);
    setLocalStage(currentStage);
  }

  const [toastAt, setToastAt] = useState(0);

  function handleClick(index: number) {
    if (index === localStage) return;
    setLocalStage(index);
    const formData = new FormData();
    formData.set("currentStage", String(index));
    updateStageAction(formData).then(() => setToastAt(Date.now()));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        {stages.map((stage, index) => {
          const color = stageColor(index);
          const isDone = index < localStage;
          const isCurrent = index === localStage;
          return (
            <button
              key={stage.title}
              type="button"
              onClick={() => handleClick(index)}
              title={stage.summary}
              className={`text-xs font-medium px-3 py-2 rounded-lg transition ${
                isDone || isCurrent
                  ? `${color.solidBg} ${color.solidText} shadow-sm`
                  : "bg-stone-100 text-stone-500 hover:bg-stone-200"
              } ${isCurrent ? `ring-2 ring-offset-2 ${color.ring} shadow-md` : ""}`}
            >
              {index + 1}. {stage.title}
            </button>
          );
        })}
      </div>
      <p className="text-sm text-stone-500 pt-2 border-t border-stone-100">{stages[localStage].summary}</p>
      {toastAt !== 0 && <SaveToast key={toastAt} message="Stage updated." />}
    </div>
  );
}
