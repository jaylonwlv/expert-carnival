import { prisma } from "@/lib/prisma";

export type ChecklistStatus = "pending" | "done" | "not_needed";

// "all" = every client. "standard" = non-PCS/civilian only. "pcs" = PCS/
// military relocation only. Lets a PCS client's checklist swap out
// financing-type items (VA vs. conventional/FHA) instead of making the
// realtor click "not needed" on a whole parallel set every time.
export type ChecklistRelevance = "all" | "standard" | "pcs";

export type ChecklistItemTemplate = {
  key: string;
  label: string;
  relevantFor: ChecklistRelevance;
};

export type StageChecklist = {
  documentHeavy: boolean;
  items: ChecklistItemTemplate[];
};

// Content researched against the Nevada Real Estate Division's Residential
// Disclosure Guide, NRS 113.130 (Form 547), NRS 116.4109 (HOA resale
// package), the federal lead-based paint disclosure rule, and standard
// GLVAR/clear-to-close practice. Situational items (self-employed docs, HOA
// package, lead paint) are expected to get marked "not needed" per client.
//
// PCS/military items (relevantFor: "pcs") were researched directly against
// VA.gov, benefits.va.gov, travel.dod.mil, and militaryonesource.mil rather
// than secondary sources. See the chat writeup for the specific citations
// and caveats (the termite/pest item in particular is Nevada-dependent and
// not fully confirmed from these searches).
export const STAGE_CHECKLISTS: StageChecklist[] = [
  {
    // Signed On
    documentHeavy: false,
    items: [
      { key: "representation_agreement_signed", label: "Representation agreement signed", relevantFor: "all" },
      {
        key: "contact_prefs_confirmed",
        label: "Contact info & communication preferences confirmed",
        relevantFor: "all",
      },
    ],
  },
  {
    // Financing & Budget
    documentHeavy: true,
    items: [
      { key: "pay_stubs", label: "Pay stubs collected (~30 days)", relevantFor: "all" },
      { key: "w2s", label: "W-2s collected (2 years)", relevantFor: "all" },
      { key: "bank_statements", label: "Bank/asset statements collected (1–2 months)", relevantFor: "all" },
      { key: "photo_id", label: "Photo ID collected", relevantFor: "all" },
      { key: "credit_pulled", label: "Credit pulled by lender", relevantFor: "all" },
      {
        key: "self_employed_docs",
        label: "Tax returns + P&L collected (self-employed only)",
        relevantFor: "standard",
      },
      { key: "preapproval_letter", label: "Pre-approval letter received", relevantFor: "all" },
      { key: "pcs_orders_received", label: "PCS orders received", relevantFor: "pcs" },
      {
        key: "coe_requested",
        label: "Certificate of Eligibility (COE) requested",
        relevantFor: "pcs",
      },
      {
        key: "coe_received",
        label: "COE received (confirms VA funding fee exemption status, if any)",
        relevantFor: "pcs",
      },
      {
        key: "bah_confirmed",
        label: "BAH confirmed for duty station (basis for budget)",
        relevantFor: "pcs",
      },
    ],
  },
  {
    // Home & Area Selection
    documentHeavy: false,
    items: [
      { key: "must_haves_collected", label: "Must-have list collected from client", relevantFor: "all" },
      { key: "neighborhoods_selected", label: "Preferred neighborhood(s) selected", relevantFor: "all" },
      { key: "listings_sent", label: "Listings/neighborhood guide sent", relevantFor: "all" },
      { key: "saved_search_setup", label: "Saved search set up", relevantFor: "all" },
      {
        key: "on_base_housing_checked",
        label: "On-base housing waitlist checked (Hunt Military Communities, if applicable)",
        relevantFor: "pcs",
      },
    ],
  },
  {
    // Touring Homes
    documentHeavy: false,
    items: [
      { key: "tours_scheduled", label: "Tour(s) scheduled", relevantFor: "all" },
      { key: "tours_completed", label: "Tour(s) completed", relevantFor: "all" },
      { key: "shortlist_narrowed", label: "Shortlist narrowed to top choice(s)", relevantFor: "all" },
    ],
  },
  {
    // Offer Submitted
    documentHeavy: false,
    items: [
      { key: "offer_drafted", label: "Offer drafted (GLVAR purchase agreement)", relevantFor: "all" },
      {
        key: "earnest_money_instructions_sent",
        label: "Earnest money deposit instructions sent to client",
        relevantFor: "all",
      },
      { key: "offer_submitted", label: "Offer submitted to listing agent", relevantFor: "all" },
      {
        key: "seller_response_received",
        label: "Seller response received (accepted/countered/rejected)",
        relevantFor: "all",
      },
      {
        key: "va_buyer_broker_fee_agreement",
        label: "Buyer-broker fee agreement signed (if client is paying agent commission directly under VA rules)",
        relevantFor: "pcs",
      },
    ],
  },
  {
    // Under Contract
    documentHeavy: true,
    items: [
      { key: "escrow_opened", label: "Escrow opened", relevantFor: "all" },
      { key: "earnest_money_deposited", label: "Earnest money deposited", relevantFor: "all" },
      {
        key: "seller_disclosure_received",
        label: "Seller's Real Property Disclosure (Form 547) received",
        relevantFor: "all",
      },
      {
        key: "lead_paint_disclosure",
        label: "Lead-based paint disclosure + EPA pamphlet provided (pre-1978 homes only)",
        relevantFor: "all",
      },
      { key: "hoa_resale_package_ordered", label: "HOA resale package ordered (if applicable)", relevantFor: "all" },
      {
        key: "hoa_rescission_period_passed",
        label: "HOA 5-day rescission period passed/waived (if applicable)",
        relevantFor: "all",
      },
      { key: "inspection_scheduled", label: "Home inspection scheduled", relevantFor: "all" },
      { key: "inspection_completed", label: "Home inspection completed", relevantFor: "all" },
      { key: "repairs_negotiated", label: "Repair requests negotiated", relevantFor: "all" },
      { key: "appraisal_ordered", label: "Appraisal ordered", relevantFor: "standard" },
      { key: "appraisal_completed", label: "Appraisal completed", relevantFor: "standard" },
      {
        key: "va_appraisal_ordered",
        label: "VA appraisal ordered (includes Minimum Property Requirements review)",
        relevantFor: "pcs",
      },
      {
        key: "va_appraisal_completed",
        label: "VA appraisal completed — any required MPR repairs cleared",
        relevantFor: "pcs",
      },
      {
        key: "pest_report_if_required",
        label: "Termite/pest report ordered if required (seller pays — buyer cannot pay this fee on a VA loan)",
        relevantFor: "pcs",
      },
      {
        key: "funding_fee_confirmed",
        label: "VA funding fee amount or exemption confirmed via COE",
        relevantFor: "pcs",
      },
      {
        key: "occupancy_timing_checked",
        label: "Occupancy timing checked against report date (VA requires intent to occupy within 60 days, extendable for documented PCS/deployment)",
        relevantFor: "pcs",
      },
      { key: "loan_conditions_cleared", label: "Loan conditions cleared with lender", relevantFor: "all" },
      { key: "clear_to_close", label: "Clear to close received", relevantFor: "all" },
    ],
  },
  {
    // Closing
    documentHeavy: true,
    items: [
      { key: "closing_disclosure_received", label: "Closing Disclosure received (3-day review)", relevantFor: "all" },
      { key: "final_walkthrough", label: "Final walkthrough completed", relevantFor: "all" },
      { key: "wire_fraud_advisory_reviewed", label: "Wire fraud advisory reviewed with client", relevantFor: "all" },
      {
        key: "funding_fee_payment_method",
        label: "VA funding fee payment method confirmed (paid at closing, financed into loan, or exempt)",
        relevantFor: "pcs",
      },
      {
        key: "occupancy_certification_signed",
        label: "VA occupancy certification (Form 26-1820) signed at closing",
        relevantFor: "pcs",
      },
      { key: "closing_documents_signed", label: "Closing documents signed", relevantFor: "all" },
      { key: "funds_wired_deed_recorded", label: "Funds wired & deed recorded", relevantFor: "all" },
      { key: "keys_received", label: "Keys received", relevantFor: "all" },
    ],
  },
  {
    // Moved In
    documentHeavy: false,
    items: [
      { key: "utilities_transferred", label: "Utilities transferred", relevantFor: "all" },
      { key: "welcome_package_sent", label: "Welcome package / local recommendations sent", relevantFor: "all" },
    ],
  },
];

