import { useState, useRef, useCallback, useEffect } from "react";

export type RecordingState = "idle" | "listening" | "recording" | "processing";

export type Transcribe = (audio: File) => Promise<string>;

export function useVoiceRecorder(onVoiceDetected?: () => void, transcribe?: Transcribe) {
  const transcribeRef = useRef(transcribe);
  transcribeRef.current = transcribe;
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // VAD (Voice Activity Detection) refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const vadIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isRecordingFromVADRef = useRef(false);
  const isListeningActiveRef = useRef(false);
  const silenceScheduledRef = useRef(false);
  const isListeningPausedRef = useRef(false);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Try formats most speech-to-text services accept, in order
      let mimeType = "audio/mp4";
      let fileExtension = "m4a";

      if (MediaRecorder.isTypeSupported("audio/mp4")) {
        mimeType = "audio/mp4";
        fileExtension = "m4a";
      } else if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
        // Try webm with opus codec as fallback
        mimeType = "audio/webm;codecs=opus";
        fileExtension = "webm";
      } else if (MediaRecorder.isTypeSupported("audio/webm")) {
        mimeType = "audio/webm";
        fileExtension = "webm";
      } else {
        // Last resort - let browser decide
        mimeType = "";
        fileExtension = "webm";
      }

      const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const actualMimeType = mimeType || mediaRecorder.mimeType;
        const blob = new Blob(chunksRef.current, { type: actualMimeType });
        setAudioBlob(blob);

        // Store the file extension for later use
        (blob as any).__fileExtension = fileExtension;

        // Stop all tracks to release the microphone
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setRecordingState("recording");
    } catch (error) {
      throw error;
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && recordingState === "recording") {
      mediaRecorderRef.current.stop();
      setRecordingState("idle");
    }
  }, [recordingState]);

  const sendRecording = useCallback(
    async (onTranscription: (text: string) => void) => {
      if (!audioBlob) {
        return;
      }

      setRecordingState("processing");

      try {
        if (!transcribeRef.current) {
          throw new Error("No transcribe adapter configured");
        }

        const extension = (audioBlob as any).__fileExtension || "m4a";
        const file = new File([audioBlob], `recording.${extension}`, {
          type: audioBlob.type,
        });

        const text = await transcribeRef.current(file);

        if (text) {
          onTranscription(text);
        }

        setAudioBlob(null);

        // Return to listening mode if still active, otherwise go to idle
        if (isListeningActiveRef.current) {
          setRecordingState("listening");
        } else {
          setRecordingState("idle");
        }
      } catch (error) {
        // Return to listening mode if still active, otherwise go to idle
        if (isListeningActiveRef.current) {
          setRecordingState("listening");
        } else {
          setRecordingState("idle");
        }
        throw error;
      }
    },
    [audioBlob]
  );

  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    setAudioBlob(null);
    setRecordingState("idle");
  }, []);

  // VAD: Detect audio level
  const getAudioLevel = useCallback(() => {
    if (!analyserRef.current) return 0;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Calculate average volume
    const average = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
    return average;
  }, []);

  // Helper: Start recording with existing stream
  const startRecordingWithStream = useCallback(async (stream: MediaStream) => {
    try {
      // Try different formats most speech-to-text services accept, in order
      let mimeType = "audio/mp4";
      let fileExtension = "m4a";

      if (MediaRecorder.isTypeSupported("audio/mp4")) {
        mimeType = "audio/mp4";
        fileExtension = "m4a";
      } else if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
        mimeType = "audio/webm;codecs=opus";
        fileExtension = "webm";
      } else if (MediaRecorder.isTypeSupported("audio/webm")) {
        mimeType = "audio/webm";
        fileExtension = "webm";
      } else {
        mimeType = "";
        fileExtension = "webm";
      }

      const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const actualMimeType = mimeType || mediaRecorder.mimeType;
        const blob = new Blob(chunksRef.current, { type: actualMimeType });
        setAudioBlob(blob);

        // Store the file extension for later use
        (blob as any).__fileExtension = fileExtension;

        // If still in listening mode, return to listening state
        // Don't stop the stream - we're in listening mode
        if (isListeningActiveRef.current) {
          setRecordingState("listening");
        } else {
          // Not in listening mode anymore, go to idle
          setRecordingState("idle");
        }
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setRecordingState("recording");
    } catch (error) {
      throw error;
    }
  }, []);

  // VAD: Start auto-recording when voice is detected
  const startListeningMode = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      // Set up audio context for VAD
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);

      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      isListeningActiveRef.current = true;

      setRecordingState("listening");

      // Voice threshold (adjust based on testing)
      const VOICE_THRESHOLD = 30; // Lower = more sensitive
      const SILENCE_DURATION = 2000; // ms of silence before stopping

      // Start VAD monitoring
      vadIntervalRef.current = setInterval(() => {
        if (!isListeningActiveRef.current) {
          return;
        }

        // Skip VAD check if paused
        if (isListeningPausedRef.current) {
          return;
        }

        const audioLevel = getAudioLevel();

        // Voice detected - start recording if not already recording
        if (audioLevel > VOICE_THRESHOLD && isListeningActiveRef.current && !isRecordingFromVADRef.current) {
          // Notify that voice was detected (for stopping audio playback)
          if (onVoiceDetected) {
            onVoiceDetected();
          }

          isRecordingFromVADRef.current = true;
          silenceScheduledRef.current = false; // Reset silence flag when starting new recording

          // Clear any existing silence timeout
          if (silenceTimeoutRef.current) {
            clearTimeout(silenceTimeoutRef.current);
            silenceTimeoutRef.current = null;
          }

          // Start recording with existing stream
          startRecordingWithStream(stream);
        }

        // Voice continues - cancel silence timeout
        if (audioLevel > VOICE_THRESHOLD && isRecordingFromVADRef.current) {
          // Voice is still active, cancel any scheduled silence timeout
          if (silenceScheduledRef.current) {
            clearTimeout(silenceTimeoutRef.current!);
            silenceTimeoutRef.current = null;
            silenceScheduledRef.current = false;
          }
        }

        // Silence detected - schedule stop ONCE if currently recording
        if (audioLevel <= VOICE_THRESHOLD && isRecordingFromVADRef.current && !silenceScheduledRef.current) {
          silenceScheduledRef.current = true; // Mark that we've scheduled the timeout

          // Schedule stop after silence duration
          silenceTimeoutRef.current = setTimeout(() => {
            if (mediaRecorderRef.current && isRecordingFromVADRef.current) {
              mediaRecorderRef.current.stop();
              isRecordingFromVADRef.current = false;
              silenceScheduledRef.current = false; // Reset for next recording
            }
          }, SILENCE_DURATION);
        }
      }, 100); // Check every 100ms
    } catch (error) {
      isListeningActiveRef.current = false;
      throw error;
    }
  }, [getAudioLevel, stopRecording, startRecordingWithStream]);

  // Stop listening mode
  const stopListeningMode = useCallback(() => {
    // Mark listening as inactive
    isListeningActiveRef.current = false;
    silenceScheduledRef.current = false; // Reset silence flag

    // Clear VAD interval
    if (vadIntervalRef.current) {
      clearInterval(vadIntervalRef.current);
      vadIntervalRef.current = null;
    }

    // Clear silence timeout
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }

    // Stop recording if active
    if (mediaRecorderRef.current && isRecordingFromVADRef.current) {
      mediaRecorderRef.current.stop();
      isRecordingFromVADRef.current = false;
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Stop all tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    analyserRef.current = null;
    setRecordingState("idle");
  }, []);

  // Pause listening (keeps stream active but stops VAD monitoring)
  const pauseListening = useCallback(() => {
    if (isListeningActiveRef.current && !isListeningPausedRef.current) {
      isListeningPausedRef.current = true;
    }
  }, []);

  // Resume listening (resumes VAD monitoring)
  const resumeListening = useCallback(() => {
    if (isListeningActiveRef.current && isListeningPausedRef.current) {
      isListeningPausedRef.current = false;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListeningMode();
    };
  }, [stopListeningMode]);

  return {
    recordingState,
    startRecording,
    stopRecording,
    sendRecording,
    cancelRecording,
    startListeningMode,
    stopListeningMode,
    pauseListening,
    resumeListening,
    hasRecording: audioBlob !== null,
    audioContextRef,
    analyserRef,
  };
}
