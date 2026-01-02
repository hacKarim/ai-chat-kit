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
