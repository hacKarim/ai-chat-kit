# Component: File Download

## Format
```file-download
{
  "id": "string",
  "fileName": "string",
  "description": "string",
  "fileUrl": "string",
  "fileSize": "string",
  "icon": "string"
}
```

## Fields

### Required
- `id` (string): Unique identifier
- `fileName` (string): File name with extension
- `fileUrl` (string): Download URL

### Optional
- `description` (string): File description
- `fileSize` (string): Human-readable file size
- `icon` (string): Lucide icon name [default: "File"]

## Example
```file-download
{
  "id": "q3-export",
  "fileName": "q3-usage-report.pdf",
  "description": "Usage by workspace, July to September",
  "fileUrl": "/demo/cover-1.svg",
  "fileSize": "1.2 MB",
  "icon": "FileText"
}
```
