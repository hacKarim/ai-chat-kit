"use client";

import {
  ArrowDownIcon,
  ArrowUpIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CopyIcon,
  PencilIcon,
  RefreshCwIcon,
  Square,
  Volume2,
  Loader2,
  StopCircle,
} from "lucide-react";

import {
  ActionBarPrimitive,
  BranchPickerPrimitive,
  ComposerPrimitive,
  ErrorPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
  useMessage,
  useThreadRuntime,
  useThread,
} from "@assistant-ui/react";

import type { FC } from "react";
import { useState, useEffect, useCallback, useRef, createContext, useContext } from "react";
import { LazyMotion, MotionConfig, domAnimation } from "motion/react";
import * as m from "motion/react-m";

// Centralized Audio Player Context - Single source of truth for all audio playback
interface AudioPlayerContextType {
  currentlyPlayingMessageId: string | null;
  isPlaying: (messageId: string) => boolean;
  canPlay: boolean;
  play: (messageId: string) => Promise<void>;
  stop: () => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextType>({
  currentlyPlayingMessageId: null,
  isPlaying: () => false,
  canPlay: false,
  play: async () => {},
  stop: () => {},
});

// Context for tracking listening mode - EXPORTED for use in VoiceRecorder
export const ListeningModeContext = createContext<{
  isListeningMode: boolean;
  setIsListeningMode: (value: boolean) => void;
}>({
  isListeningMode: false,
  setIsListeningMode: () => {},
});

import { Button } from "@/components/ui/button";
import { TextWithImages } from "@/components/assistant-ui/text-with-images";
import { Reasoning, ReasoningGroup } from "@/components/assistant-ui/reasoning";
import { ToolFallback } from "@/components/assistant-ui/tool-fallback";
import { TooltipIconButton } from "@/components/assistant-ui/tooltip-icon-button";
import {
  ComposerAddAttachment,
  ComposerAttachments,
  UserMessageAttachments,
} from "@/components/assistant-ui/attachment";
import { WorkflowStatus } from "@/components/workflow-status";
import type { WorkflowState, Source } from "@/lib/types";
import { useChatKit } from "@/lib/chat-kit";
import { VoiceRecorder } from "@/components/assistant-ui/voice-recorder";
import { MessageSources } from "@/components/assistant-ui/message-sources";
import { VoiceRecorderProvider, useVoiceRecorderContext } from "@/contexts/voice-recorder-context";
import { VoiceModal } from "@/components/assistant-ui/voice-modal";

import { cn } from "@/lib/utils";

export const Thread: FC<{ onListeningModeChange?: (isListening: boolean) => void }> = ({
  onListeningModeChange
}) => {
  const { synthesize } = useChatKit();
  const [isListeningMode, setIsListeningMode] = useState(false);
  const [currentlyPlayingMessageId, setCurrentlyPlayingMessageId] = useState<string | null>(null);
  const [lastAutoPlayedMessageId, setLastAutoPlayedMessageId] = useState<string | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const lastKnownMessageIdRef = useRef<string | null>(null);
  const shouldStopPlaybackRef = useRef(false);

  // TTS audio visualization
  const ttsAudioContextRef = useRef<AudioContext | null>(null);
  const ttsAnalyserRef = useRef<AnalyserNode | null>(null);
  const ttsSourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  // Custom scroll behavior refs
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const isNearBottomRef = useRef(true); // Start as true to allow initial scroll
  const previousMessageCountRef = useRef(0);
  const lastMessageIdRef = useRef<string | null>(null);

  // Notify parent when listening mode changes
  useEffect(() => {
    if (onListeningModeChange) {
      onListeningModeChange(isListeningMode);
    }
  }, [isListeningMode, onListeningModeChange]);

  // Helper function to split text into chunks for TTS optimization
  const splitIntoChunks = (text: string, maxChunkSize: number = 500): string[] => {
    const chunks: string[] = [];

    // Split by sentences first
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

    let currentChunk = '';
    for (const sentence of sentences) {
      // If adding this sentence would exceed max size, start new chunk
      if (currentChunk.length + sentence.length > maxChunkSize && currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = sentence;
      } else {
        currentChunk += sentence;
      }
    }

    // Add remaining text
    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    return chunks.length > 0 ? chunks : [text];
  };

  // Centralized audio player functions
  const audioPlayer: AudioPlayerContextType = {
    currentlyPlayingMessageId,

    isPlaying: (messageId: string) => currentlyPlayingMessageId === messageId,

    canPlay: !!synthesize,

    play: async (messageId: string) => {
      if (!synthesize) return;

      // Stop any currently playing audio first
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
        setCurrentlyPlayingMessageId(null);
      }

      try {
        // Read the rendered text of the message
        const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
        const messageContent = messageElement?.querySelector('.aui-assistant-message-content');
        const messageText = messageContent?.textContent?.trim() || '';
        if (!messageText) return;

        // Long answers are synthesized sentence group by sentence group,
        // so the first words play while the rest is still being generated
        const chunks = splitIntoChunks(messageText);
        shouldStopPlaybackRef.current = false;

        for (const chunk of chunks) {
          if (shouldStopPlaybackRef.current) {
            break;
          }

          const audioBlob = await synthesize(chunk);
          const audioUrl = URL.createObjectURL(audioBlob);

          const audio = new Audio(audioUrl);
          audio.playbackRate = 1.2;
          currentAudioRef.current = audio;

          // Feed the voice visual with the spoken audio
          if (!ttsAudioContextRef.current) {
            ttsAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            ttsAnalyserRef.current = ttsAudioContextRef.current.createAnalyser();
            ttsAnalyserRef.current.fftSize = 256;
            ttsAnalyserRef.current.smoothingTimeConstant = 0.8;
          }

          if (ttsSourceRef.current) {
            try {
              ttsSourceRef.current.disconnect();
            } catch (e) {
              // Already disconnected
            }
          }

          if (ttsAudioContextRef.current && ttsAnalyserRef.current) {
            ttsSourceRef.current = ttsAudioContextRef.current.createMediaElementSource(audio);
            ttsSourceRef.current.connect(ttsAnalyserRef.current);
            ttsAnalyserRef.current.connect(ttsAudioContextRef.current.destination);
          }

          // Wait for this chunk to finish before the next one
          await new Promise<void>((resolve, reject) => {
            audio.onplay = () => {
              setCurrentlyPlayingMessageId(messageId);
            };

            audio.onended = () => {
              URL.revokeObjectURL(audioUrl);
              resolve();
            };

            audio.onerror = () => {
              URL.revokeObjectURL(audioUrl);
              reject(new Error('Audio playback error'));
            };

            audio.play().catch(reject);
          });
        }

        setCurrentlyPlayingMessageId(null);
        currentAudioRef.current = null;
      } catch (error) {
        setCurrentlyPlayingMessageId(null);
        currentAudioRef.current = null;
        throw error;
      }
    },

    stop: () => {
      shouldStopPlaybackRef.current = true;
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
      setCurrentlyPlayingMessageId(null);
    },
  };

