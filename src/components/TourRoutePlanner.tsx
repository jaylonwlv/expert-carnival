"use client";

import { useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { optimizeStopOrder, googleMapsRouteUrl, type GeoPoint } from "@/lib/routing";
import { timeAgo } from "@/lib/format";
import type { TourStop } from "@/app/admin/actions";

type Stop = {
  id: string;
  address: string;
  status: "idle" | "loading" | "done" | "error";
  point: GeoPoint | null;
  error: string | null;
};

function newStop(): Stop {
  return { id: Math.random().toString(36).slice(2), address: "", status: "idle", point: null, error: null };
}

// A previously saved route is already in its final (optimized) order, with
// real coordinates already known -- seeding straight into "done" status
// skips re-geocoding every address again just to show the realtor what's
// already been shared.
function stopsFromSaved(saved: TourStop[]): Stop[] {
  return saved.map((s) => ({
    id: Math.random().toString(36).slice(2),
    address: s.address,
    status: "done",
    point: { lat: s.lat, lng: s.lng },
    error: null,
  }));
}

function numberedIcon(n: number) {
  return L.divIcon({
    className: "",
    html: `<div style="width:26px;height:26px;border-radius:50%;background:#171717;color:white;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.4);">${n}</div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
}

// Geocoding runs against Nominatim's free public search endpoint directly
// from the browser -- no API key, but one request at a time with a short
// delay between each, per Nominatim's usage policy for low-volume/occasional
// use (which fits a single realtor planning a day of tours).
async function geocode(address: string): Promise<GeoPoint> {
  const query = /\bnv\b|nevada/i.test(address) ? address : `${address}, Las Vegas, NV`;
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Geocoding service unavailable");
  const results = await res.json();
  if (!Array.isArray(results) || results.length === 0) {
    throw new Error("Address not found");
  }
  return { lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function TourRoutePlanner({
  initialStops,
  savedAt,
  saveRouteAction,
}: {
  initialStops?: TourStop[];
  savedAt?: Date | null;
  saveRouteAction: (stops: TourStop[]) => Promise<void>;
}) {
  const hasSaved = !!initialStops && initialStops.length >= 2;
  const [stops, setStops] = useState<Stop[]>(
    hasSaved ? stopsFromSaved(initialStops) : [newStop(), newStop()]
  );
  const [planning, setPlanning] = useState(false);
  const [order, setOrder] = useState<number[] | null>(hasSaved ? initialStops.map((_, i) => i) : null);
  const [saving, setSaving] = useState(false);
  const [savedJustNow, setSavedJustNow] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  function updateAddress(id: string, address: string) {
    setOrder(null);
    setSavedJustNow(false);
    setStops((prev) => prev.map((s) => (s.id === id ? { ...s, address, status: "idle", point: null, error: null } : s)));
  }

  function addStop() {
    setStops((prev) => [...prev, newStop()]);
  }

  function removeStop(id: string) {
    setOrder(null);
    setSavedJustNow(false);
    setStops((prev) => (prev.length > 2 ? prev.filter((s) => s.id !== id) : prev));
  }

  async function planRoute() {
    setOrder(null);
    setSavedJustNow(false);
    setPlanning(true);

    const addressable = stops.filter((s) => s.address.trim() !== "");
    const geocoded: Stop[] = [];

    for (const stop of addressable) {
      setStops((prev) => prev.map((s) => (s.id === stop.id ? { ...s, status: "loading", error: null } : s)));
      try {
        const point = await geocode(stop.address);
        const updated: Stop = { ...stop, status: "done", point, error: null };
        geocoded.push(updated);
        setStops((prev) => prev.map((s) => (s.id === stop.id ? updated : s)));
      } catch (err) {
        const message = err instanceof Error ? err.message : "Could not locate this address";
        setStops((prev) => prev.map((s) => (s.id === stop.id ? { ...s, status: "error", error: message } : s)));
      }
      await sleep(1100); // Nominatim usage policy: ~1 request/second, max
    }

    setPlanning(false);

    if (geocoded.length >= 2) {
      setOrder(optimizeStopOrder(geocoded.map((s) => s.point as GeoPoint)));
    }
  }

  async function handleSave(orderedStops: (Stop & { point: GeoPoint })[]) {
    setSaving(true);
    setSavedJustNow(false);
    setSaveError(null);
    try {
      await saveRouteAction(
        orderedStops.map((s) => ({ address: s.address, lat: s.point.lat, lng: s.point.lng }))
      );
      setSavedJustNow(true);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Could not share this route. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  // The stops that were successfully geocoded, in the order `planRoute` found
  // them -- `order` holds indices into exactly this array.
  const geocodedStops = stops.filter((s): s is Stop & { point: GeoPoint } => s.point !== null);
  const orderedStops = (order ?? geocodedStops.map((_, i) => i))
    .map((i) => geocodedStops[i])
    .filter((s): s is Stop & { point: GeoPoint } => !!s);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {stops.map((stop, i) => (
          <div key={stop.id} className="flex items-start gap-2">
            <span className="shrink-0 w-6 h-9 flex items-center justify-center text-sm text-stone-400">
              {i + 1}
            </span>
            <div className="flex-1">
              <input
                type="text"
                value={stop.address}
                onChange={(e) => updateAddress(stop.id, e.target.value)}
                placeholder="e.g. 123 Desert Vista Dr, Summerlin"
                className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-600"
              />
              {stop.status === "error" && <p className="text-sm text-red-600 mt-1">{stop.error}</p>}
              {stop.status === "loading" && <p className="text-sm text-stone-400 mt-1">Locating…</p>}
            </div>
            <button
              type="button"
              onClick={() => removeStop(stop.id)}
              className="shrink-0 w-9 h-9 flex items-center justify-center text-stone-400 hover:text-red-600"
              aria-label="Remove stop"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={addStop}
          className="text-sm font-medium text-stone-700 hover:underline"
        >
          + Add stop
        </button>
        <button
          type="button"
          onClick={planRoute}
          disabled={planning || stops.filter((s) => s.address.trim() !== "").length < 2}
          className="rounded-md bg-amber-600 text-white text-sm font-medium px-4 py-2 shadow-sm hover:shadow-md hover:bg-amber-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {planning ? "Planning…" : "Plan route"}
        </button>
      </div>

      {orderedStops.length >= 2 && (
        <div className="space-y-3 pt-3 border-t border-stone-100">
          <div className="rounded-lg overflow-hidden border border-stone-200" style={{ height: 320 }}>
            <MapContainer
              bounds={orderedStops.map((s) => [s.point.lat, s.point.lng])}
              boundsOptions={{ padding: [30, 30] }}
              style={{ height: "100%", width: "100%" }}
              scrollWheelZoom={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Polyline positions={orderedStops.map((s) => [s.point.lat, s.point.lng])} color="#171717" weight={3} />
              {orderedStops.map((s, i) => (
                <Marker key={s.id} position={[s.point.lat, s.point.lng]} icon={numberedIcon(i + 1)} />
              ))}
            </MapContainer>
          </div>

          <ol className="text-sm text-stone-700 space-y-1 list-decimal list-inside">
            {orderedStops.map((s) => (
              <li key={s.id}>{s.address}</li>
            ))}
          </ol>

          <p className="text-sm text-stone-500">
            Stop order is picked by straight-line distance, not real roads or traffic -- it gets you a sensible
            plan, but Google Maps below will handle the actual turn-by-turn driving directions.
          </p>

          <div className="flex items-center gap-3 flex-wrap">
            <a
              href={googleMapsRouteUrl(orderedStops.map((s) => s.address))}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md bg-amber-600 text-white text-sm font-medium px-4 py-2 shadow-sm hover:shadow-md hover:bg-amber-700 transition"
            >
              Open optimized route in Google Maps
            </a>
            <button
              type="button"
              onClick={() => handleSave(orderedStops)}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-md border border-stone-300 bg-white text-stone-800 text-sm font-medium px-4 py-2 shadow-sm hover:shadow-md hover:bg-stone-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Sharing…" : "Save & share with client"}
            </button>
            {savedJustNow && <span className="text-sm text-emerald-700">Shared with the client.</span>}
          </div>
          {saveError && <p className="text-sm text-red-600">{saveError}</p>}
          {savedAt && !savedJustNow && (
            <p className="text-xs text-stone-400">Last shared with the client {timeAgo(savedAt)}.</p>
          )}
        </div>
      )}
    </div>
  );
}
