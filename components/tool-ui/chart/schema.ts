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
  // Check if data is in the alternative format with xAxis.categories and series[].data
  if (data.xAxis?.categories && data.series?.[0]?.data) {
    // Transform xAxis.categories + series[].data format to expected format
    const xValues = data.xAxis.categories || [];
    const transformedData: Record<string, any>[] = xValues.map((xVal: any, index: number) => {
      const row: Record<string, any> = { x: xVal };
      data.series.forEach((s: any, seriesIndex: number) => {
        const key = `series${seriesIndex}`;
        row[key] = s.data?.[index];
      });
      return row;
    });

    const transformedSeries: ChartSeries[] = data.series.map((s: any, index: number) => ({
      key: `series${index}`,
      label: s.name || s.label || `Series ${index + 1}`,
      color: s.color,
    }));

    return {
      id: data.id || crypto.randomUUID(),
      type: data.type || "bar",
      title: data.title,
      description: data.description,
      data: transformedData,
      xKey: "x",
      series: transformedSeries,
      showLegend: data.showLegend ?? true,
      showGrid: data.showGrid ?? true,
    };
  }

  // Check if data is in the alternative format with xAxis.values and series[].values (camelCase)
  if (data.xAxis?.values && data.series?.[0]?.values) {
    // Transform xAxis.values + series[].values format to expected format
    const xValues = data.xAxis.values || [];
    const transformedData: Record<string, any>[] = xValues.map((xVal: any, index: number) => {
      const row: Record<string, any> = { x: xVal };
      data.series.forEach((s: any, seriesIndex: number) => {
        const key = `series${seriesIndex}`;
        row[key] = s.values?.[index];
      });
      return row;
    });

    const transformedSeries: ChartSeries[] = data.series.map((s: any, index: number) => ({
      key: `series${index}`,
      label: s.name || s.label || `Series ${index + 1}`,
      color: s.color,
    }));

    return {
      id: data.id || crypto.randomUUID(),
      type: data.type || "bar",
      title: data.title,
      description: data.description,
      data: transformedData,
      xKey: "x",
      series: transformedSeries,
      showLegend: data.showLegend ?? true,
      showGrid: data.showGrid ?? true,
    };
  }

  // Check if data is in the alternative format with x_axis/y_axis/series.values (snake_case)
  if (data.x_axis && data.series?.[0]?.values) {
    // Transform alternative format to expected format
    const xValues = data.x_axis.values || [];
    const transformedData: Record<string, any>[] = xValues.map((xVal: any, index: number) => {
      const row: Record<string, any> = { x: xVal };
      data.series.forEach((s: any, seriesIndex: number) => {
        const key = `series${seriesIndex}`;
        row[key] = s.values?.[index];
      });
      return row;
    });

    const transformedSeries: ChartSeries[] = data.series.map((s: any, index: number) => ({
      key: `series${index}`,
      label: s.name || s.label || `Series ${index + 1}`,
      color: s.color,
    }));

    return {
      id: data.id || crypto.randomUUID(),
      type: data.type || "bar",
      title: data.title,
      description: data.description,
      data: transformedData,
      xKey: "x",
      series: transformedSeries,
      showLegend: data.showLegend ?? true,
      showGrid: data.showGrid ?? true,
    };
  }

  // Standard format
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
