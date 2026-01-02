import { FC, useEffect, useState, useRef, useContext } from "react";
import { Mic, Square, Loader2, Radio } from "lucide-react";
import { cn } from "@/lib/utils";
import { TooltipIconButton } from "@/components/assistant-ui/tooltip-icon-button";
import { useVoiceRecorderContext } from "@/contexts/voice-recorder-context";
import { ListeningModeContext } from "@/components/assistant-ui/thread";

interface VoiceRecorderProps {
  onTranscription: (text: string) => void;
  onAutoSend?: () => void; // Callback to trigger LLM send
  onRecordingStart?: () => void; // Callback when user starts talking
  disabled?: boolean;
  isThreadRunning?: boolean; // Whether the LLM is currently responding
  isAudioPlaying?: boolean; // Whether TTS audio is currently playing
}

export const VoiceRecorder: FC<VoiceRecorderProps> = ({
  onTranscription,
  onAutoSend,
  onRecordingStart,
  disabled = false,
  isThreadRunning = false,
  isAudioPlaying = false,
}) => {
  const {
    recordingState,
    startRecording,
    stopRecording,
    sendRecording,
    cancelRecording,
    startListeningMode,
    stopListeningMode,
    pauseListening,
    resumeListening,
    hasRecording,
  } = useVoiceRecorderContext();

  const [recordingDuration, setRecordingDuration] = useState(0);
  const sendOnStopRef = useRef(false);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isListeningModeRef = useRef(false);
  const longPressTriggeredRef = useRef(false);
  const lastSentBlobRef = useRef<Blob | null>(null);

  // Timer for recording duration
  useEffect(() => {
    if (recordingState === "recording") {
      const interval = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setRecordingDuration(0);
    }
  }, [recordingState]);

  const { setIsListeningMode } = useContext(ListeningModeContext);

  // Update listening mode context
  useEffect(() => {
    const isListening = recordingState === "listening";
    setIsListeningMode(isListening);
  }, [recordingState, setIsListeningMode]);

  // Pause/resume listening based on thread running state
  // NOTE: We keep VAD active during audio playback so it can detect interruptions
  useEffect(() => {
    if (recordingState === "listening") {
      if (isThreadRunning) {
        // LLM is responding (streaming), pause VAD monitoring
        pauseListening();
      } else {
        // LLM finished, resume VAD monitoring
        // VAD will remain active even during audio playback to detect user interruptions
        resumeListening();
      }
    }
  }, [isThreadRunning, recordingState, pauseListening, resumeListening]);

  // Stop audio immediately when recording starts
  useEffect(() => {
    if (recordingState === "recording" && isAudioPlaying && onRecordingStart) {
      // Recording started while audio was playing - stop the audio immediately
      onRecordingStart();
    }
  }, [recordingState, isAudioPlaying, onRecordingStart]);

  // Also stop audio when VAD detects voice in listening mode (backup)
  useEffect(() => {
    if (recordingState === "listening" && hasRecording && isAudioPlaying && onRecordingStart) {
      // VAD detected voice while audio was playing - stop the audio immediately
      onRecordingStart();
    }
  }, [recordingState, hasRecording, isAudioPlaying, onRecordingStart]);

  // Auto-send after stopping recording
  useEffect(() => {
    const autoSend = async () => {
      // Get the current audio blob from the hook (we need to access it)
      // Since we can't access the blob directly, we'll use hasRecording as a proxy

      // Handle auto-send for normal recording (idle state)
      if (recordingState === "idle" && hasRecording && sendOnStopRef.current && !isListeningModeRef.current) {
        sendOnStopRef.current = false;
        try {
          await sendRecording(onTranscription);
        } catch (error) {
          alert("Failed to transcribe audio. Please try again.");
        }
      }

      // Handle auto-send for listening mode (returns to listening state)
      if (recordingState === "listening" && hasRecording && isListeningModeRef.current) {
        // Pause listening while transcribing and waiting for LLM
        pauseListening();

        try {
          await sendRecording(onTranscription);

          // Auto-send to LLM after transcription
          if (onAutoSend) {
            setTimeout(() => {
              onAutoSend();
            }, 300); // Delay to ensure text is in textarea and React state is updated
          }
        } catch (error) {
          // Resume listening even on error
          resumeListening();
        }
      }
    };

    autoSend();
  }, [recordingState, hasRecording, sendRecording, onTranscription, onAutoSend, pauseListening, resumeListening]);

  const handleMouseDown = async () => {
    if (disabled) return;

    // Reset long press flag
    longPressTriggeredRef.current = false;

    // Start long-press timer (500ms for long-press)
    longPressTimerRef.current = setTimeout(async () => {
      longPressTriggeredRef.current = true;
      isListeningModeRef.current = true;
      sendOnStopRef.current = true;
      try {
        // Stop any playing audio when user starts listening mode
        if (onRecordingStart) {
          onRecordingStart();
        }
        await startListeningMode();
      } catch (error) {
        alert("Failed to access microphone. Please check permissions.");
        isListeningModeRef.current = false;
        longPressTriggeredRef.current = false;
      }
    }, 500);
  };

  const handleMouseUp = async () => {
    if (disabled) return;

    // Clear long-press timer if it hasn't fired yet
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    // If we just triggered a long press, don't do anything on release
    if (longPressTriggeredRef.current) {
      longPressTriggeredRef.current = false;
      return;
    }

    // Short click: toggle listening mode if already in it
    if (recordingState === "listening") {
      isListeningModeRef.current = false;
      sendOnStopRef.current = false;
      stopListeningMode();
      return;
    }

    // Short click: toggle regular recording
    if (recordingState === "idle") {
      // Start regular recording
      try {
        // Stop any playing audio when user starts recording
        if (onRecordingStart) {
          onRecordingStart();
        }
        await startRecording();
      } catch (error) {
        alert("Failed to access microphone. Please check permissions.");
      }
    } else if (recordingState === "recording") {
      // Stop recording and mark for auto-send
      sendOnStopRef.current = true;
      stopRecording();
    }
  };

  const handleMouseLeave = () => {
    // Clear long-press timer if mouse leaves button
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const isListening = recordingState === "listening";
  const isRecording = recordingState === "recording";
  const isProcessing = recordingState === "processing";

  return (
    <div className="flex items-center gap-2">
      {isListening && !isRecording && (
        <div className="flex items-center gap-2 text-sm text-blue-500 animate-in fade-in slide-in-from-left-2 duration-200">
          <div className="flex items-center gap-1.5">
            <div className="size-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-xs font-medium">Listening...</span>
          </div>
        </div>
      )}

      {isRecording && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground animate-in fade-in slide-in-from-left-2 duration-200">
          <div className="flex items-center gap-1.5">
            <div className="size-2 rounded-full bg-red-500 animate-pulse" />
            <span className="font-mono text-xs">{formatDuration(recordingDuration)}</span>
          </div>
        </div>
      )}

      <TooltipIconButton
        tooltip={
          isProcessing
            ? "Transcribing..."
            : isListening
            ? "Click to stop listening"
            : isRecording
            ? "Stop and send"
            : "Click to record, hold for continuous mode"
        }
        variant={isRecording ? "default" : isListening ? "default" : "ghost"}
        size="icon"
        className={cn(
          "aui-voice-recorder size-[34px] rounded-full transition-all duration-200",
          isRecording &&
            "bg-red-500 hover:bg-red-600 dark:bg-red-500 dark:hover:bg-red-600 animate-pulse",
          isListening &&
            "bg-blue-500 hover:bg-blue-600 dark:bg-blue-500 dark:hover:bg-blue-600",
          isProcessing && "opacity-50 cursor-not-allowed"
        )}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
        disabled={disabled || isProcessing}
        aria-label={
          isProcessing
            ? "Transcribing..."
            : isListening
            ? "Click to stop listening"
            : isRecording
            ? "Stop and send"
            : "Click to record, hold for continuous mode"
        }
      >
        {isProcessing ? (
          <Loader2 className="size-5 animate-spin" />
        ) : isListening ? (
          <Radio className="size-5" />
        ) : isRecording ? (
          <Square className="size-4 fill-white dark:fill-black" />
        ) : (
          <Mic className="size-5" />
        )}
      </TooltipIconButton>
    </div>
  );
};
