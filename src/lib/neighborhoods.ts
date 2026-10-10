export type Neighborhood = {
  name: string;
  zips: string[];
  lat: number;
  lng: number;
};

export type NeighborhoodGroup = {
  group: string;
  options: Neighborhood[];
};

// Zip codes gathered from Las Vegas-area real estate guides (not USPS
// boundary files — treat as "which zip to expect," not a legal boundary).
// Coordinates are approximate community-center estimates, not geocoded
// against a live API — the map pins are draggable so they can be nudged to
// the right spot once viewed against real tiles.
export const NEIGHBORHOOD_GROUPS: NeighborhoodGroup[] = [
  {
    group: "West Valley",
    options: [
      { name: "Summerlin", zips: ["89135", "89138", "89144", "89134"], lat: 36.1716, lng: -115.3271 },
      { name: "Spring Valley", zips: ["89113", "89147", "89148"], lat: 36.1097, lng: -115.2728 },
      { name: "Southwest/Enterprise", zips: ["89139", "89178", "89123"], lat: 36.0391, lng: -115.265 },
      { name: "Mountain's Edge", zips: ["89178", "89148"], lat: 36.0107, lng: -115.285 },
    ],
  },
  {
    group: "Henderson / Southeast",
    options: [
      { name: "Henderson", zips: ["89002", "89014", "89052", "89074"], lat: 36.0395, lng: -114.9817 },
      { name: "Green Valley", zips: ["89014", "89074"], lat: 36.0719, lng: -115.0936 },
      { name: "Anthem", zips: ["89052"], lat: 35.995, lng: -115.0708 },
      { name: "Inspirada", zips: ["89044"], lat: 35.9797, lng: -115.1172 },
      { name: "Cadence", zips: ["89011"], lat: 35.995, lng: -114.955 },
      { name: "Seven Hills", zips: ["89052"], lat: 36.0075, lng: -115.0392 },
      { name: "MacDonald Highlands", zips: ["89012"], lat: 36.0019, lng: -115.0186 },
      { name: "Lake Las Vegas", zips: ["89011"], lat: 36.1225, lng: -114.9075 },
    ],
  },
  {
    group: "North / Northwest",
    options: [
      { name: "Centennial Hills", zips: ["89131", "89143", "89149"], lat: 36.2799, lng: -115.2728 },
      { name: "Skye Canyon", zips: ["89166"], lat: 36.3193, lng: -115.2814 },
      { name: "Aliante", zips: ["89084"], lat: 36.2819, lng: -115.1522 },
      { name: "North Las Vegas", zips: ["89030", "89031", "89032", "89081"], lat: 36.1989, lng: -115.1175 },
    ],
  },
  {
    group: "Central",
    options: [
      { name: "Downtown Las Vegas", zips: ["89101", "89106"], lat: 36.1699, lng: -115.1398 },
      { name: "The Strip / Paradise", zips: ["89109", "89119"], lat: 36.1147, lng: -115.1728 },
    ],
  },
  {
    group: "55+ Communities",
    options: [
      { name: "Sun City Summerlin", zips: ["89134"], lat: 36.195, lng: -115.3089 },
      { name: "Sun City Anthem", zips: ["89052"], lat: 35.9878, lng: -115.0597 },
    ],
  },
];

export function allNeighborhoodNames(): string[] {
  return NEIGHBORHOOD_GROUPS.flatMap((group) => group.options.map((option) => option.name));
}

export function findNeighborhood(name: string): Neighborhood | undefined {
  return NEIGHBORHOOD_GROUPS.flatMap((group) => group.options).find((option) => option.name === name);
}
