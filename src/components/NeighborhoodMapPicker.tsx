"use client";

import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { NeighborhoodGroup, Neighborhood } from "@/lib/neighborhoods";

const GROUP_COLORS = ["#2563eb", "#059669", "#d97706", "#7c3aed", "#db2777"];

function pinIcon(color: string, selected: boolean) {
  const size = selected ? 22 : 16;
  return L.divIcon({
    className: "",
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${
      selected ? color : "white"
    };border:3px solid ${color};box-shadow:0 1px 3px rgba(0,0,0,0.4);"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

type FlatNeighborhood = Neighborhood & { group: string; color: string };

export function NeighborhoodMapPicker({
  groups,
  selected: initialSelected,
}: {
  groups: NeighborhoodGroup[];
  selected: string[];
}) {
  const [selected, setSelected] = useState<string[]>(initialSelected);
  const [positions, setPositions] = useState<Record<string, { lat: number; lng: number }>>({});

  const flat: FlatNeighborhood[] = groups.flatMap((group, groupIndex) =>
    group.options.map((option) => ({
      ...option,
      group: group.group,
      color: GROUP_COLORS[groupIndex % GROUP_COLORS.length],
    }))
  );

  function toggle(name: string) {
    setSelected((prev) => (prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]));
  }

  return (
    <div className="space-y-2">
      <div className="rounded-lg overflow-hidden border border-neutral-200" style={{ height: 320 }}>
        <MapContainer
          center={[36.17, -115.14]}
          zoom={10}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {flat.map((n) => {
            const isSelected = selected.includes(n.name);
            const pos = positions[n.name] ?? { lat: n.lat, lng: n.lng };
            return (
              <Marker
                key={n.name}
                position={[pos.lat, pos.lng]}
                icon={pinIcon(n.color, isSelected)}
                draggable
                eventHandlers={{
                  click: () => toggle(n.name),
                  dragend: (event) => {
                    const latLng = event.target.getLatLng();
                    setPositions((prev) => ({ ...prev, [n.name]: { lat: latLng.lat, lng: latLng.lng } }));
                  },
                }}
              >
                <Popup>
                  <div className="text-sm">
                    <p className="font-semibold">{n.name}</p>
                    <p className="text-neutral-500">{n.zips.join(", ")}</p>
                    <button
                      type="button"
                      onClick={() => toggle(n.name)}
                      className="mt-1 text-blue-600 underline"
                    >
                      {isSelected ? "Remove" : "Select"}
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {flat.map((n) => (
          <button
            key={n.name}
            type="button"
            onClick={() => toggle(n.name)}
            className={`text-sm rounded-full px-3 py-1.5 border transition ${
              selected.includes(n.name)
                ? "bg-neutral-900 text-white border-neutral-900"
                : "bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100"
            }`}
          >
            {n.name} <span className="opacity-60">{n.zips[0]}</span>
          </button>
        ))}
      </div>

      {selected.map((name) => (
        <input key={name} type="hidden" name="neighborhoods" value={name} />
      ))}
    </div>
  );
}
