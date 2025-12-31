export interface PlanTodo {
  id: string;
  label: string;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  description?: string;
}

export interface SerializablePlan {
  id: string;
  title: string;
  description?: string;
  todos: PlanTodo[];
  maxVisibleTodos?: number;
  showProgress?: boolean;
}

export function parseSerializablePlan(data: any): SerializablePlan {
  return {
    id: data.id || crypto.randomUUID(),
    title: data.title || "Plan",
    description: data.description,
    todos: data.todos || [],
    maxVisibleTodos: data.maxVisibleTodos ?? 4,
    showProgress: data.showProgress ?? true,
  };
}
