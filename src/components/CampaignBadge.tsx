// A lead's traffic source at a glance in the client list, just utmSource,
// not the full breakdown (medium/campaign/content/term), which belongs on
// the client detail page where there's room to label each one. Renders
// nothing if the lead has no campaign data at all (most leads Paulin adds
// by hand, or anyone who landed without a tagged link, won't).
export function CampaignBadge({ source }: { source: string }) {
  return (
    <span className="text-xs font-semibold text-sky-700 bg-sky-100 rounded-full px-2 py-0.5 shrink-0">
      {source}
    </span>
  );
}