  // Auto-play TTS when a NEW message completes streaming (for listening mode)
  // Uses MutationObserver to detect when message ID attribute is added (streaming complete)
  useEffect(() => {
    // Early return if listening mode is not active
    if (!isListeningMode) {
      return;
    }

    // Check if audio is already playing
    if (currentlyPlayingMessageId) {
      return;
    }

    const tryAutoPlayNewMessage = () => {
      // Query DOM for the last assistant message
      const assistantMessages = document.querySelectorAll('[data-role="assistant"]');

      if (assistantMessages.length === 0) {
        return;
      }

      const lastMessage = assistantMessages[assistantMessages.length - 1];
      const completedId = lastMessage.getAttribute('data-message-id');

      // The attribute only appears once the message has finished streaming
      if (!completedId) {
        return;
      }

      // Check if this is a NEW message (different from the last one we knew about)
      const isNewMessage = completedId !== lastKnownMessageIdRef.current;

      // Update our tracking of the last known message
      lastKnownMessageIdRef.current = completedId;

      // Only auto-play if this is a NEW message
      if (!isNewMessage) {
        return;
      }

      // Check if this message has already been auto-played (extra safety)
      if (completedId === lastAutoPlayedMessageId) {
        return;
      }

      // Check if there's text content in the message (not empty)
      const messageContent = lastMessage.querySelector('.aui-assistant-message-content');
      if (!messageContent || messageContent.textContent?.trim() === '') {
        return;
      }

      // Mark this message as auto-played and play immediately
      setLastAutoPlayedMessageId(completedId);

      // Play audio immediately - no delay needed
      audioPlayer.play(completedId).catch(() => {
        // Silent error handling for auto-play
      });
    };

    // Set up MutationObserver to watch for data-message-id attribute changes
    const viewport = document.querySelector('.aui-thread-viewport');
    if (!viewport) {
      return;
    }

    const observer = new MutationObserver((mutations) => {
      // Only trigger if we see a data-message-id attribute change
      const hasMessageIdChange = mutations.some(mutation =>
        mutation.type === 'attributes' &&
        mutation.attributeName === 'data-message-id'
      );

      if (hasMessageIdChange) {
        tryAutoPlayNewMessage();
      }
    });

    observer.observe(viewport, {
      subtree: true,
      attributes: true,
      attributeFilter: ['data-message-id'],
    });

    return () => {
      observer.disconnect();
    };
  }, [isListeningMode, currentlyPlayingMessageId, lastAutoPlayedMessageId, audioPlayer]);

