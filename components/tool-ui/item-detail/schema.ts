export interface ItemDetailSection {
  id: string;
  title: string;
  items: string[];
}

export interface SerializableItemDetail {
  id: string;
  title?: string;
  subtitle?: string;
  imageUrl?: string;
  sections: ItemDetailSection[];
}

export function parseSerializableItemDetail(data: any): SerializableItemDetail {
  // Auto-generate IDs for sections if not provided
  const sections = (data.sections || []).map((section: any) => ({
    ...section,
    id: section.id || crypto.randomUUID(),
    items: section.items || [],
  }));

  return {
    id: data.id || crypto.randomUUID(),
    title: data.title,
    subtitle: data.subtitle,
    imageUrl: data.imageUrl,
    sections,
  };
}
