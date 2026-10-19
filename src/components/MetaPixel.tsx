"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

// Only the public marketing pages -- not /admin (realtor-only, behind
// auth, no ad-conversion value) and not /track (an existing client's
// private portal, already converted, and showing relocation-specific
// personal details a third-party tracker has no reason to see).
function isTrackedPath(pathname: string): boolean {
  return !pathname.startsWith("/admin") && !pathname.startsWith("/track");
}

// Loaded via next/script's afterInteractive strategy -- same reasoning as
// everywhere else video/third-party work has been deferred this session:
// it shouldn't compete with the page's own content for bandwidth on first
// paint. No-ops entirely (renders nothing) when NEXT_PUBLIC_META_PIXEL_ID
// isn't set, matching the sendEmail/sendSms no-op pattern.
export function MetaPixel() {
  const pathname = usePathname();
  const isFirstRender = useRef(true);

  // Next.js only ever runs the inline script below once per full page
  // load (it's deduped by this Script's own `id`), so that script's own
  // 'track', 'PageView' call already covers the first page a visitor
  // lands on. Without this effect, every subsequent client-side
  // navigation to another tracked page (clicking a <Link>, no full
  // reload) would never fire a PageView of its own -- undercounting
  // traffic on exactly the pages this feature exists to measure. Called
  // unconditionally, before the early return below, since hooks can't be
  // called conditionally; the ref skips firing a duplicate PageView for
  // the render that already got one from the inline script.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!PIXEL_ID || !isTrackedPath(pathname)) return;
    (window as Window & { fbq?: (...args: unknown[]) => void }).fbq?.("track", "PageView");
  }, [pathname]);

  if (!PIXEL_ID || !isTrackedPath(pathname)) return null;

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${PIXEL_ID}');
          fbq('track', 'PageView');
        `}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element -- Meta's own
            standard base code is a plain <img>, not a next/image candidate */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}
