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

  // Helper to extract prompt from action
  const extractPrompt = (action: any): string => {
    // Try various locations for the prompt
    if (action.prompt) return action.prompt;
    if (action.action) return action.action; // Handle "action" field
    if (action.payload?.question) return action.payload.question;
    if (action.payload?.topic) return action.payload.topic;
    if (action.payload?.message) return action.payload.message;
    return action.label; // Fallback to label
  };

  // Auto-generate IDs for actions if not provided (max 3)
  // Support multiple formats: actions, options, primaryAction+secondaryActions
  let actionsData = data.actions || data.options;

  // Handle primaryAction + secondaryActions format
  if (!actionsData && (data.primaryAction || data.secondaryActions)) {
    actionsData = [
      ...(data.primaryAction ? [data.primaryAction] : []),
      ...(data.secondaryActions || [])
    ];
  }

  const actions = Array.isArray(actionsData)
    ? actionsData.slice(0, 3).map((action: any) => ({
        id: action.id || crypto.randomUUID(),
        label: action.label,
        description: action.description,
        // Extract prompt from various possible locations
        prompt: extractPrompt(action),
        // Map variant from type, actionType, variant, or style field
        variant: mapVariant(action.variant || action.type || action.actionType || action.style),
      }))
    : [];

  return {
    id: data.id || crypto.randomUUID(),
    title: data.title,
    description: data.description,
    actions,
  };
}
