# Component: Link Preview

## Format
```link-preview
{
  "id": "string",
  "href": "string",
  "title": "string",
  "description": "string",
  "image": "string",
  "domain": "string",
  "favicon": "string",
  "ratio": "auto" | "1:1" | "4:3" | "16:9" | "9:16",
  "createdAt": "string",
  "responseActions": [{"id": "string", "label": "string"}]
}
```

## Fields

### Required
- `id` (string): Unique identifier
- `href` (string): Link URL

### Optional
- `title` (string): Link title
- `description` (string): Link description
- `image` (string): Preview image URL
- `domain` (string): Domain name
- `favicon` (string): Favicon URL
- `ratio` (string): Image aspect ratio [default: "auto"]
- `createdAt` (string): Creation timestamp
- `responseActions` (array): Follow-up actions

## Example
```link-preview
{
  "id": "docs-link",
  "href": "https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API",
  "title": "MediaStream Recording API",
  "description": "Record audio and video in the browser with MediaRecorder.",
  "image": "/demo/cover-2.svg",
  "domain": "developer.mozilla.org",
  "ratio": "16:9"
}
```
