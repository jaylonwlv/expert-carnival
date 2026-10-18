"use server";

import { redirect } from "next/navigation";
import { nanoid } from "nanoid";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";
import { sendEmail, escapeHtml } from "@/lib/email";
import { sendSms } from "@/lib/sms";

export type LeadSource = "homepage" | "california" | "optin";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// The homepage and /california share one lead magnet (same PDF, same
// workflow -- confirmed by Paulin). /optin (PCS) gets its own guide once
// that copy and cover image exist; until then OPTIN_GUIDE_PDF_URL is unset
// and the email just says the guide is coming separately.
const GUIDE_BY_SOURCE: Record<LeadSource, { pdfEnvVar: string; subject: string; title: string }> = {
  homepage: {
    pdfEnvVar: "CALIFORNIA_GUIDE_PDF_URL",
    subject: "Your California to Las Vegas Relocation Guide",
    title: "California to Las Vegas Relocation Guide",
  },
  california: {
    pdfEnvVar: "CALIFORNIA_GUIDE_PDF_URL",
    subject: "Your California to Las Vegas Relocation Guide",
    title: "California to Las Vegas Relocation Guide",
  },
  optin: {
    pdfEnvVar: "OPTIN_GUIDE_PDF_URL",
    subject: "Your PCS to Las Vegas Relocation Guide",
    title: "PCS to Las Vegas Relocation Guide",
  },
};

function leadMagnetEmailHtml(firstName: string, title: string, pdfUrl: string | undefined): string {
  const downloadBlock = pdfUrl
    ? `<p><a href="${pdfUrl}" style="display:inline-block;background:#d97706;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600;">Download your guide</a></p>`
    : `<p>Your guide is on its way separately -- we'll follow up shortly.</p>`;

  return `
    <div style="font-family:sans-serif;color:#1c1917;">
      <p>Hi ${escapeHtml(firstName)},</p>
      <p>Thanks for requesting the <strong>${escapeHtml(title)}</strong>. Here it is:</p>
      ${downloadBlock}
      <p>We'll be in touch soon to see how we can help with your move.</p>
      <p>— Relocation Engine</p>
    </div>
  `;
}

export async function submitLead(source: LeadSource, path: string, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const smsConsent = formData.get("smsConsent") === "on";

  if (!name || !phone || !email) {
    redirect(`${path}?lead_error=missing`);
  }
  if (!EMAIL_RE.test(email)) {
    redirect(`${path}?lead_error=invalid_email`);
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
  const pdfUrl = process.env[guide.pdfEnvVar];

  await sendEmail({
    to: email,
    subject: guide.subject,
    html: leadMagnetEmailHtml(firstName, guide.title, pdfUrl),
  });

  const notifyTo = process.env.LEAD_NOTIFICATION_EMAIL;
  if (notifyTo) {
    await sendEmail({
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
    });
  } else {
    console.log(`[lead] LEAD_NOTIFICATION_EMAIL not set -- would notify about new lead "${name}"`);
  }

  if (smsConsent) {
    await sendSms({
      to: phone,
      body: `Hi ${firstName}, this is Relocation Engine -- thanks for reaching out! We'll be in touch soon. Reply STOP to opt out.`,
    });
  }

  redirect(`${path}?lead_submitted=1`);
}
