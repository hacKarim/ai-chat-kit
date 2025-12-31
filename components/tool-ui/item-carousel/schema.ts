import type { Action } from "../shared/schema";

export interface CarouselItem {
  id: string;
  name: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  color?: string;
  actions?: Action[];
}

export interface SerializableItemCarousel {
  id: string;
  items: CarouselItem[];
  loop?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

export function parseSerializableItemCarousel(data: any): SerializableItemCarousel {
  return {
    id: data.id || crypto.randomUUID(),
    items: data.items || [],
    loop: data.loop ?? true,
    autoPlay: data.autoPlay ?? false,
    autoPlayInterval: data.autoPlayInterval ?? 3000,
  };
}
