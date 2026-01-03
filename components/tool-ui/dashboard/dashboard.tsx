"use client";

import { FC } from "react";
import { cn } from "@/lib/utils";
import * as LucideIcons from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Chart } from "@/components/tool-ui/chart";
import type { SerializableDashboard, MetricTile, ChartTile, StatComparisonTile, ProgressTile } from "./schema";

interface DashboardProps extends SerializableDashboard {
  className?: string;
}

// Get tile size class for flex layout (tiles auto-fill available space)
const getTileSizeClass = (size: string = "small", columns: number = 2) => {
  switch (size) {
    case "large":
      // Large tiles take full width
      return "w-full";
    case "medium":
      // Medium tiles flex to fill space
      if (columns === 1) return "w-full";
      return "flex-1 min-w-full md:min-w-[300px]";
    case "small":
    default:
      // Small tiles flex to fill space
      if (columns === 1) return "w-full";
      return "flex-1 min-w-full md:min-w-[200px]";
  }
};

// Metric Tile Component
const MetricTileComponent: FC<{ tile: MetricTile; columns: number }> = ({ tile, columns }) => {
  const trendIcon = tile.trend === "up"
    ? <LucideIcons.TrendingUp className="w-3 h-3" />
    : tile.trend === "down"
    ? <LucideIcons.TrendingDown className="w-3 h-3" />
    : <LucideIcons.Minus className="w-3 h-3" />;

  const trendColor = tile.trend === "up"
    ? "text-green-600 dark:text-green-400"
    : tile.trend === "down"
    ? "text-red-600 dark:text-red-400"
    : "text-muted-foreground";

  const Icon = tile.icon ? (LucideIcons as any)[tile.icon] : null;

  return (
    <div
      className={cn(
        getTileSizeClass(tile.size, columns),
        "rounded-3xl px-5 py-5 transition-all duration-300 hover:brightness-95"
      )}
      style={{ backgroundColor: '#EFF2F5' }}
    >
      <div className="flex flex-col gap-2">
        {Icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-black mb-1">
            <Icon className="h-5 w-5 text-black dark:text-white" />
          </div>
        )}
        <div className="space-y-0.5">
          <p className="text-xs font-medium text-muted-foreground">
            {tile.label}
          </p>
          <div className="flex items-baseline gap-1.5">
            <p className="text-md font-bold tracking-tight">
              {tile.value}
            </p>
            {tile.delta && tile.trend && (
              <div className={cn("flex items-center gap-0.5 text-xs font-medium", trendColor)}>
                {trendIcon}
                <span>{tile.delta}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Chart Tile Component
const ChartTileComponent: FC<{ tile: ChartTile; columns: number }> = ({ tile, columns }) => {
  return (
    <div
      className={cn(
        getTileSizeClass(tile.size, columns),
        "rounded-3xl px-5 py-5 transition-all duration-300 hover:brightness-95"
      )}
      style={{ backgroundColor: '#EFF2F5' }}
    >
      <Chart {...tile.chart} />
    </div>
  );
};

// Stat Comparison Tile Component
const StatComparisonTileComponent: FC<{ tile: StatComparisonTile; columns: number }> = ({ tile, columns }) => {
  return (
    <div
      className={cn(
        getTileSizeClass(tile.size, columns),
        "rounded-3xl px-5 py-5 transition-all duration-300 hover:brightness-95"
      )}
      style={{ backgroundColor: '#EFF2F5' }}
    >
      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold text-muted-foreground">
          {tile.label}
        </p>
        <div className="flex items-center justify-around gap-3">
          {tile.stats.map((stat, index) => (
            <div key={index} className="flex flex-col items-center gap-0.5">
              <p className="text-[10px] text-muted-foreground">{stat.label}</p>
              <p className="text font-bold">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Progress Tile Component
const ProgressTileComponent: FC<{ tile: ProgressTile; columns: number }> = ({ tile, columns }) => {
  const percentage = tile.percentage ?? (tile.max > 0 ? (tile.value / tile.max) * 100 : 0);
  const showPercentage = tile.showPercentage ?? true;

  return (
    <div
      className={cn(
        getTileSizeClass(tile.size, columns),
        "rounded-3xl px-5 py-5 transition-all duration-300 hover:brightness-95"
      )}
      style={{ backgroundColor: '#EFF2F5' }}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-muted-foreground">
            {tile.label}
          </p>
          {showPercentage && (
            <p className="text-xs font-bold">
              {Math.round(percentage)}%
            </p>
          )}
        </div>
        <Progress value={percentage} className="h-1.5" />
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>{tile.value.toLocaleString()}</span>
          <span>{tile.max.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

// Main Dashboard Component
export const Dashboard: FC<DashboardProps> = ({
  id,
  title,
  description,
  tiles,
  columns = 2,
  className,
}) => {
  const flexClass = cn(
    "flex flex-wrap gap-3"
  );

  return (
    <div
      className={cn("space-y-3", className)}
      data-tool-ui-id={id}
      data-slot="dashboard"
    >
      {/* Header */}
      {(title || description) && (
        <div className="space-y-0.5">
          {title && (
            <h3 className="text-base font-semibold tracking-tight">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-xs text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      )}

      {/* Tiles Flex Container */}
      <div className={flexClass}>
        {tiles.map((tile) => {
          switch (tile.type) {
            case "metric":
              return <MetricTileComponent key={tile.id} tile={tile} columns={columns} />;
            case "chart":
              return <ChartTileComponent key={tile.id} tile={tile} columns={columns} />;
            case "stat-comparison":
              return <StatComparisonTileComponent key={tile.id} tile={tile} columns={columns} />;
            case "progress":
              return <ProgressTileComponent key={tile.id} tile={tile} columns={columns} />;
            default:
              return null;
          }
        })}
      </div>
    </div>
  );
};
