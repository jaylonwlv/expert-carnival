// Compact 3-step strip answering "what happens after I submit this form" --
// the Altman Brothers pattern from the conversion research: walk the
// process before asking for the form fill, not just after.
export function HowItWorksSteps({ steps }: { steps: string[] }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {steps.map((step, index) => (
        <div key={step} className="text-center">
          <div className="mx-auto w-6 h-6 rounded-full bg-amber-600 text-white text-xs font-semibold flex items-center justify-center">
            {index + 1}
          </div>
          <p className="text-xs text-stone-700 mt-1.5 leading-snug">{step}</p>
        </div>
      ))}
    </div>
  );
}
