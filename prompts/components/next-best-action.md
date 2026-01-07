# Component: Next Best Action

## Format
```next-best-action
{
  "id": "string",
  "title": "string",
  "description": "string",
  "actions": [
    {
      "id": "string",
      "label": "string",
      "description": "string",
      "prompt": "string",
      "variant": "default" | "secondary" | "outline"
    }
  ]
}
```

## Fields

### Required
- `id` (string): Unique identifier
- `actions` (array): Action buttons (max 3)
  - `id` (string): Action identifier
  - `label` (string): Button text
  - `prompt` (string): Message sent when clicked

### Optional
- `title` (string): Component title
- `description` (string): Component description
- `actions[].description` (string): Action explanation
- `actions[].variant` (string): Button style [default: "secondary"]

## Example
```next-best-action
{
  "id": "after-report",
  "title": "What next?",
  "description": "Three ways to continue from this report",
  "actions": [
    {
      "id": "a1",
      "label": "Draft the incident summary",
      "description": "A short write-up for the status page",
      "prompt": "Draft the incident summary for the status page",
      "variant": "secondary"
    },
    {
      "id": "a2",
      "label": "Compare with last month",
      "description": "Same metrics, previous period",
      "prompt": "Compare these numbers with last month",
      "variant": "secondary"
    },
    {
      "id": "a3",
      "label": "Plan the fix",
      "description": "Break the work into steps",
      "prompt": "Plan the fix as a list of steps",
      "variant": "secondary"
    }
  ]
}
```
