"use client";

import dynamic from "next/dynamic";
import type { TourStop } from "@/app/admin/actions";

// Leaflet touches `window` at import time, which breaks SSR -- load client-only.
// `ssr: false` requires this to live inside a Client Component.
const TourRoutePlanner = dynamic(
  () => import("@/components/TourRoutePlanner").then((m) => m.TourRoutePlanner),
  { ssr: false, loading: () => <div className="h-40 rounded-lg bg-stone-50 animate-pulse" /> }
);

export function TourRoutePlannerLoader({
  initialStops,
  savedAt,
  saveRouteAction,
}: {
  initialStops?: TourStop[];
  savedAt?: Date | null;
  saveRouteAction: (stops: TourStop[]) => Promise<void>;
}) {
  return <TourRoutePlanner initialStops={initialStops} savedAt={savedAt} saveRouteAction={saveRouteAction} />;
}
