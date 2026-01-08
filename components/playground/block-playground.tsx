"use client";

import { useState } from "react";
import { BlockRenderer, parseBlock } from "@/components/tool-ui/block-renderer";
import { VoiceRecorderProvider } from "@/contexts/voice-recorder-context";
import { ChatKitProvider } from "@/lib/chat-kit";
import { mockTranscribe } from "@/lib/demo/mock-model";

export function BlockPlayground({ name, initial }: { name: string; initial: string }) {
  const [code, setCode] = useState(initial);
  const [sent, setSent] = useState<string | null>(null);
  const parsed = parseBlock(code);

  return (
    <div className="grid overflow-hidden rounded-3xl border lg:grid-cols-2">
      <div className="flex min-w-0 flex-col border-b bg-foreground text-background lg:border-r lg:border-b-0">
        <div className="flex items-center justify-between px-5 pt-4 text-sm">
          <label htmlFor="block-json" className="text-background/60">
            Edit the JSON
          </label>
          {code !== initial && (
            <button
              onClick={() => setCode(initial)}
              className="text-[#9db0ff] underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none"
            >
              Reset
            </button>
          )}
        </div>
        <textarea
          id="block-json"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          spellCheck={false}
          className="h-[30rem] w-full resize-none bg-transparent px-5 pt-3 pb-5 font-mono text-[13px] leading-relaxed outline-none"
        />
        <p
          role="status"
          className="border-t border-background/15 px-5 py-2.5 font-mono text-xs text-background/70"
        >
          {parsed.ok ? "Valid JSON" : `Not valid yet: ${parsed.error}`}
        </p>
      </div>

      <div className="flex min-w-0 flex-col">
        <p className="px-6 pt-4 text-sm text-muted-foreground">Rendered</p>
        <div className="h-[30rem] overflow-y-auto px-6 pb-4">
          <ChatKitProvider transcribe={mockTranscribe}>
            <VoiceRecorderProvider>
              <BlockRenderer
                type={name}
                code={code}
                send={setSent}
                fallback={
                  <p className="mt-6 text-sm text-muted-foreground">
                    The block renders again as soon as the JSON parses.
                  </p>
                }
              />
            </VoiceRecorderProvider>
          </ChatKitProvider>
        </div>
        <p role="status" className="border-t px-6 py-2.5 text-xs text-muted-foreground">
          {sent ? (
            <>
              Sent to the conversation: <span className="text-foreground">{sent}</span>
            </>
          ) : (
            "Interactive blocks report here what they would send as the user's reply."
          )}
        </p>
      </div>
    </div>
  );
}
