export const RATIO_CLASS_MAP = {
  auto: "aspect-auto",
  "1:1": "aspect-square",
  "4:3": "aspect-[4/3]",
  "16:9": "aspect-video",
  "9:16": "aspect-[9/16]",
} as const;

export function getFitClass(fit: "cover" | "contain" = "cover") {
  return fit === "cover" ? "object-cover" : "object-contain";
}

export const OVERLAY_GRADIENT =
  "bg-gradient-to-t from-black/60 via-black/20 to-transparent";

export function sanitizeHref(href: string | undefined): string | undefined {
  if (!href) return undefined;
  try {
    const url = new URL(href);
    if (url.protocol === "javascript:") return undefined;
    return href;
  } catch {
    return undefined;
  }
}