  // Scroll event listener to detect if user is near bottom
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = viewport;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      // User is "near bottom" if within 100px of the bottom
      isNearBottomRef.current = distanceFromBottom < 100;
    };

    viewport.addEventListener('scroll', handleScroll);
    // Call once to set initial state
    handleScroll();

    return () => {
      viewport.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Message detection effect - scroll to new messages
  const thread = useThread();
  const messages = thread.messages;

  // Get latest assistant message for voice modal
  const latestAssistantMessage = messages
    .slice()
    .reverse()
    .find((m) => m.role === "assistant");
  const latestResponse = latestAssistantMessage?.content
    .filter((c) => c.type === "text")
    .map((c) => c.text)
    .join(" ") || "";

  // Smooth autoscroll during streaming
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    // Only autoscroll if user is near bottom
    if (!isNearBottomRef.current) return;

    let scrollTimeout: NodeJS.Timeout | null = null;
    let lastScrollTime = 0;
    const scrollThrottle = 150; // Throttle scroll calls to every 150ms for slower effect

    // Smoothly scroll to bottom whenever content changes
    const scrollToBottom = () => {
      const now = Date.now();
      const timeSinceLastScroll = now - lastScrollTime;

      // Throttle scroll calls
      if (timeSinceLastScroll < scrollThrottle) {
        // Clear existing timeout and schedule new one
        if (scrollTimeout) {
          clearTimeout(scrollTimeout);
        }
        scrollTimeout = setTimeout(() => {
          viewport.scrollTo({
            top: viewport.scrollHeight,
            behavior: 'smooth'
          });
          lastScrollTime = Date.now();
        }, scrollThrottle - timeSinceLastScroll);
      } else {
        // Execute scroll immediately
        viewport.scrollTo({
          top: viewport.scrollHeight,
          behavior: 'smooth'
        });
        lastScrollTime = now;
      }
    };

    // Create a MutationObserver to watch for content changes
    const observer = new MutationObserver(() => {
      if (isNearBottomRef.current) {
        scrollToBottom();
      }
    });

    // Observe the viewport for any changes in the subtree
    observer.observe(viewport, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      observer.disconnect();
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
    };
  }, [messages]);

  useEffect(() => {
    // Skip on initial mount
    if (previousMessageCountRef.current === 0 && messages.length > 0) {
      previousMessageCountRef.current = messages.length;
      if (messages.length > 0) {
        lastMessageIdRef.current = messages[messages.length - 1].id;
      }
      return;
    }

    // Check if a new message was added
    if (messages.length > previousMessageCountRef.current) {
      const newMessage = messages[messages.length - 1];

      // Update tracking refs
      previousMessageCountRef.current = messages.length;
      lastMessageIdRef.current = newMessage.id;
    }
  }, [messages]);

  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">
        <VoiceRecorderProvider
          onVoiceDetected={() => {
            // Called when VAD detects voice - stop audio immediately if playing
            if (currentlyPlayingMessageId) {
              audioPlayer.stop();
            }
          }}
        >
          <AudioPlayerContext.Provider value={audioPlayer}>
            <ListeningModeContext.Provider value={{ isListeningMode, setIsListeningMode }}>
          <ThreadPrimitive.Root
            className="aui-root aui-thread-root @container flex h-full flex-col"
            style={{
              ["--thread-max-width" as string]: "44rem",
            }}
          >
            <ThreadPrimitive.Viewport
              ref={(el) => {
                if (el) {
                  viewportRef.current = el as HTMLDivElement;
                }
              }}
              className="aui-thread-viewport relative flex flex-1 flex-col overflow-x-auto overflow-y-scroll scroll-smooth px-4 pt-20"
            >
              <ThreadPrimitive.If empty>
                <ThreadWelcome />
              </ThreadPrimitive.If>

              <ThreadPrimitive.Messages
                components={{
                  UserMessage,
                  EditComposer,
                  AssistantMessage,
                }}
              />

              <ThreadPrimitive.If empty={false}>
                <div className="aui-thread-viewport-spacer min-h-8 grow" />
              </ThreadPrimitive.If>

              <Composer />
            </ThreadPrimitive.Viewport>
          </ThreadPrimitive.Root>
          <VoiceModal
            open={isListeningMode}
            onClose={() => setIsListeningMode(false)}
            latestResponse={latestResponse}
            ttsAnalyserRef={ttsAnalyserRef}
          />
          </ListeningModeContext.Provider>
        </AudioPlayerContext.Provider>
        </VoiceRecorderProvider>
      </MotionConfig>
    </LazyMotion>
  );
};

