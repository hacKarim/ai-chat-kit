import Link from "next/link";
import { SiteHeader } from "@/components/playground/site-header";
import { StreamDemo } from "@/components/playground/stream-demo";
import { blocks } from "@/components/tool-ui/registry";

const pieces = [
  {
    title: "A thread that streams",
    body: "Messages, edits, branches, attachments, follow-up suggestions and auto-scroll that stops when the reader scrolls up.",
  },
  {
    title: "Voice, both ways",
    body: "Push to talk, or hands-free with silence detection and barge-in: start speaking and the spoken reply stops.",
  },
  {
    title: "Work in progress, shown",
    body: "Reasoning that folds away, workflow steps with timings, and the sources an answer was built on.",
  },
];

export default function Home() {
  return (
    <div className="min-h-dvh">
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl px-6 pb-24">
        <section className="pt-10 pb-12 md:pt-16">
          <h1 className="max-w-4xl font-display text-5xl leading-[1.02] font-semibold tracking-tight text-balance md:text-7xl">
            The model writes a fenced block. The chat shows a component.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            A chat UI kit for LLM apps, built on React, assistant-ui and shadcn. No tool calls
            and no special API: any model that can write Markdown can draw a chart, ask a
            question with buttons, or lay out a plan.
          </p>
        </section>

        <StreamDemo />

        <section className="mt-24 grid gap-x-16 gap-y-10 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <div>
            <h2 className="font-display text-3xl font-semibold tracking-tight">
              {blocks.length} blocks
            </h2>
            <p className="mt-3 leading-7 text-muted-foreground">
              Each one is a plain React component with a forgiving parser and a prompt
              contract you paste into your system prompt. Open one to edit its JSON live.
            </p>
          </div>
          <ul className="grid gap-x-10 sm:grid-cols-2">
            {blocks.map((block) => (
              <li key={block.name} className="border-t">
                <Link
                  href={`/blocks/${block.name}`}
                  className="group block py-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
                >
                  <span className="flex items-baseline justify-between gap-4">
                    <span className="font-medium group-hover:text-signal">{block.title}</span>
                    <code className="font-mono text-xs text-muted-foreground">
                      {"```"}
                      {block.name}
                    </code>
                  </span>
                  <span className="mt-1 block text-sm leading-6 text-muted-foreground">
                    {block.description}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-24 grid gap-x-16 gap-y-10 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <div>
            <h2 className="font-display text-3xl font-semibold tracking-tight">
              Around the blocks
            </h2>
            <p className="mt-3 leading-7 text-muted-foreground">
              The rest of the chat screen, wired to your backend through three small
              functions.
            </p>
            <Link
              href="/chat"
              className="mt-6 inline-flex rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:bg-signal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
            >
              Open the chat demo
            </Link>
          </div>
          <dl className="grid gap-8">
            {pieces.map((piece) => (
              <div key={piece.title} className="border-t pt-4">
                <dt className="font-medium">{piece.title}</dt>
                <dd className="mt-1 max-w-xl leading-7 text-muted-foreground">{piece.body}</dd>
              </div>
            ))}
          </dl>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-2 px-6 py-6 text-sm text-muted-foreground">
          <span>MIT licensed. The demo runs on a scripted model, with no network calls.</span>
          <a
            href="https://github.com/hacKarim/ai-chat-kit"
            className="underline-offset-4 hover:text-foreground hover:underline"
          >
            Source on GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}
