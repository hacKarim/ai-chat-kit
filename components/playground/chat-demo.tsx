"use client";

import Link from "next/link";
import { AssistantRuntimeProvider, useLocalRuntime } from "@assistant-ui/react";
import { Thread } from "@/components/assistant-ui/thread";
import { GradientBackground } from "@/components/layouts/gradient-background";
import { ChatKitProvider } from "@/lib/chat-kit";
import { mockModel, mockTranscribe } from "@/lib/demo/mock-model";

const starters = [
  { title: "List open incidents", label: "reasoning, steps, a table and sources", prompt: "List the open incidents" },
  { title: "Chart signups", label: "a bar chart from a small spec", prompt: "Chart signups by week" },
  { title: "Pick a region", label: "a choice that answers for you", prompt: "Which region should we deploy to?" },
  { title: "Draft a post", label: "previews for X and LinkedIn", prompt: "Draft a post about the cold start fix" },
];

export function ChatDemo() {
  const runtime = useLocalRuntime(mockModel);

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <ChatKitProvider
        welcome={{ title: "This model is scripted.", subtitle: "The interface around it is real." }}
        starters={starters}
        placeholder="Ask for incidents, a chart, a plan, a post..."
        transcribe={mockTranscribe}
      >
        <div className="relative isolate h-dvh">
          <GradientBackground seed="chat-demo" />
          <header className="absolute inset-x-0 top-0 z-30 flex items-center justify-between px-5 py-4 text-sm backdrop-blur-md">
            <Link href="/" className="font-display text-base font-semibold tracking-tight">
              AI chat kit
            </Link>
            <span className="text-muted-foreground">
              Demo: scripted model, canned transcription
            </span>
          </header>
          <div className="relative z-10 h-full">
            <Thread />
          </div>
        </div>
      </ChatKitProvider>
    </AssistantRuntimeProvider>
  );
}
