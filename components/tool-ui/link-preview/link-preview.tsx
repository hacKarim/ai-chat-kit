"use client";

import { FC } from "react";
import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";
import { ActionButtons } from "@/components/tool-ui/shared/action-buttons";
import { RATIO_CLASS_MAP, getFitClass } from "@/components/tool-ui/shared/media";
import type { SerializableLinkPreview } from "./schema";

interface LinkPreviewProps extends SerializableLinkPreview {
  className?: string;
  onResponseAction?: (actionId: string) => void;
}

export const LinkPreview: FC<LinkPreviewProps> = ({
  id,
  href,
  title,
  description,
  image,
  domain,
  favicon,
  ratio = "16:9",
  createdAt,
  responseActions,
  className,
  onResponseAction,
}) => {
  return (
    <div
      className={cn("flex flex-col gap-3", className)}
      data-tool-ui-id={id}
      data-slot="link-preview"
    >
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-card text-card-foreground border shadow-sm group block rounded-xl overflow-hidden hover:shadow-md transition-all"
      >
        {/* Preview Image */}
        {image && (
          <div className={cn("relative overflow-hidden bg-muted", RATIO_CLASS_MAP[ratio])}>
            <img
              src={image}
              alt={title || "Link preview"}
              className={cn("w-full h-full object-cover transition-transform duration-300 group-hover:scale-105", getFitClass("cover"))}
              loading="lazy"
            />
          </div>
        )}

        {/* Content */}
        <div className="p-4 space-y-2">
          {/* Domain with favicon */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {favicon && (
              <img src={favicon} alt="" className="w-4 h-4 rounded" />
            )}
            <span>{domain || new URL(href).hostname}</span>
            <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          {/* Title */}
          {title && (
            <h3 className="font-semibold text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">
              {title}
            </h3>
          )}

          {/* Description */}
          {description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {description}
            </p>
          )}

          {/* Created At */}
          {createdAt && (
            <time className="text-xs text-muted-foreground block">
              {new Date(createdAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </time>
          )}
        </div>
      </a>

      {/* Response Actions */}
      {responseActions && responseActions.length > 0 && (
        <ActionButtons
          actions={responseActions}
          onAction={onResponseAction}
        />
      )}
    </div>
  );
};
