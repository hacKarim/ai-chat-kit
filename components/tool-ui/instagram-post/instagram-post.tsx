"use client";

import { FC, useState } from "react";
import { Heart, MessageCircle, Send, Bookmark, BadgeCheck, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ActionButtons } from "../shared/action-buttons";
import type { Action } from "../shared/schema";
import type { InstagramPostData } from "./schema";

interface InstagramPostProps {
  post: InstagramPostData;
  className?: string;
  onAction?: (action: string, post: InstagramPostData) => void;
  responseActions?: Action[];
  onResponseAction?: (actionId: string) => void;
}

export const InstagramPost: FC<InstagramPostProps> = ({
  post,
  className,
  onAction,
  responseActions,
  onResponseAction,
}) => {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const formatNumber = (num?: number) => {
    if (!num || num === 0) return "0";
    if (num < 1000) return num.toString();
    if (num < 1000000) return `${(num / 1000).toFixed(1)}K`;
    return `${(num / 1000000).toFixed(1)}M`;
  };

  const hasMultipleMedia = post.media && post.media.length > 1;
  const currentMedia = post.media?.[currentMediaIndex];

  const goToPrevious = () => {
    if (!post.media) return;
    setCurrentMediaIndex((prev) => (prev === 0 ? post.media!.length - 1 : prev - 1));
  };

  const goToNext = () => {
    if (!post.media) return;
    setCurrentMediaIndex((prev) => (prev === post.media!.length - 1 ? 0 : prev + 1));
  };

  const postUrl = `https://instagram.com/p/${post.id}`;

  return (
    <div className={cn("w-full max-w-[540px]", className)}>
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-border">
          <div className="flex items-center gap-3">
            <a
              href={`https://instagram.com/${post.author.handle}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Avatar className="size-8">
                <AvatarImage src={post.author.avatarUrl} alt={post.author.name} />
                <AvatarFallback>{post.author.name[0]}</AvatarFallback>
              </Avatar>
            </a>
            <div className="flex items-center gap-1">
              <a
                href={`https://instagram.com/${post.author.handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-sm hover:underline"
              >
                {post.author.handle}
              </a>
              {post.author.verified && (
                <BadgeCheck className="size-3.5 text-blue-500" />
              )}
            </div>
          </div>

          <a
            href={postUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="size-4" />
          </a>
        </div>

        {/* Media */}
        {post.media && post.media.length > 0 && (
          <div className="relative aspect-square bg-muted">
            {currentMedia?.type === "video" ? (
              <video
                src={currentMedia.url}
                controls
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={currentMedia?.url}
                alt={currentMedia?.alt || ""}
                className="w-full h-full object-cover"
              />
            )}

            {/* Carousel controls */}
            {hasMultipleMedia && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full size-8"
                  onClick={goToPrevious}
                >
                  <ChevronLeft className="size-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full size-8"
                  onClick={goToNext}
                >
                  <ChevronRight className="size-4" />
                </Button>

                {/* Carousel dots */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {post.media.map((_, index) => (
                    <div
                      key={index}
                      className={cn(
                        "size-1.5 rounded-full transition-all",
                        index === currentMediaIndex
                          ? "bg-white w-4"
                          : "bg-white/50"
                      )}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="p-3 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="hover:text-pink-500 hover:bg-transparent p-0"
                onClick={() => onAction?.("like", post)}
              >
                <Heart className="size-6" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="hover:text-foreground hover:bg-transparent p-0"
                onClick={() => onAction?.("comment", post)}
              >
                <MessageCircle className="size-6" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="hover:text-foreground hover:bg-transparent p-0"
                onClick={() => onAction?.("share", post)}
              >
                <Send className="size-6" />
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="hover:text-foreground hover:bg-transparent p-0"
              onClick={() => onAction?.("save", post)}
            >
              <Bookmark className="size-6" />
            </Button>
          </div>

          {/* Likes count */}
          {post.stats?.likes !== undefined && post.stats.likes > 0 && (
            <div className="font-semibold text-sm">
              {formatNumber(post.stats.likes)} likes
            </div>
          )}

          {/* Caption */}
          {post.text && (
            <div className="text-sm">
              <span className="font-semibold mr-2">{post.author.handle}</span>
              <span className="whitespace-pre-wrap">{post.text}</span>
            </div>
          )}

          {/* Timestamp */}
          {post.createdAt && (
            <div className="text-xs text-muted-foreground">
              {formatDate(post.createdAt)}
            </div>
          )}
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
