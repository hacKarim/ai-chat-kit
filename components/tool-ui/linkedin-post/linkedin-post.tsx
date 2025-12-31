"use client";

import { FC } from "react";
import { ThumbsUp, MessageCircle, Repeat2, Send, ExternalLink } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ActionButtons } from "../shared/action-buttons";
import type { Action } from "../shared/schema";
import type { LinkedInPostData } from "./schema";

interface LinkedInPostProps {
  post: LinkedInPostData;
  className?: string;
  onAction?: (action: string, post: LinkedInPostData) => void;
  responseActions?: Action[];
  onResponseAction?: (actionId: string) => void;
}

export const LinkedInPost: FC<LinkedInPostProps> = ({
  post,
  className,
  onAction,
  responseActions,
  onResponseAction,
}) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)}w`;

    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const formatNumber = (num?: number) => {
    if (!num || num === 0) return "";
    if (num < 1000) return num.toString();
    if (num < 1000000) return `${(num / 1000).toFixed(1)}K`;
    return `${(num / 1000000).toFixed(1)}M`;
  };

  const postUrl = `https://linkedin.com/feed/update/${post.id}`;

  return (
    <div className={cn("w-full max-w-[540px]", className)}>
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        {/* Header */}
        <div className="p-4">
          <div className="flex items-start gap-3 mb-3">
            <a
              href={`https://linkedin.com/in/${post.author.name.toLowerCase().replace(/\s+/g, '-')}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Avatar className="size-12">
                <AvatarImage src={post.author.avatarUrl} alt={post.author.name} />
                <AvatarFallback>{post.author.name[0]}</AvatarFallback>
              </Avatar>
            </a>

            <div className="flex-1 min-w-0">
              <a
                href={`https://linkedin.com/in/${post.author.name.toLowerCase().replace(/\s+/g, '-')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-sm hover:underline hover:text-blue-600"
              >
                {post.author.name}
              </a>
              {post.author.headline && (
                <div className="text-xs text-muted-foreground line-clamp-2">
                  {post.author.headline}
                </div>
              )}
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                {post.createdAt && (
                  <>
                    <span>{formatDate(post.createdAt)}</span>
                    <span>·</span>
                  </>
                )}
                <svg className="size-3" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zM3 8a5 5 0 0 1 5-5v10a5 5 0 0 1-5-5z" />
                </svg>
              </div>
            </div>

            <a
              href={postUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-muted-foreground hover:text-foreground"
            >
              <ExternalLink className="size-4" />
            </a>
          </div>

          {/* Text content */}
          {post.text && (
            <p className="text-sm leading-relaxed whitespace-pre-wrap mb-3">
              {post.text}
            </p>
          )}
        </div>

        {/* Media */}
        {post.media && post.media.length > 0 && (
          <div className="mb-0">
            {post.media[0].type === "video" ? (
              <video
                src={post.media[0].url}
                controls
                className="w-full h-auto"
              />
            ) : (
              <img
                src={post.media[0].url}
                alt={post.media[0].alt || ""}
                className="w-full h-auto"
              />
            )}
          </div>
        )}

        {/* Link Preview */}
        {post.linkPreview && (
          <a
            href={post.linkPreview.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block border-t border-border hover:bg-accent transition-colors"
          >
            {post.linkPreview.imageUrl && (
              <img
                src={post.linkPreview.imageUrl}
                alt=""
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-3">
              {post.linkPreview.title && (
                <div className="font-semibold text-sm mb-1 line-clamp-2">
                  {post.linkPreview.title}
                </div>
              )}
              {post.linkPreview.domain && (
                <div className="text-xs text-muted-foreground">
                  {post.linkPreview.domain}
                </div>
              )}
            </div>
          </a>
        )}

        {/* Stats */}
        {post.stats && (post.stats.likes || post.stats.comments) && (
          <div className="px-4 py-2 border-y border-border text-xs text-muted-foreground flex items-center justify-between">
            {post.stats.likes && post.stats.likes > 0 && (
              <div className="flex items-center gap-1">
                <div className="size-4 rounded-full bg-blue-600 flex items-center justify-center">
                  <ThumbsUp className="size-2.5 text-white fill-white" />
                </div>
                <span>{formatNumber(post.stats.likes) || post.stats.likes}</span>
              </div>
            )}
            {post.stats.comments && post.stats.comments > 0 && (
              <span>{post.stats.comments} comments</span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-around px-2 py-1 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 hover:bg-accent flex-1 py-3"
            onClick={() => onAction?.("like", post)}
          >
            <ThumbsUp className="size-5" />
            <span className="text-sm font-medium">Like</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 hover:bg-accent flex-1 py-3"
            onClick={() => onAction?.("comment", post)}
          >
            <MessageCircle className="size-5" />
            <span className="text-sm font-medium">Comment</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 hover:bg-accent flex-1 py-3"
            onClick={() => onAction?.("repost", post)}
          >
            <Repeat2 className="size-5" />
            <span className="text-sm font-medium">Repost</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 hover:bg-accent flex-1 py-3"
            onClick={() => onAction?.("send", post)}
          >
            <Send className="size-5" />
            <span className="text-sm font-medium">Send</span>
          </Button>
        </div>
      </div>

      {responseActions && responseActions.length > 0 && (
        <div className="mt-3">
          <ActionButtons actions={responseActions} onAction={onResponseAction} />
        </div>
      )}
    </div>
  );
};