const ThreadScrollToBottom: FC = () => {
  return (
    <ThreadPrimitive.ScrollToBottom asChild>
      <TooltipIconButton
        tooltip="Scroll to bottom"
        variant="outline"
        className="aui-thread-scroll-to-bottom absolute -top-12 z-10 self-center rounded-full p-4 disabled:invisible dark:bg-background dark:hover:bg-accent"
      >
        <ArrowDownIcon />
      </TooltipIconButton>
    </ThreadPrimitive.ScrollToBottom>
  );
};

const ThreadWelcome: FC = () => {
  const { welcome } = useChatKit();

  return (
    <div className="aui-thread-welcome-root mx-auto my-auto flex w-full max-w-[var(--thread-max-width)] flex-grow flex-col">
      <div className="aui-thread-welcome-center flex w-full flex-grow flex-col items-center justify-center">
        <div className="aui-thread-welcome-message flex size-full flex-col justify-center px-8">
          <m.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ delay: 0.5 }}
            className="aui-thread-welcome-message-motion-1 text-2xl font-semibold"
          >
            {welcome?.title}
          </m.div>
          {welcome?.subtitle && (
            <m.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ delay: 0.6 }}
              className="aui-thread-welcome-message-motion-2 text-2xl text-muted-foreground/65"
            >
              {welcome.subtitle}
            </m.div>
          )}
        </div>
      </div>
      <ThreadSuggestions />
    </div>
  );
};

const ThreadSuggestions: FC = () => {
  const { starters = [] } = useChatKit();

  if (starters.length === 0) return null;

  return (
    <div className="aui-thread-welcome-suggestions grid w-full gap-2 pb-4 @md:grid-cols-2">
      {starters.map((starter, index) => (
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.5 + 0.05 * index }}
          key={`starter-${starter.title}-${index}`}
          className="aui-thread-welcome-suggestion-display [&:nth-child(n+3)]:hidden @md:[&:nth-child(n+3)]:block"
        >
          <ThreadPrimitive.Suggestion prompt={starter.prompt} send asChild>
            <button
              className="group relative flex min-h-[140px] w-full cursor-pointer flex-col items-start justify-between rounded-3xl bg-muted px-6 py-8 text-left transition-all duration-300 ease-in-out hover:brightness-95"
              aria-label={starter.prompt}
            >
              <div className="flex flex-col gap-1">
                <span className="text-lg font-semibold">{starter.title}</span>
                <span className="text-sm text-muted-foreground">{starter.label}</span>
              </div>
            </button>
          </ThreadPrimitive.Suggestion>
        </m.div>
      ))}
    </div>
  );
};

