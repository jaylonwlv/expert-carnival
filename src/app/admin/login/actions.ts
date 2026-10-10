"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { checkPassword, makeSessionToken, SESSION_COOKIE } from "@/lib/auth";
import { isLockedOut, recordFailedAttempt, clearAttempts } from "@/lib/rateLimit";

async function clientIp(): Promise<string> {
  const headerList = await headers();
  const forwardedFor = headerList.get("x-forwarded-for");
  return forwardedFor?.split(",")[0]?.trim() ?? "unknown";
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
