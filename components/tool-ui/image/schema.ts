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
