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
  // Auto-generate IDs for items if not provided
  const items = (data.items || []).map((item: any) => ({
    ...item,
    id: item.id || crypto.randomUUID(),
  }));

  return {
    id: data.id || crypto.randomUUID(),
    items,
    loop: data.loop ?? true,
    autoPlay: data.autoPlay ?? false,
    autoPlayInterval: data.autoPlayInterval ?? 1000,
  };
}
