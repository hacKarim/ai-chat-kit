# Component: Item Carousel

## Format
```item-carousel
{
  "id": "string",
  "items": [
    {
      "id": "string",
      "name": "string",
      "subtitle": "string",
      "description": "string",
      "imageUrl": "string",
      "color": "string",
      "actions": [{"id": "string", "label": "string"}]
    }
  ],
  "loop": true,
  "autoPlay": false,
  "autoPlayInterval": 3000
}
```

## Fields

### Required
- `id` (string): Unique identifier
- `items` (array): Carousel items
  - `id` (string): Item identifier
  - `name` (string): Item title

### Optional
- `items[].subtitle` (string): Item subtitle
- `items[].description` (string): Item description
- `items[].imageUrl` (string): Item image URL
- `items[].color` (string): Fallback color if no image
- `items[].actions` (array): Item action buttons
- `loop` (boolean): Enable looping [default: true]
- `autoPlay` (boolean): Auto-advance slides [default: false]
- `autoPlayInterval` (number): Interval in ms [default: 3000]

## Example
```item-carousel
{
  "id": "templates",
  "loop": true,
  "items": [
    {
      "id": "i1",
      "name": "Weekly report",
      "subtitle": "Analytics",
      "description": "Charts and a short summary, every Monday.",
      "imageUrl": "/demo/cover-1.svg",
      "actions": [
        {
          "id": "use",
          "label": "Use this",
          "prompt": "Set up the weekly report template"
        }
      ]
    },
    {
      "id": "i2",
      "name": "Onboarding checklist",
      "subtitle": "People",
      "description": "First-week tasks for a new teammate.",
      "imageUrl": "/demo/cover-2.svg",
      "actions": [
        {
          "id": "use",
          "label": "Use this",
          "prompt": "Set up the onboarding checklist template"
        }
      ]
    },
    {
      "id": "i3",
      "name": "Release notes",
      "subtitle": "Product",
      "description": "Turn merged work into readable notes.",
      "imageUrl": "/demo/cover-3.svg",
      "actions": [
        {
          "id": "use",
          "label": "Use this",
          "prompt": "Set up the release notes template"
        }
      ]
    },
    {
      "id": "i4",
      "name": "Interview kit",
      "subtitle": "Hiring",
      "description": "Questions and a scorecard per role.",
      "color": "#3B2A66",
      "actions": [
        {
          "id": "use",
          "label": "Use this",
          "prompt": "Set up the interview kit template"
        }
      ]
    }
  ]
}
```
