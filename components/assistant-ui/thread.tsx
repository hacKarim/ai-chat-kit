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
} from "lucide-react";

import {
  ActionBarPrimitive,
  BranchPickerPrimitive,
  ComposerPrimitive,
  ErrorPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
  useMessage,
} from "@assistant-ui/react";

import type { FC } from "react";
import { useState, useEffect, useCallback } from "react";
import { LazyMotion, MotionConfig, domAnimation } from "motion/react";
import * as m from "motion/react-m";

import { Button } from "@/components/ui/button";
import { MarkdownText } from "@/components/assistant-ui/markdown-text";
import { Reasoning, ReasoningGroup } from "@/components/assistant-ui/reasoning";
import { ToolFallback } from "@/components/assistant-ui/tool-fallback";
import { TooltipIconButton } from "@/components/assistant-ui/tooltip-icon-button";
import {
  ComposerAddAttachment,
  ComposerAttachments,
  UserMessageAttachments,
} from "@/components/assistant-ui/attachment";
import { WorkflowStatus } from "@/components/workflow-status";
import type { WorkflowState } from "@/lib/dify/types";
import { getOrCreateSessionId } from "@/lib/session";

import { cn } from "@/lib/utils";

export const Thread: FC = () => {
  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">
        <ThreadPrimitive.Root
          className="aui-root aui-thread-root @container flex h-full flex-col bg-background"
          style={{
            ["--thread-max-width" as string]: "44rem",
          }}
        >
          <ThreadPrimitive.Viewport className="aui-thread-viewport relative flex flex-1 flex-col overflow-x-auto overflow-y-scroll px-4">
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
            Hello there!
          </m.div>
          <m.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ delay: 0.6 }}
            className="aui-thread-welcome-message-motion-2 text-2xl text-muted-foreground/65"
          >
            How can I help you today?
          </m.div>
        </div>
      </div>
      <ThreadSuggestions />
    </div>
  );
};

const ThreadSuggestions: FC = () => {
  return (
    <div className="aui-thread-welcome-suggestions grid w-full gap-2 pb-4 @md:grid-cols-2">
      {[
        {
          title: "What's the weather",
          label: "in San Francisco?",
          action: "What's the weather in San Francisco?",
        },
        {
          title: "Explain React hooks",
          label: "like useState and useEffect",
          action: "Explain React hooks like useState and useEffect",
        },
        {
          title: "Write a SQL query",
          label: "to find top customers",
          action: "Write a SQL query to find top customers",
        },
        {
          title: "Create a meal plan",
          label: "for healthy weight loss",
          action: "Create a meal plan for healthy weight loss",
        },
      ].map((suggestedAction, index) => (
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.5 + 0.05 * index }}
          key={`suggested-action-${suggestedAction.title}-${index}`}
          className="aui-thread-welcome-suggestion-display [&:nth-child(n+3)]:hidden @md:[&:nth-child(n+3)]:block"
        >
          <ThreadPrimitive.Suggestion
            prompt={suggestedAction.action}
            send
            asChild
          >
            <Button
              variant="ghost"
              className="aui-thread-welcome-suggestion h-auto w-full flex-1 flex-wrap items-start justify-start gap-1 rounded-3xl border px-5 py-4 text-left text-sm @md:flex-col dark:hover:bg-accent/60"
              aria-label={suggestedAction.action}
            >
              <span className="aui-thread-welcome-suggestion-text-1 font-medium">
                {suggestedAction.title}
              </span>
              <span className="aui-thread-welcome-suggestion-text-2 text-muted-foreground">
                {suggestedAction.label}
              </span>
            </Button>
          </ThreadPrimitive.Suggestion>
        </m.div>
      ))}
    </div>
  );
};

