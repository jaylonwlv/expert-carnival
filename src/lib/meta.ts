import crypto from "node:crypto";
import { cookies } from "next/headers";

// Graph API version pins to a specific release; Meta deprecates old ones on
// a rolling schedule, so this needs bumping occasionally (check
// developers.facebook.com/docs/graph-api/changelog before it's dropped).
const GRAPH_API_VERSION = "v21.0";

// Set only by submitLead actually running (see app/lead-actions.ts) —
// reading it back here, instead of trusting a `?eid=` query param a page
// might otherwise accept, is what stops anyone from crafting a success URL
// that fires a fake "Lead" event without a real submission ever happening.
export async function getMetaLeadEventId(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get("meta_lead_eid")?.value;
}

// Meta requires user_data identifiers to arrive pre-hashed (SHA-256,
// lowercased, trimmed) — it never sees the raw email/phone, only the hash,
// which it compares against its own hash of the same value for matching.
function hashForMeta(value: string): string {
  return crypto.createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

// Meta wants digits only, country code included, no "+" — same
// normalization sendSms's toE164 applies for Twilio, minus the leading "+"
// (lib/sms.ts keeps its own copy since the two have different output
// formats, not because the logic actually differs).
function normalizePhoneForMeta(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `1${digits}`;
  return digits;
}

// Sends a server-side "Lead" event via Meta's Conversions API, paired with
// the browser Pixel's own client-side Lead event for the same `eventId`
// (see components/MetaLeadPixelFire.tsx) so Meta deduplicates instead of
// double-counting. The server-side half is what makes this reliable: it
// still fires through an ad blocker, Safari's tracking prevention, or the
// site's own no-JS path (this form works without JavaScript) — the browser
// pixel alone would miss all three. No-ops with a console log when
// NEXT_PUBLIC_META_PIXEL_ID/META_CONVERSIONS_API_TOKEN aren't set, matching
// the sendEmail/sendSms pattern elsewhere in this app.
export async function sendMetaLeadEvent({
  email,
  phone,
  eventId,
  eventSourceUrl,
  clientIp,
  userAgent,
  fbp,
  fbc,
}: {
  email: string;
  phone: string;
  eventId: string;
  eventSourceUrl: string;
  clientIp: string | null;
  userAgent: string | null;
  fbp: string | null;
  fbc: string | null;
}): Promise<void> {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const accessToken = process.env.META_CONVERSIONS_API_TOKEN;

  if (!pixelId || !accessToken) {
    console.log(`[meta] Conversions API not configured — would send a "Lead" event for ${email}`);
    return;
  }

  const userData: Record<string, string> = {
    em: hashForMeta(email),
    ph: hashForMeta(normalizePhoneForMeta(phone)),
  };
  if (clientIp) userData.client_ip_address = clientIp;
  if (userAgent) userData.client_user_agent = userAgent;
  if (fbp) userData.fbp = fbp;
  if (fbc) userData.fbc = fbc;

  const body: Record<string, unknown> = {
    data: [
      {
        event_name: "Lead",
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        event_source_url: eventSourceUrl,
        action_source: "website",
        user_data: userData,
      },
    ],
  };
  // Lets this be pointed at Meta's Test Events tool in Events Manager
  // during setup/verification without affecting real ad optimization.
  if (process.env.META_TEST_EVENT_CODE) body.test_event_code = process.env.META_TEST_EVENT_CODE;

  // A failed send should never take down the mutation it's a side effect of
  // — same error-handling posture as sendEmail/sendSms.
  try {
    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_API_VERSION}/${pixelId}/events?access_token=${encodeURIComponent(accessToken)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );
    if (!res.ok) {
      const text = await res.text();
      console.error(`[meta] Failed to send Lead event: ${res.status} ${text}`);
    }
  } catch (err) {
    console.error("[meta] Failed to send Lead event:", err);
  }
}
