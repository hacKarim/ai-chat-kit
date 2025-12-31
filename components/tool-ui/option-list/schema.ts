import type { Action } from "../shared/schema";

export interface Option {
  id: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface SerializableOptionList {
  id: string;
  options: Option[];
  selectionMode?: "single" | "multiple";
  minSelections?: number;
  maxSelections?: number;
  defaultSelected?: string[];
  confirmed?: string | string[];
  responseActions?: Action[];
}

export function parseSerializableOptionList(data: any): SerializableOptionList {
  return {
    id: data.id || crypto.randomUUID(),
    options: data.options || [],
    selectionMode: data.selectionMode || "multiple",
    minSelections: data.minSelections,
    maxSelections: data.maxSelections,
    defaultSelected: data.defaultSelected,
    confirmed: data.confirmed,
    responseActions: data.responseActions,
  };
}
