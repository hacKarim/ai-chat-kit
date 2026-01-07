# Component: Image

## Format
```image
{
  "id": "string",
  "assetId": "string",
  "src": "string",
  "alt": "string",
  "title": "string",
  "description": "string",
  "ratio": "auto" | "1:1" | "4:3" | "16:9" | "9:16",
  "fit": "cover" | "contain"
}
```

## Fields

### Required
- `id` (string): Unique identifier
- `assetId` (string): Asset identifier
- `src` (string): Image URL
- `alt` (string): Accessibility text

### Optional
- `title` (string): Image title
- `description` (string): Image description
- `href` (string): Link URL when clicked
- `domain` (string): Source domain
- `ratio` (string): Aspect ratio [default: "auto"]
- `fit` (string): Image fit - "cover" or "contain" [default: "cover"]
- `source` (object): Source attribution
- `createdAt` (string): Creation date
- `fileSizeBytes` (number): File size in bytes

## Example
```image
{
  "id": "arch-diagram",
  "assetId": "asset-arch-diagram",
  "src": "/demo/cover-1.svg",
  "alt": "Abstract blue composition",
  "title": "Service map, December",
  "description": "Generated from the dependency graph.",
  "ratio": "16:9",
  "fit": "cover"
}
```
