const TRACKING_PARAM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid"] as const;

// Pulled straight from the landing page's own query string and passed
// through as hidden form fields (see components/LeadForm.tsx) -- these
// values are attacker-controlled (anyone can craft a link with arbitrary
// query params), so each is capped defensively before it ever reaches a
// hidden input or the database, rather than trusted as-is.
export function extractTrackingParams(searchParams: Record<string, string | string[] | undefined>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const key of TRACKING_PARAM_KEYS) {
    const raw = searchParams[key];
    const value = Array.isArray(raw) ? raw[0] : raw;
    if (value) result[key] = value.slice(0, 200);
  }
  return result;
}

export function singleParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
