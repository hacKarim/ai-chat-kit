# Component: Data Table

If the data table contains status, the first column is status.
Status are colored, and grouped by status.

## Format
```data-table
{
  "id": "string",
  "columns": [
    {
      "key": "string",
      "label": "string",
      "priority": "primary" | "secondary" | "tertiary",
      "format": {
        "kind": "text" | "status" | "date" | "boolean" | "number" | "delta" | "link" | "badge" | "array"
      }
    }
  ],
  "data": [{"key": "value"}],
  "rowIdKey": "string",
  "caption": "string",
  "striped": true,
  "compact": false
}
```

## Fields

### Required
- `id` (string): Unique identifier
- `columns` (array): Column definitions
  - `key` (string): Data field key
  - `label` (string): Column header
  - `format.kind` (string): Column type - "text", "status", "date", "number", "delta", "badge", "array", etc.
- `data` (array): Array of data objects
- `rowIdKey` (string): Key for unique row identifier

### Optional
- `caption` (string): Table caption/title
- `striped` (boolean): Striped rows [default: false]
- `compact` (boolean): Compact layout [default: false]
- `columns[].priority` (string): "primary", "secondary", or "tertiary"
- `columns[].format` (object): Format options (statusMap, dateFormat, numberFormat, etc.)

## Example
```data-table
{
  "id": "open-incidents",
  "caption": "Open incidents",
  "rowIdKey": "id",
  "striped": true,
  "columns": [
    {
      "key": "status",
      "label": "Status",
      "priority": "primary",
      "format": {
        "kind": "status",
        "statusMap": {
          "investigating": {
            "tone": "danger",
            "label": "Investigating"
          },
          "mitigated": {
            "tone": "warning",
            "label": "Mitigated"
          },
          "resolved": {
            "tone": "success",
            "label": "Resolved"
          }
        }
      }
    },
    {
      "key": "service",
      "label": "Service",
      "priority": "primary"
    },
    {
      "key": "opened",
      "label": "Opened",
      "format": {
        "kind": "date",
        "dateFormat": "short"
      }
    },
    {
      "key": "errorRate",
      "label": "Error rate",
      "format": {
        "kind": "number",
        "numberFormat": "percentage"
      }
    },
    {
      "key": "change",
      "label": "Since 1h",
      "format": {
        "kind": "delta",
        "showSign": true
      }
    },
    {
      "key": "owners",
      "label": "Owners",
      "priority": "secondary",
      "format": {
        "kind": "array",
        "maxVisibleItems": 2
      }
    }
  ],
  "data": [
    {
      "id": "inc-311",
      "status": "investigating",
      "service": "checkout-api",
      "opened": "2025-12-15T08:40:00Z",
      "errorRate": 0.042,
      "change": 1.1,
      "owners": [
        "Ines",
        "Theo"
      ]
    },
    {
      "id": "inc-309",
      "status": "mitigated",
      "service": "search",
      "opened": "2025-12-15T06:15:00Z",
      "errorRate": 0.009,
      "change": -2.4,
      "owners": [
        "Sam"
      ]
    },
    {
      "id": "inc-304",
      "status": "resolved",
      "service": "notifications",
      "opened": "2025-12-14T19:02:00Z",
      "errorRate": 0.001,
      "change": -0.6,
      "owners": [
        "Lena",
        "Omar",
        "Jo"
      ]
    }
  ]
}
```
