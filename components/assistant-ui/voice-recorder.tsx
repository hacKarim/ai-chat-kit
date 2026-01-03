import { FC, useEffect, useState, useRef, useContext } from "react";
import { Mic, Square, Loader2, Radio, AudioWaveform } from "lucide-react";
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
  const isListeningModeActiveRef = useRef(false);
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

  // Update listening mode context - keep modal open during entire listening session
  useEffect(() => {
    // If we're back to idle and were in listening mode, end the session
    if (recordingState === "idle" && isListeningModeActiveRef.current) {
      isListeningModeActiveRef.current = false;
    }
    setIsListeningMode(isListeningModeActiveRef.current);
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
      if (recordingState === "idle" && hasRecording && sendOnStopRef.current && !isListeningModeActiveRef.current) {
        sendOnStopRef.current = false;
        try {
          await sendRecording(onTranscription);
        } catch (error) {
          alert("Failed to transcribe audio. Please try again.");
        }
      }

      // Handle auto-send for listening mode (returns to listening state)
      if (recordingState === "listening" && hasRecording && isListeningModeActiveRef.current) {
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

  // Handle mic button click (regular recording)
  const handleMicClick = async () => {
    if (disabled) return;

    // Toggle regular recording
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

  // Handle waveform button click (continuous/listening mode)
  const handleWaveformClick = async () => {
    if (disabled) return;

    // Toggle listening mode
    if (recordingState === "listening" || isListeningModeActiveRef.current) {
      isListeningModeActiveRef.current = false;
      sendOnStopRef.current = false;
      stopListeningMode();
    } else if (recordingState === "idle") {
      // Start listening mode
      isListeningModeActiveRef.current = true;
      sendOnStopRef.current = true;
      try {
        // Stop any playing audio when user starts listening mode
        if (onRecordingStart) {
          onRecordingStart();
        }
        await startListeningMode();
      } catch (error) {
        alert("Failed to access microphone. Please check permissions.");
        isListeningModeActiveRef.current = false;
      }
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
      {/* Waveform button for continuous/listening mode */}
      <TooltipIconButton
        tooltip={
          isProcessing
            ? "Transcribing..."
            : isListening
            ? "Stop continuous mode"
            : "Continuous mode"
        }
        variant={isListening ? "default" : "ghost"}
        size="icon"
        className={cn(
          "size-[34px] rounded-full transition-all duration-200",
          isListening &&
            "bg-blue-500 hover:bg-blue-600 dark:bg-blue-500 dark:hover:bg-blue-600",
          isProcessing && "opacity-50 cursor-not-allowed"
        )}
        onClick={handleWaveformClick}
        disabled={disabled || isProcessing || isRecording}
        aria-label={
          isProcessing
            ? "Transcribing..."
            : isListening
            ? "Stop continuous mode"
            : "Start continuous mode"
        }
      >
        {isListening ? (
          <Radio className="size-5" />
        ) : (
          <AudioWaveform className="size-5" />
        )}
      </TooltipIconButton>

      {/* Mic button for regular recording */}
      <TooltipIconButton
        tooltip={
          isProcessing
            ? "Transcribing..."
            : isRecording
            ? "Stop and send"
            : "Click to record"
        }
        variant={isRecording ? "default" : "ghost"}
        size="icon"
        className={cn(
          "aui-voice-recorder size-[34px] rounded-full transition-all duration-200",
          isRecording &&
            "bg-red-500 hover:bg-red-600 dark:bg-red-500 dark:hover:bg-red-600 animate-pulse",
          isProcessing && "opacity-50 cursor-not-allowed"
        )}
        onClick={handleMicClick}
        disabled={disabled || isProcessing || isListening}
        aria-label={
          isProcessing
            ? "Transcribing..."
            : isRecording
            ? "Stop and send"
            : "Click to record"
        }
      >
        {isProcessing ? (
          <Loader2 className="size-5 animate-spin" />
        ) : isRecording ? (
          <Square className="size-4 fill-white dark:fill-black" />
        ) : (
          <Mic className="size-5" />
        )}
      </TooltipIconButton>
    </div>
  );
};
