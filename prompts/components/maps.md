# Component: Maps

## Format
```maps
{
  "id": "string",
  "destination": "string",
  "origin": "string",
  "mode": "driving" | "walking" | "transit" | "bicycling",
  "title": "string",
  "distance": "string",
  "duration": "string",
  "ratio": "auto" | "1:1" | "4:3" | "16:9" | "9:16"
}
```

## Fields

### Required
- `id` (string): Unique identifier
- `destination` (string): Destination address or place name

### Optional
- `origin` (string): Starting point [default: current location]
- `mode` (string): Travel mode [default: "driving"]
- `title` (string): Map title
- `description` (string): Additional info
- `distance` (string): Route distance
- `duration` (string): Estimated travel time
- `mapImageUrl` (string): Static map image URL
- `ratio` (string): Image aspect ratio [default: "16:9"]
- `responseActions` (array): Follow-up actions

## Example
```maps
{
  "id": "to-office",
  "title": "To the client office",
  "origin": "Gare de Nice-Ville",
  "destination": "Promenade des Anglais, Nice",
  "mode": "walking",
  "distance": "1.4 km",
  "duration": "18 min",
  "mapImageUrl": "/demo/map.svg",
  "ratio": "16:9"
}
```
