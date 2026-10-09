"use client";

import dynamic from "next/dynamic";

// Leaflet touches `window` at import time, which breaks SSR -- load client-only.
// `ssr: false` requires this to live inside a Client Component.
const TourRoutePlanner = dynamic(
  () => import("@/components/TourRoutePlanner").then((m) => m.TourRoutePlanner),
  { ssr: false, loading: () => <div className="h-40 rounded-lg bg-neutral-50 animate-pulse" /> }
);

export function TourRoutePlannerLoader() {
  return <TourRoutePlanner />;
}
