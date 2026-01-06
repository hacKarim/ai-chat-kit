import type { ReactNode } from "react";

import { XPost, parseSerializableXPost } from "@/components/tool-ui/x-post";
import { InstagramPost, parseSerializableInstagramPost } from "@/components/tool-ui/instagram-post";
import { LinkedInPost, parseSerializableLinkedInPost } from "@/components/tool-ui/linkedin-post";
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

/**
 * What a block may do to the conversation it lives in.
 * Blocks never import a chat runtime: the host passes these in.
 */
export interface BlockContext {
  /** Send a user message (a picked option, a follow-up prompt, a transcript). */
  send: (text: string) => void;
  /** False once a newer message exists, so one-shot blocks can lock themselves. */
  isLatest: boolean;
}

export interface BlockDefinition {
  /** The fence language the model writes, e.g. ```plan */
  name: string;
  /** Other spellings models tend to produce. */
  aliases?: string[];
  title: string;
  description: string;
  /** True when the block talks back to the conversation. */
  interactive?: boolean;
  render: (data: any, ctx: BlockContext) => ReactNode;
}

export const blocks: BlockDefinition[] = [
  {
    name: "chart",
    aliases: ["chart_display"],
    title: "Chart",
    description: "Bar and line charts from a small series spec.",
    render: (data) => <Chart {...parseSerializableChart(data)} />,
  },
  {
    name: "dashboard",
    title: "Dashboard",
    description: "A grid of metric, comparison, progress and chart tiles.",
    render: (data) => <Dashboard {...parseSerializableDashboard(data)} />,
  },
  {
    name: "data-table",
    aliases: ["data_table"],
    title: "Data table",
    description: "Sortable table with typed columns: status, delta, date, link, badge.",
    render: (data) => <DataTable {...parseSerializableDataTable(data)} />,
  },
  {
    name: "plan",
    title: "Plan",
    description: "A task list with statuses and a progress bar.",
    render: (data) => <Plan {...parseSerializablePlan(data)} />,
  },
  {
    name: "option-list",
    aliases: ["option_list"],
    title: "Option list",
    description: "Single or multiple choice. The pick is sent back as the user's reply.",
    interactive: true,
    render: (data, ctx) => {
      const list = parseSerializableOptionList(data);
      return (
        <OptionList
          {...list}
          onConfirm={(selection: string | string[]) => {
            const ids = Array.isArray(selection) ? selection : [selection];
            const labels = ids.map(
              (id) => list.options.find((option) => option.id === id)?.label ?? id,
            );
            ctx.send(labels.join(", "));
          }}
        />
      );
    },
  },
  {
    name: "next-best-action",
    aliases: ["next_best_action", "next-action", "next_action"],
    title: "Next best action",
    description: "Suggested follow-ups, each one a ready-made prompt.",
    interactive: true,
    render: (data, ctx) => (
      <NextBestAction {...parseSerializableNextBestAction(data)} onActionClick={ctx.send} />
    ),
  },
  {
    name: "item-carousel",
    aliases: ["item_carousel"],
    title: "Item carousel",
    description: "Swipeable cards. Tapping a card or its action continues the conversation.",
    interactive: true,
    render: (data, ctx) => (
      <ItemCarousel
        {...parseSerializableItemCarousel(data)}
        onItemClick={(_id: string, name: string) => ctx.send(name)}
        onActionClick={ctx.send}
      />
    ),
  },
  {
    name: "item-detail",
    aliases: ["item_detail"],
    title: "Item detail",
    description: "One item with image, attributes and description.",
    render: (data) => <ItemDetail {...parseSerializableItemDetail(data)} />,
  },
  {
    name: "image",
    title: "Image",
    description: "Image card with caption, source and a lightbox.",
    render: (data) => <Image {...parseSerializableImage(data)} />,
  },
  {
    name: "link-preview",
    aliases: ["link_preview"],
    title: "Link preview",
    description: "Rich card for a URL.",
    render: (data) => <LinkPreview {...parseSerializableLinkPreview(data)} />,
  },
  {
    name: "maps",
    title: "Directions",
    description: "Route summary with stops, travel mode and a deep link to the map.",
    render: (data) => <Maps {...parseSerializableMaps(data)} />,
  },
  {
    name: "file-download",
    aliases: ["file_download"],
    title: "File download",
    description: "A generated file, ready to download.",
    render: (data) => <FileDownload {...parseSerializableFileDownload(data)} />,
  },
  {
    name: "record-button",
    aliases: ["record_button"],
    title: "Record button",
    description: "Asks the user to record audio. The transcript comes back as their reply.",
    interactive: true,
    render: (data, ctx) => (
      <RecordButton
        {...parseSerializableRecordButton(data)}
        onTranscript={ctx.send}
        isActive={ctx.isLatest}
      />
    ),
  },
  {
    name: "x-post",
    aliases: ["x_post", "twitter-post", "twitter_post"],
    title: "X post",
    description: "Preview of a drafted post.",
    render: (data) => <XPost post={parseSerializableXPost(data)} />,
  },
  {
    name: "instagram-post",
    aliases: ["instagram_post"],
    title: "Instagram post",
    description: "Preview of a drafted post.",
    render: (data) => <InstagramPost post={parseSerializableInstagramPost(data)} />,
  },
  {
    name: "linkedin-post",
    aliases: ["linkedin_post"],
    title: "LinkedIn post",
    description: "Preview of a drafted post.",
    render: (data) => <LinkedInPost post={parseSerializableLinkedInPost(data)} />,
  },
];

/**
 * Fence languages that carry machine-readable metadata for your app.
 * They are swallowed instead of being shown as code.
 */
export const hiddenBlocks = ["meta", "intent_detection", "directions"];

const byLanguage = new Map<string, BlockDefinition>();
for (const block of blocks) {
  byLanguage.set(block.name, block);
  for (const alias of block.aliases ?? []) byLanguage.set(alias, block);
}

export const findBlock = (language: string) => byLanguage.get(language);

/** Every fence language the renderer takes over. */
export const blockLanguages = [...byLanguage.keys(), ...hiddenBlocks];
