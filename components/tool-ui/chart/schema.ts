export interface ChartSeries {
  key: string;
  label: string;
  color?: string;
}

export interface SerializableChart {
  id: string;
  type: "bar" | "line";
  title?: string;
  description?: string;
  data: Record<string, any>[];
  xKey: string;
  series: ChartSeries[];
  showLegend?: boolean;
  showGrid?: boolean;
}

export function parseSerializableChart(data: any): SerializableChart {
  return {
    id: data.id || crypto.randomUUID(),
    type: data.type || "bar",
    title: data.title,
    description: data.description,
    data: data.data || [],
    xKey: data.xKey || "x",
    series: data.series || [],
    showLegend: data.showLegend ?? true,
    showGrid: data.showGrid ?? true,
  };
}
