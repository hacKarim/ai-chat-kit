"use client";

import "@assistant-ui/react-markdown/styles/dot.css";

import {
  type CodeHeaderProps,
  MarkdownTextPrimitive,
  unstable_memoizeMarkdownComponents as memoizeMarkdownComponents,
  useIsMarkdownCodeBlock,
} from "@assistant-ui/react-markdown";
import { useThreadRuntime, useMessage } from "@assistant-ui/react";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import ReactMarkdown from "react-markdown";
import { type FC, memo, useState } from "react";
import { CheckIcon, CopyIcon } from "lucide-react";
import { visit } from "unist-util-visit";
import type { Plugin } from "unified";

import { TooltipIconButton } from "@/components/assistant-ui/tooltip-icon-button";
import { cn } from "@/lib/utils";

import { BlockRenderer, BlockSkeleton } from "@/components/tool-ui/block-renderer";
import { blockLanguages } from "@/components/tool-ui/registry";

// Remark plugin: a fenced block whose language is a known block name
// (```plan, ```chart, ...) becomes an <answer-block> element instead of code.
const remarkAnswerBlocks: Plugin = () => {
  return (tree: any) => {
    visit(tree, "code", (node: any, index: number | undefined, parent: any) => {
      const language = node.lang;

      if (blockLanguages.includes(language) && index !== undefined && parent) {
        // btoa keeps the JSON intact through the HTML attribute
        const encodedContent = btoa(encodeURIComponent(node.value));

        parent.children[index] = {
          type: "html",
          value: `<answer-block data-type="${language}" data-content="${encodedContent}"></answer-block>`,
        };
      }
    });
  };
};

// Preprocess markdown to unescape any escaped backticks
const preprocessMarkdown = (text: string): string => {
  // Unescape backticks that were escaped in JSON responses
  return text.replace(/\\`/g, '`');
};

const MarkdownTextImpl = ({ text }: { text?: string }) => {
  // If text prop is provided, use ReactMarkdown directly
  if (text !== undefined) {
    const processedText = preprocessMarkdown(text);
    return (
      <div className="aui-md">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkAnswerBlocks]}
          rehypePlugins={[rehypeRaw as any]}
          components={defaultComponents as any}
        >
          {processedText}
        </ReactMarkdown>
      </div>
    );
  }

  // Otherwise, get text from context using MarkdownTextPrimitive
  return (
    <MarkdownTextPrimitive
      remarkPlugins={[remarkGfm, remarkAnswerBlocks]}
      rehypePlugins={[rehypeRaw]}
      className="aui-md"
      components={defaultComponents}
      preprocess={preprocessMarkdown}
    />
  );
};

export const MarkdownText = memo(MarkdownTextImpl);

const CodeHeader: FC<CodeHeaderProps> = ({ language, code }) => {
  const { isCopied, copyToClipboard } = useCopyToClipboard();
  const onCopy = () => {
    if (!code || isCopied) return;
    copyToClipboard(code);
  };

  return (
    <div className="aui-code-header-root mt-4 flex items-center justify-between gap-4 rounded-t-lg bg-muted-foreground/15 px-4 py-2 text-sm font-semibold text-foreground dark:bg-muted-foreground/20">
      <span className="aui-code-header-language lowercase [&>span]:text-xs">
        {language}
      </span>
      <TooltipIconButton tooltip="Copy" onClick={onCopy}>
        {!isCopied && <CopyIcon />}
        {isCopied && <CheckIcon />}
      </TooltipIconButton>
    </div>
  );
};

const useCopyToClipboard = ({
  copiedDuration = 3000,
}: {
  copiedDuration?: number;
} = {}) => {
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const copyToClipboard = (value: string) => {
    if (!value) return;

    navigator.clipboard.writeText(value).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), copiedDuration);
    });
  };

  return { isCopied, copyToClipboard };
};

// Connects a block to the conversation it was rendered in
const ThreadBlock: FC<{ type: string; code: string }> = ({ type, code }) => {
  const threadRuntime = useThreadRuntime();
  const message = useMessage();

  const messages = threadRuntime.getState().messages;
  const isLatest = messages[messages.length - 1]?.id === message?.id;
  const isStreaming = message?.status?.type === "running";

  const send = (text: string) => {
    threadRuntime.append({
      role: "user",
      content: [{ type: "text", text }],
    });
  };

  return (
    <BlockRenderer
      type={type}
      code={code}
      send={send}
      isLatest={isLatest}
      // Half-written JSON while the answer streams: hold the space
      fallback={isStreaming ? <BlockSkeleton className="my-4" /> : null}
    />
  );
};

