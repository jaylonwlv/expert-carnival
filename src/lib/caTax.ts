// California 2025 married-filing-jointly state income tax brackets, standard
// deduction, and personal exemption credit (FTB 2025 schedules). Nevada has
// no state income tax, so the "Nevada tax" side of this comparison is always
// $0, there's nothing to model there.
const STANDARD_DEDUCTION_MFJ = 11_412;
const PERSONAL_EXEMPTION_CREDIT_MFJ = 306;
const MENTAL_HEALTH_SERVICES_TAX_THRESHOLD = 1_000_000;
const MENTAL_HEALTH_SERVICES_TAX_RATE = 0.01;

const BRACKETS_MFJ: { upTo: number; rate: number }[] = [
  { upTo: 22_158, rate: 0.01 },
  { upTo: 52_528, rate: 0.02 },
  { upTo: 82_904, rate: 0.04 },
  { upTo: 115_084, rate: 0.06 },
  { upTo: 145_448, rate: 0.08 },
  { upTo: 742_958, rate: 0.093 },
  { upTo: 891_542, rate: 0.103 },
  { upTo: 1_485_906, rate: 0.113 },
  { upTo: Infinity, rate: 0.123 },
];

// Estimated only, illustrative, not tax advice. Matches the methodology
// footnoted in the California relocation guide PDF: married filing jointly,
// standard deduction only, no credits beyond the personal exemption.
export function estimateCaliforniaTax(householdIncome: number): number {
  const taxableIncome = Math.max(0, householdIncome - STANDARD_DEDUCTION_MFJ);

  let tax = 0;
  let previousCap = 0;
  for (const bracket of BRACKETS_MFJ) {
    if (taxableIncome <= previousCap) break;
    const amountInBracket = Math.min(taxableIncome, bracket.upTo) - previousCap;
    tax += amountInBracket * bracket.rate;
    previousCap = bracket.upTo;
  }

  tax = Math.max(0, tax - PERSONAL_EXEMPTION_CREDIT_MFJ);

  if (taxableIncome > MENTAL_HEALTH_SERVICES_TAX_THRESHOLD) {
    tax += (taxableIncome - MENTAL_HEALTH_SERVICES_TAX_THRESHOLD) * MENTAL_HEALTH_SERVICES_TAX_RATE;
  }

  return Math.round(tax);
}
