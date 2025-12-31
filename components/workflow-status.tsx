"use client";

import { useState } from "react";
import { WorkflowState, NodeStatus } from "@/lib/dify/types";
import { CheckCircle2, Circle, Loader2, XCircle, Clock, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkflowStatusProps {
  workflowState: WorkflowState;
}

export function WorkflowStatus({ workflowState }: WorkflowStatusProps) {
  const [isStepsCollapsed, setIsStepsCollapsed] = useState(true);

  if (workflowState.status === "idle" || !workflowState.workflowRunId) {
    return null;
  }

  const getStatusIcon = (status: NodeStatus | string) => {
    switch (status) {
      case "pending":
        return <Circle className="h-4 w-4 text-muted-foreground" />;
      case "in_progress":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-destructive" />;
      // Legacy workflow statuses
      case "running":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case "succeeded":
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case "stopped":
        return <Circle className="h-4 w-4 text-gray-400" />;
      default:
        return <Circle className="h-4 w-4 text-gray-300" />;
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
    return `${seconds.toFixed(2)}s`;
  };

  return (
    <div className="my-4 rounded-lg  bg-card p-4">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between hidden">
        <div className="flex items-center gap-2">
          {getStatusIcon(workflowState.status)}
          <h3 className="text-sm font-semibold">Workflow Execution</h3>
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
        <div className="mb-3">
          <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>
              {workflowState.completedSteps} / {workflowState.totalSteps} steps
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{
                width: `${(workflowState.completedSteps / workflowState.totalSteps) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Execution Steps */}
      {workflowState.nodes.length > 0 && (
        <div className="space-y-1">
          <button
            onClick={() => setIsStepsCollapsed(!isStepsCollapsed)}
            className="flex w-full items-center justify-between text-xs font-medium hover:text-foreground transition-colors"
          >
            <span>
              {workflowState.status === "running" && workflowState.currentNode
                ? workflowState.currentNode.title
                : "Execution Steps"}
            </span>
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform duration-200",
                isStepsCollapsed ? "-rotate-90" : "rotate-0"
              )}
            />
          </button>
          {!isStepsCollapsed && (
            <div className="space-y-0.5 pt-1">
              {workflowState.nodes.map((node) => (
                <div
                  key={node.id}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs hover:bg-muted -mx-2 transition-colors"
                >
                  <div className="shrink-0">
                    {getStatusIcon(node.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("truncate font-medium", getNodeTextStyle(node.status))}>
                      {node.title}
                    </p>
                    {/* {node.type && (
                      <p className="truncate text-muted-foreground text-[10px]">
                        {node.type}
                      </p>
                    )} */}
                  </div>
                  {node.elapsedTime && (
                    <span className="shrink-0 text-muted-foreground text-[10px]">
                      {formatTime(node.elapsedTime)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Status Message */}
      {workflowState.status !== "running" && (
        <div className="mt-3 border-t-0">
          <p className="text-xs text-muted-foreground">
            {workflowState.status === "succeeded" && "✓ Workflow completed successfully"}
            {workflowState.status === "failed" && "✗ Workflow execution failed"}
            {workflowState.status === "stopped" && "Workflow execution stopped"}
          </p>
        </div>
      )}
    </div>
  );
}