const MessageSuggestions: FC<{
  messageId?: string;
  inline?: string[];
  onSuggestionClick?: () => void;
}> = ({ messageId, inline, onSuggestionClick }) => {
  const { getSuggestions } = useChatKit();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Suggestions shipped with the message win over the adapter
    if (inline && inline.length > 0) {
      setSuggestions(inline);
      return;
    }

    if (!messageId || !getSuggestions) {
      setSuggestions([]);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    getSuggestions(messageId)
      .then((result) => {
        if (!cancelled) setSuggestions(result || []);
      })
      .catch(() => {
        // Suggestions are optional, stay quiet
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [messageId, inline, getSuggestions]);

  const handleSuggestionClick = useCallback(() => {
    setSuggestions([]);
    onSuggestionClick?.();
  }, [onSuggestionClick]);

  if (isLoading || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="flex gap-2 items-center flex-1 overflow-x-auto scrollbar-hide">
      {suggestions.map((suggestion, index) => (
        <m.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ delay: 0.05 * index }}
          key={`message-suggestion-${index}`}
        >
          <ThreadPrimitive.Suggestion
            prompt={suggestion}
            send
            asChild
          >
            <Button
              variant="outline"
              size="sm"
              className="h-auto rounded-full px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm hover:bg-accent dark:hover:bg-accent/60 whitespace-nowrap cursor-pointer"
              aria-label={suggestion}
              onClick={handleSuggestionClick}
            >
              {suggestion}
            </Button>
          </ThreadPrimitive.Suggestion>
        </m.div>
      ))}
    </div>
  );
};

const Composer: FC = () => {
  const { placeholder } = useChatKit();
  const [showSuggestions, setShowSuggestions] = useState(true);

  const thread = useThread();
  const messages = thread.messages;

  // Follow-ups belong to the last assistant message
  const lastAssistant = messages.filter((msg) => msg.role === "assistant").at(-1);
  const lastMessageId = lastAssistant?.id ?? null;
  const hasConversation = !!lastAssistant;
  const inlineSuggestions = (
    lastAssistant?.content.find(
      (part: any) => part.type === "data" && part.name === "suggestions"
    ) as any
  )?.data as string[] | undefined;

  // A new assistant message brings its suggestions back
  useEffect(() => {
    setShowSuggestions(true);
  }, [lastMessageId]);

  const handleSend = useCallback(() => {
    setShowSuggestions(false);
  }, []);

  return (
    <div className="aui-composer-wrapper sticky bottom-0 mx-auto flex w-full max-w-[var(--thread-max-width)] flex-col gap-4 overflow-visible rounded-t-3xl bg-background pb-4 md:pb-6">
      <ThreadScrollToBottom />

      <ComposerPrimitive.Root className="aui-composer-root relative flex w-full flex-col">
        <ComposerPrimitive.AttachmentDropzone className="aui-composer-attachment-dropzone group/input-group flex w-full flex-col rounded-3xl border border-input bg-background px-1 pt-2 shadow-xs transition-[color,box-shadow] outline-none has-[textarea:focus-visible]:border-ring has-[textarea:focus-visible]:ring-[3px] has-[textarea:focus-visible]:ring-ring/50 data-[dragging=true]:border-dashed data-[dragging=true]:border-ring data-[dragging=true]:bg-accent/50 dark:bg-background">
          <ComposerAttachments />

          <ComposerPrimitive.Input
            placeholder={placeholder}
            className="aui-composer-input max-h-32 min-h-12 w-full resize-none bg-transparent px-3.5 pt-1.5  text-base outline-none placeholder:text-muted-foreground focus-visible:ring-0"
            rows={1}
            autoFocus
            aria-label="Message input"
          />

          {/* Suggestions between input and actions */}
          <ComposerSuggestions
            showSuggestions={showSuggestions}
            lastMessageId={lastMessageId}
            inline={inlineSuggestions}
            hasConversation={hasConversation}
            onSuggestionClick={() => setShowSuggestions(false)}
          />

          <ComposerInnerAction
            onSend={handleSend}
          />
        </ComposerPrimitive.AttachmentDropzone>
      </ComposerPrimitive.Root>
    </div>
  );
};

