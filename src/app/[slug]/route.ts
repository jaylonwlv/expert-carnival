import { NextResponse } from "next/server";
import { SHORT_LINKS } from "@/lib/shortLinks";

// Bio-link redirects (see lib/shortLinks.ts). A 307 (not 308) so the
// mapping can be repointed later -- e.g. retiring a campaign -- without a
// browser or CDN having cached the old destination as permanent.
export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const link = SHORT_LINKS[slug];
  const url = new URL(request.url);

  if (!link) {
    console.warn(`[shortLinks] Unknown slug "${slug}" -- sending to homepage untagged.`);
    return NextResponse.redirect(new URL("/", url.origin), 307);
  }

  const target = new URL(link.path, url.origin);
  target.searchParams.set("utm_source", link.utmSource);
  target.searchParams.set("utm_medium", link.utmMedium);

  // Lets one short slug cover many videos: relocationengine.com/tt?c=move-day-1
  // tags utm_campaign without needing a separate slug per video.
  const campaign = url.searchParams.get("c");
  if (campaign) target.searchParams.set("utm_campaign", campaign.slice(0, 200));

  return NextResponse.redirect(target, 307);
}
