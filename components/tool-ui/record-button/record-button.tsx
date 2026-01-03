"use client";

import { FC, useState, useEffect, useCallback } from "react";
import { Mic, Square, Loader2, Radio, Check as CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ActionButtons } from "@/components/tool-ui/shared/action-buttons";
import { useVoiceRecorderContext } from "@/contexts/voice-recorder-context";
import type { SerializableRecordButton } from "./schema";

interface RecordButtonProps extends SerializableRecordButton {
  className?: string;
  onTranscript?: (transcript: string) => void;
  onResponseAction?: (actionId: string) => void;
  isActive?: boolean; // Whether this record button is still active (last message)
}

export const RecordButton: FC<RecordButtonProps> = ({
  id,
  title,
  description,
  startLabel = "Start Recording",
  processingLabel = "Processing...",
  autoSend = true,
  promptPrefix = "Here's a transcript of the meeting, launch meeting notes workflow:\n\n",
  responseActions,
  className,
  onTranscript,
  onResponseAction,
  isActive = true,
}) => {
  const [transcript, setTranscript] = useState<string>("");
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [finalDuration, setFinalDuration] = useState(0);
  const [shouldSendOnStop, setShouldSendOnStop] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [pausedDuration, setPausedDuration] = useState(0);

  // Use the shared voice recorder context
  const {
    recordingState,
    startRecording,
    stopRecording,
    sendRecording,
    hasRecording,
  } = useVoiceRecorderContext();

  // Timer for recording duration
  useEffect(() => {
    if (recordingState === "recording" && !isPaused) {
      const interval = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [recordingState, isPaused]);

  // Handle transcription callback
  const handleTranscription = useCallback((text: string) => {
    setTranscript(text);

    if (autoSend && onTranscript) {
      // Format duration
      const mins = Math.floor(finalDuration / 60);
      const secs = finalDuration % 60;
      const durationText = mins > 0
        ? `${mins} minute${mins !== 1 ? 's' : ''} ${secs} second${secs !== 1 ? 's' : ''}`
        : `${secs} second${secs !== 1 ? 's' : ''}`;

      // Add the prefix with duration before sending
      const fullMessage = promptPrefix.replace(
        "Here's a transcript of the meeting,",
        `Here's a transcript of the meeting (duration: ${durationText}),`
      ) + text;
      onTranscript(fullMessage);
    }
  }, [autoSend, promptPrefix, onTranscript, finalDuration]);

  // Auto-send when recording stops and we have a recording
  useEffect(() => {
    const autoSendRecording = async () => {
      if (recordingState === "idle" && hasRecording && shouldSendOnStop) {
        setShouldSendOnStop(false);
        try {
          await sendRecording(handleTranscription);
        } catch (error) {
          console.error("Failed to transcribe audio:", error);
        }
      }
    };

    autoSendRecording();
  }, [recordingState, hasRecording, shouldSendOnStop, sendRecording, handleTranscription]);

  const handleClick = async () => {
    try {
      if (recordingState === "idle" && !isPaused) {
        // Start recording
        setTranscript("");
        setFinalDuration(0);
        setRecordingDuration(0);
        setPausedDuration(0);
        setIsPaused(false);
        setShouldSendOnStop(false);
        await startRecording();
      } else if (recordingState === "recording" && !isPaused) {
        // Pause recording
        setIsPaused(true);
        setPausedDuration(recordingDuration);
        stopRecording(); // Stop the media recorder but keep the state
      } else if (isPaused) {
        // Resume recording
        setIsPaused(false);
        await startRecording();
      }
    } catch (error) {
      console.error("Recording error:", error);
      alert("Failed to access microphone. Please check permissions.");
      setShouldSendOnStop(false);
      setIsPaused(false);
    }
  };

  const handleValidateAndSend = async () => {
    try {
      // Create a custom transcription handler with the current duration
      const currentDuration = pausedDuration;

      const handleTranscriptionWithDuration = (text: string) => {
        setTranscript(text);

        if (autoSend && onTranscript) {
          // Format duration
          const mins = Math.floor(currentDuration / 60);
          const secs = currentDuration % 60;
          const durationText = mins > 0
            ? `${mins} minute${mins !== 1 ? 's' : ''} ${secs} second${secs !== 1 ? 's' : ''}`
            : `${secs} second${secs !== 1 ? 's' : ''}`;

          // Add the prefix with duration before sending
          const fullMessage = promptPrefix.replace(
            "Here's a transcript of the meeting,",
            `Here's a transcript of the meeting (duration: ${durationText}),`
          ) + text;
          onTranscript(fullMessage);
        }
      };

      // Save the final duration
      setFinalDuration(currentDuration);
      setShouldSendOnStop(true);
      setIsPaused(false);

      // Trigger the send with the duration-aware handler
      if (hasRecording) {
        await sendRecording(handleTranscriptionWithDuration);
      }

      // Reset state
      setRecordingDuration(0);
      setPausedDuration(0);
    } catch (error) {
      console.error("Failed to send recording:", error);
      alert("Failed to transcribe audio. Please try again.");
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getButtonIcon = () => {
    if (isPaused) {
      return <Mic className="h-8 w-8" />;
    }

    switch (recordingState) {
      case "listening":
        return <Radio className="h-8 w-8" />;
      case "recording":
        return (
          <div className="flex items-center justify-center">
            <div className="h-6 w-1.5 bg-white rounded-full mr-1" />
            <div className="h-6 w-1.5 bg-white rounded-full" />
          </div>
        );
      case "processing":
        return <Loader2 className="h-8 w-8 animate-spin" />;
      default:
        return <Mic className="h-8 w-8" />;
    }
  };

  const getButtonLabel = () => {
    if (isSessionEnded) {
      return "Session terminée";
    }

    if (isPaused) {
      return "Resume Recording";
    }

    switch (recordingState) {
      case "listening":
        return "Listening...";
      case "recording":
        return "Pause";
      case "processing":
        return processingLabel;
      default:
        return startLabel;
    }
  };

  const isListening = recordingState === "listening";
  const isRecording = recordingState === "recording" && !isPaused;
  const isProcessing = recordingState === "processing";
  const hasActiveRecording = isRecording || isPaused;
  const isSessionEnded = !isActive;

  return (
    <div
      className={cn("flex flex-col gap-3", className)}
      data-tool-ui-id={id}
      data-slot="record-button"
    >
      <Card>
        {(title || description) && (
          <CardHeader>
            {title && <CardTitle>{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
        )}
        <CardContent className="space-y-4">
          {/* Recording Button */}
          <div className="flex flex-col items-center gap-4">
            {/* Buttons Container */}
            <div className="flex items-center gap-6">
              {/* Big Round Record Button */}
              <div className="relative">
              <button
                onClick={handleClick}
                disabled={isProcessing || isSessionEnded}
                className={cn(
                  "relative h-32 w-32 rounded-full transition-all duration-300 shadow-lg",
                  "flex items-center justify-center",
                  "focus:outline-none focus:ring-4 focus:ring-offset-2",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  isSessionEnded && "bg-gray-500 cursor-not-allowed",
                  !isSessionEnded && isRecording && "bg-red-500 hover:bg-red-600 animate-pulse shadow-red-500/50 focus:ring-red-300",
                  !isSessionEnded && isPaused && "bg-orange-500 hover:bg-orange-600 shadow-orange-500/50 focus:ring-orange-300",
                  !isSessionEnded && isListening && "bg-blue-500 hover:bg-blue-600 shadow-blue-500/50 focus:ring-blue-300",
                  !isSessionEnded && !isRecording && !isListening && !isProcessing && !isPaused && "bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-red-500/30 focus:ring-red-300",
                  !isSessionEnded && isProcessing && "bg-gray-400"
                )}
              >
                {/* Inner circle for depth effect */}
                <div className={cn(
                  "absolute inset-4 rounded-full transition-all duration-300",
                  isSessionEnded && "bg-gray-600",
                  !isSessionEnded && isRecording && "bg-red-600 animate-pulse",
                  !isSessionEnded && isPaused && "bg-orange-600",
                  !isSessionEnded && isListening && "bg-blue-600",
                  !isSessionEnded && !isRecording && !isListening && !isProcessing && !isPaused && "bg-red-600/80",
                  !isSessionEnded && isProcessing && "bg-gray-500"
                )} />

                {/* Icon */}
                <div className="relative z-10 text-white">
                  {isSessionEnded ? (
                    <Square className="h-8 w-8 fill-white" />
                  ) : (
                    getButtonIcon()
                  )}
                </div>
              </button>

              {/* Outer glow ring when recording */}
              {isRecording && (
                <div className="absolute inset-0 -z-10 rounded-full bg-red-500/30 blur-xl animate-pulse" />
              )}

              {/* Outer glow ring when listening */}
              {isListening && (
                <div className="absolute inset-0 -z-10 rounded-full bg-blue-500/30 blur-xl animate-pulse" />
              )}

              {/* Outer glow ring when paused */}
              {isPaused && (
                <div className="absolute inset-0 -z-10 rounded-full bg-orange-500/30 blur-xl" />
              )}
              </div>

              {/* Send to LLM Round Button - Hidden when session ended */}
              {!isSessionEnded && (
                <div className="relative">
                  <button
                    onClick={handleValidateAndSend}
                    disabled={isProcessing || !isPaused}
                    className={cn(
                      "relative h-32 w-32 rounded-full transition-all duration-300 shadow-lg",
                      "flex items-center justify-center",
                      "focus:outline-none focus:ring-4 focus:ring-offset-2",
                      "disabled:opacity-30 disabled:cursor-not-allowed",
                      isPaused && "bg-green-600 hover:bg-green-700 shadow-green-600/50 focus:ring-green-300",
                      !isPaused && "bg-green-600/50"
                    )}
                  >
                    {/* Inner circle for depth effect */}
                    <div className={cn(
                      "absolute inset-4 rounded-full transition-all duration-300",
                      isPaused && "bg-green-700",
                      !isPaused && "bg-green-700/50"
                    )} />

                    {/* Icon */}
                    <div className="relative z-10 text-white">
                      <CheckIcon className="h-8 w-8" />
                    </div>
                  </button>

                  {/* Outer glow ring when enabled */}
                  {isPaused && (
                    <div className="absolute inset-0 -z-10 rounded-full bg-green-500/30 blur-xl" />
                  )}
                </div>
              )}
            </div>

            {/* Button Labels */}
            <div className="flex gap-6 items-center justify-center">
              <p className={cn(
                "text-sm font-medium transition-colors w-32 text-center",
                isSessionEnded && "text-gray-500",
                !isSessionEnded && isRecording && "text-red-500",
                !isSessionEnded && isPaused && "text-orange-500",
                !isSessionEnded && isListening && "text-blue-500",
                !isSessionEnded && isProcessing && "text-gray-500"
              )}>
                {getButtonLabel()}
              </p>

              {!isSessionEnded && (
                <p className={cn(
                  "text-sm font-medium transition-colors w-32 text-center",
                  isPaused && "text-green-600",
                  !isPaused && "text-gray-400"
                )}>
                  Send to LLM
                </p>
              )}
            </div>

            {/* Recording Duration */}
            {(isRecording || isPaused) && !isSessionEnded && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center gap-1.5">
                  <div className={cn(
                    "size-2 rounded-full",
                    isRecording && "bg-red-500 animate-pulse",
                    isPaused && "bg-orange-500"
                  )} />
                  <span className="font-mono text-xs">
                    {formatDuration(isPaused ? pausedDuration : recordingDuration)}
                  </span>
                </div>
              </div>
            )}

            {/* Listening Indicator */}
            {isListening && !isRecording && !isSessionEnded && (
              <div className="flex items-center gap-2 text-sm text-blue-500 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center gap-1.5">
                  <div className="size-2 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-xs font-medium">Listening...</span>
                </div>
              </div>
            )}

            {/* Transcript Display */}
            {transcript && !isSessionEnded && (
              <div className="w-full p-4 bg-muted rounded-lg animate-in fade-in slide-in-from-bottom-2 duration-300">
                <p className="text-sm font-medium mb-2">Transcript:</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {transcript}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Response Actions */}
      {responseActions && responseActions.length > 0 && (
        <ActionButtons
          actions={responseActions}
          onAction={onResponseAction}
        />
      )}
    </div>
  );
};
