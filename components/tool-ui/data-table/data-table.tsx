"use client";

import { FC } from "react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Check, X, TrendingUp, TrendingDown, ExternalLink } from "lucide-react";
import type { SerializableDataTable, Column, ColumnFormat } from "./schema";

interface DataTableProps extends SerializableDataTable {
  className?: string;
}

const getToneClass = (tone: string) => {
  switch (tone) {
    case "neutral":
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    case "info":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "success":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "warning":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    case "danger":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
  }
};

const formatCellValue = (value: any, format?: ColumnFormat): React.ReactNode => {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground">-</span>;
  }

  if (!format || format.kind === "text") {
    return value;
  }

  switch (format.kind) {
    case "status":
      if (format.statusMap && value in format.statusMap) {
        const config = format.statusMap[value];
        const displayLabel = config.label || value;
        return (
          <span
            className={cn(
              "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
              getToneClass(config.tone)
            )}
          >
            {displayLabel}
          </span>
        );
      }
      return value;

    case "date":
      try {
        const date = new Date(value);
        if (isNaN(date.getTime())) return value;

        if (format.dateFormat === "long") {
          return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });
        } else if (format.dateFormat === "relative") {
          const now = new Date();
          const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
          const diffInDays = Math.floor(diffInSeconds / 86400);

          if (diffInDays === 0) return "Today";
          if (diffInDays === 1) return "Yesterday";
          if (diffInDays === -1) return "Tomorrow";
          if (diffInDays > 0) return `${diffInDays}d ago`;
          return `in ${Math.abs(diffInDays)}d`;
        } else {
          // short
          return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          });
        }
      } catch {
        return value;
      }

    case "boolean":
      return (
        <div className="flex items-center justify-center">
          {value ? (
            <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
          ) : (
            <X className="h-4 w-4 text-red-600 dark:text-red-400" />
          )}
        </div>
      );

    case "number":
      const num = Number(value);
      if (isNaN(num)) return value;

      if (format.numberFormat === "currency") {
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(num);
      } else if (format.numberFormat === "percentage") {
        return `${(num * 100).toFixed(1)}%`;
      } else if (format.numberFormat === "decimal") {
        return num.toFixed(2);
      } else {
        // integer
        return Math.round(num).toLocaleString();
      }

    case "delta":
      const delta = Number(value);
      if (isNaN(delta)) return value;

      const isPositive = delta > 0;
      const isNegative = delta < 0;
      const showSign = format.showSign ?? true;

      const deltaColors = format.deltaColors || {
        positive: "text-green-600 dark:text-green-400",
        negative: "text-red-600 dark:text-red-400",
        neutral: "text-gray-600 dark:text-gray-400",
      };

      const colorClass = isPositive
        ? deltaColors.positive
        : isNegative
        ? deltaColors.negative
        : deltaColors.neutral;

      return (
        <div className={cn("flex items-center gap-1", colorClass)}>
          {isPositive && <TrendingUp className="h-4 w-4" />}
          {isNegative && <TrendingDown className="h-4 w-4" />}
          <span className="font-medium">
            {showSign && isPositive ? "+" : ""}
            {delta.toFixed(1)}
          </span>
        </div>
      );

    case "link":
      if (!value) return null;
      const url = String(value);
      const target = format.linkTarget || "_blank";
      const isExternal = target === "_blank";

      return (
        <a
          href={url}
          target={target}
          rel={isExternal ? "noopener noreferrer" : undefined}
          className="inline-flex items-center gap-1 text-primary hover:underline"
        >
          <span className="truncate max-w-xs">{url}</span>
          {isExternal && <ExternalLink className="h-3 w-3 flex-shrink-0" />}
        </a>
      );

    case "badge":
      const badgeValue = String(value);
      const badgeColorMap = format.badgeColorMap || {};
      const badgeColor = badgeColorMap[badgeValue] || "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";

      return (
        <span
          className={cn(
            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
            badgeColor
          )}
        >
          {badgeValue}
        </span>
      );

    case "array":
      if (!Array.isArray(value)) return value;

      const maxVisible = format.maxVisibleItems ?? 3;
      const separator = format.separator || ", ";
      const visibleItems = value.slice(0, maxVisible);
      const hiddenCount = value.length - maxVisible;

      return (
        <div className="flex items-center gap-1">
          <span>{visibleItems.join(separator)}</span>
          {hiddenCount > 0 && (
            <span className="text-xs text-muted-foreground">
              +{hiddenCount} more
            </span>
          )}
        </div>
      );

    default:
      return value;
  }
};

