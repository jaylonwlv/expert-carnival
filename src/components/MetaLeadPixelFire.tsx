"use client";

import { useEffect, useRef } from "react";

// Fires the browser Pixel's own "Lead" event, sharing the same eventId the
// server-side Conversions API call already sent (see lib/meta.ts,
// app/lead-actions.ts) so Meta deduplicates the two instead of double-
// counting one real conversion as two.
//
// sessionStorage (not just the mount-guard ref) is what stops a reload or a
// bookmarked revisit of this exact success URL from re-firing the same
// event: the ref alone only protects against this component re-rendering
// within one page load, not a second, separate visit to the same
// `?lead_submitted=1&eid=...` URL.
export function MetaLeadPixelFire({ eventId }: { eventId: string }) {
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;

    const storageKey = `meta_lead_fired_${eventId}`;
    try {
      if (sessionStorage.getItem(storageKey)) return;
      sessionStorage.setItem(storageKey, "1");
    } catch {
      // Private browsing / storage disabled, fall through and fire once
      // for this page load anyway rather than silently dropping the event.
    }

    const fbq = (window as Window & { fbq?: (...args: unknown[]) => void }).fbq;
    fbq?.("track", "Lead", {}, { eventID: eventId });
  }, [eventId]);

  return null;
}
