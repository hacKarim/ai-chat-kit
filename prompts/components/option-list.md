# Component: Option List

## Format
```option-list
{
  "id": "string",
  "options": [
    {
      "id": "string",
      "label": "string",
      "description": "string",
      "disabled": false
    }
  ],
  "selectionMode": "single" | "multiple",
  "minSelections": 1,
  "maxSelections": 3,
  "defaultSelected": ["option-id"],
  "confirmed": "option-id" | ["option-id-1", "option-id-2"]
}
```

## Fields

### Required
- `id` (string): Unique identifier
- `options` (array): Selectable options
  - `id` (string): Option identifier
  - `label` (string): Option text

### Optional
- `options[].description` (string): Option explanation
- `options[].disabled` (boolean): Disable selection [default: false]
- `selectionMode` (string): "single" or "multiple" [default: "single"]
- `minSelections` (number): Minimum selections [default: 1]
- `maxSelections` (number): Maximum selections [default: unlimited]
- `defaultSelected` (array): Pre-selected option IDs
- `confirmed` (string | array): Locked-in selections
- `responseActions` (array): Follow-up actions after selection

## Example
```option-list
{
  "id": "pick-region",
  "selectionMode": "single",
  "options": [
    {
      "id": "paris",
      "label": "Paris (eu-west-3)",
      "description": "Closest to most of your users, 18 ms median."
    },
    {
      "id": "frankfurt",
      "label": "Frankfurt (eu-central-1)",
      "description": "Largest capacity in Europe, 24 ms median."
    },
    {
      "id": "dublin",
      "label": "Dublin (eu-west-1)",
      "description": "Cheapest of the three, 31 ms median."
    }
  ]
}
```
