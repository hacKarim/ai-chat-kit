"use client";

import { FC } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { SerializableNextBestAction } from "./schema";

interface NextBestActionProps extends SerializableNextBestAction {
  className?: string;
  onActionClick?: (prompt: string) => void;
}

export const NextBestAction: FC<NextBestActionProps> = ({
  id,
  title,
  description,
  actions,
  className,
  onActionClick,
}) => {
  const handleActionClick = (prompt: string) => {
    if (onActionClick) {
      onActionClick(prompt);
    }
  };

  return (
    <div
      className={cn("w-full max-w-2xl space-y-4", className)}
      data-tool-ui-id={id}
      data-slot="next-best-action"
    >
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h3 className="text-lg font-semibold">{title}</h3>
          )}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}

      <div className="flex flex-col md:flex-row md:flex-wrap gap-3">
        {actions.map((action) => (
          <Button
            key={action.id}
            variant={action.variant || "default"}
            onClick={() => handleActionClick(action.prompt)}
            className={cn(
              "h-auto w-full md:flex-1 flex-row items-center justify-between gap-4 p-4 text-left cursor-pointer",
              "hover:scale-[1.01] transition-transform"
            )}
          >
            <div className="flex flex-col items-start gap-2">
              <span className="font-semibold text-base">{action.label}</span>
              {action.description && (
                <span className="text-xs font-normal text-muted-foreground whitespace-normal hidden">
                  {action.description}
                </span>
              )}
            </div>
            <ChevronRight className="h-5 w-5 flex-shrink-0" />
          </Button>
        ))}
      </div>
    </div>
  );
};
