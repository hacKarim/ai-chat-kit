"use client";

import { Component, type FC, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { findBlock, hiddenBlocks, type BlockContext } from "./registry";

/**
 * Models write almost-JSON. Repair the usual slips before giving up:
 * trailing commas and raw line breaks inside strings.
 */
export const sanitizeJSON = (jsonString: string): string => {
  return jsonString
    // Remove trailing commas before closing braces/brackets
    .replace(/,(\s*[}\]])/g, "$1")
    // Escape literal newlines that sit inside a quoted string
    .split("\n")
    .map((line, i, arr) => {
      if (i === 0) return line;
      const prevLines = arr.slice(0, i).join("\n");
      const quoteCount = (prevLines.match(/(?<!\\)"/g) || []).length;
      return quoteCount % 2 !== 0 ? "\\n" + line : line;
    })
    .join("");
};

export type ParsedBlock =
  | { ok: true; data: any }
  | { ok: false; error: string };

export const parseBlock = (code: string): ParsedBlock => {
  try {
    return { ok: true, data: JSON.parse(code) };
  } catch (firstError) {
    try {
      return { ok: true, data: JSON.parse(sanitizeJSON(code)) };
    } catch {
      return { ok: false, error: (firstError as Error).message };
    }
  }
};

/** A block that throws must not take the whole message down with it. */
class BlockBoundary extends Component<
  { children: ReactNode; fallback: ReactNode; resetKey: string },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidUpdate(prev: { resetKey: string }) {
    if (prev.resetKey !== this.props.resetKey && this.state.failed) {
      this.setState({ failed: false });
    }
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export const BlockSkeleton: FC<{ className?: string }> = ({ className }) => (
  <div
    className={cn(
      "h-28 w-full max-w-2xl animate-pulse rounded-2xl border bg-muted/60",
      className,
    )}
    aria-hidden
  />
);

export interface BlockRendererProps extends Partial<BlockContext> {
  /** The fence language: `plan`, `chart`, ... */
  type: string;
  /** The raw text inside the fence. */
  code: string;
  /** Shown while the JSON is incomplete (streaming) or invalid. Defaults to nothing. */
  fallback?: ReactNode;
  className?: string;
}

const noop = () => {};

/**
 * Turns one fenced block into its component.
 * Pure: no chat runtime, no network. Give it `send` to make interactive blocks talk back.
 */
export const BlockRenderer: FC<BlockRendererProps> = ({
  type,
  code,
  send = noop,
  isLatest = true,
  fallback = null,
  className,
}) => {
  if (hiddenBlocks.includes(type)) return null;

  const block = findBlock(type);
  if (!block) return null;

  const parsed = parseBlock(code);
  if (!parsed.ok) return <>{fallback}</>;

  return (
    <BlockBoundary fallback={fallback} resetKey={code}>
      <div className={cn("not-prose my-4", className)} data-block={block.name}>
        {block.render(parsed.data, { send, isLatest })}
      </div>
    </BlockBoundary>
  );
};
