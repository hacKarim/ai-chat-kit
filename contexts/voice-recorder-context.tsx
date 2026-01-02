"use client";

import { createContext, useContext, type FC, type ReactNode } from "react";
import { useVoiceRecorder, type RecordingState } from "@/hooks/use-voice-recorder";

interface VoiceRecorderContextType {
  recordingState: RecordingState;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  sendRecording: (onTranscription: (text: string) => void) => Promise<void>;
  cancelRecording: () => void;
  startListeningMode: () => Promise<void>;
  stopListeningMode: () => void;
  pauseListening: () => void;
  resumeListening: () => void;
  hasRecording: boolean;
}

const VoiceRecorderContext = createContext<VoiceRecorderContextType | null>(null);

export function VoiceRecorderProvider({
  children,
  onVoiceDetected,
}: {
  children: ReactNode;
  onVoiceDetected?: () => void;
}) {
  const recorder = useVoiceRecorder(onVoiceDetected);

  return (
    <VoiceRecorderContext.Provider value={recorder}>
      {children}
    </VoiceRecorderContext.Provider>
  );
}

export function useVoiceRecorderContext() {
  const context = useContext(VoiceRecorderContext);
  if (!context) {
    throw new Error("useVoiceRecorderContext must be used within VoiceRecorderProvider");
  }
  return context;
}
