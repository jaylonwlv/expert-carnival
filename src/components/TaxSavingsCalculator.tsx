"use client";

import { useState } from "react";
import { estimateCaliforniaTax } from "@/lib/caTax";

const DEFAULT_INCOME = 150_000;
const MIN_INCOME = 40_000;
const MAX_INCOME = 500_000;

function formatUsd(value: number): string {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

// Interactive stand-in for the static CA-vs-NV comparison table buried in
// the PDF guide -- same underlying math, but something a visitor can play
// with before ever filling out the form. See lib/caTax.ts for the figures.
export function TaxSavingsCalculator() {
  const [income, setIncome] = useState(DEFAULT_INCOME);
  const caTax = estimateCaliforniaTax(income);

  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-3">
        See your savings
      </p>

      <label htmlFor="household-income" className="block text-sm font-medium text-stone-700 mb-1">
        Household income
      </label>
      <input
        id="household-income"
        type="range"
        min={MIN_INCOME}
        max={MAX_INCOME}
        step={5_000}
        value={income}
        onChange={(e) => setIncome(Number(e.target.value))}
        className="w-full accent-amber-600"
      />
      <p className="text-sm text-stone-900 font-semibold">{formatUsd(income)}</p>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="rounded-lg bg-stone-50 border border-stone-200 p-3">
          <p className="text-xs text-stone-500">California tax (est.)</p>
          <p className="text-lg font-semibold text-stone-900">{formatUsd(caTax)}</p>
        </div>
        <div className="rounded-lg bg-green-50 border border-green-200 p-3">
          <p className="text-xs text-green-700">Nevada tax</p>
          <p className="text-lg font-semibold text-green-800">$0</p>
        </div>
      </div>

      <p className="text-sm font-semibold text-stone-900 mt-4">
        Estimated annual savings: <span className="text-amber-700">{formatUsd(caTax)}</span>
      </p>
      <p className="text-xs text-stone-400 mt-2 leading-relaxed">
        Estimates use 2025 California state income tax brackets for a married couple filing jointly,
        standard deduction only. Simplified for illustration -- not tax advice. Consult a licensed CPA
        or tax advisor for guidance specific to your household.
      </p>
    </div>
  );
}
