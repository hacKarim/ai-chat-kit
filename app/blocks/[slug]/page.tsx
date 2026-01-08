import fs from "node:fs/promises";
import path from "node:path";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { blocks, findBlock } from "@/components/tool-ui/registry";
import { BlockPlayground } from "@/components/playground/block-playground";
import { CopyButton } from "@/components/playground/copy-button";
import { exampleJson } from "@/lib/demo/examples";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return blocks.map((block) => ({ slug: block.name }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const block = findBlock(slug);
  return { title: block ? `${block.title} | AI chat kit` : "AI chat kit" };
}

export default async function BlockPage({ params }: Params) {
  const { slug } = await params;
  const block = blocks.find((candidate) => candidate.name === slug);
  if (!block) notFound();

  const contract = await fs.readFile(
    path.join(process.cwd(), "prompts", "components", `${block.name}.md`),
    "utf8",
  );
  const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const install = `npx shadcn@latest add ${site}/r/${block.name}.json`;

  return (
    <article>
      <header className="pb-8">
        <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">
          {block.title}
        </h1>
        <p className="mt-3 max-w-2xl text-lg leading-8 text-muted-foreground">
          {block.description}
        </p>
        <p className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-muted-foreground">
          <span>
            Fence: <code className="font-mono text-foreground">{"```" + block.name}</code>
          </span>
          {block.aliases && (
            <span>
              Also accepts: <code className="font-mono">{block.aliases.join(", ")}</code>
            </span>
          )}
          {block.interactive && <span>Replies to the conversation</span>}
        </p>
      </header>

      <BlockPlayground key={block.name} name={block.name} initial={exampleJson(block.name)} />

      <section className="mt-14">
        <h2 className="font-display text-2xl font-semibold tracking-tight">Add it to your app</h2>
        <div className="mt-4 flex items-center justify-between gap-4 rounded-2xl border px-5 py-3">
          <code className="overflow-x-auto font-mono text-sm whitespace-nowrap">{install}</code>
          <CopyButton text={install} />
        </div>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          Or copy <code className="font-mono">components/tool-ui/{block.name}</code> from the
          repository. The component only depends on shadcn primitives.
        </p>
      </section>

      <section className="mt-14">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-2xl font-semibold tracking-tight">
            What you tell the model
          </h2>
          <CopyButton text={contract} label="Copy contract" />
        </div>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          Paste this into your system prompt. It is the whole integration: the model learns
          the fence name and the fields, and the renderer does the rest.
        </p>
        <pre className="mt-4 max-h-[32rem] overflow-auto rounded-2xl bg-muted px-5 py-4 font-mono text-[13px] leading-relaxed whitespace-pre-wrap">
          {contract}
        </pre>
      </section>
    </article>
  );
}
