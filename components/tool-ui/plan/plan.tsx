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
  // Initialize with all todos that have descriptions expanded by default
  const [expandedTodos, setExpandedTodos] = useState<Set<string>>(() => {
    const initialExpanded = new Set<string>();
    todos.forEach((todo) => {
      if (todo.description) {
        initialExpanded.add(todo.id);
      }
    });
    return initialExpanded;
  });

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
        return <Check className="w-4 h-4 text-green-600" />;
      case "in_progress":
        return <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />;
      case "cancelled":
        return <X className="w-4 h-4 text-gray-400" />;
      default:
        return <Circle className="w-4 h-4 text-gray-300" />;
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
      className={cn(" bg-card/60 text-card-foreground border border-border/50 rounded-lg p-4 space-y-3", className)}
      data-tool-ui-id={id}
      data-slot="plan"
    >
      {/* Header */}
      <div className="space-y-1.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold">{title}</h3>
            {description && (
              <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
            )}
          </div>
          {allCompleted && (
            <PartyPopper className="w-5 h-5 text-yellow-500 flex-shrink-0" />
          )}
        </div>

        {/* Progress Bar */}
        {showProgress && (
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">
                {completedCount} of {todos.length} complete {allCompleted && "✓"}
              </span>
            </div>
            <Progress value={progressPercentage} className="h-1.5" />
          </div>
        )}
      </div>

      {/* Todo List */}
      <div className="space-y-1.5">
        {visibleTodos.map((todo) => {
          const isExpanded = expandedTodos.has(todo.id);
          const hasDescription = Boolean(todo.description);

          return (
            <div
              key={todo.id}
              className="flex items-start gap-2.5 py-1.5"
            >
              <div className="flex-shrink-0 mt-0.5">{getStatusIcon(todo.status)}</div>
              <div className="flex-1 min-w-0">
                <div
                  className={cn(
                    "text-sm",
                    getStatusColor(todo.status),
                    hasDescription && "cursor-pointer hover:underline"
                  )}
                  onClick={hasDescription ? () => toggleTodoExpanded(todo.id) : undefined}
                >
                  {todo.label}
                </div>
                {hasDescription && isExpanded && (
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{todo.description}</p>
                )}
              </div>
              {hasDescription && (
                <button
                  onClick={() => toggleTodoExpanded(todo.id)}
                  className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {isExpanded ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>
              )}
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
          className="w-full h-8 text-xs"
        >
          {expanded ? (
            <>
              <ChevronUp className="w-3.5 h-3.5 mr-1.5" />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5 mr-1.5" />
              Show {todos.length - maxVisibleTodos} More
            </>
          )}
        </Button>
      )}

      
    </div>
  );
};