const ComposerSuggestions: FC<{
  showSuggestions: boolean;
  lastMessageId: string | null;
  inline?: string[];
  hasConversation: boolean;
  onSuggestionClick: () => void;
}> = ({ showSuggestions, lastMessageId, inline, hasConversation, onSuggestionClick }) => {
  const [hasInputText, setHasInputText] = useState(false);
  const [hasAttachments, setHasAttachments] = useState(false);

  // Get thread state to check if running
  const thread = useThread();
  const isRunning = thread.isRunning;

  // Get recording state from voice recorder context
  const { recordingState } = useVoiceRecorderContext();
  const isRecording = recordingState === 'recording' || recordingState === 'listening' || recordingState === 'processing';

  // Poll the input value and attachments to check state (non-intrusive approach)
  useEffect(() => {
    const checkComposerState = () => {
      // Check input text
      const input = document.querySelector('.aui-composer-input') as HTMLTextAreaElement;
      if (input) {
        setHasInputText(input.value.trim().length > 0);
      }

      // Check attachments
      const attachmentsList = document.querySelector('.aui-composer-attachments');
      setHasAttachments(!!attachmentsList && attachmentsList.children.length > 0);
    };

    // Check immediately
    checkComposerState();

    // Poll every 200ms
    const interval = setInterval(checkComposerState, 200);

    return () => clearInterval(interval);
  }, []);

  if (!showSuggestions || !lastMessageId || !hasConversation || isRunning || isRecording || hasInputText || hasAttachments) {
    return null;
  }

  return (
    <div className="px-2 sm:px-3.5 pb-2">
      <MessageSuggestions
        messageId={lastMessageId}
        inline={inline}
        onSuggestionClick={onSuggestionClick}
      />
    </div>
  );
};

const ComposerInnerAction: FC<{
  onSend?: () => void;
}> = ({ onSend }) => {
  const { transcribe } = useChatKit();

  // Get the thread runtime to append messages
  const threadRuntime = useThreadRuntime();

  // Get thread state to check if running
  const thread = useThread();
  const isRunning = thread.isRunning;

  // Get audio player from context
  const audioPlayer = useContext(AudioPlayerContext);

  // Store transcribed text temporarily
  const transcribedTextRef = useRef<string>("");

  const handleTranscription = useCallback((text: string) => {
    if (text) {
      // Store the transcribed text for auto-send
      transcribedTextRef.current = text;
    }
  }, []);

  const handleAutoSend = useCallback(() => {
    // Auto-send the transcribed text using the thread runtime
    // Small delay to ensure transcription is complete
    setTimeout(() => {
      const message = transcribedTextRef.current.trim();

      if (!message) {
        return;
      }

      // Clear the transcribed text
      transcribedTextRef.current = "";

      // Use the thread runtime to append the message
      threadRuntime.append({
        role: "user",
        content: [{ type: "text", text: message }],
      });
    }, 100);

    // Also call the onSend callback if provided
    if (onSend) {
      onSend();
    }
  }, [threadRuntime, onSend]);

  return (
    <div className="aui-composer-action-wrapper relative mx-1 mt-2 mb-2 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <ComposerAddAttachment />
      </div>

      <div className="flex items-center gap-2">
        {/* Voice needs a transcribe adapter. Kept mounted so hands-free mode can pause and resume. */}
        {transcribe && (
          <VoiceRecorder
            onTranscription={handleTranscription}
            onAutoSend={handleAutoSend}
            onRecordingStart={audioPlayer.stop}
            isThreadRunning={isRunning}
            isAudioPlaying={!!audioPlayer.currentlyPlayingMessageId}
          />
        )}

        <ThreadPrimitive.If running={false}>
          <ComposerPrimitive.Send asChild>
            <TooltipIconButton
              tooltip="Send message"
              side="bottom"
              type="submit"
              variant="default"
              size="icon"
              className="aui-composer-send size-[34px] rounded-full p-1"
              aria-label="Send message"
              onClick={onSend}
            >
              <ArrowUpIcon className="aui-composer-send-icon size-5" />
            </TooltipIconButton>
          </ComposerPrimitive.Send>
        </ThreadPrimitive.If>

        <ThreadPrimitive.If running>
          <ComposerPrimitive.Cancel asChild>
            <Button
              type="button"
              variant="default"
              size="icon"
              className="aui-composer-cancel size-[34px] rounded-full border border-muted-foreground/60 hover:bg-primary/75 dark:border-muted-foreground/90"
              aria-label="Stop generating"
            >
              <Square className="aui-composer-cancel-icon size-3.5 fill-white dark:fill-black" />
            </Button>
          </ComposerPrimitive.Cancel>
        </ThreadPrimitive.If>
      </div>
    </div>
  );
};