function itemsForClientType(isPCS: boolean): { key: string; label: string; stageIndex: number; sortOrder: number }[] {
  const result: { key: string; label: string; stageIndex: number; sortOrder: number }[] = [];
  STAGE_CHECKLISTS.forEach(({ items }, stageIndex) => {
    let sortOrder = 0;
    for (const item of items) {
      const applies =
        item.relevantFor === "all" || (isPCS ? item.relevantFor === "pcs" : item.relevantFor === "standard");
      if (!applies) continue;
      result.push({ key: item.key, label: item.label, stageIndex, sortOrder });
      sortOrder++;
    }
  });
  return result;
}

export async function ensureChecklistItems(clientId: string, isPCS: boolean) {
  const expected = itemsForClientType(isPCS);

  // Cheap short-circuit: once a client's items are seeded (the common case on
  // every page load after the first), skip the upsert pass entirely instead
  // of re-upserting unchanged rows every time the page re-renders.
  const existingCount = await prisma.checklistItem.count({ where: { clientId } });
  if (existingCount === expected.length) return;

  await Promise.all(
    expected.map(({ key, label, stageIndex, sortOrder }) =>
      prisma.checklistItem.upsert({
        where: { clientId_key: { clientId, key } },
        update: { label, sortOrder, stageIndex },
        create: { clientId, key, label, sortOrder, stageIndex },
      })
    )
  );
}
