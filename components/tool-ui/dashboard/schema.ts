import type { SerializableChart } from "../chart/schema";

// Metric/KPI tile
export interface MetricTile {
  type: "metric";
  id: string;
  label: string;
  value: string | number;
  icon?: string;
  trend?: "up" | "down" | "neutral";
  delta?: string;
  size?: "small" | "medium" | "large";
}

// Chart tile (reuses existing Chart component)
export interface ChartTile {
  type: "chart";
  id: string;
  chart: SerializableChart;
  size?: "small" | "medium" | "large";
}

// Stat comparison tile
export interface StatComparisonTile {
  type: "stat-comparison";
  id: string;
  label: string;
  stats: Array<{ label: string; value: string | number }>;
  size?: "small" | "medium" | "large";
}

// Progress tile
export interface ProgressTile {
  type: "progress";
  id: string;
  label: string;
  value: number;
  max: number;
  percentage?: number;
  showPercentage?: boolean;
  size?: "small" | "medium" | "large";
}

// Discriminated union for tile types
export type DashboardTile = MetricTile | ChartTile | StatComparisonTile | ProgressTile;

// Main dashboard interface
export interface SerializableDashboard {
  id: string;
  title?: string;
  description?: string;
  tiles: DashboardTile[];
  columns?: 1 | 2;
}

export function parseSerializableDashboard(data: any): SerializableDashboard {
  // Helper function to parse trend string to trend type
  const parseTrend = (trendStr?: string): "up" | "down" | "neutral" | undefined => {
    if (!trendStr) return undefined;
    const str = trendStr.toLowerCase();
    if (str.includes('+') || str.includes('↑') || str.includes('positive')) return "up";
    if (str.includes('-') || str.includes('↓') || str.includes('negative')) return "down";
    return "neutral";
  };

  // Handle kpis format (alternative to tiles)
  let tilesData = data.tiles;
  if (!tilesData && data.kpis) {
    tilesData = data.kpis.map((kpi: any) => ({
      type: "metric",
      id: kpi.id || crypto.randomUUID(),
      label: kpi.label,
      value: kpi.value,
      icon: kpi.icon,
      trend: parseTrend(kpi.trend),
      delta: kpi.trend, // The trend string becomes the delta
      size: kpi.size,
    }));
  }

  // Auto-generate IDs for tiles if not provided
  const tiles = (tilesData || []).map((tile: any) => ({
    ...tile,
    id: tile.id || crypto.randomUUID(),
  }));

  // Clamp columns to max 2
  const columns = Math.min(data.columns || 2, 2) as 1 | 2;

  return {
    id: data.id || crypto.randomUUID(),
    title: data.title,
    description: data.description,
    tiles,
    columns,
  };
}
