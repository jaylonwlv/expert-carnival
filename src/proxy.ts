import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, isValidSessionToken } from "@/lib/auth";
import { detectInAppPlatform } from "@/lib/inAppBrowser";

// The three lead-capture pages (see lead-actions.ts's GUIDE_BY_SOURCE) --
// the only ones extractTrackingParams's utm_source actually feeds into a
// Client record, so there's no point tagging anywhere else.
const LEAD_CAPTURE_PATHS = new Set(["/", "/california", "/optin"]);

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (!isValidSessionToken(token)) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Only a fallback for a visit that arrived with no tag of its own -- a
  // real utm_source (e.g. from a paid ad link) always wins over a guess
  // made here. GET-only: the lead form on these same paths submits via POST
  // (a Server Action), and that request has no tracking page-load to tag --
  // rewriting it could only risk interfering with the submission itself for
  // no benefit.
  if (request.method === "GET" && LEAD_CAPTURE_PATHS.has(pathname) && !searchParams.get("utm_source")) {
    const detected = detectInAppPlatform(
      request.headers.get("user-agent"),
      request.headers.get("referer"),
      request.headers.get("x-requested-with")
    );
    if (detected) {
      const url = request.nextUrl.clone();
      url.searchParams.set("utm_source", detected.source);
      url.searchParams.set("utm_medium", detected.medium);
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/", "/california", "/optin"],
};
