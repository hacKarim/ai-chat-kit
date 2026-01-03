"use client";

import { FC } from "react";
import { cn } from "@/lib/utils";
import type { SerializableItemDetail } from "./schema";

interface ItemDetailProps extends SerializableItemDetail {
  className?: string;
}

export const ItemDetail: FC<ItemDetailProps> = ({
  id,
  title,
  subtitle,
  imageUrl,
  sections,
  className,
}) => {
  return (
    <div
      className={cn("flex flex-col gap-4 rounded-lg border border-border bg-card p-4", className)}
      data-tool-ui-id={id}
      data-slot="item-detail"
    >
      {/* Header with image */}
      {(title || subtitle || imageUrl) && (
        <div className="flex flex-col gap-3">
          {imageUrl && (
            <div className="relative aspect-video w-full overflow-hidden rounded-md">
              <img
                src={imageUrl}
                alt={title || "Detail image"}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
          )}
          {(title || subtitle) && (
            <div className="flex flex-col gap-1">
              {title && (
                <h3 className="text-lg font-semibold tracking-tight">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-sm text-muted-foreground">
                  {subtitle}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Sections */}
      <div className="flex flex-col gap-4">
        {sections.map((section) => (
          <div key={section.id} className="flex flex-col gap-2">
            <h4 className="text-sm font-semibold">
              {section.title}
            </h4>
            <ul className="flex flex-col gap-1.5 pl-4">
              {section.items.map((item, index) => (
                <li
                  key={index}
                  className="text-sm leading-relaxed text-muted-foreground list-disc"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};
