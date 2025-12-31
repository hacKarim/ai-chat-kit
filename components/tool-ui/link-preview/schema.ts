import type { Action } from "../shared/schema";

export interface SerializableLinkPreview {
  id: string;
  href: string;
  title?: string;
  description?: string;
  image?: string;
  domain?: string;
  favicon?: string;
  ratio?: "auto" | "1:1" | "4:3" | "16:9" | "9:16";
  createdAt?: string;
  responseActions?: Action[];
}

export function parseSerializableLinkPreview(data: any): SerializableLinkPreview {
  return {
    id: data.id || crypto.randomUUID(),
    href: data.href || "",
    title: data.title,
    description: data.description,
    image: data.image,
    domain: data.domain,
    favicon: data.favicon,
    ratio: data.ratio || "16:9",
    createdAt: data.createdAt,
    responseActions: data.responseActions,
  };
}
