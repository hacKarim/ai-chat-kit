import type { ChatModelAdapter } from "@assistant-ui/react";
import type { Source, WorkflowNode, WorkflowState } from "@/lib/types";
import { exampleFence } from "./examples";

/**
 * A scripted "model" for the playground. No network, no key.
 * It streams text the way a real one does, so every piece of the kit
 * gets exercised: fenced blocks, reasoning, workflow steps, sources, follow-ups.
 */

interface Reply {
  match: RegExp;
  before: string;
  blocks: string[];
  after?: string;
  /** Show reasoning, workflow steps and sources for this one. */
  research?: boolean;
  suggestions: string[];
}

const replies: Reply[] = [
  {
    match: /incident|table|status/i,
    before: "Three incidents are open right now. The checkout one is the only one still getting worse.",
    blocks: ["data-table"],
    after: "Want me to plan the fix, or draft the status page update?",
    research: true,
    suggestions: ["Plan the fix", "Draft a post about it", "Show release health"],
  },
  {
    match: /plan|migrat|steps|fix/i,
    before: "Here is the plan. Every step can be rolled back until the last one.",
    blocks: ["plan"],
    suggestions: ["Which region should we use?", "Show release health"],
  },
  {
    match: /dashboard|release|health|metric/i,
    before: "Version 4.2 after 24 hours:",
    blocks: ["dashboard"],
    after: "Crash-free sessions are up and latency is down. Rollout is paused at 60%.",
    suggestions: ["Chart signups by week", "List open incidents"],
  },
  {
    match: /chart|signup|graph|week/i,
    before: "Signups over the last six weeks, organic against paid:",
    blocks: ["chart"],
    after: "Organic more than doubled. Paid flattened after week 40.",
    suggestions: ["Show release health", "Export this as a file"],
  },
  {
    match: /region|option|choose|pick|deploy/i,
    before: "Pick a region and I will set it up:",
    blocks: ["option-list"],
    suggestions: [],
  },
  {
    match: /template|carousel|browse/i,
    before: "A few templates you can start from. Tap one to use it.",
    blocks: ["item-carousel"],
    suggestions: ["Tell me about the team plan"],
  },
  {
    match: /team plan|pricing|detail/i,
    before: "The team plan in short:",
    blocks: ["item-detail"],
    suggestions: ["Browse templates"],
  },
  {
    match: /post|tweet|linkedin|social|draft/i,
    before: "Two drafts, one short and one longer:",
    blocks: ["x-post", "linkedin-post"],
    after: "Tell me which one to keep and I will tighten it.",
    suggestions: ["Make an Instagram version", "List open incidents"],
  },
  {
    match: /instagram/i,
    before: "An Instagram version:",
    blocks: ["instagram-post"],
    suggestions: ["Draft a post for X and LinkedIn"],
  },
  {
    match: /direction|route|map|walk|office/i,
    before: "It is a short walk from the station:",
    blocks: ["maps"],
    suggestions: ["Record the stand-up"],
  },
  {
    match: /record|stand-?up|meeting|voice/i,
    before: "Ready when you are.",
    blocks: ["record-button"],
    suggestions: [],
  },
  {
    match: /file|export|download|report|pdf/i,
    before: "The export is ready:",
    blocks: ["file-download"],
    suggestions: ["Chart signups by week"],
  },
  {
    match: /image|picture|diagram/i,
    before: "Here is the current service map:",
    blocks: ["image"],
    suggestions: ["Find the docs for audio recording"],
  },
  {
    match: /link|docs|documentation/i,
    before: "This is the page you want:",
    blocks: ["link-preview"],
    suggestions: ["Record the stand-up"],
  },
];

const fallback: Reply = {
  match: /.*/,
  before:
    "This is a scripted demo, so I only know a few tricks. Each one answers with a component instead of a wall of text. Try one:",
  blocks: ["next-best-action"],
  suggestions: ["List open incidents", "Chart signups by week", "Draft a post", "Pick a region"],
};

