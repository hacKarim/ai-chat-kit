"use client";

import { FC, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ActionButtons } from "../shared/action-buttons";
import type { SerializableOptionList } from "./schema";

interface OptionListProps extends SerializableOptionList {
  className?: string;
  onConfirm?: (selection: string | string[]) => void;
  onResponseAction?: (actionId: string) => void;
}

export const OptionList: FC<OptionListProps> = ({
  id,
  options,
  selectionMode = "multiple",
  minSelections,
  maxSelections,
  defaultSelected,
  confirmed,
  responseActions,
  className,
  onConfirm,
  onResponseAction,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(defaultSelected || []);
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Initialize confirmed state
  useEffect(() => {
    if (confirmed !== undefined) {
      setIsConfirmed(true);
      if (Array.isArray(confirmed)) {
        setSelectedIds(confirmed);
      } else {
        setSelectedIds([confirmed]);
      }
    }
  }, [confirmed]);

  const handleSingleSelection = (optionId: string) => {
    if (isConfirmed) return;
    setSelectedIds([optionId]);
  };

  const handleMultipleSelection = (optionId: string, checked: boolean) => {
    if (isConfirmed) return;

    setSelectedIds((prev) => {
      if (checked) {
        // Check max selections
        if (maxSelections && prev.length >= maxSelections) {
          return prev;
        }
        return [...prev, optionId];
      } else {
        return prev.filter((id) => id !== optionId);
      }
    });
  };

  const handleConfirm = () => {
    // Validate min selections
    if (minSelections && selectedIds.length < minSelections) {
      return;
    }

    setIsConfirmed(true);

    const result = selectionMode === "single" ? selectedIds[0] : selectedIds;

    if (onConfirm) {
      onConfirm(result);
    }
  };

  const handleCancel = () => {
    setSelectedIds(defaultSelected || []);
    setIsConfirmed(false);
  };

  const handleActionClick = (actionId: string) => {
    if (actionId === "confirm") {
      handleConfirm();
    } else if (actionId === "cancel") {
      handleCancel();
    } else if (onResponseAction) {
      onResponseAction(actionId);
    }
  };

  const isConfirmDisabled =
    (minSelections !== undefined && selectedIds.length < minSelections) ||
    (maxSelections !== undefined && selectedIds.length > maxSelections);

  const getValidationMessage = () => {
    if (minSelections !== undefined && selectedIds.length < minSelections) {
      const remaining = minSelections - selectedIds.length;
      return `Please select ${remaining} more option${remaining > 1 ? "s" : ""}`;
    }
    if (maxSelections !== undefined && selectedIds.length > maxSelections) {
      const excess = selectedIds.length - maxSelections;
      return `Please deselect ${excess} option${excess > 1 ? "s" : ""}`;
    }
    return null;
  };

  const validationMessage = getValidationMessage();

  return (
    <div
      className={cn("w-full max-w-2xl space-y-4", className)}
      data-tool-ui-id={id}
      data-slot="option-list"
    >
      <div className="rounded-lg border border-border bg-card p-4 space-y-3">
        {selectionMode === "single" ? (
          <RadioGroup
            value={selectedIds[0]}
            onValueChange={handleSingleSelection}
            disabled={isConfirmed}
          >
            {options.map((option) => (
              <div
                key={option.id}
                className={cn(
                  "flex items-start space-x-3 rounded-lg p-3 transition-colors",
                  !isConfirmed && !option.disabled && "hover:bg-muted/50 cursor-pointer",
                  selectedIds.includes(option.id) && "bg-muted",
                  isConfirmed && selectedIds.includes(option.id) && "bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800",
                  option.disabled && "opacity-50 cursor-not-allowed"
                )}
                onClick={() => !isConfirmed && !option.disabled && handleSingleSelection(option.id)}
              >
                <RadioGroupItem
                  value={option.id}
                  id={`option-${id}-${option.id}`}
                  disabled={option.disabled || isConfirmed}
                  className={cn(
                    "mt-0.5",
                    isConfirmed && selectedIds.includes(option.id) && "border-green-600 text-green-600"
                  )}
                />
                <Label
                  htmlFor={`option-${id}-${option.id}`}
                  className={cn(
                    "flex-1 cursor-pointer space-y-1",
                    option.disabled && "cursor-not-allowed"
                  )}
                >
                  <div className="font-medium leading-none">{option.label}</div>
                  {option.description && (
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  )}
                </Label>
              </div>
            ))}
          </RadioGroup>
        ) : (
          <div className="space-y-2">
            {options.map((option) => {
              const isSelected = selectedIds.includes(option.id);
              return (
                <div
                  key={option.id}
                  className={cn(
                    "flex items-start space-x-3 rounded-lg p-3 transition-colors",
                    !isConfirmed && !option.disabled && "hover:bg-muted/50 cursor-pointer",
                    isSelected && "bg-muted",
                    isConfirmed && isSelected && "bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800",
                    option.disabled && "opacity-50 cursor-not-allowed"
                  )}
                  onClick={() =>
                    !isConfirmed && !option.disabled && handleMultipleSelection(option.id, !isSelected)
                  }
                >
                  <Checkbox
                    id={`option-${id}-${option.id}`}
                    checked={isSelected}
                    onCheckedChange={(checked) =>
                      handleMultipleSelection(option.id, checked as boolean)
                    }
                    disabled={option.disabled || isConfirmed}
                    className={cn(
                      "mt-0.5",
                      isConfirmed && isSelected && "border-green-600 data-[state=checked]:bg-green-600"
                    )}
                  />
                  <Label
                    htmlFor={`option-${id}-${option.id}`}
                    className={cn(
                      "flex-1 cursor-pointer space-y-1",
                      option.disabled && "cursor-not-allowed"
                    )}
                  >
                    <div className="font-medium leading-none">{option.label}</div>
                    {option.description && (
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    )}
                  </Label>
                </div>
              );
            })}
          </div>
        )}

        {validationMessage && !isConfirmed && (
          <p className="text-sm text-amber-600 dark:text-amber-500 mt-2">
            {validationMessage}
          </p>
        )}

        {minSelections !== undefined && maxSelections !== undefined && !isConfirmed && (
          <p className="text-xs text-muted-foreground mt-2">
            Select {minSelections === maxSelections
              ? `exactly ${minSelections}`
              : `${minSelections}-${maxSelections}`} option{maxSelections > 1 ? "s" : ""}
          </p>
        )}
      </div>

      {responseActions && responseActions.length > 0 && !isConfirmed && (
        <ActionButtons
          actions={responseActions.map((action) => ({
            ...action,
            disabled: action.id === "confirm" ? isConfirmDisabled : action.disabled,
          }))}
          onAction={handleActionClick}
        />
      )}

      {isConfirmed && (
        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-500">
          <svg
            className="h-5 w-5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-medium">Selection confirmed</span>
        </div>
      )}
    </div>
  );
};
