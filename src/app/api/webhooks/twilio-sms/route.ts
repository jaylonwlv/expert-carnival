import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { toE164, sendSms } from "@/lib/sms";
import { sendEmail, escapeHtml } from "@/lib/email";
import { logActivity } from "@/lib/activity";
import { BUSINESS } from "@/lib/business";
import { classifyTimelineReply, TIMELINE_LABELS } from "@/lib/timeline";

// The standard CTIA/carrier-recognized opt-out and opt-in keywords — every
// SMS this app sends already promises "Reply STOP to opt out, HELP for
// help" (lead-actions.ts, the review-request cron, the SMS Terms page), so
// honoring them here isn't optional polish, it's making good on a promise
// already made in writing.
const STOP_KEYWORDS = new Set(["STOP", "STOPALL", "UNSUBSCRIBE", "CANCEL", "END", "QUIT"]);
const START_KEYWORDS = new Set(["START", "UNSTOP", "YES"]);
const HELP_KEYWORDS = new Set(["HELP", "INFO"]);

// Configured as this Twilio number's "A Message Comes In" webhook. Unlike
// every other inbound path in this app, a request here isn't something a
// browser navigated to — it's unauthenticated by default, so without the
// signature check below, anyone who discovered this URL could POST a fake
// reply and overwrite any client's timeline. Twilio's own validation
// algorithm (https://www.twilio.com/docs/usage/webhooks/webhooks-security):
// HMAC-SHA1, keyed by the Auth Token, over the exact request URL followed
// by every POST param's key+value concatenated in sorted-key order.
function isValidTwilioSignature(url: string, params: Record<string, string>, signature: string, authToken: string): boolean {
  const sortedKeys = Object.keys(params).sort();
  let data = url;
  for (const key of sortedKeys) data += key + params[key];

  const expected = crypto.createHmac("sha1", authToken).update(Buffer.from(data, "utf-8")).digest("base64");

  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function emptyTwiml(): NextResponse {
  // Twilio expects a TwiML response (even an empty one) to treat this as a
  // handled webhook rather than an error — there's nothing to say back to
  // the lead here, so an empty <Response/> is the correct "got it."
  return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
    status: 200,
    headers: { "Content-Type": "text/xml" },
  });
}

// Unlike the outbound sends elsewhere in this app (a separate API call to
// Twilio's REST endpoint), a STOP/HELP reply's own confirmation goes back
// as TwiML in this same response — Twilio delivers it as the reply to the
// exact message that triggered it, with no second outbound send to pay for
// or to race against.
function twimlMessage(message: string): NextResponse {
  const escaped = message.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return new NextResponse(
    `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escaped}</Message></Response>`,
    { status: 200, headers: { "Content-Type": "text/xml" } }
  );
}

async function notifyPaulinOfUnhandledReply(from: string, body: string, reason: string) {
  await sendEmail({
    to: BUSINESS.email,
    subject: "A timeline reply needs a manual look",
    html: `
      <p>${escapeHtml(reason)}</p>
      <p>From: ${escapeHtml(from)}</p>
      <p>Message: "${escapeHtml(body)}"</p>
    `,
  });
}

// Real-time nudge for an actual lead replying — separate from (and faster
// to notice than) the email path above, which is for replies that need a
// manual look rather than ones that already resolved cleanly. Reuses the
// same NEXT_PUBLIC_AGENT_PHONE the client tracker page already shows as
// "reach Paulin" — no second phone-number env var to keep in sync with
// it. No-ops (same pattern as AGENT_EMAIL) if it's unset.
async function notifyPaulinBySms(message: string) {
  const agentPhone = process.env.NEXT_PUBLIC_AGENT_PHONE;
  if (!agentPhone) return;
  await sendSms({ to: agentPhone, body: message });
}

export async function POST(req: NextRequest) {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const signature = req.headers.get("x-twilio-signature");

  const formData = await req.formData();
  const params: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") params[key] = value;
  }

  if (!authToken || !signature || !isValidTwilioSignature(req.url, params, signature, authToken)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
  }

  const from = params.From;
  const body = params.Body ?? "";
  if (!from) return emptyTwiml();

  // Client.phone is free-text (whatever a lead typed into the form), not
  // stored normalized — toE164 here is the same normalization sendSms
  // already applies at send time, so a stored "(702) 555-1234" correctly
  // matches Twilio's own already-E.164 `From`.
  const candidates = await prisma.client.findMany({ where: { phone: { not: null } } });
  const matches = candidates.filter((c) => c.phone && toE164(c.phone) === from);

  if (matches.length !== 1) {
    await notifyPaulinOfUnhandledReply(
      from,
      body,
      matches.length === 0
        ? "Received a timeline reply from a number that doesn't match any client."
        : `Received a timeline reply from a number matching ${matches.length} clients — can't tell which one.`
    );
    return emptyTwiml();
  }

  const client = matches[0];
  // Checked before classifyTimelineReply below — "STOP" would never match
  // A/B/C anyway, but catching it here is what actually revokes consent
  // instead of just falling through to "unrecognized reply."
  const normalizedBody = body.trim().toUpperCase();

  if (STOP_KEYWORDS.has(normalizedBody)) {
    await prisma.client.update({ where: { id: client.id }, data: { smsConsent: false } });
    await logActivity(client.id, "Replied STOP — SMS consent revoked.");
    return twimlMessage(
      `You have been unsubscribed from ${BUSINESS.legalName} text messages. No further messages will be sent. Reply START to opt back in.`
    );
  }

  if (START_KEYWORDS.has(normalizedBody)) {
    await prisma.client.update({ where: { id: client.id }, data: { smsConsent: true, smsConsentAt: new Date() } });
    await logActivity(client.id, "Replied START — SMS consent restored.");
    return twimlMessage(`You're resubscribed to ${BUSINESS.legalName} text messages. Reply STOP to opt out again.`);
  }

  if (HELP_KEYWORDS.has(normalizedBody)) {
    return twimlMessage(
      `${BUSINESS.legalName}: for help, contact ${BUSINESS.email} or ${BUSINESS.phone}. Msg & data rates may apply. Reply STOP to unsubscribe.`
    );
  }

  const timeline = classifyTimelineReply(body, client.isPCS);

  if (!timeline) {
    await logActivity(client.id, `Received an unrecognized timeline reply: "${body}".`);
    await notifyPaulinOfUnhandledReply(
      from,
      body,
      `${client.name}'s timeline reply didn't parse as ${client.isPCS ? "A/B" : "A/B/C"}.`
    );
    await notifyPaulinBySms(
      `${client.name} replied: "${body}" — didn't parse as ${client.isPCS ? "A/B" : "A/B/C"}, check your email.`
    );
    return emptyTwiml();
  }

  await prisma.client.update({
    where: { id: client.id },
    data: { timeline, timelineSetAt: new Date() },
  });
  await logActivity(client.id, `Timeline reply: ${TIMELINE_LABELS[timeline]} (auto-classified from SMS).`);
  await notifyPaulinBySms(`${client.name} replied to the timeline text: ${TIMELINE_LABELS[timeline]}.`);

  return emptyTwiml();
}
