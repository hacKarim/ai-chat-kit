"use client";

import { FC } from "react";
import { Heart, MessageCircle, Repeat2, Share, BadgeCheck, ExternalLink } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ActionButtons } from "../shared/action-buttons";
import type { Action } from "../shared/schema";
import type { XPostData } from "./schema";

interface XPostProps {
  post: XPostData;
  className?: string;
  onAction?: (action: string, post: XPostData) => void;
  responseActions?: Action[];
  onResponseAction?: (actionId: string) => void;
}

export const XPost: FC<XPostProps> = ({
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

    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;

    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const formatNumber = (num?: number) => {
    if (!num || num === 0) return "";
    if (num < 1000) return num.toString();
    if (num < 1000000) return `${(num / 1000).toFixed(1)}K`;
    return `${(num / 1000000).toFixed(1)}M`;
  };

  return (
    <div className={cn("w-full max-w-[540px]", className)}>
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-none">
        <PostContent post={post} formatDate={formatDate} formatNumber={formatNumber} onAction={onAction} />
      </div>

      {responseActions && responseActions.length > 0 && (
        <div className="mt-3">
          <ActionButtons actions={responseActions} onAction={onResponseAction} />
        </div>
      )}
    </div>
  );
};

const PostContent: FC<{
  post: XPostData;
  formatDate: (date?: string) => string;
  formatNumber: (num?: number) => string;
  onAction?: (action: string, post: XPostData) => void;
  isQuoted?: boolean;
}> = ({ post, formatDate, formatNumber, onAction, isQuoted = false }) => {
  const postUrl = `https://x.com/${post.author.handle}/status/${post.id}`;

  return (
    <div className={cn("p-4", isQuoted && "border border-border rounded-xl")}>
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <a
          href={`https://x.com/${post.author.handle}`}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0"
        >
          <Avatar className="size-10">
            <AvatarImage src={post.author.avatarUrl} alt={post.author.name} />
            <AvatarFallback>{post.author.name[0]}</AvatarFallback>
          </Avatar>
        </a>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <a
              href={`https://x.com/${post.author.handle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-sm hover:underline truncate"
            >
              {post.author.name}
            </a>
            {post.author.verified && (
              <BadgeCheck className="size-4 text-blue-500 shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-1 text-muted-foreground text-sm">
            <span className="truncate">@{post.author.handle}</span>
            {post.createdAt && (
              <>
                <span>·</span>
                <span>{formatDate(post.createdAt)}</span>
              </>
            )}
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

      {/* Media */}
      {post.media && post.media.length > 0 && (
        <div className="mb-3 rounded-xl overflow-hidden">
          {post.media.length === 1 ? (
            <MediaItem media={post.media[0]} />
          ) : (
            <div className="grid grid-cols-2 gap-0.5">
              {post.media.slice(0, 4).map((item, index) => (
                <MediaItem key={index} media={item} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Link Preview */}
      {post.linkPreview && (
        <a
          href={post.linkPreview.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block mb-3 rounded-xl border border-border overflow-hidden hover:bg-accent transition-colors"
        >
          {post.linkPreview.imageUrl && (
            <img
              src={post.linkPreview.imageUrl}
              alt=""
              className="w-full h-48 object-cover"
            />
          )}
          <div className="p-3">
            <div className="text-xs text-muted-foreground mb-1">
              {post.linkPreview.domain}
            </div>
            {post.linkPreview.title && (
              <div className="font-medium text-sm mb-1 line-clamp-1">
                {post.linkPreview.title}
              </div>
            )}
            {post.linkPreview.description && (
              <div className="text-xs text-muted-foreground line-clamp-2">
                {post.linkPreview.description}
              </div>
            )}
          </div>
        </a>
      )}

      {/* Quoted Post */}
      {post.quotedPost && (
        <div className="mb-3">
          <PostContent
            post={post.quotedPost}
            formatDate={formatDate}
            formatNumber={formatNumber}
            isQuoted
          />
        </div>
      )}

      {/* Stats and Actions */}
      {!isQuoted && (
        <div className="flex items-center gap-6 pt-2 border-t border-border text-muted-foreground">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 hover:text-blue-500 hover:bg-blue-500/10"
            onClick={() => onAction?.("comment", post)}
          >
            <MessageCircle className="size-4" />
            {post.stats?.comments && (
              <span className="text-xs">{formatNumber(post.stats.comments)}</span>
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 hover:text-green-500 hover:bg-green-500/10"
            onClick={() => onAction?.("repost", post)}
          >
            <Repeat2 className="size-4" />
            {post.stats?.shares && (
              <span className="text-xs">{formatNumber(post.stats.shares)}</span>
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 hover:text-pink-500 hover:bg-pink-500/10"
            onClick={() => onAction?.("like", post)}
          >
            <Heart className="size-4" />
            {post.stats?.likes && (
              <span className="text-xs">{formatNumber(post.stats.likes)}</span>
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 hover:text-blue-500 hover:bg-blue-500/10"
            onClick={() => onAction?.("share", post)}
          >
            <Share className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

const MediaItem: FC<{ media: { type: string; url: string; alt?: string } }> = ({
  media,
}) => {
  if (media.type === "video") {
    return (
      <video
        src={media.url}
        controls
        className="w-full h-auto max-h-96 bg-black"
      />
    );
  }

  return (
    <img
      src={media.url}
      alt={media.alt || ""}
      className="w-full h-full object-cover min-h-48"
    />
  );
};
