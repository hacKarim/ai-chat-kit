"use client";

import { FC, useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { FileText, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Source } from "@/lib/types";

interface MessageSourcesProps {
  sources: Source[];
}

// Extract domain from URL for favicon
const getDomain = (url: string): string => {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    return urlObj.hostname;
  } catch {
    return url;
  }
};

// Get favicon URL using Google's service
const getFaviconUrl = (url: string): string => {
  const domain = getDomain(url);
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
};

export const MessageSources: FC<MessageSourcesProps> = ({ sources }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!sources || sources.length === 0) {
    return null;
  }

  // Get unique sources by id (avoid duplicates)
  const uniqueSources = sources.reduce((acc, source) => {
    if (!acc.find(s => s.id === source.id)) {
      acc.push(source);
    }
    return acc;
  }, [] as Source[]);

  // Limit to first 5 for compact display
  const displaySources = uniqueSources.slice(0, 5);
  const hasMore = uniqueSources.length > 5;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-7 rounded-full px-2.5 py-1 text-xs font-semibold gap-1.5",
            "hover:bg-token-main-surface-secondary transition-colors cursor-pointer",
            "border-token-border-default bg-token-main-surface-primary",
            "mt-0 mb-0"
          )}
        >
          {/* Overlapping avatars - OpenAI style */}
          <div className="flex flex-row-reverse items-center">
            {displaySources.map((source, index) => (
              <div
                key={source.id}
                className={cn(
                  "border-token-main-surface-primary bg-token-main-surface-primary",
                  "flex items-center overflow-hidden rounded-full border-2",
                  "group-hover/footnote:border-token-main-surface-secondary",
                  "relative",
                  index > 0 && "-ms-1 first:me-0"
                )}
              >
                <Avatar className="size-3 border-0">
                  <AvatarImage
                    src={getFaviconUrl(source.url)}
                    alt={source.title}
                    className="duration-200 motion-safe:transition-opacity"
                  />
                  <AvatarFallback className="text-[10px] bg-muted">
                    <FileText className="size-4" />
                  </AvatarFallback>
                </Avatar>
              </div>
            ))}
          </div>

          <span className="text-token-text-secondary text-xs font-semibold">
            {uniqueSources.length} {uniqueSources.length === 1 ? 'Source' : 'Sources'}
          </span>
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Sources ({uniqueSources.length})</SheetTitle>
        </SheetHeader>

        <div className="space-y-3 p-4">
          {uniqueSources.map((source, index) => (
            <div
              key={`${source.id}-${index}`}
              className="rounded-lg border p-3 space-y-2 hover:bg-accent/50 transition-colors"
            >
              {/* Header with favicon and title */}
              <div className="flex items-start gap-2">
                <Avatar className="size-6 shrink-0 mt-0.5">
                  <AvatarImage
                    src={getFaviconUrl(source.url)}
                    alt={source.title}
                  />
                  <AvatarFallback className="text-[8px]">
                    <FileText className="size-3" />
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">
                    {source.title}
                  </div>

                  {source.url && (
                    <a
                      href={source.url.startsWith('http')
                        ? source.url
                        : `https://${source.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 truncate mt-0.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="truncate">{getDomain(source.url)}</span>
                      <ExternalLink className="size-3 shrink-0" />
                    </a>
                  )}
                </div>
              </div>

              {/* Content snippet */}
              {source.snippet && (
                <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                  {source.snippet}
                </p>
              )}

              {/* Metadata badges */}
              <div className="flex items-center gap-2 flex-wrap">
                {source.score !== undefined && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                    Score: {(source.score * 100).toFixed(0)}%
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
};
