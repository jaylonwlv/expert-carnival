export type NeighborhoodGroup = {
  group: string;
  options: string[];
};

export const NEIGHBORHOOD_GROUPS: NeighborhoodGroup[] = [
  {
    group: "West Valley",
    options: ["Summerlin", "Spring Valley", "Southwest/Enterprise", "Mountain's Edge"],
  },
  {
    group: "Henderson / Southeast",
    options: [
      "Henderson",
      "Green Valley",
      "Anthem",
      "Inspirada",
      "Cadence",
      "Seven Hills",
      "MacDonald Highlands",
      "Lake Las Vegas",
    ],
  },
  {
    group: "North / Northwest",
    options: ["Centennial Hills", "Skye Canyon", "Aliante", "North Las Vegas"],
  },
  {
    group: "Central",
    options: ["Downtown Las Vegas", "The Strip / Paradise"],
  },
  {
    group: "55+ Communities",
    options: ["Sun City Summerlin", "Sun City Anthem"],
  },
];
