import type { Action } from "../shared/schema";

export interface SerializableRecordButton {
  id: string;
  title?: string;
  description?: string;
  startLabel?: string;        // Label for start recording button (default: "Start Recording")
  stopLabel?: string;         // Label for stop recording button (default: "Stop Recording")
  processingLabel?: string;   // Label while processing (default: "Processing...")
  autoSend?: boolean;         // Auto-send transcript (default: true)
  promptPrefix?: string;      // Prefix to add before transcript (default: "Here's a transcript of the meeting, launch meeting notes workflow:\n\n")
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  showWaveform?: boolean;     // Show audio waveform while recording (default: true)
  responseActions?: Action[]; // Additional actions after recording
}

export function parseSerializableRecordButton(data: any): SerializableRecordButton {
  return {
    id: data.id || crypto.randomUUID(),
    title: data.title,
    description: data.description,
    startLabel: data.startLabel || "Start Recording",
    stopLabel: data.stopLabel || "Stop Recording",
    processingLabel: data.processingLabel || "Processing...",
    autoSend: data.autoSend !== undefined ? data.autoSend : true,
    promptPrefix: data.promptPrefix || "Here's a transcript of the meeting, launch meeting notes workflow:\n\n",
    variant: data.variant || "default",
    size: data.size || "default",
    showWaveform: data.showWaveform !== undefined ? data.showWaveform : true,
    responseActions: data.responseActions,
  };
}
