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
  // Map status values to match expected types
  const mapStatus = (status: string): PlanTodo["status"] => {
    switch (status) {
      case "incomplete":
      case "pending":
        return "pending";
      case "in_progress":
        return "in_progress";
      case "complete":
      case "completed":
        return "completed";
      case "cancelled":
        return "cancelled";
      default:
        return "pending";
    }
  };

  // Support both 'todos' and 'items' field names
  const rawTodos = data.todos || data.items || [];
  const todos = rawTodos.map((todo: any) => ({
    ...todo,
    status: mapStatus(todo.status),
  }));

  return {
    id: data.id || crypto.randomUUID(),
    title: data.title || "Plan",
    description: data.description,
    todos,
    maxVisibleTodos: data.maxVisibleTodos ?? 4,
    showProgress: data.showProgress ?? true,
  };
}
