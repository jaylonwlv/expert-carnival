"use server";

import { redirect } from "next/navigation";
import { nanoid } from "nanoid";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";
import { sendEmail, escapeHtml } from "@/lib/email";
import { sendSms } from "@/lib/sms";
import { buildAbsoluteUrl } from "@/lib/trackerUrl";
import { BUSINESS } from "@/lib/business";

export type LeadSource = "homepage" | "california" | "optin";

// Returned to useActionState rather than carried via a redirect's query
// string -- a validation failure stays on the same render, so the visitor's
// scroll position and everything else they've typed survive it. Only a
// validation error returns state; success still redirects (nothing to
// preserve once the lead's in).
export type LeadFormState = {
  error?: "missing" | "invalid_email";
  // React resets uncontrolled form fields after every action dispatch,
  // success or failure alike -- echoing back what was typed (and keying
  // the form on it in LeadForm) is what actually keeps it on screen.
  values?: { name: string; phone: string; email: string; smsConsent: boolean };
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// The homepage and /california share one lead magnet -- confirmed by
// Paulin. Both PDFs live in public/guides, so the link is just this app's
// own domain -- no external hosting/env var to configure.
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

function leadMagnetEmailHtml(firstName: string, title: string, pdfUrl: string): string {
  const downloadBlock = `<p><a href="${pdfUrl}" style="display:inline-block;background:#d97706;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600;">Download your guide</a></p>`;

  return `
    <div style="font-family:sans-serif;color:#1c1917;">
      <p>Hi ${escapeHtml(firstName)},</p>
      <p>Thanks for requesting the <strong>${escapeHtml(title)}</strong>. Here it is:</p>
      ${downloadBlock}
      <p>We'll be in touch soon to see how we can help with your move.</p>
      <p>Relocation Engine</p>
    </div>
  `;
}

export async function submitLead(
  source: LeadSource,
  path: string,
  _prevState: LeadFormState,
  formData: FormData
): Promise<LeadFormState> {
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

  const client = await prisma.client.create({
    data: {
      name,
      phone,
      email,
      token: nanoid(12),
      isPCS,
      source,
      smsConsent,
      smsConsentAt: smsConsent ? new Date() : null,
    },
  });

  const sourceLabel = source === "homepage" ? "the homepage" : `/${source}`;
  await logActivity(client.id, `New lead submitted via ${sourceLabel}.`);

  const firstName = name.split(" ")[0];
  const guide = GUIDE_BY_SOURCE[source];
  const pdfUrl = await buildAbsoluteUrl(guide.pdfPath);

  const notifyTo = process.env.LEAD_NOTIFICATION_EMAIL ?? BUSINESS.email;

  // These three sends are independent of each other -- run them together
  // instead of back-to-back so a slow Resend/Twilio response doesn't add
  // to the visitor's wait on every one of them in turn.
  await Promise.all([
    sendEmail({
      to: email,
      subject: guide.subject,
      html: leadMagnetEmailHtml(firstName, guide.title, pdfUrl),
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
            body: `Hi ${firstName}, this is Relocation Engine -- thanks for reaching out! We'll be in touch soon. Reply STOP to opt out.`,
          }),
        ]
      : []),
  ]);

  redirect(`${path}?lead_submitted=1`);
}
