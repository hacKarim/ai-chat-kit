"use client";

import { useState } from "react";
import { WorkflowState, NodeStatus } from "@/lib/dify/types";
import { CheckCircle2, Circle, Loader2, XCircle, Clock, CircleDotDashed, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface WorkflowStatusProps {
  workflowState: WorkflowState;
}

export function WorkflowStatus({ workflowState }: WorkflowStatusProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (workflowState.status === "idle" || !workflowState.workflowRunId) {
    return null;
  }

  // Determine effective status - check for partial success
  const getEffectiveStatus = () => {
    if (workflowState.status === "running") return "running";
    if (workflowState.status === "canceled") return "canceled";

    // Check if we have mixed results (some completed, some failed)
    const hasCompleted = workflowState.nodes.some(n => n.status === "completed");
    const hasFailed = workflowState.nodes.some(n => n.status === "failed" || n.status === "cancelled");

    if (hasCompleted && hasFailed) {
      // Check if the last node failed
      const lastNode = workflowState.nodes[workflowState.nodes.length - 1];
      if (lastNode && (lastNode.status === "failed" || lastNode.status === "cancelled")) {
        return "failed";
      }
      // Mixed results but last didn't fail = partial success
      return "partial";
    }

    return workflowState.status;
  };

  const effectiveStatus = getEffectiveStatus();

  const getStatusIcon = (status: NodeStatus | string, size: "sm" | "md" = "md") => {
    const sizeClass = size === "sm" ? "h-3 w-3" : "h-4 w-4";

    switch (status) {
      case "pending":
        return <Circle className={cn(sizeClass, "text-muted-foreground")} />;
      case "in_progress":
        return <Loader2 className={cn(sizeClass, "animate-spin text-blue-500")} />;
      case "completed":
        return <CheckCircle2 className={cn(sizeClass, "text-emerald-500")} />;
      case "failed":
        return <XCircle className={cn(sizeClass, "text-red-500")} />;
      case "cancelled":
      case "canceled":
        return <XCircle className={cn(sizeClass, "text-orange-500")} />;
      case "running":
        return <Loader2 className={cn(sizeClass, "animate-spin text-blue-500")} />;
      case "succeeded":
        return <CheckCircle2 className={cn(sizeClass, "text-emerald-500")} />;
      case "stopped":
        return <Circle className={cn(sizeClass, "text-gray-400")} />;
      case "partial":
        return <AlertCircle className={cn(sizeClass, "text-yellow-500")} />;
      default:
        return <Circle className={cn(sizeClass, "text-gray-300")} />;
    }
  };

  const getNodeTextStyle = (status: NodeStatus) => {
    switch (status) {
      case "pending":
        return "text-muted-foreground";
      case "in_progress":
        return "text-foreground";
      case "completed":
        return "text-emerald-600 dark:text-emerald-400";
      case "failed":
      case "cancelled":
        return "text-destructive line-through";
      default:
        return "text-foreground";
    }
  };

  const formatTime = (seconds: number) => {
    return `${seconds.toFixed(1)}s`;
  };

  const isRunning = effectiveStatus === "running";
  const progressPercent = workflowState.totalSteps > 0
    ? (workflowState.completedSteps / workflowState.totalSteps) * 100
    : 0;

  const getStatusLabel = () => {
    if (isRunning && workflowState.currentNode) {
      return workflowState.currentNode.title;
    }
    if (effectiveStatus === "succeeded") return "Completed";
    if (effectiveStatus === "partial") return "Partial Success";
    if (effectiveStatus === "failed") return "Failed";
    if (effectiveStatus === "stopped") return "Stopped";
    if (effectiveStatus === "canceled") return "Partially Canceled by user";
    return "Processing";
  };

  const getStatusColor = () => {
    if (isRunning) return "text-primary/50";
    if (effectiveStatus === "succeeded") return "text-emerald-600 dark:text-emerald-400";
    if (effectiveStatus === "partial") return "text-yellow-600 dark:text-yellow-400";
    if (effectiveStatus === "failed") return "text-red-600 dark:text-red-400";
    if (effectiveStatus === "canceled") return "text-orange-600 dark:text-orange-400";
    return "text-muted-foreground";
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "inline-flex items-center gap-1.5 cursor-pointer transition-colors",
            "hover:bg-accent/50 rounded-md px-2 py-1.5 -mx-2",
            "text-xs"
          )}
        >
          {/* Rotating icon when running */}
          {isRunning ? (
            <span className="inline-flex shrink-0 motion-safe:animate-[plan-spin_8s_linear_infinite]">
              <CircleDotDashed className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            </span>
          ) : (
            getStatusIcon(effectiveStatus, "sm")
          )}

          <span className={cn(
            "font-medium",
            isRunning ? "motion-safe:shimmer text-primary/50" : getStatusColor()
          )}>
            {getStatusLabel()}
          </span>

          {workflowState.totalSteps > 0 && (
            <span className="text-[10px] text-muted-foreground">
              {workflowState.completedSteps}/{workflowState.totalSteps}
            </span>
          )}
          {workflowState.elapsedTime > 0 && !isRunning && (
            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
              <Clock className="h-2.5 w-2.5" />
              {formatTime(workflowState.elapsedTime)}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[380px] p-3"
        align="start"
        side="top"
      >
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(effectiveStatus)}
              <h4 className="font-semibold text-sm">Workflow Execution</h4>
            </div>
            {workflowState.elapsedTime > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {formatTime(workflowState.elapsedTime)}
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {workflowState.totalSteps > 0 && (
            <div>
              <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
                <span>Progress</span>
                <span>
                  {workflowState.completedSteps} / {workflowState.totalSteps} steps
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full transition-all duration-300",
                    isRunning ? "bg-blue-500" : "bg-emerald-500"
                  )}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Execution Steps */}
          {workflowState.nodes.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <h5 className="text-xs font-medium text-muted-foreground">Steps</h5>
              <ul className="space-y-0 max-h-[400px] overflow-y-auto">
                {workflowState.nodes.map((node) => {
                  const hasError = node.status === "failed" || node.error;
                  const isRunning = node.status === "in_progress";

                  return (
                    <li key={node.id} className={cn("-mx-2 flex flex-col gap-2 rounded-md px-2 py-1", hasError && "bg-red-50 dark:bg-red-950/20")}>
                      {/* Node header */}
                      <div className="flex items-start gap-2">
                        <span className={cn("mt-0.5 inline-flex shrink-0", isRunning && "motion-safe:animate-[plan-spin_8s_linear_infinite]")}>
                          {getStatusIcon(node.status, "sm")}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={cn("text-xs", isRunning ? "motion-safe:shimmer text-primary/50" : getNodeTextStyle(node.status))}>
                              {node.title}
                            </span>
 
                          </div>

                          {/* Error message */}
                          {hasError && node.error && (
                            <p className="text-red-600 dark:text-red-400 text-xs mt-1">
                              {node.error}
                            </p>
                          )}

                          {/* Token usage inline */}
                          {(node.executionMetadata?.total_tokens || node.processData?.usage) && (
                            <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                              {node.processData?.usage?.prompt_tokens && node.processData?.usage?.completion_tokens && (
                                <span className="font-mono">
                                  {node.processData.usage.prompt_tokens + node.processData.usage.completion_tokens} tokens
                                </span>
                              )}
                              {node.executionMetadata?.total_price && (
                                <span className="font-mono">
                                  ${node.executionMetadata.total_price}
                                </span>
                              )}
                              {node.processData?.usage?.latency && (
                                <span className="font-mono">
                                  {node.processData.usage.latency.toFixed(2)}s
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        {node.elapsedTime && (
                          <span className="shrink-0 text-muted-foreground text-xs tabular-nums">
                            {formatTime(node.elapsedTime)}
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Status Message */}
          {!isRunning && (
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                {effectiveStatus === "succeeded" && "✓ Workflow completed successfully"}
                {effectiveStatus === "partial" && "⚠ Workflow completed with some failures"}
                {effectiveStatus === "failed" && "✗ Workflow execution failed"}
                {effectiveStatus === "stopped" && "Workflow execution stopped"}
                {effectiveStatus === "canceled" && "⊘ Workflow execution canceled by user"}
              </p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
