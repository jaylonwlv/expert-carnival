"use server";

import { randomUUID } from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { checkPassword, makeSessionToken, SESSION_COOKIE } from "@/lib/auth";
import { isLockedOut, recordFailedAttempt, clearAttempts } from "@/lib/rateLimit";

async function clientIp(): Promise<string> {
  const headerList = await headers();
  const forwardedFor = headerList.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (forwardedFor) return forwardedFor;

  const realIp = headerList.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  // No identifying header at all (local/dev, or a proxy that doesn't
  // forward one) — a shared literal "unknown" bucket would mean five
  // failed attempts from ANY such visitor locks out every other one
  // sharing it for 15 minutes, including the real admin. A fresh,
  // non-shared key per call means this one unidentifiable request just
  // doesn't get meaningfully rate-limited, which is a better tradeoff
  // than a shared-bucket lockout.
  return `unidentified-${randomUUID()}`;
}

export async function login(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin");
  const ip = await clientIp();

  if (isLockedOut(ip)) {
    redirect(`/admin/login?error=locked&next=${encodeURIComponent(next)}`);
  }

  if (!checkPassword(password)) {
    recordFailedAttempt(ip);
    redirect(`/admin/login?error=1&next=${encodeURIComponent(next)}`);
  }

  clearAttempts(ip);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, makeSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  redirect(next.startsWith("/admin") ? next : "/admin");
}
