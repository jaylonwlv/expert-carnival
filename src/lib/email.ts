// Sends via Resend's REST API directly (no SDK dependency, consistent with
// how this project avoids extra service wrappers). No-ops with a console log
// when RESEND_API_KEY isn't set, matching the FAKE_SIGNED_URLS pattern in
// lib/documents.ts -- local dev and testing don't need a real key, and
// nothing breaks if it's missing.
//
// Required for production: a Resend account, a verified sending domain, and
// RESEND_API_KEY + EMAIL_FROM set in the deployment's environment variables.
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "Relocation Engine <updates@example.com>";

  if (!apiKey) {
    console.log(`[email] RESEND_API_KEY not set -- would send "${subject}" to ${to}`);
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error(`[email] Failed to send "${subject}" to ${to}: ${res.status} ${body}`);
  }
}
