"use client";

import { useEffect, useRef, useState } from "react";
import { BlockRenderer, BlockSkeleton } from "@/components/tool-ui/block-renderer";
import { exampleFence } from "@/lib/demo/examples";
import { cn } from "@/lib/utils";

const choices = [
  { name: "plan", label: "Plan" },
  { name: "chart", label: "Chart" },
  { name: "option-list", label: "Option list" },
  { name: "data-table", label: "Data table" },
];

const lead: Record<string, string> = {
  plan: "Here is the plan. Every step can be rolled back until the last one.",
  chart: "Signups over the last six weeks:",
  "option-list": "Pick a region and I will set it up:",
  "data-table": "Three incidents are open right now.",
};

/**
 * The whole idea of the kit in one frame: on the left, the characters the
 * model streams; on the right, what the user sees.
 */
export function StreamDemo() {
  const [choice, setChoice] = useState("plan");
  const [run, setRun] = useState(0);
  const [typed, setTyped] = useState(0);
  const rawRef = useRef<HTMLPreElement>(null);

  const full = `${lead[choice]}\n\n${exampleFence(choice)}`;

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setTyped(full.length);
      return;
    }

    setTyped(0);
    const timer = setInterval(() => {
      setTyped((count) => {
        if (count >= full.length) {
          clearInterval(timer);
          return count;
        }
        return count + 4;
      });
    }, 16);

    return () => clearInterval(timer);
  }, [full, run]);

  // Keep the newest characters in view, like a terminal
  useEffect(() => {
    const el = rawRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [typed]);

  const visible = full.slice(0, typed);
  const done = typed >= full.length;

  const fenceStart = visible.indexOf("```");
  const prose = fenceStart === -1 ? visible : visible.slice(0, fenceStart);
  const fence = fenceStart === -1 ? "" : visible.slice(fenceStart);
  const code = fence.replace(/^```[\w-]*\n?/, "").replace(/\n?```$/, "");

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2" role="group" aria-label="Block to stream">
        {choices.map((option) => (
          <button
            key={option.name}
            onClick={() => {
              setChoice(option.name);
              setRun((n) => n + 1);
            }}
            aria-pressed={choice === option.name}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal",
              choice === option.name
                ? "border-foreground bg-foreground text-background"
                : "border-border text-muted-foreground hover:border-foreground hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        ))}
        <button
          onClick={() => setRun((n) => n + 1)}
          className="ml-auto text-sm text-signal underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none"
        >
          Stream it again
        </button>
      </div>

      <div className="grid overflow-hidden rounded-3xl border md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="flex flex-col border-b bg-foreground text-background md:border-r md:border-b-0">
          <p className="px-5 pt-4 text-sm text-background/60">What the model writes</p>
          <pre
            ref={rawRef}
            className="h-[26rem] overflow-y-auto px-5 pt-3 pb-5 font-mono text-[13px] leading-relaxed whitespace-pre-wrap"
          >
            {prose}
            <span className="text-[#9db0ff]">{fence}</span>
            {!done && <span className="ml-0.5 inline-block h-4 w-2 translate-y-0.5 bg-[#9db0ff]" />}
          </pre>
        </div>

        <div className="flex flex-col bg-background">
          <p className="px-6 pt-4 text-sm text-muted-foreground">What the user sees</p>
          <div className="h-[26rem] overflow-y-auto px-6 pt-3 pb-6">
            <p className="leading-7">{prose.trim()}</p>
            {fenceStart !== -1 && (
              <BlockRenderer
                key={`${choice}-${run}`}
                type={choice}
                code={code}
                fallback={<BlockSkeleton className="my-4" />}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
