"use client";

import { FC } from "react";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";
import type { SerializableChart } from "./schema";
import { cn } from "@/lib/utils";

interface ChartProps extends SerializableChart {
  className?: string;
  onDataPointClick?: (dataPoint: any) => void;
}

export const Chart: FC<ChartProps> = ({
  id,
  type,
  title,
  description,
  data,
  xKey,
  series,
  showLegend = true,
  showGrid = true,
  className,
  onDataPointClick,
}) => {
  // Build ChartConfig from series
  const chartConfig: ChartConfig = series.reduce((config, s) => {
    config[s.key] = {
      label: s.label,
      color: s.color,
    };
    return config;
  }, {} as ChartConfig);

  // Default colors for series without explicit colors
  const defaultColors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ];

  return (
    <div
      className={cn("flex flex-col gap-2", className)}
      data-tool-ui-id={id}
      data-slot="chart"
    >
      {(title || description) && (
        <div className="space-y-1">
          {title && <h3 className="text-lg font-semibold">{title}</h3>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      )}

      <ChartContainer id={id} config={chartConfig}>
        {type === "bar" ? (
          <BarChart data={data} onClick={onDataPointClick}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} />}
            <XAxis
              dataKey={xKey}
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => {
                if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
                return value.toString();
              }}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            {showLegend && <Legend />}
            {series.map((s, index) => (
              <Bar
                key={s.key}
                dataKey={s.key}
                fill={s.color || defaultColors[index % defaultColors.length]}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        ) : (
          <LineChart data={data} onClick={onDataPointClick}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} />}
            <XAxis
              dataKey={xKey}
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => {
                if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
                return value.toString();
              }}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            {showLegend && <Legend />}
            {series.map((s, index) => (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                stroke={s.color || defaultColors[index % defaultColors.length]}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        )}
      </ChartContainer>
    </div>
  );
};
