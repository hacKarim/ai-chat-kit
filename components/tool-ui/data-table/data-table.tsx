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
import { Check, X } from "lucide-react";
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

  return (
    <div
      className={cn(
        "w-full overflow-x-auto rounded-lg border border-border bg-card",
        className
      )}
      data-tool-ui-id={id}
      data-slot="data-table"
    >
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
};
