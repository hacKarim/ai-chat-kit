"use client";

import { FC, useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FileText, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RetrieverResource } from "@/lib/dify/types";

interface MessageSourcesProps {
  sources: RetrieverResource[];
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

  // Get unique sources by document_id (avoid duplicates)
  const uniqueSources = sources.reduce((acc, source) => {
    if (!acc.find(s => s.document_id === source.document_id)) {
      acc.push(source);
    }
    return acc;
  }, [] as RetrieverResource[]);

  // Limit to first 5 for compact display
  const displaySources = uniqueSources.slice(0, 5);
  const hasMore = uniqueSources.length > 5;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-[38px] rounded-full px-3 py-2 text-xs font-semibold gap-1.5",
            "hover:bg-token-main-surface-secondary transition-colors cursor-pointer",
            "border-token-border-default bg-token-main-surface-primary",
            "mt-0 mb-0"
          )}
        >
          {/* Overlapping avatars - OpenAI style */}
          <div className="flex flex-row-reverse items-center">
            {displaySources.map((source, index) => (
              <div
                key={source.document_id}
                className={cn(
                  "border-token-main-surface-primary bg-token-main-surface-primary",
                  "flex items-center overflow-hidden rounded-full border-2",
                  "group-hover/footnote:border-token-main-surface-secondary",
                  "relative",
                  index > 0 && "-ms-1 first:me-0"
                )}
              >
                <Avatar className="size-4 border-0">
                  <AvatarImage
                    src={getFaviconUrl(source.document_name)}
                    alt={source.dataset_name}
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
      </PopoverTrigger>

      <PopoverContent
        className="w-[400px] max-h-[500px] overflow-y-auto p-3"
        align="start"
        side="top"
      >
        <div className="space-y-3">
          <h4 className="font-semibold text-sm mb-2">Sources</h4>

          {uniqueSources.map((source, index) => (
            <div
              key={`${source.document_id}-${index}`}
              className="rounded-lg border p-3 space-y-2 hover:bg-accent/50 transition-colors"
            >
              {/* Header with favicon and title */}
              <div className="flex items-start gap-2">
                <Avatar className="size-6 shrink-0 mt-0.5">
                  <AvatarImage
                    src={getFaviconUrl(source.document_name)}
                    alt={source.dataset_name}
                  />
                  <AvatarFallback className="text-[8px]">
                    <FileText className="size-3" />
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">
                    {source.dataset_name}
                  </div>

                  {source.document_name && (
                    <a
                      href={source.document_name.startsWith('http')
                        ? source.document_name
                        : `https://${source.document_name}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 truncate mt-0.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="truncate">{getDomain(source.document_name)}</span>
                      <ExternalLink className="size-3 shrink-0" />
                    </a>
                  )}
                </div>
              </div>

              {/* Content snippet */}
              {source.content && (
                <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                  {source.content}
                </p>
              )}

              {/* Metadata badges */}
              <div className="flex items-center gap-2 flex-wrap">
                {source.score !== undefined && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                    Score: {(source.score * 100).toFixed(0)}%
                  </Badge>
                )}
                {source.hit_count > 0 && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                    Hits: {source.hit_count}
                  </Badge>
                )}
                {source.position !== undefined && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
                    #{source.position}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
