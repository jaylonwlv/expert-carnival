"use client";

import { useEffect, useRef } from "react";

// Marking a signature request "viewed" needs to happen only once a real
// browser has actually rendered this page -- a server-side, render-time
// update also fired for a messaging app's link-preview/unfurl bot fetching
// the URL for a thumbnail before the client ever tapped it. Bots fetch
// HTML; they don't run this effect.
export function MarkViewedOnMount({ onMount }: { onMount: () => void }) {
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    onMount();
  }, [onMount]);

  return null;
}
