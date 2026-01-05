"use client";

import { createContext, useContext, type ReactNode } from "react";

/**
 * Everything the kit needs from your backend, as plain async functions.
 * Leave one out and the matching piece of UI hides itself.
 */
export interface ChatKitAdapters {
  /** Speech to text. Enables the mic button and hands-free mode. */
  transcribe?: (audio: File) => Promise<string>;
  /** Text to speech. Enables the "play" action and spoken replies in hands-free mode. */
  synthesize?: (text: string) => Promise<Blob>;
  /** Follow-up prompts for an assistant message. A `suggestions` data part works too. */
  getSuggestions?: (messageId: string) => Promise<string[]>;
}

export interface Starter {
  title: string;
  label: string;
  prompt: string;
}

export interface ChatKitConfig extends ChatKitAdapters {
  welcome?: { title: string; subtitle?: string };
  starters?: Starter[];
  placeholder?: string;
}

const defaults: ChatKitConfig = {
  welcome: { title: "Hello.", subtitle: "How can I help today?" },
  starters: [],
  placeholder: "Send a message...",
};

const ChatKitContext = createContext<ChatKitConfig>(defaults);

export function ChatKitProvider({
  children,
  ...config
}: ChatKitConfig & { children: ReactNode }) {
  return (
    <ChatKitContext.Provider value={{ ...defaults, ...config }}>
      {children}
    </ChatKitContext.Provider>
  );
}

export function useChatKit() {
  return useContext(ChatKitContext);
}
