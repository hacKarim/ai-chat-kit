import type { Action } from "../shared/schema";

export interface SerializableMaps {
  id: string;
  destination: string;
  origin?: string;
  mode?: "driving" | "walking" | "transit" | "bicycling";
  title?: string;
  description?: string;
  distance?: string;
  duration?: string;
  mapImageUrl?: string;
  ratio?: "auto" | "1:1" | "4:3" | "16:9" | "9:16";
  responseActions?: Action[];
}

export function parseSerializableMaps(data: any): SerializableMaps {
  // Check if data is in the complex format with markers and routes
  if (data.markers && Array.isArray(data.markers)) {
    // Extract destination and origin from markers
    const originMarker = data.markers.find((m: any) =>
      m.id?.includes('origin') || m.label?.toLowerCase().includes('vous') || m.label?.toLowerCase().includes('you')
    );
    const destMarker = data.markers.find((m: any) =>
      m.id?.includes('destination') || m.id?.includes('dest') || (!m.id?.includes('origin') && m !== originMarker)
    );

    // Build destination and origin strings from marker labels and coordinates
    const destination = destMarker
      ? `${destMarker.label || 'Destination'} (${destMarker.lat}, ${destMarker.lng})`
      : data.destination || "";

    const origin = originMarker
      ? `${originMarker.label || 'Origin'} (${originMarker.lat}, ${originMarker.lng})`
      : data.origin;

    return {
      id: data.id || crypto.randomUUID(),
      destination,
      origin,
      mode: data.mode || "driving",
      title: data.title,
      description: data.description,
      distance: data.distance,
      duration: data.duration,
      mapImageUrl: data.mapImageUrl,
      ratio: data.ratio || "16:9",
      responseActions: data.responseActions,
    };
  }

  // Standard format
  return {
    id: data.id || crypto.randomUUID(),
    destination: data.destination || "",
    origin: data.origin,
    mode: data.mode || "driving",
    title: data.title,
    description: data.description,
    distance: data.distance,
    duration: data.duration,
    mapImageUrl: data.mapImageUrl,
    ratio: data.ratio || "16:9",
    responseActions: data.responseActions,
  };
}
