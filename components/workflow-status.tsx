"use client";

import { WorkflowState } from "@/lib/dify/types";
import { CheckCircle2, Circle, Loader2, XCircle, Clock } from "lucide-react";

interface WorkflowStatusProps {
  workflowState: WorkflowState;
}

export function WorkflowStatus({ workflowState }: WorkflowStatusProps) {
  if (workflowState.status === "idle" || !workflowState.workflowRunId) {
    return null;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "running":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case "succeeded":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "stopped":
        return <Circle className="h-4 w-4 text-gray-400" />;
      default:
        return <Circle className="h-4 w-4 text-gray-300" />;
    }
  };

  const formatTime = (seconds: number) => {
    return `${seconds.toFixed(2)}s`;
  };

  return (
    <div className="my-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getStatusIcon(workflowState.status)}
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Workflow Execution
          </h3>
        </div>
        {workflowState.elapsedTime > 0 && (
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <Clock className="h-3 w-3" />
            {formatTime(workflowState.elapsedTime)}
          </div>
        )}
      </div>

      {/* Current Node */}
      {workflowState.currentNode && (
        <div className="mb-3 rounded-md bg-white p-3 dark:bg-gray-900">
          <div className="flex items-center gap-2">
            {getStatusIcon(workflowState.currentNode.status)}
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {workflowState.currentNode.title}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {workflowState.currentNode.type}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {workflowState.totalSteps > 0 && (
        <div className="mb-3">
          <div className="mb-1 flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
            <span>Progress</span>
            <span>
              {workflowState.completedSteps} / {workflowState.totalSteps} steps
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{
                width: `${(workflowState.completedSteps / workflowState.totalSteps) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Node List */}
      {workflowState.nodes.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
            Execution Steps
          </p>
          <div className="space-y-1">
            {workflowState.nodes.map((node, index) => (
              <div
                key={node.id}
                className="flex items-center gap-2 rounded px-2 py-1.5 text-xs hover:bg-white dark:hover:bg-gray-900"
              >
                <div className="flex-shrink-0">
                  {getStatusIcon(node.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium text-gray-900 dark:text-gray-100">
                    {index + 1}. {node.title}
                  </p>
                  <p className="truncate text-gray-500 dark:text-gray-400">
                    {node.type}
                  </p>
                </div>
                {node.elapsedTime && (
                  <span className="flex-shrink-0 text-gray-500 dark:text-gray-400">
                    {formatTime(node.elapsedTime)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status Message */}
      {workflowState.status !== "running" && (
        <div className="mt-3 border-t border-gray-200 pt-3 dark:border-gray-700">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {workflowState.status === "succeeded" &&
              "✓ Workflow completed successfully"}
            {workflowState.status === "failed" && "✗ Workflow execution failed"}
            {workflowState.status === "stopped" && "Workflow execution stopped"}
          </p>
        </div>
      )}
    </div>
  );
}
