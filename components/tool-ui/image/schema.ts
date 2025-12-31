export interface Source {
  label?: string;
  iconUrl?: string;
  url?: string;
}

export interface SerializableImage {
  id: string;
  assetId: string;
  src: string;
  alt: string;
  title?: string;
  description?: string;
  href?: string;
  domain?: string;
  ratio?: "auto" | "1:1" | "4:3" | "16:9" | "9:16";
  fit?: "cover" | "contain";
  source?: Source;
  createdAt?: string;
  fileSizeBytes?: number;
  locale?: string;
}

export function parseSerializableImage(data: any): SerializableImage {
  return {
    id: data.id || crypto.randomUUID(),
    assetId: data.assetId || data.id || crypto.randomUUID(),
    src: data.src || "",
    alt: data.alt || "",
    title: data.title,
    description: data.description,
    href: data.href,
    domain: data.domain,
    ratio: data.ratio || "auto",
    fit: data.fit || "cover",
    source: data.source,
    createdAt: data.createdAt,
    fileSizeBytes: data.fileSizeBytes,
    locale: data.locale,
  };
}