const MessageError: FC = () => {
  return (
    <MessagePrimitive.Error>
      <ErrorPrimitive.Root className="aui-message-error-root mt-2 rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive dark:bg-destructive/5 dark:text-red-200">
        <ErrorPrimitive.Message className="aui-message-error-message line-clamp-2" />
      </ErrorPrimitive.Root>
    </MessagePrimitive.Error>
  );
};

// Reads a named data part from the current message
const useDataPart = <T,>(name: string): T | null => {
  const message = useMessage();
  const part = message?.content?.find(
    (p: any) => p.type === "data" && p.name === name
  ) as any;
  return (part?.data as T) ?? null;
};

const AssistantMessage: FC = () => {
  const message = useMessage();
  const workflowState = useDataPart<WorkflowState>("workflow");
  const sources = useDataPart<Source[]>("sources");
  const isDone = message.status?.type !== "running";

  return (
    <MessagePrimitive.Root asChild>
      <div
        className="aui-assistant-message-root relative mx-auto w-full max-w-[var(--thread-max-width)] animate-in py-4 duration-150 ease-out fade-in slide-in-from-bottom-1 last:mb-24"
        data-role="assistant"
        data-message-id={isDone ? message.id : undefined}
      >
        {/* Display workflow status if available */}
        {workflowState && (
          <div className="mx-2 mb-2">
            <WorkflowStatus workflowState={workflowState} />
          </div>
        )}

        <div className="aui-assistant-message-content mx-2 leading-7 break-words text-foreground">
          <MessagePrimitive.Parts
            components={{
              Text: TextWithImages,
              Reasoning: Reasoning,
              ReasoningGroup: ReasoningGroup,
              tools: { Fallback: ToolFallback },
            }}
          />
          <MessageError />
        </div>

        <div className="aui-assistant-message-footer mt-2 ml-2 flex flex-col gap-2">
          {/* Sources display - before action bar */}
          {sources && sources.length > 0 && (
            <div className="flex items-center">
              <MessageSources sources={sources} />
            </div>
          )}

          <div className="flex items-center">
            <BranchPicker />
            <AssistantActionBar />
          </div>
        </div>
      </div>
    </MessagePrimitive.Root>
  );
};

const TextToSpeechButton: FC = () => {
  const message = useMessage();
  const audioPlayer = useContext(AudioPlayerContext);
  const [isLoading, setIsLoading] = useState(false);

  const messageId = message.id;
  const isPlaying = audioPlayer.isPlaying(messageId);

  const handlePlayAudio = async () => {
    if (isPlaying) {
      audioPlayer.stop();
      return;
    }

    if (isLoading) {
      return;
    }

    setIsLoading(true);
    try {
      await audioPlayer.play(messageId);
    } catch (error) {
      // Playback is best effort
    } finally {
      setIsLoading(false);
    }
  };

  // No synthesize adapter, no button
  if (!audioPlayer.canPlay) {
    return null;
  }

  return (
    <TooltipIconButton
      tooltip={
        isLoading
          ? "Loading audio..."
          : isPlaying
            ? "Stop audio"
            : "Play audio"
      }
      onClick={handlePlayAudio}
      className={isPlaying ? "text-blue-500 hover:text-blue-600" : ""}
    >
      {isLoading ? (
        <Loader2 className="animate-spin" />
      ) : isPlaying ? (
        <StopCircle className="fill-current" />
      ) : (
        <Volume2 />
      )}
    </TooltipIconButton>
  );
};

const AssistantActionBar: FC = () => {
  return (
    <ActionBarPrimitive.Root
      hideWhenRunning
      autohide="not-last"
      autohideFloat="single-branch"
      className="aui-assistant-action-bar-root col-start-3 row-start-2 -ml-1 flex gap-1 text-muted-foreground data-floating:absolute data-floating:rounded-md data-floating:border data-floating:bg-background data-floating:p-1 data-floating:shadow-sm"
    >
      <TextToSpeechButton />
      <ActionBarPrimitive.Copy asChild>
        <TooltipIconButton tooltip="Copy">
          <MessagePrimitive.If copied>
            <CheckIcon />
          </MessagePrimitive.If>
          <MessagePrimitive.If copied={false}>
            <CopyIcon />
          </MessagePrimitive.If>
        </TooltipIconButton>
      </ActionBarPrimitive.Copy>
      <ActionBarPrimitive.Reload asChild>
        <TooltipIconButton tooltip="Refresh">
          <RefreshCwIcon />
        </TooltipIconButton>
      </ActionBarPrimitive.Reload>
    </ActionBarPrimitive.Root>
  );
};

