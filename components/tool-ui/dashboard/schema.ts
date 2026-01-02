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
  columns?: 1 | 2 | 3 | 4;
}

export function parseSerializableDashboard(data: any): SerializableDashboard {
  // Auto-generate IDs for tiles if not provided
  const tiles = (data.tiles || []).map((tile: any) => ({
    ...tile,
    id: tile.id || crypto.randomUUID(),
  }));

  return {
    id: data.id || crypto.randomUUID(),
    title: data.title,
    description: data.description,
    tiles,
    columns: data.columns || 2,
  };
}
