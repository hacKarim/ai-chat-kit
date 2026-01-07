# Component: Plan

## Format
```plan
{
  "id": "string",
  "title": "string",
  "description": "string",
  "todos": [
    {
      "id": "string",
      "label": "string",
      "status": "pending" | "in_progress" | "completed" | "cancelled",
      "description": "string"
    }
  ],
  "maxVisibleTodos": 5,
  "showProgress": true
}
```

## Fields

### Required
- `id` (string): Unique identifier
- `title` (string): Plan title
- `todos` (array): Task list
  - `id` (string): Task identifier
  - `label` (string): Task description
  - `status` (string): "pending", "in_progress", "completed", or "cancelled"

### Optional
- `description` (string): Plan description
- `todos[].description` (string): Detailed description
- `maxVisibleTodos` (number): Max tasks shown initially [default: 5]
- `showProgress` (boolean): Show progress bar [default: true]

## Example
```plan
{
  "id": "migration-plan",
  "title": "Move billing to the new database",
  "description": "Zero downtime, reversible until the last step",
  "showProgress": true,
  "maxVisibleTodos": 5,
  "todos": [
    {
      "id": "t1",
      "label": "Create the new schema",
      "status": "completed",
      "description": "Tables, indexes and constraints mirrored from production."
    },
    {
      "id": "t2",
      "label": "Dual-write from the billing service",
      "status": "completed"
    },
    {
      "id": "t3",
      "label": "Backfill historical invoices",
      "status": "in_progress",
      "description": "62% done, running in batches of 5,000."
    },
    {
      "id": "t4",
      "label": "Compare both stores for a week",
      "status": "pending"
    },
    {
      "id": "t5",
      "label": "Switch reads, then drop the old tables",
      "status": "pending"
    }
  ]
}
```
