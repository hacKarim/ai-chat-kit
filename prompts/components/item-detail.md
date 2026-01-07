# Component: Item Detail

## Format
```item-detail
{
  "id": "string",
  "title": "string",
  "subtitle": "string",
  "imageUrl": "string",
  "sections": [{"id": "string", "title": "string", "items": ["string"]}]
}
```

## Fields

### Required
- `id` (string): Unique identifier
- `sections` (array): Groups of short lines
  - `title` (string): Section heading
  - `items` (array): Lines of text

### Optional
- `title` (string): Item title
- `subtitle` (string): Item subtitle
- `imageUrl` (string): Image URL

## Example
```item-detail
{
  "id": "plan-team",
  "title": "Team plan",
  "subtitle": "For groups of 5 to 50",
  "imageUrl": "/demo/cover-4.svg",
  "sections": [
    {
      "id": "s1",
      "title": "Included",
      "items": [
        "Unlimited projects",
        "Shared workspaces",
        "Audit log, 90 days"
      ]
    },
    {
      "id": "s2",
      "title": "Limits",
      "items": [
        "50 seats",
        "200 GB storage",
        "1,000 automation runs a day"
      ]
    }
  ]
}
```
