"use client";

import { FC, useState } from "react";
import { cn } from "@/lib/utils";
import { Check, Circle, Loader2, X, ChevronDown, ChevronUp, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { SerializablePlan, PlanTodo } from "./schema";

interface PlanProps extends SerializablePlan {
  className?: string;
}

export const Plan: FC<PlanProps> = ({
  id,
  title,
  description,
  todos,
  maxVisibleTodos = 4,
  showProgress = true,
  className,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [expandedTodos, setExpandedTodos] = useState<Set<string>>(new Set());

  const completedCount = todos.filter((t) => t.status === "completed").length;
  const progressPercentage = todos.length > 0 ? (completedCount / todos.length) * 100 : 0;
  const allCompleted = completedCount === todos.length && todos.length > 0;

  const visibleTodos = expanded ? todos : todos.slice(0, maxVisibleTodos);
  const hasMore = todos.length > maxVisibleTodos;

  const toggleTodoExpanded = (todoId: string) => {
    setExpandedTodos((prev) => {
      const next = new Set(prev);
      if (next.has(todoId)) {
        next.delete(todoId);
      } else {
        next.add(todoId);
      }
      return next;
    });
  };

  const getStatusIcon = (status: PlanTodo["status"]) => {
    switch (status) {
      case "completed":
        return <Check className="w-5 h-5 text-green-600" />;
      case "in_progress":
        return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
      case "cancelled":
        return <X className="w-5 h-5 text-gray-400" />;
      default:
        return <Circle className="w-5 h-5 text-gray-300" />;
    }
  };

  const getStatusColor = (status: PlanTodo["status"]) => {
    switch (status) {
      case "completed":
        return "text-green-600";
      case "in_progress":
        return "text-blue-600";
      case "cancelled":
        return "text-gray-400 line-through";
      default:
        return "text-foreground";
    }
  };

  return (
    <div
      className={cn("bg-card text-card-foreground border shadow-sm rounded-lg p-6 space-y-4", className)}
      data-tool-ui-id={id}
      data-slot="plan"
    >
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold">{title}</h3>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          {allCompleted && (
            <PartyPopper className="w-6 h-6 text-yellow-500 flex-shrink-0" />
          )}
        </div>

        {/* Progress Bar */}
        {showProgress && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">
                {completedCount} / {todos.length} {allCompleted && "✓"}
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        )}
      </div>

      {/* Todo List */}
      <div className="space-y-2">
        {visibleTodos.map((todo) => {
          const isExpanded = expandedTodos.has(todo.id);
          const hasDescription = Boolean(todo.description);

          return (
            <div
              key={todo.id}
              className={cn(
                "border rounded-lg p-3 transition-colors",
                todo.status === "completed" && "bg-green-50/50 dark:bg-green-950/10",
                todo.status === "in_progress" && "bg-blue-50/50 dark:bg-blue-950/10",
                todo.status === "cancelled" && "bg-gray-50/50 dark:bg-gray-950/10"
              )}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">{getStatusIcon(todo.status)}</div>
                <div className="flex-1 min-w-0">
                  <div
                    className={cn(
                      "font-medium",
                      getStatusColor(todo.status),
                      hasDescription && "cursor-pointer"
                    )}
                    onClick={hasDescription ? () => toggleTodoExpanded(todo.id) : undefined}
                  >
                    {todo.label}
                  </div>
                  {hasDescription && isExpanded && (
                    <p className="text-sm text-muted-foreground mt-2">{todo.description}</p>
                  )}
                </div>
                {hasDescription && (
                  <button
                    onClick={() => toggleTodoExpanded(todo.id)}
                    className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Show More/Less Button */}
      {hasMore && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="w-full"
        >
          {expanded ? (
            <>
              <ChevronUp className="w-4 h-4 mr-2" />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4 mr-2" />
              Show {todos.length - maxVisibleTodos} More
            </>
          )}
        </Button>
      )}

      {/* Celebration Message */}
      {allCompleted && (
        <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
            All tasks completed! Great work! 🎉
          </p>
        </div>
      )}
    </div>
  );
};