const defaultComponents = memoizeMarkdownComponents({
  // @ts-expect-error - custom HTML element from the remark plugin
  "answer-block": function AnswerBlock(props: any) {
    const type = props["data-type"];
    const encodedContent = props["data-content"];

    if (!type || !encodedContent) {
      return null;
    }

    let code: string;
    try {
      code = decodeURIComponent(atob(encodedContent));
    } catch {
      return null;
    }

    return <ThreadBlock type={type} code={code} />;
  },
  h1: ({ className, ...props }) => (
    <h1
      className={cn(
        "aui-md-h1 mb-8 scroll-m-20 text-4xl font-extrabold tracking-tight last:mb-0",
        className,
      )}
      {...props}
    />
  ),
  h2: ({ className, ...props }) => (
    <h2
      className={cn(
        "aui-md-h2 mt-8 mb-4 scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0 last:mb-0",
        className,
      )}
      {...props}
    />
  ),
  h3: ({ className, ...props }) => (
    <h3
      className={cn(
        "aui-md-h3 mt-6 mb-4 scroll-m-20 text-2xl font-semibold tracking-tight first:mt-0 last:mb-0",
        className,
      )}
      {...props}
    />
  ),
  h4: ({ className, ...props }) => (
    <h4
      className={cn(
        "aui-md-h4 mt-6 mb-4 scroll-m-20 text-xl font-semibold tracking-tight first:mt-0 last:mb-0",
        className,
      )}
      {...props}
    />
  ),
  h5: ({ className, ...props }) => (
    <h5
      className={cn(
        "aui-md-h5 my-4 text-lg font-semibold first:mt-0 last:mb-0",
        className,
      )}
      {...props}
    />
  ),
  h6: ({ className, ...props }) => (
    <h6
      className={cn(
        "aui-md-h6 my-4 font-semibold first:mt-0 last:mb-0",
        className,
      )}
      {...props}
    />
  ),
  p: ({ className, ...props }) => (
    <p
      className={cn(
        "aui-md-p mt-5 mb-5 leading-7 first:mt-0 last:mb-0 rounded overflow-hidden",
        className,
      )}
      {...props}
    />
  ),
  a: ({ className, ...props }) => (
    <a
      className={cn(
        "aui-md-a font-medium text-primary underline underline-offset-4",
        className,
      )}
      {...props}
    />
  ),
  blockquote: ({ className, ...props }) => (
    <blockquote
      className={cn("aui-md-blockquote border-l-2 pl-6 italic", className)}
      {...props}
    />
  ),
  ul: ({ className, ...props }) => (
    <ul
      className={cn("aui-md-ul my-5 ml-6 list-disc [&>li]:mt-2", className)}
      {...props}
    />
  ),
  ol: ({ className, ...props }) => (
    <ol
      className={cn("aui-md-ol my-5 ml-6 list-decimal [&>li]:mt-2", className)}
      {...props}
    />
  ),
  hr: ({ className, ...props }) => (
    <hr className={cn("aui-md-hr my-5 border-b", className)} {...props} />
  ),
  table: ({ className, ...props }) => (
    <table
      className={cn(
        "aui-md-table my-5 w-full border-separate border-spacing-0 overflow-y-auto",
        className,
      )}
      {...props}
    />
  ),
  th: ({ className, ...props }) => (
    <th
      className={cn(
        "aui-md-th bg-muted px-4 py-2 text-left font-bold first:rounded-tl-lg last:rounded-tr-lg [&[align=center]]:text-center [&[align=right]]:text-right",
        className,
      )}
      {...props}
    />
  ),
  td: ({ className, ...props }) => (
    <td
      className={cn(
        "aui-md-td border-b border-l px-4 py-2 text-left last:border-r [&[align=center]]:text-center [&[align=right]]:text-right",
        className,
      )}
      {...props}
    />
  ),
  tr: ({ className, ...props }) => (
    <tr
      className={cn(
        "aui-md-tr m-0 border-b p-0 first:border-t [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg",
        className,
      )}
      {...props}
    />
  ),
  sup: ({ className, ...props }) => (
    <sup
      className={cn("aui-md-sup [&>a]:text-xs [&>a]:no-underline", className)}
      {...props}
    />
  ),
  pre: ({ className, ...props }) => (
    <pre
      className={cn(
        "aui-md-pre overflow-x-auto  rounded-b-lg  p-4",
        className,
      )}
      {...props}
    />
  ),
  code: function Code({ className, ...props }) {
    const isCodeBlock = useIsMarkdownCodeBlock();
    return (
      <code
        className={cn(
          !isCodeBlock &&
            "aui-md-inline-code rounded border bg-muted font-semibold",
          className,
        )}
        {...props}
      />
    );
  },
  CodeHeader,
});
