/**
 * Types for Dify workflow execution
 */

export interface WorkflowNode {
  id: string;
  title: string;
  type?: string;
  status: "running" | "succeeded" | "failed";
  elapsedTime?: number;
}

export interface WorkflowState {
  workflowRunId: string;
  workflowId?: string;
  status: "idle" | "running" | "succeeded" | "failed" | "stopped";
  currentNode: WorkflowNode | null;
  nodes: WorkflowNode[];
  totalSteps: number;
  completedSteps: number;
  elapsedTime: number;
  startedAt: number | null;
  finishedAt: number | null;
}