const MessageSuggestions: FC<{
  messageId?: string;
  onSuggestionClick?: () => void;
}> = ({ messageId, onSuggestionClick }) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!messageId) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      setIsLoading(true);
      try {
        const sessionId = getOrCreateSessionId();
        const response = await fetch(`/api/suggestions/${messageId}`, {
          headers: {
            "X-Session-Id": sessionId,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data.data || []);
        } else {
          console.error("Failed to fetch suggestions:", response.status);
        }
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, [messageId]);

  const handleSuggestionClick = useCallback(() => {
    setSuggestions([]);
    onSuggestionClick?.();
  }, [onSuggestionClick]);

  if (isLoading || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 items-center flex-1">
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
  const [lastMessageId, setLastMessageId] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [hasConversation, setHasConversation] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  // Get the last assistant message ID from the thread
  useEffect(() => {
    const checkLastMessage = () => {
      // Get conversation ID from URL
      const pathParts = window.location.pathname.split('/');
      const conversationIdFromUrl = pathParts[pathParts.length - 1];
      const isValidConversationId = conversationIdFromUrl && conversationIdFromUrl !== '' && conversationIdFromUrl !== 'assistant';

      // If conversation ID changed, reset suggestions
      if (isValidConversationId && conversationIdFromUrl !== currentConversationId) {
        setCurrentConversationId(conversationIdFromUrl);
        setLastMessageId(null);
        setShowSuggestions(true);
      } else if (!isValidConversationId && currentConversationId !== null) {
        // New conversation (no ID in URL)
        setCurrentConversationId(null);
        setLastMessageId(null);
        setHasConversation(false);
      }

      // Query for all assistant messages
      const assistantMessages = document.querySelectorAll('[data-role="assistant"]');

      // Only show suggestions if there's at least one assistant message (conversation started)
      if (assistantMessages.length > 0) {
        setHasConversation(true);
        // Get the last assistant message
        const lastAssistant = assistantMessages[assistantMessages.length - 1];
        const messageId = lastAssistant.getAttribute('data-message-id');
        if (messageId && messageId !== lastMessageId) {
          setLastMessageId(messageId);
          setShowSuggestions(true);
        }
      } else {
        // No assistant messages yet - hide suggestions
        setHasConversation(false);
        setLastMessageId(null);
      }
    };

    // Initial check
    checkLastMessage();

    // Set up observer to watch for new messages
    const observer = new MutationObserver(checkLastMessage);
    const viewport = document.querySelector('.aui-thread-viewport');
    if (viewport) {
      observer.observe(viewport, { childList: true, subtree: true });
    }

    // Listen for URL changes (when switching conversations)
    const handleUrlChange = () => {
      checkLastMessage();
    };
    window.addEventListener('popstate', handleUrlChange);

    return () => {
      observer.disconnect();
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, [lastMessageId, currentConversationId]);

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
            placeholder="Send a message..."
            className="aui-composer-input mb-1 max-h-32 min-h-16 w-full resize-none bg-transparent px-3.5 pt-1.5 pb-3 text-base outline-none placeholder:text-muted-foreground focus-visible:ring-0"
            rows={1}
            autoFocus
            aria-label="Message input"
          />

          {/* Suggestions between input and actions */}
          {showSuggestions && lastMessageId && hasConversation && (
            <div className="px-2 sm:px-3.5 pb-2">
              <MessageSuggestions
                messageId={lastMessageId}
                onSuggestionClick={() => setShowSuggestions(false)}
              />
            </div>
          )}

          <ComposerAction onSend={handleSend} />
        </ComposerPrimitive.AttachmentDropzone>
      </ComposerPrimitive.Root>
    </div>
  );
};

const ComposerAction: FC<{ onSend?: () => void }> = ({ onSend }) => {
  return (
    <div className="aui-composer-action-wrapper relative mx-1 mt-2 mb-2 flex items-center justify-between">
      <ComposerAddAttachment />

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

const AssistantMessage: FC = () => {
  const message = useMessage();
  const [workflowState, setWorkflowState] = useState<WorkflowState | null>(null);
  const [difyMessageId, setDifyMessageId] = useState<string | null>(null);

  // Extract workflow events from message data parts
  useEffect(() => {
    // Safety check - ensure message and content exist
    if (!message?.content) {
      return;
    }

    // Look for workflow events in message parts
    const dataParts = message.content.filter(
      (part: any) => part.type === "data" && part.data?.workflowEvent
    );

    if (dataParts.length > 0) {
      // Get the latest workflow event
      const latestEvent = dataParts[dataParts.length - 1] as any;
      const workflowEvent = latestEvent.data.workflowEvent;

      // Update workflow state based on event type
      setWorkflowState((prev) => {
        // If no previous state or this is a new workflow, use the event state
        if (!prev || workflowEvent.type === "workflow_started") {
          return {
            workflowRunId: workflowEvent.workflowRunId,
            workflowId: workflowEvent.workflowId,
            status: workflowEvent.status,
            currentNode: workflowEvent.currentNode || null,
            nodes: workflowEvent.nodes || [],
            totalSteps: workflowEvent.totalSteps || 0,
            completedSteps: workflowEvent.completedSteps || 0,
            elapsedTime: workflowEvent.elapsedTime || 0,
            startedAt: workflowEvent.startedAt || null,
            finishedAt: workflowEvent.finishedAt || null,
          };
        }

        // Update existing state
        return {
          ...prev,
          status: workflowEvent.status || prev.status,
          currentNode: workflowEvent.currentNode ?? prev.currentNode,
          nodes: workflowEvent.nodes || prev.nodes,
          totalSteps: workflowEvent.totalSteps || prev.totalSteps,
          completedSteps: workflowEvent.completedSteps || prev.completedSteps,
          elapsedTime: workflowEvent.elapsedTime || prev.elapsedTime,
          finishedAt: workflowEvent.finishedAt || prev.finishedAt,
        };
      });
    }

    // Extract Dify message ID from message data parts
    const messageData = message.content.find(
      (part: any) => part.type === "data" && part.data?.difyMessageId
    );
    if (messageData) {
      setDifyMessageId((messageData as any).data.difyMessageId);
    } else {
      // Try to extract from message ID if it follows the pattern msg-{difyId}-assistant
      const messageId = (message as any).id;
      if (messageId && typeof messageId === "string") {
        const match = messageId.match(/^msg-(.+)-(assistant|user)$/);
        if (match && match[1] && match[1].includes("-")) {
          // If it looks like a UUID (contains hyphens), use it
          setDifyMessageId(match[1]);
        }
      }
    }
  }, [message?.content, message]);

  return (
    <MessagePrimitive.Root asChild>
      <div
        className="aui-assistant-message-root relative mx-auto w-full max-w-[var(--thread-max-width)] animate-in py-4 duration-150 ease-out fade-in slide-in-from-bottom-1 last:mb-24"
        data-role="assistant"
        data-message-id={difyMessageId || undefined}
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
              Text: MarkdownText,
              Reasoning: Reasoning,
              ReasoningGroup: ReasoningGroup,
              tools: { Fallback: ToolFallback },
            }}
          />
          <MessageError />
        </div>

        <div className="aui-assistant-message-footer mt-2 ml-2 flex">
          <BranchPicker />
          <AssistantActionBar />
        </div>
      </div>
    </MessagePrimitive.Root>
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
