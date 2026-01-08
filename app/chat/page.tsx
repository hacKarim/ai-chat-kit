import type { Metadata } from "next";
import { ChatDemo } from "@/components/playground/chat-demo";

export const metadata: Metadata = { title: "Chat demo | AI chat kit" };

export default function ChatPage() {
  return <ChatDemo />;
}
