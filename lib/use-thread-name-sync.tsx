"use client";

import { useEffect, useRef } from "react";
import { useThread, useThreadListItem } from "@assistant-ui/react";
import { useConversationNamesStore } from "./conversation-names-store";

// Store mapping of thread IDs to thread keys (first message)
const threadIdToKeyMap = new Map<string, string>();

/**
 * Hook that tracks the current thread's first message and associates it with the thread ID
 * This runs in each ThreadListItem and updates a global registry
 * ONLY registers when THIS specific thread is the active one
 */
export const useThreadKeyRegistry = () => {
  const threadListItem = useThreadListItem({ optional: true });
  const thread = useThread({ optional: true });

  useEffect(() => {
    if (!thread?.messages || !threadListItem) return;

    // CRITICAL: Only register if THIS thread list item is the active/main thread
    // Otherwise all thread items will register the same active thread's data
    if (!threadListItem.isMain) return;

    // Check if already registered for this thread
    if (threadIdToKeyMap.has(threadListItem.id)) return;

    // Find first user message
    const firstUserMessage = thread.messages.find((m) => m.role === "user");
    if (!firstUserMessage) return;

    // Extract text content as threadKey
    const threadKey = firstUserMessage.content
      .filter((part) => part.type === "text")
      .map((part) => (part as any).text)
      .join("");

    if (!threadKey || !threadListItem.id) return;

    // Register this association
    threadIdToKeyMap.set(threadListItem.id, threadKey);
  }, [thread?.messages, threadListItem?.id, threadListItem?.isMain]);
};

/**
 * Get the thread key for a given thread ID
 */
export const getThreadKeyById = (threadId: string): string | undefined => {
  return threadIdToKeyMap.get(threadId);
};
