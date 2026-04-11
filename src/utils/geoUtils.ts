// src/utils/geoUtils.ts
// Utility for converting geographic coordinates to map positions.
// Currently locations use pre-computed mapX/mapY values from the Figma design.
// This utility is intended for future use when locations are fetched from an API.

export interface MapBounds {
  west: number;
  east: number;
  north: number;
  south: number;
}

export interface MapPosition {
  x: number;
  y: number;
}

/**
 * Geographic bounds calibrated to the dot-matrix world map image.
 * Adjust these values to align pin positions with the background.
 */
export const MAP_BOUNDS: MapBounds = {
  west: -170,
  east: 190,
  north: 80,
  south: -60,
};

const toRadians = (deg: number): number => (deg * Math.PI) / 180;
const mercatorY = (lat: number): number => Math.log(Math.tan(Math.PI / 4 + toRadians(lat) / 2));

/**
 * Converts geographic coordinates to percentage-based position on a Mercator-projected map.
 * @param lat - Latitude (-90 to 90)
 * @param lng - Longitude (-180 to 180)
 * @param bounds - The geographic bounds the map image covers
 * @returns Percentage-based x/y position (0–100)
 */
export const geoToPosition = (
  lat: number,
  lng: number,
  bounds: MapBounds = MAP_BOUNDS
): MapPosition => {
  const x = ((lng - bounds.west) / (bounds.east - bounds.west)) * 100;

  const yNorth = mercatorY(bounds.north);
  const ySouth = mercatorY(bounds.south);
  const yPoint = mercatorY(lat);

  const y = ((yNorth - yPoint) / (yNorth - ySouth)) * 100;

  return { x, y };
};
