import { useState, useCallback } from "react";
import type { Action } from "./schema";

export function useActionButtons(onAction?: (actionId: string) => void) {
  const [activeAction, setActiveAction] = useState<string | null>(null);

  const handleAction = useCallback(
    (actionId: string) => {
      setActiveAction(actionId);
      onAction?.(actionId);

      // Reset active state after animation
      setTimeout(() => setActiveAction(null), 300);
    },
    [onAction]
  );

  return { activeAction, handleAction };
}
