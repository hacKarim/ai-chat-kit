"use client";

import "@assistant-ui/react-markdown/styles/dot.css";

import {
  type CodeHeaderProps,
  MarkdownTextPrimitive,
  unstable_memoizeMarkdownComponents as memoizeMarkdownComponents,
  useIsMarkdownCodeBlock,
} from "@assistant-ui/react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { type FC, memo, useState } from "react";
import { CheckIcon, CopyIcon } from "lucide-react";
import { visit } from "unist-util-visit";
import type { Plugin } from "unified";

import { TooltipIconButton } from "@/components/assistant-ui/tooltip-icon-button";
import { cn } from "@/lib/utils";

// Import social post components
import { XPost, parseSerializableXPost } from "@/components/tool-ui/x-post";
import { InstagramPost, parseSerializableInstagramPost } from "@/components/tool-ui/instagram-post";
import { LinkedInPost, parseSerializableLinkedInPost } from "@/components/tool-ui/linkedin-post";

// Import tool-ui components
import { DataTable, parseSerializableDataTable } from "@/components/tool-ui/data-table";
import { OptionList, parseSerializableOptionList } from "@/components/tool-ui/option-list";
import { ItemCarousel, parseSerializableItemCarousel } from "@/components/tool-ui/item-carousel";

// Remark plugin to transform social post code blocks
const remarkSocialPosts: Plugin = () => {
  return (tree: any) => {
    visit(tree, "code", (node: any, index: number, parent: any) => {
      const language = node.lang;
      const socialPostTypes = [
        'x-post', 'twitter-post', 'instagram-post', 'linkedin-post',
        'data-table', 'option-list', 'item-carousel'
      ];

      if (socialPostTypes.includes(language)) {
        // Replace the code node with a custom HTML node
        // Use btoa for browser compatibility instead of Buffer
        const encodedContent = btoa(encodeURIComponent(node.value));

        parent.children[index] = {
          type: 'html',
          value: `<social-post-block data-type="${language}" data-content="${encodedContent}"></social-post-block>`,
        };
      }
    });
  };
};

const MarkdownTextImpl = ({ text }: { text?: string }) => {
  // If text prop is provided, use it directly
  // Otherwise, MarkdownTextPrimitive will get text from MessagePrimitive context
  if (text !== undefined) {
    return (
      <MarkdownTextPrimitive
        text={text}
        remarkPlugins={[remarkGfm, remarkSocialPosts]}
        rehypePlugins={[rehypeRaw]}
        className="aui-md"
        components={defaultComponents}
      />
    );
  }

  return (
    <MarkdownTextPrimitive
      remarkPlugins={[remarkGfm, remarkSocialPosts]}
      rehypePlugins={[rehypeRaw]}
      className="aui-md"
      components={defaultComponents}
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

const defaultComponents = memoizeMarkdownComponents({
  // Custom renderer for social post blocks
  "social-post-block": function SocialPostBlockRenderer(props: any) {
    const type = props['data-type'];
    const encodedContent = props['data-content'];

    if (!type || !encodedContent) {
      return null;
    }

    try {
      // Decode the content
      const content = decodeURIComponent(atob(encodedContent));
      const data = JSON.parse(content);

      // Render based on type
      switch (type) {
        case 'x-post':
        case 'twitter-post':
          const xPost = parseSerializableXPost(data);
          return (
            <div className="not-prose my-4">
              <XPost post={xPost} />
            </div>
          );

        case 'instagram-post':
          const igPost = parseSerializableInstagramPost(data);
          return (
            <div className="not-prose my-4">
              <InstagramPost post={igPost} />
            </div>
          );

        case 'linkedin-post':
          const liPost = parseSerializableLinkedInPost(data);
          return (
            <div className="not-prose my-4">
              <LinkedInPost post={liPost} />
            </div>
          );

        case 'data-table':
          const dataTable = parseSerializableDataTable(data);
          return (
            <div className="not-prose my-4">
              <DataTable {...dataTable} />
            </div>
          );

        case 'option-list':
          const optionList = parseSerializableOptionList(data);
          return (
            <div className="not-prose my-4">
              <OptionList {...optionList} />
            </div>
          );

        case 'item-carousel':
          const carousel = parseSerializableItemCarousel(data);
          return (
            <div className="not-prose my-4">
              <ItemCarousel {...carousel} />
            </div>
          );

        default:
          return null;
      }
    } catch (error) {
      return null;
    }
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
        "aui-md-p mt-5 mb-5 leading-7 first:mt-0 last:mb-0 rounded-2xl overflow-hidden",
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
        "aui-md-pre overflow-x-auto !rounded-t-none rounded-b-lg bg-black p-4 text-white",
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
