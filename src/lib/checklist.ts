import { prisma } from "@/lib/prisma";

export type ChecklistStatus = "pending" | "done" | "not_needed";

export type ChecklistItemTemplate = {
  key: string;
  label: string;
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
export const STAGE_CHECKLISTS: StageChecklist[] = [
  {
    // Signed On
    documentHeavy: false,
    items: [
      { key: "representation_agreement_signed", label: "Representation agreement signed" },
      { key: "contact_prefs_confirmed", label: "Contact info & communication preferences confirmed" },
    ],
  },
  {
    // Financing & Budget
    documentHeavy: true,
    items: [
      { key: "pay_stubs", label: "Pay stubs collected (~30 days)" },
      { key: "w2s", label: "W-2s collected (2 years)" },
      { key: "bank_statements", label: "Bank/asset statements collected (1–2 months)" },
      { key: "photo_id", label: "Photo ID collected" },
      { key: "credit_pulled", label: "Credit pulled by lender" },
      { key: "self_employed_docs", label: "Tax returns + P&L collected (self-employed only)" },
      { key: "preapproval_letter", label: "Pre-approval letter received" },
    ],
  },
  {
    // Home & Area Selection
    documentHeavy: false,
    items: [
      { key: "must_haves_collected", label: "Must-have list collected from client" },
      { key: "neighborhoods_selected", label: "Preferred neighborhood(s) selected" },
      { key: "listings_sent", label: "Listings/neighborhood guide sent" },
      { key: "saved_search_setup", label: "Saved search set up" },
    ],
  },
  {
    // Touring Homes
    documentHeavy: false,
    items: [
      { key: "tours_scheduled", label: "Tour(s) scheduled" },
      { key: "tours_completed", label: "Tour(s) completed" },
      { key: "shortlist_narrowed", label: "Shortlist narrowed to top choice(s)" },
    ],
  },
  {
    // Offer Submitted
    documentHeavy: false,
    items: [
      { key: "offer_drafted", label: "Offer drafted (GLVAR purchase agreement)" },
      { key: "earnest_money_instructions_sent", label: "Earnest money deposit instructions sent to client" },
      { key: "offer_submitted", label: "Offer submitted to listing agent" },
      { key: "seller_response_received", label: "Seller response received (accepted/countered/rejected)" },
    ],
  },
  {
    // Under Contract
    documentHeavy: true,
    items: [
      { key: "escrow_opened", label: "Escrow opened" },
      { key: "earnest_money_deposited", label: "Earnest money deposited" },
      { key: "seller_disclosure_received", label: "Seller's Real Property Disclosure (Form 547) received" },
      {
        key: "lead_paint_disclosure",
        label: "Lead-based paint disclosure + EPA pamphlet provided (pre-1978 homes only)",
      },
      { key: "hoa_resale_package_ordered", label: "HOA resale package ordered (if applicable)" },
      { key: "hoa_rescission_period_passed", label: "HOA 5-day rescission period passed/waived (if applicable)" },
      { key: "inspection_scheduled", label: "Home inspection scheduled" },
      { key: "inspection_completed", label: "Home inspection completed" },
      { key: "repairs_negotiated", label: "Repair requests negotiated" },
      { key: "appraisal_ordered", label: "Appraisal ordered" },
      { key: "appraisal_completed", label: "Appraisal completed" },
      { key: "loan_conditions_cleared", label: "Loan conditions cleared with lender" },
      { key: "clear_to_close", label: "Clear to close received" },
    ],
  },
  {
    // Closing
    documentHeavy: true,
    items: [
      { key: "closing_disclosure_received", label: "Closing Disclosure received (3-day review)" },
      { key: "final_walkthrough", label: "Final walkthrough completed" },
      { key: "wire_fraud_advisory_reviewed", label: "Wire fraud advisory reviewed with client" },
      { key: "closing_documents_signed", label: "Closing documents signed" },
      { key: "funds_wired_deed_recorded", label: "Funds wired & deed recorded" },
      { key: "keys_received", label: "Keys received" },
    ],
  },
  {
    // Moved In
    documentHeavy: false,
    items: [
      { key: "utilities_transferred", label: "Utilities transferred" },
      { key: "welcome_package_sent", label: "Welcome package / local recommendations sent" },
    ],
  },
];

const TOTAL_CHECKLIST_ITEMS = STAGE_CHECKLISTS.reduce((sum, stage) => sum + stage.items.length, 0);

export async function ensureChecklistItems(clientId: string) {
  // Cheap short-circuit: once a client's items are seeded (the common case on
  // every page load after the first), skip the 37-upsert pass entirely instead
  // of re-upserting unchanged rows every time the page re-renders.
  const existingCount = await prisma.checklistItem.count({ where: { clientId } });
  if (existingCount === TOTAL_CHECKLIST_ITEMS) return;

  const upserts = STAGE_CHECKLISTS.flatMap(({ items }, stageIndex) =>
    items.map(({ key, label }, sortOrder) =>
      prisma.checklistItem.upsert({
        where: { clientId_key: { clientId, key } },
        update: { label, sortOrder, stageIndex },
        create: { clientId, key, label, sortOrder, stageIndex },
      })
    )
  );

  await Promise.all(upserts);
}
