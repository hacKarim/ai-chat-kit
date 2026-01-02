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

export function parseSerializableDataTable(input: any): SerializableDataTable {
  // Support both 'data' and 'rows' field names
  const tableData = input.data || input.rows || [];

  // Support both 'caption' and 'title' field names
  const caption = input.caption || input.title;

  // Auto-generate IDs for rows if not provided
  const dataWithIds = tableData.map((row: any) => ({
    ...row,
    id: row.id || crypto.randomUUID(),
  }));

  // Map column 'id' to 'key' and ensure each column has a unique key
  const columns = (input.columns || []).map((column: any) => ({
    ...column,
    key: column.key || column.id || crypto.randomUUID(),
  }));

  return {
    id: input.id || crypto.randomUUID(),
    columns,
    data: dataWithIds,
    rowIdKey: input.rowIdKey || "id",
    caption,
    striped: input.striped ?? true,
    compact: input.compact ?? false,
  };
}
