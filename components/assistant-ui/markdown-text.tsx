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

// Import social post components
import { XPost, parseSerializableXPost } from "@/components/tool-ui/x-post";
import { InstagramPost, parseSerializableInstagramPost } from "@/components/tool-ui/instagram-post";
import { LinkedInPost, parseSerializableLinkedInPost } from "@/components/tool-ui/linkedin-post";

// Import tool-ui components
import { DataTable, parseSerializableDataTable } from "@/components/tool-ui/data-table";
import { OptionList, parseSerializableOptionList } from "@/components/tool-ui/option-list";
import { ItemCarousel, parseSerializableItemCarousel } from "@/components/tool-ui/item-carousel";
import { ItemDetail, parseSerializableItemDetail } from "@/components/tool-ui/item-detail";
import { Chart, parseSerializableChart } from "@/components/tool-ui/chart";
import { LinkPreview, parseSerializableLinkPreview } from "@/components/tool-ui/link-preview";
import { Plan, parseSerializablePlan } from "@/components/tool-ui/plan";
import { Image, parseSerializableImage } from "@/components/tool-ui/image";
import { Maps, parseSerializableMaps } from "@/components/tool-ui/maps";
import { Dashboard, parseSerializableDashboard } from "@/components/tool-ui/dashboard";
import { FileDownload, parseSerializableFileDownload } from "@/components/tool-ui/file-download";
import { RecordButton, parseSerializableRecordButton } from "@/components/tool-ui/record-button";
import { NextBestAction, parseSerializableNextBestAction } from "@/components/tool-ui/next-best-action";

