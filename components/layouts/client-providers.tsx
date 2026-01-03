"use client";

import { ReactNode } from "react";
import { ThreadProvider } from "@/lib/thread-context";
import { GradientBackground } from "./gradient-background";

interface ClientProvidersProps {
  children: ReactNode;
  initialConversationId?: string;
}

export function ClientProviders({ children, initialConversationId }: ClientProvidersProps) {
  return (
    <ThreadProvider initialConversationId={initialConversationId}>
      <GradientBackground />
      {children}
    </ThreadProvider>
  );
}
