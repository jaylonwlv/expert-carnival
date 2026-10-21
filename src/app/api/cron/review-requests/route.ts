import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";
import { sendEmail, escapeHtml } from "@/lib/email";
import { sendSms } from "@/lib/sms";
import { BUSINESS } from "@/lib/business";
import { STAGES } from "@/lib/stages";

// Fires once per client, a few days after they reach the final "Moved In"
// stage: a review-request (Google Business Profile) plus a referral ask.
// Deliberately not fired the instant the stage changes, let them actually
// settle in first. Triggered by Vercel Cron (see vercel.json); CRON_SECRET
// gates it from being hit by anyone else, since this sends real
// email/SMS to real clients.
const SETTLE_IN_DAYS = 3;
const MOVED_IN_STAGE = STAGES.length - 1;

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cutoff = new Date(Date.now() - SETTLE_IN_DAYS * 24 * 60 * 60 * 1000);

  const clients = await prisma.client.findMany({
    where: {
      currentStage: MOVED_IN_STAGE,
      stageUpdatedAt: { lte: cutoff },
      reviewRequestSentAt: null,
      email: { not: null },
    },
  });

  let sent = 0;
  for (const client of clients) {
    const firstName = client.name.split(" ")[0];
    const referralUrl = `https://${BUSINESS.domain}`;

    await sendEmail({
      to: client.email!,
      subject: `Congrats on your new home, ${firstName}!`,
      html: `
        <div style="font-family:sans-serif;color:#1c1917;">
          <p>Hi ${escapeHtml(firstName)},</p>
          <p>Congratulations again on your move to Las Vegas! It's been a pleasure working with you,
          and we hope you're settling in well.</p>
          <p>If you have a minute, a quick review means a lot to a small team like ours:</p>
          <p><a href="${BUSINESS.reviewUrl}" style="display:inline-block;background:#d97706;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600;">Leave us a review</a></p>
          <p>And if you know anyone else relocating to the Las Vegas area, California sellers or
          military families with PCS orders, we'd love the introduction. They can get started at
          <a href="${referralUrl}">${escapeHtml(BUSINESS.domain)}</a>.</p>
          <p>Thank you again for trusting us with your move.</p>
          <p>${escapeHtml(BUSINESS.licensee)}<br/>${escapeHtml(BUSINESS.legalName)}</p>
        </div>
      `,
    });

    if (client.smsConsent && client.phone) {
      await sendSms({
        to: client.phone,
        body: `Hi ${firstName}, it's ${BUSINESS.licensee} with ${BUSINESS.legalName}, congrats again on your new home! If you have a minute, a review means a lot: ${BUSINESS.reviewUrl} And if you know anyone else moving to Vegas, send them to ${BUSINESS.domain}. Reply STOP to opt out.`,
      });
    }

    await prisma.client.update({
      where: { id: client.id },
      data: { reviewRequestSentAt: new Date() },
    });

    await logActivity(client.id, "Review & referral request sent.");
    sent++;
  }

  return NextResponse.json({ sent });
}
