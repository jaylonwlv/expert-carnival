const COMPANY_NAME = process.env.NEXT_PUBLIC_COMPANY_NAME ?? "Relocation Engine";
const AGENT_NAME = process.env.NEXT_PUBLIC_AGENT_NAME ?? "your agent";

export type EmailTrigger = {
  subject: string;
  body: (firstName: string, trackerUrl: string) => string;
};

function wrap(firstName: string, message: string, trackerUrl: string): string {
  return `
    <p>Hi ${firstName},</p>
    <p>${message}</p>
    <p><a href="${trackerUrl}">View your progress</a></p>
    <p>-- ${AGENT_NAME}, ${COMPANY_NAME}</p>
  `;
}

// Maps the six milestones to the checklist item keys / stage that represent
// them in this app's data model (see src/lib/checklist.ts and
// src/lib/stages.ts). "Approved" is interpreted as loan approval
// (loan_conditions_cleared), distinct from "clear to close" at the end of
// the same stage -- flagged since it's the one ambiguous name in the
// original request; easy to remap if that's not the intent.
export const CHECKLIST_EMAIL_TRIGGERS: Record<string, EmailTrigger> = {
  preapproval_letter: {
    subject: "You're pre-approved!",
    body: (firstName, trackerUrl) =>
      wrap(firstName, "Great news — your mortgage pre-approval is in.", trackerUrl),
  },
  loan_conditions_cleared: {
    subject: "Your loan has been approved",
    body: (firstName, trackerUrl) =>
      wrap(firstName, "Your lender has cleared your loan conditions — your loan is approved.", trackerUrl),
  },
  inspection_completed: {
    subject: "Your home inspection is complete",
    body: (firstName, trackerUrl) => wrap(firstName, "Your home inspection has been completed.", trackerUrl),
  },
  offer_submitted: {
    subject: "Your offer has been submitted",
    body: (firstName, trackerUrl) =>
      wrap(firstName, "Your offer has been submitted to the seller — we'll let you know as soon as we hear back.", trackerUrl),
  },
  clear_to_close: {
    subject: "You're clear to close!",
    body: (firstName, trackerUrl) =>
      wrap(firstName, "You're clear to close — contingencies are cleared and closing is coming up.", trackerUrl),
  },
};

export const STAGE_EMAIL_TRIGGERS: Record<string, EmailTrigger> = {
  "Under Contract": {
    subject: "You're under contract!",
    body: (firstName, trackerUrl) =>
      wrap(firstName, "Congratulations — you're officially under contract on your new home.", trackerUrl),
  },
};
