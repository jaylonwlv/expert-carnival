"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { cookies, headers } from "next/headers";
import { nanoid } from "nanoid";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";
import { sendEmail, escapeHtml } from "@/lib/email";
import { sendSms } from "@/lib/sms";
import { buildAbsoluteUrl } from "@/lib/trackerUrl";
import { BUSINESS } from "@/lib/business";
import { isDatabaseConnectivityError } from "@/lib/dbErrors";
import { TIMELINE_SMS_BODY } from "@/lib/timeline";
import { getClientIp } from "@/lib/clientIp";
import { sendMetaLeadEvent } from "@/lib/meta";

export type LeadSource = "homepage" | "california" | "optin";

// Returned to useActionState rather than carried via a redirect's query
// string, a validation failure stays on the same render, so the visitor's
// scroll position and everything else they've typed survive it. Only a
// validation error returns state; success still redirects (nothing to
// preserve once the lead's in).
export type LeadFormState = {
  error?: "missing" | "invalid_email" | "db_unavailable";
  // React resets uncontrolled form fields after every action dispatch,
  // success or failure alike, echoing back what was typed (and keying
  // the form on it in LeadForm) is what actually keeps it on screen.
  values?: { name: string; phone: string; email: string; smsConsent: boolean };
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// The homepage and /california share one lead magnet, confirmed by
// Paulin. Both PDFs live in public/guides, so the link is just this app's
// own domain, no external hosting/env var to configure.
const GUIDE_BY_SOURCE: Record<LeadSource, { pdfPath: string; subject: string; title: string }> = {
  homepage: {
    pdfPath: "/guides/California-to-Las-Vegas-Relocation-Guide-2026.pdf",
    subject: "Your California to Las Vegas Relocation Guide",
    title: "California to Las Vegas Relocation Guide",
  },
  california: {
    pdfPath: "/guides/California-to-Las-Vegas-Relocation-Guide-2026.pdf",
    subject: "Your California to Las Vegas Relocation Guide",
    title: "California to Las Vegas Relocation Guide",
  },
  optin: {
    pdfPath: "/guides/PCS-to-Las-Vegas-Relocation-Guide-2026.pdf",
    subject: "Your PCS to Las Vegas Relocation Guide",
    title: "PCS to Las Vegas Relocation Guide",
  },
};

// Previously just "thanks for requesting X, here's the download", the
// one touchpoint that should carry the landing page's own warmth (Paulin's
// photo, a personal signature, a concrete next step) into the recipient's
// inbox was carrying none of it, reading more like an automated receipt
// than a handoff from a real person. logoUrl/photoUrl have to be absolute
// (not root-relative), most email clients render straight from the raw
// HTML with no site origin to resolve a relative path against.
function leadMagnetEmailHtml(
  firstName: string,
  title: string,
  pdfUrl: string,
  logoUrl: string,
  photoUrl: string
): string {
  const downloadBlock = `<p><a href="${pdfUrl}" style="display:inline-block;background:#d97706;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600;">Download your guide</a></p>`;

  return `
    <div style="font-family:sans-serif;color:#1c1917;max-width:480px;">
      <img src="${logoUrl}" alt="${escapeHtml(BUSINESS.legalName)}" height="40" style="margin-bottom:20px;">
      <p>Hi ${escapeHtml(firstName)},</p>
      <p>Thanks for requesting the <strong>${escapeHtml(title)}</strong>. Here it is:</p>
      ${downloadBlock}
      <p>I'll personally reach out by call or text soon to see how I can help with your move.
      No pressure, just a conversation about your timeline and what you're looking for.</p>
      <table cellpadding="0" cellspacing="0" style="margin-top:20px;">
        <tr>
          <td style="padding-right:12px;">
            <img src="${photoUrl}" alt="${escapeHtml(BUSINESS.licensee)}" width="56" height="56"
              style="border-radius:50%;object-fit:cover;display:block;">
          </td>
          <td style="font-size:14px;line-height:1.4;">
            <strong>${escapeHtml(BUSINESS.licensee)}</strong><br>
            <span style="color:#78716c;">Licensed Nevada Realtor · License #${escapeHtml(BUSINESS.nvLicense)}</span><br>
            <span style="color:#78716c;">Brokered by ${escapeHtml(BUSINESS.brokerage)} · CA DRE #${escapeHtml(BUSINESS.caDre)}</span>
          </td>
        </tr>
      </table>
    </div>
  `;
}

export async function submitLead(
  source: LeadSource,
  path: string,
  _prevState: LeadFormState,
  formData: FormData
): Promise<LeadFormState> {
  // Honeypot: a field real visitors never see or tab to (LeadForm positions
  // it off-screen and marks it aria-hidden/tabIndex=-1), named "company",
  // generic enough that a bot filling every field it finds on a lead form
  // tends to fill it anyway. A filled value means this wasn't a person;
  // pretend success without writing anything or sending any email/SMS, so
  // nothing here tips the bot off that it was caught.
  if (String(formData.get("company") ?? "").trim()) {
    redirect(`${path}?lead_submitted=1`);
  }

  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const smsConsent = formData.get("smsConsent") === "on";
  const values = { name, phone, email, smsConsent };

  if (!name || !phone || !email) {
    return { error: "missing", values };
  }
  if (!EMAIL_RE.test(email)) {
    return { error: "invalid_email", values };
  }

  const isPCS = source === "optin";

  // Read straight off whatever hidden fields LeadForm rendered (see
  // app/california/page.tsx, app/optin/page.tsx, app/page.tsx), already
  // length-capped server-side by extractTrackingParams before they ever
  // reached a hidden input, but formData is still attacker-controlled input
  // from here, so each is treated as optional/untrusted the same way
  // name/phone/email already are.
  const utmSource = String(formData.get("utm_source") ?? "").trim() || null;
  const utmMedium = String(formData.get("utm_medium") ?? "").trim() || null;
  const utmCampaign = String(formData.get("utm_campaign") ?? "").trim() || null;
  const utmContent = String(formData.get("utm_content") ?? "").trim() || null;
  const utmTerm = String(formData.get("utm_term") ?? "").trim() || null;
  const fbclid = String(formData.get("fbclid") ?? "").trim() || null;
  // Captured server-side when the landing page itself rendered (close to
  // the actual ad click), not at submission time, a visitor who browses
  // for a few minutes before submitting would otherwise get a fabricated
  // "click time" in the fbc fallback below that's really the submit time.
  const fbclidCapturedAtRaw = Number(formData.get("fbclid_captured_at"));
  const fbclidCapturedAt = Number.isFinite(fbclidCapturedAtRaw) && fbclidCapturedAtRaw > 0 ? fbclidCapturedAtRaw : null;

  // Unlike the validation checks above, a database hiccup here isn't the
  // visitor's fault and shouldn't cost them what they typed: without this,
  // the exception reaches the root error boundary, which unmounts the
  // whole form, name/phone/email, gone, with only a generic "Something
  // went wrong." Catching it here and returning state (same pattern as the
  // validation errors above) keeps `values` echoed back so they can just
  // retry immediately.
  let client;
  try {
    client = await prisma.client.create({
      data: {
        name,
        phone,
        email,
        token: nanoid(12),
        isPCS,
        source,
        smsConsent,
        smsConsentAt: smsConsent ? new Date() : null,
        utmSource,
        utmMedium,
        utmCampaign,
        utmContent,
        utmTerm,
        fbclid,
      },
    });
  } catch (error) {
    if (!isDatabaseConnectivityError(error)) throw error;
    return { error: "db_unavailable", values };
  }

  const sourceLabel = source === "homepage" ? "the homepage" : `/${source}`;
  await logActivity(client.id, `New lead submitted via ${sourceLabel}.`);

  const firstName = name.split(" ")[0];
  const guide = GUIDE_BY_SOURCE[source];
  const [pdfUrl, logoUrl, photoUrl] = await Promise.all([
    buildAbsoluteUrl(guide.pdfPath),
    buildAbsoluteUrl("/logo.png"),
    buildAbsoluteUrl("/team/paulin-bust.jpg"),
  ]);

  const notifyTo = process.env.LEAD_NOTIFICATION_EMAIL ?? BUSINESS.email;

  // Shared between the server-side Conversions API call below and the
  // browser Pixel's own "Lead" event (components/MetaLeadPixelFire.tsx,
  // fired once the visitor actually reaches the success state) so both
  // halves report the exact same event_id and Meta deduplicates them
  // instead of counting one real conversion twice.
  //
  // Carried to the client via a short-lived, httpOnly cookie rather than
  // the redirect's own query string, a query param is visible to and
  // craftable by anyone, and LeadForm's success branch (gated only on
  // `?lead_submitted=1`) doesn't verify a real submission happened. Without
  // this, visiting `/california?lead_submitted=1&eid=<anything>` directly
  //, no form filled in, no Client row ever created, would still fire a
  // real "Lead" conversion event against the live ad account. An httpOnly
  // cookie can only be set by this server action actually running, so
  // there's no way to manufacture one without a genuine submission.
  const metaEventId = randomUUID();
  const eventSourceUrl = await buildAbsoluteUrl(path);
  const clientIp = await getClientIp();
  const userAgent = (await headers()).get("user-agent");
  const cookieStore = await cookies();
  const fbp = cookieStore.get("_fbp")?.value ?? null;
  // Meta's own fallback construction for when the click landed before the
  // Pixel had a chance to set _fbc itself, using the URL's own fbclid
  // (captured into the Client record above) still gives Meta something to
  // match against instead of nothing. Uses the page-load-time timestamp
  // captured above, not "now", since this fallback's whole point is
  // approximating when the click actually happened.
  const fbc =
    cookieStore.get("_fbc")?.value ?? (fbclid ? `fb.1.${fbclidCapturedAt ?? Date.now()}.${fbclid}` : null);

  cookieStore.set("meta_lead_eid", metaEventId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    // Just long enough to survive the redirect and the success page's own
    // render, not a general-purpose session, so it isn't left around as
    // a replayable credential beyond the one request that needs it.
    maxAge: 300,
  });

  // The lead is already safely committed above, none of these sends can
  // change that (sendEmail/sendSms/sendMetaLeadEvent all swallow their own
  // errors), and the visitor's "you're all set" confirmation doesn't need
  // any of them to have actually gone out yet. Running them via `after()`
  // instead of awaiting lets the redirect fire as soon as the DB write
  // lands, rather than holding the visitor's spinner hostage to however
  // long Resend/Twilio/Meta take to respond. `after()` (not a bare fire-
  // and-forget) is what keeps this work alive past the response on a
  // serverless deployment, where an un-awaited promise can otherwise get
  // cut off the instant the response is sent.
  after(() =>
    Promise.all([
      sendMetaLeadEvent({
        email,
        phone,
        eventId: metaEventId,
        eventSourceUrl,
        clientIp,
        userAgent,
        fbp,
        fbc,
      }),
      sendEmail({
        to: email,
        subject: guide.subject,
        html: leadMagnetEmailHtml(firstName, guide.title, pdfUrl, logoUrl, photoUrl),
        // Attached directly, not just linked, a spam filter or an
        // email client set to block remote content can keep the link
        // from ever loading, but an attachment arrives with the email
        // itself either way. The download button in the body stays too,
        // as a second path to the same file.
        attachments: [{ filename: guide.pdfPath.split("/").pop()!, path: pdfUrl }],
      }),
      sendEmail({
        to: notifyTo,
        subject: `New lead: ${name}`,
        html: `
        <div style="font-family:sans-serif;color:#1c1917;">
          <p>New lead from <strong>${escapeHtml(sourceLabel)}</strong>:</p>
          <ul>
            <li>Name: ${escapeHtml(name)}</li>
            <li>Phone: ${escapeHtml(phone)}</li>
            <li>Email: ${escapeHtml(email)}</li>
            <li>SMS consent: ${smsConsent ? "Yes" : "No"}</li>
          </ul>
        </div>
      `,
      }),
      ...(smsConsent
        ? [
            sendSms({
              to: phone,
              body: `Hi ${firstName}, this is Relocation Engine. Thanks for reaching out! We'll be in touch soon. Reply STOP to opt out.`,
            }),
            // Separate text, not folded into the one above, a reply to
            // this one is meant to come back as a bare "A"/"B"/"C" (see
            // lib/timeline.ts), which only works cleanly if the question is
            // the only thing in the thread asking for a reply.
            sendSms({
              to: phone,
              body: TIMELINE_SMS_BODY[isPCS ? "pcs" : "california"],
            }),
          ]
        : []),
    ])
  );

  redirect(`${path}?lead_submitted=1`);
}
