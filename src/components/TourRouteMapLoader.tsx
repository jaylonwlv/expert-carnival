"use client";

import dynamic from "next/dynamic";
import type { TourStop } from "@/app/admin/actions";

// Leaflet touches `window` at import time, which breaks SSR -- load client-only.
const TourRouteMap = dynamic(() => import("@/components/TourRouteMap").then((m) => m.TourRouteMap), {
  ssr: false,
  loading: () => <div className="h-40 rounded-lg bg-stone-50 animate-pulse" />,
});

export function TourRouteMapLoader({ stops }: { stops: TourStop[] }) {
  return <TourRouteMap stops={stops} />;
}
