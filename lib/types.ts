/**
 * Types for the workflow status and sources UI.
 * Send them to the thread as data parts: `workflow`, `sources`, `suggestions`.
 */

export type NodeStatus = "pending" | "in_progress" | "completed" | "failed" | "cancelled";
export type WorkflowStatus = "idle" | "running" | "succeeded" | "failed" | "stopped" | "canceled";

export interface WorkflowNode {
  id: string;
  title: string;
  type?: string;
  status: NodeStatus;
  elapsedTime?: number;
  error?: string | null;
  inputs?: Record<string, any>;
  outputs?: Record<string, any>;
  executionMetadata?: {
    total_tokens?: number;
    total_price?: string;
    currency?: string;
    error_strategy?: string;
  };
  processData?: {
    usage?: {
      prompt_tokens?: number;
      completion_tokens?: number;
      total_tokens?: number;
      total_price?: string;
      currency?: string;
      latency?: number;
    };
  };
}

export interface WorkflowState {
  workflowRunId: string;
  workflowId?: string;
  status: WorkflowStatus;
  currentNode: WorkflowNode | null;
  nodes: WorkflowNode[];
  totalSteps: number;
  completedSteps: number;
  elapsedTime: number;
  startedAt: number | null;
  finishedAt: number | null;
}

/**
 * A source the answer was grounded on (RAG citation).
 */
export interface Source {
  id: string;
  title: string;
  /** Page URL or bare domain. Used for the favicon and the link. */
  url: string;
  snippet?: string;
  /** Relevance between 0 and 1. */
  score?: number;
}
