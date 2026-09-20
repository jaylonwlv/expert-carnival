export type Stage = {
  title: string;
  summary: string;
  nextSteps: string;
};

export const STAGES: Stage[] = [
  {
    title: "Signed On",
    summary: "You're officially working with your Relocation Engine agent.",
    nextSteps:
      "We'll get your financing and budget confirmed so we know exactly what to search for in Las Vegas.",
  },
  {
    title: "Financing & Budget",
    summary: "Your lender is confirming your pre-approval and total moving budget.",
    nextSteps:
      "Once pre-approval is in hand, we'll build your custom list of Las Vegas neighborhoods and homes.",
  },
  {
    title: "Home & Area Selection",
    summary: "Your agent is sending curated listings and neighborhood breakdowns based on your must-haves.",
    nextSteps: "We'll schedule your tour (in person or virtual) of your top picks.",
  },
  {
    title: "Touring Homes",
    summary: "You're touring homes in Las Vegas with your agent.",
    nextSteps: "Once you find the one, we'll put together a competitive offer.",
  },
  {
    title: "Offer Submitted",
    summary: "Your offer is in and your agent is negotiating on your behalf.",
    nextSteps: "We're waiting on the seller's response — accepted, countered, or we look at backups.",
  },
  {
    title: "Under Contract",
    summary: "You're under contract. Now it's inspections, appraisal, and loan finalization.",
    nextSteps: "Stay reachable for your lender and inspector — we'll flag anything you need to sign.",
  },
  {
    title: "Closing",
    summary: "You're in the final stretch — closing documents and funding are being finalized.",
    nextSteps: "Once funds are confirmed, you'll get your keys.",
  },
  {
    title: "Moved In",
    summary: "Welcome home! You're officially a Las Vegas resident.",
    nextSteps: "Let us know if you need local recommendations — thank you for trusting us with your move.",
  },
];
