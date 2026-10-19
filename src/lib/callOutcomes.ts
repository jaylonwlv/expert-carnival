// Logged while a lead is still at the "Lead" stage (see lib/stages.ts,
// currentStage 0) after Paulin actually calls them -- each pick adds one
// dated ActivityLog entry (lib/activity.ts stamps createdAt) rather than
// setting a persistent field on Client, since the point is a history of
// attempts (several calls, several dates), not a single current status.
export type CallOutcome = "no_answer_voicemail" | "voicemail_full" | "answered_tracker_sent" | "no_response";

export const CALL_OUTCOME_ORDER: CallOutcome[] = [
  "no_answer_voicemail",
  "voicemail_full",
  "answered_tracker_sent",
  "no_response",
];

export const CALL_OUTCOME_LABELS: Record<CallOutcome, string> = {
  no_answer_voicemail: "No answer — left voicemail",
  voicemail_full: "No answer — voicemail full",
  answered_tracker_sent: "Answered — tracker sent",
  no_response: "No response",
};
