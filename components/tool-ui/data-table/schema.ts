export interface StatusConfig {
  tone: "neutral" | "info" | "success" | "warning" | "danger";
  label?: string;
}

export interface ColumnFormat {
  kind: "text" | "status" | "date" | "boolean" | "number";
  statusMap?: Record<string, StatusConfig>;
  dateFormat?: "short" | "long" | "relative";
  numberFormat?: "integer" | "decimal" | "currency" | "percentage";
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