export const DataTable: FC<DataTableProps> = ({
  id,
  columns,
  data,
  rowIdKey,
  caption,
  striped = true,
  compact = false,
  className,
}) => {
  const getPriorityClass = (priority?: string) => {
    if (!priority || priority === "primary") return "";
    if (priority === "secondary") return "hidden lg:table-cell";
    if (priority === "tertiary") return "hidden xl:table-cell";
    return "";
  };

  // Split columns into primary and secondary/tertiary for mobile view
  const primaryColumns = columns.filter((col) => !col.priority || col.priority === "primary");
  const secondaryColumns = columns.filter((col) => col.priority === "secondary" || col.priority === "tertiary");

  // Desktop table view
  const tableView = (
    <div className="hidden md:block overflow-x-auto rounded-lg border border-border bg-card">
      <Table>
        {caption && <TableCaption>{caption}</TableCaption>}
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead
                key={column.key}
                className={cn(getPriorityClass(column.priority))}
              >
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-muted-foreground"
              >
                No data available
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, index) => (
              <TableRow
                key={row[rowIdKey] || index}
                className={cn(
                  striped && index % 2 === 0 && "bg-muted/30",
                  compact ? "h-10" : "h-12"
                )}
              >
                {columns.map((column) => (
                  <TableCell
                    key={column.key}
                    className={cn(
                      getPriorityClass(column.priority),
                      compact && "py-2"
                    )}
                  >
                    {formatCellValue(row[column.key], column.format)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  // Mobile accordion view
  const mobileView = data.length === 0 ? (
    <div className="md:hidden p-8 text-center text-muted-foreground">
      No data available
    </div>
  ) : (
    <div className="md:hidden bg-card flex flex-col overflow-hidden rounded-2xl border shadow-xs">
      {data.map((row, index) => {
        const rowId = row[rowIdKey] || `row-${index}`;
        const firstColumn = primaryColumns[0];
        const summaryColumns = primaryColumns.slice(1, 3); // Show up to 2 more columns in summary
        const detailColumns = [...primaryColumns.slice(3), ...secondaryColumns];

        return (
          <Accordion
            key={rowId}
            type="single"
            collapsible
            className={cn(index > 0 && "border-t")}
            role="listitem"
            aria-label={`Row ${index + 1}: ${row[firstColumn.key]}`}
          >
            <AccordionItem value={rowId} className="last:border-b-0 group border-0">
              <AccordionTrigger
                className={cn(
                  "focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-start justify-between gap-4 text-left text-sm font-medium transition-all outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:scale-y-[-1] group-data-[state=closed]:hover:bg-accent/50 active:bg-accent/50 group-data-[state=open]:bg-muted w-full rounded-none px-4 py-3 hover:no-underline"
                )}
                aria-label={`Row ${index + 1}: ${row[firstColumn.key]}. Expand for details`}
              >
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  {/* Heading - First column value */}
                  <div
                    id={`row-${rowId}-heading`}
                    role="heading"
                    aria-level={3}
                    className="truncate"
                    aria-label={`${firstColumn.label}: ${row[firstColumn.key]}`}
                  >
                    {formatCellValue(row[firstColumn.key], firstColumn.format)}
                  </div>

                  {/* Summary - Next few primary columns */}
                  {summaryColumns.length > 0 && (
                    <div
                      className="text-muted-foreground flex w-full flex-wrap gap-x-4 gap-y-0.5"
                      role="group"
                      aria-label="Summary information"
                    >
                      {summaryColumns.map((column) => (
                        <span
                          key={column.key}
                          id={`row-${rowId}-${column.key}`}
                          className="flex min-w-0 gap-1 font-normal"
                          role="cell"
                          aria-label={`${column.label}: ${row[column.key]}`}
                        >
                          <span className="sr-only">{column.label}:</span>
                          <span aria-hidden="true">{column.label}:</span>
                          <span className="truncate">
                            {formatCellValue(row[column.key], column.format)}
                          </span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </AccordionTrigger>

              {/* Detail content - Remaining columns */}
              {detailColumns.length > 0 && (
                <AccordionContent
                  id={`row-${rowId}-details`}
                  role="region"
                  aria-labelledby={`row-${rowId}-heading`}
                  className="group data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-y-clip overflow-x-visible text-sm"
                >
                  <div className="px-4 pb-3 pt-0 space-y-2">
                    {detailColumns.map((column) => (
                      <div
                        key={column.key}
                        className="flex justify-between items-start gap-4"
                        role="row"
                      >
                        <span className="text-sm font-medium text-muted-foreground">
                          {column.label}
                        </span>
                        <span className="text-sm text-right">
                          {formatCellValue(row[column.key], column.format)}
                        </span>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              )}
            </AccordionItem>
          </Accordion>
        );
      })}
    </div>
  );

  return (
    <div
      className={cn(
        "w-full",
        className
      )}
      data-tool-ui-id={id}
      data-slot="data-table"
    >
      {tableView}
      {mobileView}
    </div>
  );
};
