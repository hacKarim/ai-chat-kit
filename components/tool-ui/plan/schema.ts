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

  // Flatten nested items recursively
  const flattenItems = (items: any[], parentTitle?: string): PlanTodo[] => {
    const result: PlanTodo[] = [];

    items.forEach((item: any) => {
      // Map title/label field
      const label = item.label || item.title;

      // Add the parent item
      if (label) {
        result.push({
          id: item.id || crypto.randomUUID(),
          label: label,
          status: mapStatus(item.status || "pending"),
          description: item.description,
        });
      }

      // Recursively flatten nested items
      if (item.items && Array.isArray(item.items)) {
        result.push(...flattenItems(item.items, label));
      }
    });

    return result;
  };

  // Support both 'todos' and 'items' field names
  const rawItems = data.todos || data.items || [];
  const todos = flattenItems(rawItems);

  return {
    id: data.id || crypto.randomUUID(),
    title: data.title || "Plan",
    description: data.description,
    todos,
    maxVisibleTodos: data.maxVisibleTodos ?? 4,
    showProgress: data.showProgress ?? true,
  };
}
