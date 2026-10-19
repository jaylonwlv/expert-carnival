import { headers } from "next/headers";

// General-purpose IP lookup for anything that wants it as a plain optional
// fact (Meta's Conversions API user_data, an activity log, etc). Admin
// login's own rate limiter needs different semantics on a missing header --
// a fresh random key per call so unidentifiable visitors don't share a
// lockout bucket -- which is why that one stays its own local function
// (admin/login/actions.ts) instead of reusing this.
export async function getClientIp(): Promise<string | null> {
  const headerList = await headers();
  const forwardedFor = headerList.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (forwardedFor) return forwardedFor;

  const realIp = headerList.get("x-real-ip")?.trim();
  return realIp || null;
}
