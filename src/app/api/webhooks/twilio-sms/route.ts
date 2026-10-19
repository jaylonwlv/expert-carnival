import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { toE164 } from "@/lib/sms";
import { sendEmail, escapeHtml } from "@/lib/email";
import { logActivity } from "@/lib/activity";
import { BUSINESS } from "@/lib/business";
import { classifyTimelineReply, TIMELINE_LABELS } from "@/lib/timeline";

// Configured as this Twilio number's "A Message Comes In" webhook. Unlike
// every other inbound path in this app, a request here isn't something a
// browser navigated to -- it's unauthenticated by default, so without the
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
  // handled webhook rather than an error -- there's nothing to say back to
  // the lead here, so an empty <Response/> is the correct "got it."
  return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
    status: 200,
    headers: { "Content-Type": "text/xml" },
  });
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
  // stored normalized -- toE164 here is the same normalization sendSms
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
        : `Received a timeline reply from a number matching ${matches.length} clients -- can't tell which one.`
    );
    return emptyTwiml();
  }

  const client = matches[0];
  const timeline = classifyTimelineReply(body);

  if (!timeline) {
    await logActivity(client.id, `Received an unrecognized timeline reply: "${body}".`);
    await notifyPaulinOfUnhandledReply(from, body, `${client.name}'s timeline reply didn't parse as A/B/C.`);
    return emptyTwiml();
  }

  await prisma.client.update({
    where: { id: client.id },
    data: { timeline, timelineSetAt: new Date() },
  });
  await logActivity(client.id, `Timeline reply: ${TIMELINE_LABELS[timeline]} (auto-classified from SMS).`);

  return emptyTwiml();
}