// Remark plugin to transform social post code blocks
const remarkSocialPosts: Plugin = () => {
  return (tree: any) => {
    visit(tree, "code", (node: any, index: number | undefined, parent: any) => {
      const language = node.lang;
      const socialPostTypes = [
        'x-post', 'x_post', 'twitter-post', 'twitter_post', 'instagram-post', 'instagram_post', 'linkedin-post', 'linkedin_post',
        'data-table', 'data_table', 'option-list', 'option_list', 'detect', 'item-carousel', 'item_carousel', 'item-detail', 'item_detail',
        'chart', 'chart_display', 'link-preview', 'link_preview', 'plan', 'image', 'maps', 'directions', 'dashboard', 'file-download', 'file_download',
        'record-button', 'record_button', 'next-best-action', 'next_best_action', 'next-action', 'next_action', 'intent_detection', 'social_media',
        'form'
      ];

      if (socialPostTypes.includes(language) && index !== undefined && parent) {
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

// Preprocess markdown to unescape any escaped backticks
const preprocessMarkdown = (text: string): string => {
  // Unescape backticks that were escaped in JSON responses
  return text.replace(/\\`/g, '`');
};

// Attempt to fix common JSON syntax errors
const sanitizeJSON = (jsonString: string): string => {
  return jsonString
    // Remove trailing commas before closing braces/brackets
    .replace(/,(\s*[}\]])/g, '$1')
    // Replace unescaped newlines in string values
    .replace(/: *"([^"]*)\n([^"]*)"([,}\]])/g, (match, before, after, end) => {
      return `: "${before}\\n${after}"${end}`;
    })
    // Remove any literal newlines within quoted strings (convert to \n)
    .split('\n').map((line, i, arr) => {
      // Check if we're inside a string by counting quotes
      if (i === 0) return line;
      const prevLines = arr.slice(0, i).join('\n');
      const quoteCount = (prevLines.match(/"/g) || []).length;
      const isInsideString = quoteCount % 2 !== 0;
      if (isInsideString) {
        return '\\n' + line;
      }
      return line;
    }).join('');
};

const MarkdownTextImpl = ({ text }: { text?: string }) => {
  // If text prop is provided, use ReactMarkdown directly
  if (text !== undefined) {
    const processedText = preprocessMarkdown(text);
    return (
      <div className="aui-md">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkSocialPosts]}
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
      remarkPlugins={[remarkGfm, remarkSocialPosts]}
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

// Wrapper component for OptionList that connects to the conversation
const InteractiveOptionList: FC<{ data: any }> = ({ data }) => {
  const threadRuntime = useThreadRuntime();
  const optionList = parseSerializableOptionList(data);

  const handleConfirm = (selection: string | string[]) => {
    // Format the selection as a message
    let message: string;
    if (Array.isArray(selection)) {
      // Multiple selections
      const selectedOptions = optionList.options
        .filter(opt => selection.includes(opt.id))
        .map(opt => opt.label);
      message = selectedOptions.join(", ");
    } else {
      // Single selection
      const selectedOption = optionList.options.find(opt => opt.id === selection);
      message = selectedOption?.label || selection;
    }

    // Send the message to the conversation
    threadRuntime.append({
      role: "user",
      content: [{ type: "text", text: message }],
    });
  };

  return <OptionList {...optionList} onConfirm={handleConfirm} />;
};

// Wrapper component for RecordButton that connects to the conversation
const InteractiveRecordButton: FC<{ data: any }> = ({ data }) => {
  const threadRuntime = useThreadRuntime();
  const recordButton = parseSerializableRecordButton(data);
  const message = useMessage();

  // Check if this is the last message in the thread
  const thread = threadRuntime.getState();
  const messages = thread.messages;
  const currentMessageId = message?.id;
  const currentMessageIndex = messages.findIndex((msg) => msg.id === currentMessageId);
  const isLastMessage = currentMessageIndex === messages.length - 1;

  const handleTranscript = (transcript: string) => {
    // Send the transcript to the conversation
    threadRuntime.append({
      role: "user",
      content: [{ type: "text", text: transcript }],
    });
  };

  return <RecordButton {...recordButton} onTranscript={handleTranscript} isActive={isLastMessage} />;
};

// Wrapper component for NextBestAction that connects to the conversation
const InteractiveNextBestAction: FC<{ data: any }> = ({ data }) => {
  const threadRuntime = useThreadRuntime();
  const nextBestAction = parseSerializableNextBestAction(data);

  const handleActionClick = (prompt: string) => {
    // Send the prompt to the conversation
    threadRuntime.append({
      role: "user",
      content: [{ type: "text", text: prompt }],
    });
  };

  return <NextBestAction {...nextBestAction} onActionClick={handleActionClick} />;
};

// Wrapper component for ItemCarousel that connects to the conversation
const InteractiveItemCarousel: FC<{ data: any }> = ({ data }) => {
  const threadRuntime = useThreadRuntime();
  const carousel = parseSerializableItemCarousel(data);

  const handleItemClick = (itemId: string, itemName: string) => {
    // Send the item name to the conversation
    threadRuntime.append({
      role: "user",
      content: [{ type: "text", text: itemName }],
    });
  };

  const handleActionClick = (prompt: string) => {
    // Send the prompt to the conversation
    threadRuntime.append({
      role: "user",
      content: [{ type: "text", text: prompt }],
    });
  };

  return <ItemCarousel {...carousel} onItemClick={handleItemClick} onActionClick={handleActionClick} />;
};

const defaultComponents = memoizeMarkdownComponents({
  // Custom renderer for social post blocks
  // @ts-ignore - custom HTML element from remark plugin
  "social-post-block": function SocialPostBlockRenderer(props: any) {
    const type = props['data-type'];
    const encodedContent = props['data-content'];

    if (!type || !encodedContent) {
      return null;
    }

    try {
      // Decode the content
      const content = decodeURIComponent(atob(encodedContent));

      let data;
      try {
        data = JSON.parse(content);
      } catch (parseError) {
        // Try to sanitize and fix common JSON issues
        try {
          const sanitizedContent = sanitizeJSON(content);
          data = JSON.parse(sanitizedContent);
        } catch (secondError) {
          // Silently fail - return null so component doesn't render
          return null;
        }
      }

      // Render based on type
      switch (type) {
        case 'x-post':
        case 'x_post':
        case 'twitter-post':
        case 'twitter_post':
          const xPost = parseSerializableXPost(data);
          return (
            <div className="not-prose my-4">
              <XPost post={xPost} />
            </div>
          );

        case 'instagram-post':
        case 'instagram_post':
          const igPost = parseSerializableInstagramPost(data);
          return (
            <div className="not-prose my-4">
              <InstagramPost post={igPost} />
            </div>
          );

        case 'linkedin-post':
        case 'linkedin_post':
          const liPost = parseSerializableLinkedInPost(data);
          return (
            <div className="not-prose my-4">
              <LinkedInPost post={liPost} />
            </div>
          );

        case 'social_media':
          // Transform social_media format to platform-specific format
          const platform = data.platform?.toLowerCase();
          const transformedData = {
            id: data.id || crypto.randomUUID(),
            author: data.author || {
              name: "Acme",
              handle: data.platform === 'instagram' ? '@acme' : 'acme',
              avatarUrl: '',
              verified: true
            },
            text: data.caption || data.text || '',
            media: data.elements?.image_concept ? [{ type: 'image', url: '', alt: data.elements.image_concept }] : undefined,
            stats: data.stats,
            createdAt: data.createdAt || new Date().toISOString()
          };

          // Route to appropriate platform component
          if (platform === 'instagram') {
            const igPostFromSM = parseSerializableInstagramPost(transformedData);
            return (
              <div className="not-prose my-4">
                <InstagramPost post={igPostFromSM} />
              </div>
            );
          } else if (platform === 'linkedin') {
            const liPostFromSM = parseSerializableLinkedInPost(transformedData);
            return (
              <div className="not-prose my-4">
                <LinkedInPost post={liPostFromSM} />
              </div>
            );
          } else if (platform === 'twitter' || platform === 'x') {
            const xPostFromSM = parseSerializableXPost(transformedData);
            return (
              <div className="not-prose my-4">
                <XPost post={xPostFromSM} />
              </div>
            );
          }
          // Default to Instagram if platform not specified
          const defaultPost = parseSerializableInstagramPost(transformedData);
          return (
            <div className="not-prose my-4">
              <InstagramPost post={defaultPost} />
            </div>
          );

        case 'data-table':
        case 'data_table':
          const dataTable = parseSerializableDataTable(data);
          return (
            <div className="not-prose my-4">
              <DataTable {...dataTable} />
            </div>
          );

        case 'option-list':
        case 'option_list':
        case 'detect':
          return (
            <div className="not-prose my-4">
              <InteractiveOptionList data={data} />
            </div>
          );

        case 'item-carousel':
        case 'item_carousel':
          return (
            <div className="not-prose my-4">
              <InteractiveItemCarousel data={data} />
            </div>
          );

        case 'item-detail':
        case 'item_detail':
          const itemDetail = parseSerializableItemDetail(data);
          return (
            <div className="not-prose my-4">
              <ItemDetail {...itemDetail} />
            </div>
          );

        case 'chart':
        case 'chart_display':
          const chart = parseSerializableChart(data);
          return (
            <div className="not-prose my-4">
              <Chart {...chart} />
            </div>
          );

        case 'link-preview':
        case 'link_preview':
          const linkPreview = parseSerializableLinkPreview(data);
          return (
            <div className="not-prose my-4">
              <LinkPreview {...linkPreview} />
            </div>
          );

        case 'plan':
          const plan = parseSerializablePlan(data);
          return (
            <div className="not-prose my-4">
              <Plan {...plan} />
            </div>
          );

        case 'image':
          const image = parseSerializableImage(data);
          return (
            <div className="not-prose my-4">
              <Image {...image} />
            </div>
          );

        case 'maps':
          const maps = parseSerializableMaps(data);
          return (
            <div className="not-prose my-4">
              <Maps {...maps} />
            </div>
          );

        case 'dashboard':
          const dashboard = parseSerializableDashboard(data);
          return (
            <div className="not-prose my-4">
              <Dashboard {...dashboard} />
            </div>
          );

        case 'file-download':
        case 'file_download':
          const fileDownload = parseSerializableFileDownload(data);
          return (
            <div className="not-prose my-4">
              <FileDownload {...fileDownload} />
            </div>
          );

        case 'record-button':
        case 'record_button':
          return (
            <div className="not-prose my-4">
              <InteractiveRecordButton data={data} />
            </div>
          );

        case 'next-best-action':
        case 'next_best_action':
        case 'next-action':
        case 'next_action':
          return (
            <div className="not-prose my-4">
              <InteractiveNextBestAction data={data} />
            </div>
          );

        case 'intent_detection':
          // Silent component - metadata only, don't render
          return null;

        case 'directions':
          // Silent component - metadata only, don't render
          // The actual directions are shown via the maps component
          return null;

        default:
          return null;
      }
    } catch (error) {
      // Silently fail
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
