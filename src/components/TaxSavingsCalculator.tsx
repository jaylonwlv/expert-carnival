"use client";

import { useRef, useState } from "react";
import { estimateStateTax, STATE_LABELS, STATE_ORDER, isPreciseBracketState, type StateCode } from "@/lib/stateTax";
import { logCalculatorInteraction } from "@/lib/calculatorTracking";
import type { LeadSource } from "@/app/lead-actions";

const DEFAULT_INCOME = 150_000;
const MIN_INCOME = 40_000;
const MAX_INCOME = 500_000;
// Most of this site's traffic is explicitly "moving from California" --
// defaulting the picker to CA instead of an alphabetical first state (AL)
// means the number a visitor sees on first paint, before touching anything,
// is already the relevant one for most of them.
const DEFAULT_STATE: StateCode = "CA";

function formatUsd(value: number): string {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

// Interactive stand-in for the static CA-vs-NV comparison table buried in
// the PDF guide -- same underlying math, but something a visitor can play
// with before ever filling out the form. See lib/stateTax.ts (and, for
// California specifically, lib/caTax.ts) for the figures.
export function TaxSavingsCalculator({ page }: { page: LeadSource }) {
  const [income, setIncome] = useState(DEFAULT_INCOME);
  const [state, setState] = useState<StateCode>(DEFAULT_STATE);
  const stateTax = estimateStateTax(state, income);
  const monthlyStateTax = stateTax / 12;
  // Dragging the slider or changing the state is the engagement signal we
  // actually care about -- not a second CTA on the calculator (that
  // competes with the one real ask, the lead form below). Logged once per
  // page load, on whichever happens first, so one visitor who plays with
  // either control for a while doesn't inflate the count.
  const hasLoggedInteraction = useRef(false);

  function logFirstInteraction(nextIncome: number, nextState: StateCode) {
    if (hasLoggedInteraction.current) return;
    hasLoggedInteraction.current = true;
    logCalculatorInteraction(page, nextIncome, nextState).catch(() => {});
  }

  function handleIncomeChange(value: number) {
    setIncome(value);
    logFirstInteraction(value, state);
  }

  function handleStateChange(value: StateCode) {
    setState(value);
    logFirstInteraction(income, value);
  }

  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-3">
        See your savings
      </p>

      <label htmlFor="origin-state" className="block text-sm font-medium text-stone-700 mb-1">
        Moving from
      </label>
      <select
        id="origin-state"
        value={state}
        onChange={(e) => handleStateChange(e.target.value as StateCode)}
        className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 mb-4 focus:outline-none focus:ring-2 focus:ring-amber-600"
      >
        {STATE_ORDER.map((code) => (
          <option key={code} value={code}>
            {STATE_LABELS[code]}
          </option>
        ))}
      </select>

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
        onChange={(e) => handleIncomeChange(Number(e.target.value))}
        className="w-full accent-amber-600"
      />
      <p className="text-sm text-stone-900 font-semibold">{formatUsd(income)}</p>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="rounded-lg bg-stone-50 border border-stone-200 p-3">
          <p className="text-xs text-stone-500">{STATE_LABELS[state]} tax (est.)</p>
          <p className="text-lg font-semibold text-stone-900">{formatUsd(stateTax)}</p>
        </div>
        <div className="rounded-lg bg-green-50 border border-green-200 p-3">
          <p className="text-xs text-green-700">Nevada tax</p>
          <p className="text-lg font-semibold text-green-800">$0</p>
        </div>
      </div>

      <p className="text-sm font-semibold text-stone-900 mt-4">
        Estimated monthly savings: <span className="text-amber-700">{formatUsd(monthlyStateTax)}</span>
      </p>
      <p className="text-xs text-stone-400 mt-2 leading-relaxed">
        {isPreciseBracketState(state)
          ? "Estimates use 2025 California state income tax brackets for a married couple filing jointly, standard deduction only."
          : `Estimates use ${STATE_LABELS[state]}'s top state income-tax rate as a simplified, single-rate figure (not full bracket math).`}{" "}
        Simplified for illustration -- not tax advice. Consult a licensed CPA or tax advisor for
        guidance specific to your household.
      </p>
    </div>
  );
}
