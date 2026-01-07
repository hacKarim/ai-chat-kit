# Component: Dashboard

Dashboard titles, text etc are always small, short, 1 to 3 words max
Numbers are styled like 130K instead of 130000

## Format
```dashboard
{
  "id": "string",
  "title": "string",
  "description": "string",
  "tiles": [
    {
      "type": "metric" | "chart" | "stat-comparison" | "progress",
      "id": "string",
      // tile-specific fields
    }
  ],
  "columns": 1 | 2
}
```

## Fields

### Required
- `id` (string): Unique identifier
- `tiles` (array): Array of dashboard tiles (see tile types below)

### Optional
- `title` (string): Dashboard title
- `description` (string): Dashboard description
- `columns` (number): Grid columns - 1 or 2 [default: 2]

### Tile Types

#### Metric Tile
- `type` (string): "metric"
- `id` (string): Tile identifier
- `label` (string): Metric label
- `value` (string | number): Metric value
- `icon` (string): Optional Lucide icon name
- `trend` (string): "up", "down", or "neutral"
- `delta` (string): Change indicator
- `size` (string): "small", "medium", or "large" [default: "medium"]

#### Chart Tile
- `type` (string): "chart"
- `id` (string): Tile identifier
- `chart` (object): SerializableChart object
- `size` (string): "small", "medium", or "large" [default: "medium"]

#### Stat-Comparison Tile
- `type` (string): "stat-comparison"
- `id` (string): Tile identifier
- `label` (string): Comparison label
- `stats` (array): Array of {label, value} objects
- `size` (string): "small", "medium", or "large" [default: "medium"]

#### Progress Tile
- `type` (string): "progress"
- `id` (string): Tile identifier
- `label` (string): Progress label
- `value` (number): Current value
- `max` (number): Maximum value
- `percentage` (number): Optional percentage override
- `showPercentage` (boolean): Show percentage [default: true]
- `size` (string): "small", "medium", or "large" [default: "medium"]

## Example
```dashboard
{
  "id": "release-health",
  "title": "Release health",
  "description": "Version 4.2, first 24 hours",
  "columns": 2,
  "tiles": [
    {
      "type": "metric",
      "id": "crash-free",
      "label": "Crash-free",
      "value": "99.4%",
      "icon": "ShieldCheck",
      "trend": "up",
      "delta": "+0.3 pts",
      "size": "small"
    },
    {
      "type": "metric",
      "id": "p95",
      "label": "p95 latency",
      "value": "412 ms",
      "icon": "Timer",
      "trend": "down",
      "delta": "-38 ms",
      "size": "small"
    },
    {
      "type": "progress",
      "id": "rollout",
      "label": "Rollout",
      "value": 60,
      "max": 100,
      "size": "small"
    },
    {
      "type": "stat-comparison",
      "id": "errors",
      "label": "Errors per 10K",
      "stats": [
        {
          "label": "4.1",
          "value": 18
        },
        {
          "label": "4.2",
          "value": 11
        }
      ],
      "size": "small"
    },
    {
      "type": "chart",
      "id": "adoption",
      "size": "large",
      "chart": {
        "id": "adoption-chart",
        "type": "line",
        "title": "Adoption",
        "xKey": "hour",
        "data": [
          {
            "hour": "0h",
            "share": 2
          },
          {
            "hour": "6h",
            "share": 14
          },
          {
            "hour": "12h",
            "share": 31
          },
          {
            "hour": "18h",
            "share": 47
          },
          {
            "hour": "24h",
            "share": 60
          }
        ],
        "series": [
          {
            "key": "share",
            "label": "Share of sessions (%)",
            "color": "#2F4BFF"
          }
        ],
        "showLegend": false
      }
    }
  ]
}
```