const UserMessage: FC = () => {
  return (
    <MessagePrimitive.Root asChild>
      <div
        className="aui-user-message-root mx-auto grid w-full max-w-[var(--thread-max-width)] animate-in auto-rows-auto grid-cols-[minmax(72px,1fr)_auto] gap-y-2 px-2 py-4 duration-150 ease-out fade-in slide-in-from-bottom-1 first:mt-3 last:mb-5 [&:where(>*)]:col-start-2"
        data-role="user"
      >
        <UserMessageAttachments />

        <div className="aui-user-message-content-wrapper relative col-start-2 min-w-0">
          <div className="aui-user-message-content rounded-3xl bg-muted px-5 py-2.5 break-words text-foreground">
            <MessagePrimitive.Parts />
          </div>
          <div className="aui-user-action-bar-wrapper absolute top-1/2 left-0 -translate-x-full -translate-y-1/2 pr-2">
            <UserActionBar />
          </div>
        </div>

        <BranchPicker className="aui-user-branch-picker col-span-full col-start-1 row-start-3 -mr-1 justify-end" />
      </div>
    </MessagePrimitive.Root>
  );
};

const UserActionBar: FC = () => {
  return (
    <ActionBarPrimitive.Root
      hideWhenRunning
      autohide="not-last"
      className="aui-user-action-bar-root flex flex-col items-end"
    >
      <ActionBarPrimitive.Edit asChild>
        <TooltipIconButton tooltip="Edit" className="aui-user-action-edit p-4">
          <PencilIcon />
        </TooltipIconButton>
      </ActionBarPrimitive.Edit>
    </ActionBarPrimitive.Root>
  );
};

const EditComposer: FC = () => {
  return (
    <div className="aui-edit-composer-wrapper mx-auto flex w-full max-w-[var(--thread-max-width)] flex-col gap-4 px-2 first:mt-4">
      <ComposerPrimitive.Root className="aui-edit-composer-root ml-auto flex w-full max-w-7/8 flex-col rounded-xl bg-muted">
        <ComposerPrimitive.Input
          className="aui-edit-composer-input flex min-h-[60px] w-full resize-none bg-transparent p-4 text-foreground outline-none"
          autoFocus
        />

        <div className="aui-edit-composer-footer mx-3 mb-3 flex items-center justify-center gap-2 self-end">
          <ComposerPrimitive.Cancel asChild>
            <Button variant="ghost" size="sm" aria-label="Cancel edit">
              Cancel
            </Button>
          </ComposerPrimitive.Cancel>
          <ComposerPrimitive.Send asChild>
            <Button size="sm" aria-label="Update message">
              Update
            </Button>
          </ComposerPrimitive.Send>
        </div>
      </ComposerPrimitive.Root>
    </div>
  );
};

const BranchPicker: FC<BranchPickerPrimitive.Root.Props> = ({
  className,
  ...rest
}) => {
  return (
    <BranchPickerPrimitive.Root
      hideWhenSingleBranch
      className={cn(
        "aui-branch-picker-root mr-2 -ml-2 inline-flex items-center text-xs text-muted-foreground",
        className,
      )}
      {...rest}
    >
      <BranchPickerPrimitive.Previous asChild>
        <TooltipIconButton tooltip="Previous">
          <ChevronLeftIcon />
        </TooltipIconButton>
      </BranchPickerPrimitive.Previous>
      <span className="aui-branch-picker-state font-medium">
        <BranchPickerPrimitive.Number /> / <BranchPickerPrimitive.Count />
      </span>
      <BranchPickerPrimitive.Next asChild>
        <TooltipIconButton tooltip="Next">
          <ChevronRightIcon />
        </TooltipIconButton>
      </BranchPickerPrimitive.Next>
    </BranchPickerPrimitive.Root>
  );
};
