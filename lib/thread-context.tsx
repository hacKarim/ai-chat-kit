"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useRef } from "react";
import { ThreadMessageLike } from "@assistant-ui/react";
import { getOrCreateSessionId } from "./session";

export interface DifyConversation {
  id: string;
  name: string;
  inputs: Record<string, unknown>;
  status: string;
  created_at: number;
}

interface ThreadData {
  threadId: string;
  conversationId: string | null;
  title: string;
  messages: ThreadMessageLike[];
  status: "regular" | "archived";
}

interface ThreadContextValue {
  currentThreadId: string;
  setCurrentThreadId: (id: string) => void;
  threads: Map<string, ThreadData>;
  setThreads: React.Dispatch<React.SetStateAction<Map<string, ThreadData>>>;
  isLoadingConversations: boolean;
  loadConversationsFromDify: () => Promise<void>;
}

const ThreadContext = createContext<ThreadContextValue | null>(null);

export function ThreadProvider({
  children,
  initialConversationId
}: {
  children: ReactNode;
  initialConversationId?: string;
}) {
  const [threads, setThreads] = useState<Map<string, ThreadData>>(new Map());
  const [currentThreadId, setCurrentThreadId] = useState<string>("");
  const [isLoadingConversations, setIsLoadingConversations] = useState(true); // Start as true since we load on mount
  const hasInitialized = useRef(false);

  // Load conversations from Dify on mount
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    loadConversationsFromDify();
  }, []);

  const loadConversationsFromDify = async () => {
    setIsLoadingConversations(true);
    try {
      const userId = getOrCreateSessionId();

      const response = await fetch(
        `/api/conversations?user=${encodeURIComponent(userId)}&limit=50`
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to load conversations (status: " + response.status + "):", errorText);

        // Don't fail completely - just start with empty state
        // This is normal for new users who haven't created any conversations yet
        if (response.status === 404 || response.status === 400) {
          // Create a new thread for the user
          const newThreadId = `thread-${Date.now()}`;
          const defaultThread: ThreadData = {
            threadId: newThreadId,
            conversationId: null,
            title: "Nouvelle Discussion",
            messages: [],
            status: "regular",
          };
          setThreads(new Map([[newThreadId, defaultThread]]));
          setCurrentThreadId(newThreadId);
          return;
        }

        // For other errors, log but don't crash
        console.warn("Continuing with default state despite error");

        // Create a default thread if none exist
        if (threads.size === 0) {
          const newThreadId = `thread-${Date.now()}`;
          const defaultThread: ThreadData = {
            threadId: newThreadId,
            conversationId: null,
            title: "Nouvelle Discussion",
            messages: [],
            status: "regular",
          };
          setThreads(new Map([[newThreadId, defaultThread]]));
          setCurrentThreadId(newThreadId);
        }
        return;
      }

      const data = await response.json();
      const conversations: DifyConversation[] = data.data || [];

      // If no conversations, create a new thread for the user
      if (conversations.length === 0) {
        const newThreadId = `thread-${Date.now()}`;
        const defaultThread: ThreadData = {
          threadId: newThreadId,
          conversationId: null,
          title: "Nouvelle Discussion",
          messages: [],
          status: "regular",
        };
        setThreads(new Map([[newThreadId, defaultThread]]));
        setCurrentThreadId(newThreadId);
        return;
      }

      // Convert Dify conversations to thread data
      const newThreads = new Map(threads);

      conversations.forEach((conv) => {
        const threadId = `thread-${conv.id}`;
        newThreads.set(threadId, {
          threadId,
          conversationId: conv.id,
          title: conv.name || "Untitled Conversation",
          messages: [], // Messages will be loaded when thread is activated
          status: "regular",
        });
      });

      setThreads(newThreads);

      // Switch to the conversation specified by initialConversationId, or create a new thread
      let targetThreadId: string;
      if (initialConversationId) {
        targetThreadId = `thread-${initialConversationId}`;
        // Verify the conversation exists
        if (!newThreads.has(targetThreadId)) {
          console.warn(`Conversation ${initialConversationId} not found, creating new thread`);
          targetThreadId = `thread-${Date.now()}`;
          newThreads.set(targetThreadId, {
            threadId: targetThreadId,
            conversationId: null,
            title: "Nouvelle Discussion",
            messages: [],
            status: "regular",
          });
          setThreads(newThreads);
        }
      } else {
        // No conversation ID specified - create a new thread
        targetThreadId = `thread-${Date.now()}`;
        newThreads.set(targetThreadId, {
          threadId: targetThreadId,
          conversationId: null,
          title: "Nouvelle Discussion",
          messages: [],
          status: "regular",
        });
        setThreads(newThreads);
      }
      setCurrentThreadId(targetThreadId);
    } catch (error) {
      console.error("Error loading conversations:", error);
      console.warn("Continuing with default state despite error");

      // Create a default thread on error if no threads exist
      if (threads.size === 0) {
        const newThreadId = `thread-${Date.now()}`;
        const defaultThread: ThreadData = {
          threadId: newThreadId,
          conversationId: null,
          title: "Nouvelle Discussion",
          messages: [],
          status: "regular",
        };
        setThreads(new Map([[newThreadId, defaultThread]]));
        setCurrentThreadId(newThreadId);
      }
    } finally {
      setIsLoadingConversations(false);
    }
  };

  return (
    <ThreadContext.Provider
      value={{
        currentThreadId,
        setCurrentThreadId,
        threads,
        setThreads,
        isLoadingConversations,
        loadConversationsFromDify,
      }}
    >
      {children}
    </ThreadContext.Provider>
  );
}

export function useThreadContext() {
  const context = useContext(ThreadContext);
  if (!context) {
    throw new Error("useThreadContext must be used within ThreadProvider");
  }
  return context;
}

/**
 * Optional version of useThreadContext that returns null if not within a ThreadProvider
 * Useful for components that need to work both inside and outside the provider
 */
export function useThreadContextOptional() {
  return useContext(ThreadContext);
}
