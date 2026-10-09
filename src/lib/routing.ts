export type GeoPoint = { lat: number; lng: number };

export function haversineDistanceMiles(a: GeoPoint, b: GeoPoint): number {
  const EARTH_RADIUS_MILES = 3958.8;
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_MILES * Math.asin(Math.sqrt(h));
}

function totalRouteDistance(points: GeoPoint[], order: number[]): number {
  let total = 0;
  for (let i = 0; i < order.length - 1; i++) {
    total += haversineDistanceMiles(points[order[i]], points[order[i + 1]]);
  }
  return total;
}

function permutations(indices: number[]): number[][] {
  if (indices.length <= 1) return [indices];
  const result: number[][] = [];
  for (let i = 0; i < indices.length; i++) {
    const rest = [...indices.slice(0, i), ...indices.slice(i + 1)];
    for (const perm of permutations(rest)) {
      result.push([indices[i], ...perm]);
    }
  }
  return result;
}

// Straight-line (haversine) distance stands in for drive time to pick a
// visiting order -- no routing API needed. Brute-forces every permutation
// after the fixed starting stop for <=8 total stops (7! = 5,040, instant),
// which covers any realistic day of home tours; falls back to a greedy
// nearest-neighbor heuristic beyond that so it never hangs on a huge list.
export function optimizeStopOrder(points: GeoPoint[]): number[] {
  if (points.length <= 2) return points.map((_, i) => i);

  const rest = points.slice(1).map((_, i) => i + 1);

  if (points.length <= 8) {
    let best: number[] = [0, ...rest];
    let bestDistance = totalRouteDistance(points, best);
    for (const perm of permutations(rest)) {
      const order = [0, ...perm];
      const distance = totalRouteDistance(points, order);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = order;
      }
    }
    return best;
  }

  const order = [0];
  const remaining = new Set(rest);
  while (remaining.size > 0) {
    const current = points[order[order.length - 1]];
    let nearest = -1;
    let nearestDistance = Infinity;
    for (const candidate of remaining) {
      const distance = haversineDistanceMiles(current, points[candidate]);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = candidate;
      }
    }
    order.push(nearest);
    remaining.delete(nearest);
  }
  return order;
}

export function googleMapsRouteUrl(addresses: string[]): string {
  const destination = addresses[addresses.length - 1];
  const waypoints = addresses.slice(0, -1).join("|");
  const params = new URLSearchParams({ api: "1", destination, travelmode: "driving" });
  if (waypoints) params.set("waypoints", waypoints);
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}
