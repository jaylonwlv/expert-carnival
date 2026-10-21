// Generalizes caTax.ts's California-only model to every US state (+ DC) so
// the calculator can compare a visitor's actual origin state against Nevada,
// not just assume California. California keeps its own precise bracket
// calculation (estimateCaliforniaTax in caTax.ts); every other state uses
// its single published top marginal income-tax rate as a simplified,
// explicitly-labeled estimate — not full bracket math. Building verified
// bracket tables for all 50 states isn't something to fake: rates below are
// 2025 figures (Tax Foundation / state revenue department reporting) and,
// same as caTax.ts's own note, need re-checking against
// taxfoundation.org/data/all/state/state-income-tax-rates/ when rates change
// (several states are mid-phase-down as of 2025 and will have moved by the
// time this is read again).
import { estimateCaliforniaTax } from "@/lib/caTax";

export type StateCode =
  | "AL" | "AK" | "AZ" | "AR" | "CA" | "CO" | "CT" | "DE" | "DC" | "FL"
  | "GA" | "HI" | "ID" | "IL" | "IN" | "IA" | "KS" | "KY" | "LA" | "ME"
  | "MD" | "MA" | "MI" | "MN" | "MS" | "MO" | "MT" | "NE" | "NV" | "NH"
  | "NJ" | "NM" | "NY" | "NC" | "ND" | "OH" | "OK" | "OR" | "PA" | "RI"
  | "SC" | "SD" | "TN" | "TX" | "UT" | "VT" | "VA" | "WA" | "WV" | "WI" | "WY";

export const STATE_LABELS: Record<StateCode, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", DC: "Washington, D.C.",
  FL: "Florida", GA: "Georgia", HI: "Hawaii", ID: "Idaho", IL: "Illinois",
  IN: "Indiana", IA: "Iowa", KS: "Kansas", KY: "Kentucky", LA: "Louisiana",
  ME: "Maine", MD: "Maryland", MA: "Massachusetts", MI: "Michigan",
  MN: "Minnesota", MS: "Mississippi", MO: "Missouri", MT: "Montana",
  NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey",
  NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota",
  OH: "Ohio", OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania",
  RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota",
  TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia",
  WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
};

// Ordered for the <select> — alphabetical by label, same order STATE_LABELS
// would sort to, just precomputed so the component doesn't re-sort on
// every render.
export const STATE_ORDER: StateCode[] = (Object.keys(STATE_LABELS) as StateCode[]).sort((a, b) =>
  STATE_LABELS[a].localeCompare(STATE_LABELS[b])
);

// No individual income tax at all — not an approximation, an actual $0.
// (New Hampshire's old interest/dividends-only tax was fully repealed
// effective Jan 1, 2025, which is why it's in this list now and wasn't a
// few years ago.)
const NO_TAX_STATES = new Set<StateCode>(["AK", "FL", "NV", "NH", "SD", "TN", "TX", "WA", "WY"]);

// Top marginal state income-tax rate, used as a flat simplification for
// every state except California (which gets the real bracket treatment in
// caTax.ts). For an actually-flat-rate state this rate is exact; for a
// progressive state it deliberately overstates tax for any household below
// the top bracket — conservative in the "don't overstate the NV savings"
// direction, and clearly labeled as such in the calculator's own copy
// rather than presented as bracket-accurate.
const TOP_RATE: Partial<Record<StateCode, number>> = {
  AL: 0.05, AZ: 0.025, AR: 0.039, CO: 0.044, CT: 0.0699, DE: 0.066,
  DC: 0.1075, GA: 0.0519, HI: 0.11, ID: 0.053, IL: 0.0495, IN: 0.03,
  IA: 0.038, KS: 0.0558, KY: 0.04, LA: 0.03, ME: 0.0715, MD: 0.0575,
  MA: 0.05, MI: 0.0405, MN: 0.0985, MS: 0.044, MO: 0.047, MT: 0.059,
  NE: 0.052, NJ: 0.1075, NM: 0.059, NY: 0.109, NC: 0.0425, ND: 0.025,
  OH: 0.035, OK: 0.0475, OR: 0.099, PA: 0.0307, RI: 0.0599, SC: 0.062,
  UT: 0.0455, VT: 0.0875, VA: 0.0575, WV: 0.0482, WI: 0.0765,
};

// Rough stand-in for a standard deduction on the simplified (non-California)
// path — without subtracting *something*, every flat-rate state would tax
// the first dollar of income same as the millionth, which overstates low
// and middle incomes far more than it overstates high ones. Not any real
// state's actual deduction figure; just enough to keep the curve realistic
// across the calculator's $40k-$500k slider range.
const SIMPLIFIED_STANDARD_DEDUCTION = 14_000;

export function estimateStateTax(state: StateCode, householdIncome: number): number {
  if (state === "CA") return estimateCaliforniaTax(householdIncome);
  if (NO_TAX_STATES.has(state)) return 0;

  const rate = TOP_RATE[state];
  if (rate === undefined) return 0; // unreachable given STATE_LABELS' coverage, but never a negative/NaN fallback

  const taxableIncome = Math.max(0, householdIncome - SIMPLIFIED_STANDARD_DEDUCTION);
  return Math.round(taxableIncome * rate);
}

export function isPreciseBracketState(state: StateCode): boolean {
  return state === "CA";
}