const sources: Source[] = [
  { id: "runbook", title: "Checkout runbook", url: "https://example.com/runbooks/checkout", snippet: "If the error rate stays above 2% for ten minutes, page the payments on-call.", score: 0.92 },
  { id: "postmortem", title: "Post-mortem, March outage", url: "https://example.org/postmortems/march", snippet: "The retry storm started when the gateway timeout was raised without changing the client budget.", score: 0.81 },
  { id: "dashboards", title: "Service dashboards", url: "https://example.net/dashboards", snippet: "Error rate, latency and saturation for every public service.", score: 0.67 },
];

const stepTitles = ["Understand the question", "Search the knowledge base", "Query live metrics", "Write the answer"];

const workflow = (done: number, finished = false): WorkflowState => {
  const nodes: WorkflowNode[] = stepTitles.map((title, i) => ({
    id: `step-${i}`,
    title,
    status: i < done ? "completed" : i === done && !finished ? "in_progress" : "pending",
    elapsedTime: i < done ? 0.4 + i * 0.3 : undefined,
  }));
  return {
    workflowRunId: "demo-run",
    status: finished ? "succeeded" : "running",
    currentNode: finished ? null : nodes[Math.min(done, nodes.length - 1)],
    nodes,
    totalSteps: nodes.length,
    completedSteps: Math.min(done, nodes.length),
    elapsedTime: done * 0.6,
    startedAt: null,
    finishedAt: null,
  };
};

const sleep = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve) => {
    const timer = setTimeout(resolve, ms);
    signal.addEventListener("abort", () => {
      clearTimeout(timer);
      resolve();
    });
  });

/** Splits text into token-sized pieces, like a streaming API would. */
const tokenize = (text: string) => text.match(/\s*\S{1,6}/g) ?? [text];

export const mockModel: ChatModelAdapter = {
  async *run({ messages, abortSignal }) {
    const last = messages.at(-1);
    const question =
      last?.content
        .filter((part) => part.type === "text")
        .map((part) => (part as { text: string }).text)
        .join(" ") ?? "";

    const reply = replies.find((candidate) => candidate.match.test(question)) ?? fallback;

    const body = [
      reply.before,
      ...reply.blocks.map((name) => exampleFence(name)),
      reply.after,
    ]
      .filter(Boolean)
      .join("\n\n");

    const extras: any[] = [];
    let reasoning = "";

    if (reply.research) {
      const thought =
        "The user wants the current incidents. I should check the runbook for severity rules, then pull live error rates, and answer with a table so the statuses can be compared at a glance.";
      for (let step = 0; step < stepTitles.length - 1; step++) {
        if (abortSignal.aborted) return;
        reasoning = thought.slice(0, Math.ceil((thought.length * (step + 1)) / 3));
        yield {
          content: [
            { type: "reasoning", text: reasoning },
            { type: "data", name: "workflow", data: workflow(step) },
          ],
        };
        await sleep(650, abortSignal);
      }
      extras.push({ type: "reasoning", text: reasoning });
    }

    let text = "";
    for (const token of tokenize(body)) {
      if (abortSignal.aborted) return;
      text += token;
      yield {
        content: [
          ...extras,
          { type: "text", text },
          ...(reply.research
            ? [{ type: "data", name: "workflow", data: workflow(stepTitles.length - 1) }]
            : []),
        ],
      };
      await sleep(14, abortSignal);
    }

    yield {
      content: [
        ...extras,
        { type: "text", text },
        ...(reply.research
          ? [
              { type: "data", name: "workflow", data: workflow(stepTitles.length, true) },
              { type: "data", name: "sources", data: sources },
            ]
          : []),
        ...(reply.suggestions.length
          ? [{ type: "data", name: "suggestions", data: reply.suggestions }]
          : []),
      ],
    };
  },
};

/** Stand-in for a speech-to-text service: waits a moment, returns a fixed sentence. */
export const mockTranscribe = async (_audio: File) => {
  await new Promise((resolve) => setTimeout(resolve, 900));
  return "List the open incidents";
};
