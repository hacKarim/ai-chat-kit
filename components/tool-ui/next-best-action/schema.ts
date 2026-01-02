export interface ActionButton {
  id: string;
  label: string;
  description?: string;
  prompt: string; // The message to send when clicked
  variant?: "default" | "secondary" | "outline";
}

export interface SerializableNextBestAction {
  id: string;
  title?: string;
  description?: string;
  actions: ActionButton[]; // Max 3 buttons
}

export function parseSerializableNextBestAction(data: any): SerializableNextBestAction {
  // Map variant values
  const mapVariant = (variant: string): ActionButton["variant"] => {
    switch (variant) {
      case "primary":
        return "default";
      case "default":
      case "secondary":
      case "outline":
        return variant;
      default:
        return "default";
    }
  };

  // Auto-generate IDs for actions if not provided (max 3)
  const actions = Array.isArray(data.actions)
    ? data.actions.slice(0, 3).map((action: any) => ({
        id: action.id || crypto.randomUUID(),
        label: action.label,
        description: action.description,
        // Use label as prompt if prompt is not provided
        prompt: action.prompt || action.label,
        // Map variant from type or variant field
        variant: mapVariant(action.variant || action.type),
      }))
    : [];

  return {
    id: data.id || crypto.randomUUID(),
    title: data.title,
    description: data.description,
    actions,
  };
}
