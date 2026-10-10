"use client";

import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { googleMapsRouteUrl } from "@/lib/routing";
import type { TourStop } from "@/app/admin/actions";

function numberedIcon(n: number) {
  return L.divIcon({
    className: "",
    html: `<div style="width:26px;height:26px;border-radius:50%;background:#d97706;color:white;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.4);">${n}</div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
}

export function TourRouteMap({ stops }: { stops: TourStop[] }) {
  return (
    <div className="space-y-3">
      <div className="rounded-lg overflow-hidden border border-stone-200" style={{ height: 280 }}>
        <MapContainer
          bounds={stops.map((s) => [s.lat, s.lng])}
          boundsOptions={{ padding: [30, 30] }}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Polyline positions={stops.map((s) => [s.lat, s.lng])} color="#d97706" weight={3} />
          {stops.map((s, i) => (
            <Marker key={`${s.address}-${i}`} position={[s.lat, s.lng]} icon={numberedIcon(i + 1)} />
          ))}
        </MapContainer>
      </div>

      <ol className="text-sm text-stone-700 space-y-1 list-decimal list-inside">
        {stops.map((s, i) => (
          <li key={`${s.address}-${i}`}>{s.address}</li>
        ))}
      </ol>

      <a
        href={googleMapsRouteUrl(stops.map((s) => s.address))}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-md bg-amber-600 text-white text-sm font-medium px-4 py-2 shadow-sm hover:shadow-md hover:bg-amber-700 transition"
      >
        Open route in Google Maps
      </a>
    </div>
  );
}
