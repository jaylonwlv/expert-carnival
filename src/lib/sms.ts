// Sends via Twilio's REST API directly (no SDK dependency, consistent with
// how lib/email.ts talks to Resend). No-ops with a console log when Twilio
// credentials aren't set, so lead capture can be built and tested before
// real credentials exist.
//
// Required for production: a Twilio account, an SMS-capable phone number,
// and TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN + TWILIO_FROM_NUMBER set in the
// deployment's environment variables.

// Twilio requires E.164 (+1XXXXXXXXXX). Lead forms collect phone numbers as
// free text (e.g. "(702) 555-1234"), so normalize at send time rather than
// rejecting whatever format the person typed. Exported so the inbound SMS
// webhook (api/webhooks/twilio-sms) can normalize a stored Client.phone the
// same way before comparing it against Twilio's own already-E.164 `From`.
export function toE164(phone: string): string {
  if (phone.startsWith("+")) return phone;
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return `+${digits}`;
}

export async function sendSms({ to, body }: { to: string; body: string }): Promise<void> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;

  if (!accountSid || !authToken || !from) {
    console.log(`[sms] Twilio credentials not set, would text ${to}: "${body}"`);
    return;
  }

  // A failed send should never take down the mutation it's a side effect of,
  // swallow both network-level failures and non-OK responses here,
  // matching sendEmail's error handling in lib/email.ts.
  try {
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ To: toE164(to), From: from, Body: body }).toString(),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`[sms] Failed to text ${to}: ${res.status} ${text}`);
    }
  } catch (err) {
    console.error(`[sms] Failed to text ${to}:`, err);
  }
}
