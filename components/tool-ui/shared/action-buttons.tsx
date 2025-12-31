"use client";

import { FC } from "react";
import { Button } from "@/components/ui/button";
import type { Action } from "./schema";

interface ActionButtonsProps {
  actions?: Action[];
  onAction?: (actionId: string) => void;
  className?: string;
}

export const ActionButtons: FC<ActionButtonsProps> = ({
  actions,
  onAction,
  className,
}) => {
  if (!actions || actions.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-2 ${className || ""}`}>
      {actions.map((action) => (
        <Button
          key={action.id}
          variant={action.variant || "outline"}
          size="sm"
          disabled={action.disabled}
          onClick={() => onAction?.(action.id)}
          className="text-xs"
        >
          {action.label}
        </Button>
      ))}
    </div>
  );
};
