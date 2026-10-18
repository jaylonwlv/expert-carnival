// Compact 3-step strip answering "what happens after I submit this form" --
// the Altman Brothers pattern from the conversion research: walk the
// process before asking for the form fill, not just after.
export function HowItWorksSteps({ steps }: { steps: string[] }) {
  return (
    <div className="grid grid-cols-3 gap-2 lg:gap-4">
      {steps.map((step, index) => (
        <div key={step} className="text-center">
          <div className="mx-auto w-6 h-6 lg:w-9 lg:h-9 rounded-full bg-amber-600 text-white text-xs lg:text-base font-semibold flex items-center justify-center">
            {index + 1}
          </div>
          <p className="text-xs lg:text-sm text-stone-700 mt-1.5 lg:mt-2 leading-snug">{step}</p>
        </div>
      ))}
    </div>
  );
}
