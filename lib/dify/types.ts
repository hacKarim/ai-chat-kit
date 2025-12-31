/**
 * Types for Dify workflow execution
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
 * Types for retriever resources (RAG sources)
 */
export interface RetrieverResource {
  position: number;
  dataset_id: string;
  dataset_name: string;
  document_id: string;
  document_name: string;  // URL
  data_source_type?: string;
  segment_id: string;
  retriever_from?: string;
  score: number;
  hit_count: number;
  word_count?: number;
  segment_position?: number;
  index_node_hash?: string;
  content: string;
  page?: string | null;
  doc_metadata?: any;
  title?: string | null;
  files?: any;
}

export interface MessageMetadata {
  annotation_reply?: any;
  retriever_resources?: RetrieverResource[];
  usage?: {
    prompt_tokens: number;
    prompt_unit_price?: string;
    prompt_price_unit?: string;
    prompt_price?: string;
    completion_tokens: number;
    completion_unit_price?: string;
    completion_price_unit?: string;
    completion_price?: string;
    total_tokens: number;
    total_price?: string;
    currency?: string;
    latency?: number;
    time_to_first_token?: number;
    time_to_generate?: number;
  };
}
