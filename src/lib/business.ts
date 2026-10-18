// Shared business details referenced across the public site (footer, about,
// contact, and the legal pages) so they're defined once rather than copied
// into six files that would quietly drift apart.
export const BUSINESS = {
  legalName: "Relocation Engine LLC",
  parentEntity: "Global Citizen Ventures LLC",
  phone: "725-666-9289",
  phoneHref: "tel:+17256669289",
  email: "guide@relocationengine.com",
  accessibilityEmail: "realtorpaulin@gmail.com",
  nvLicense: "S.0204097",
  licensee: "Paulin Korensia",
  domain: "relocationengine.com",
  // TODO: replace with the real Google Business Profile short review link
  // (Business Profile > Ask for reviews > Share review form) before the
  // post-move review-request cron (api/cron/review-requests) goes live.
  reviewUrl: "https://g.page/r/REPLACE_ME/review",
} as const;
