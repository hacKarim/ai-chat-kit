export interface StatusConfig {
  tone: "neutral" | "info" | "success" | "warning" | "danger";
  label?: string;
}

export interface ColumnFormat {
  kind: "text" | "status" | "date" | "boolean" | "number" | "delta" | "link" | "badge" | "array";

  // Status format
  statusMap?: Record<string, StatusConfig>;

  // Date format
  dateFormat?: "short" | "long" | "relative";

  // Number format
  numberFormat?: "integer" | "decimal" | "currency" | "percentage";

  // Delta format (for change indicators)
  deltaColors?: { positive?: string; negative?: string; neutral?: string };
  showSign?: boolean;

  // Link format
  linkTarget?: "_blank" | "_self";

  // Badge format
  badgeColorMap?: Record<string, string>;

  // Array format
  maxVisibleItems?: number;
  separator?: string;
}

export interface Column {
  key: string;
  label: string;
  priority?: "primary" | "secondary" | "tertiary";
  format?: ColumnFormat;
}

export interface SerializableDataTable {
  id: string;
  columns: Column[];
  data: Record<string, any>[];
  rowIdKey: string;
  caption?: string;
  striped?: boolean;
  compact?: boolean;
}

export function parseSerializableDataTable(data: any): SerializableDataTable {
  return {
    id: data.id || crypto.randomUUID(),
    columns: data.columns || [],
    data: data.data || [],
    rowIdKey: data.rowIdKey || "id",
    caption: data.caption,
    striped: data.striped ?? true,
    compact: data.compact ?? false,
  };
}
