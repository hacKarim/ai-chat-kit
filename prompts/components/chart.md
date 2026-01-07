# Component: Chart

## Format
```chart
{
  "id": "string",
  "type": "bar" | "line",
  "data": [{"key": "value", ...}],
  "xKey": "string",
  "series": [{"key": "string", "label": "string", "color": "string"}],
  "title": "string",
  "description": "string",
  "showLegend": true,
  "showGrid": true
}
```

## Fields

### Required
- `id` (string): Unique identifier
- `type` (string): Chart type - "bar" or "line"
- `data` (array): Array of data objects
- `xKey` (string): Key for X-axis values in data objects
- `series` (array): Data series to plot
  - `key` (string): Key in data objects for this series
  - `label` (string): Display label for series
  - `color` (string): Optional hex color

### Optional
- `title` (string): Chart title
- `description` (string): Chart description
- `showLegend` (boolean): Display legend [default: true]
- `showGrid` (boolean): Display grid lines [default: true]

## Example
```chart
{
  "id": "signups-by-week",
  "type": "bar",
  "title": "Signups by week",
  "description": "Organic against paid, last six weeks",
  "xKey": "week",
  "data": [
    {
      "week": "W36",
      "organic": 320,
      "paid": 140
    },
    {
      "week": "W37",
      "organic": 410,
      "paid": 180
    },
    {
      "week": "W38",
      "organic": 380,
      "paid": 260
    },
    {
      "week": "W39",
      "organic": 520,
      "paid": 240
    },
    {
      "week": "W40",
      "organic": 610,
      "paid": 310
    },
    {
      "week": "W41",
      "organic": 690,
      "paid": 290
    }
  ],
  "series": [
    {
      "key": "organic",
      "label": "Organic",
      "color": "#2F4BFF"
    },
    {
      "key": "paid",
      "label": "Paid",
      "color": "#9DB0FF"
    }
  ],
  "showLegend": true,
  "showGrid": true
}
```
