"use client";

import { FC } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { SerializableItemCarousel, CarouselItem as Item } from "./schema";

interface ItemCarouselProps extends SerializableItemCarousel {
  className?: string;
  onItemClick?: (itemId: string) => void;
  onItemAction?: (itemId: string, actionId: string) => void;
}

export const ItemCarousel: FC<ItemCarouselProps> = ({
  id,
  items,
  className,
  onItemClick,
  onItemAction,
}) => {
  if (items.length === 0) {
    return (
      <div
        className={cn(
          "w-full rounded-lg border border-border bg-card p-8 text-center",
          className
        )}
        data-tool-ui-id={id}
        data-slot="item-carousel"
      >
        <p className="text-muted-foreground">No items to display</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid auto-cols-max grid-flow-col gap-4 overflow-x-auto overscroll-x-contain p-0 snap-x snap-mandatory",
        className
      )}
      role="list"
      style={{ scrollPaddingInline: "1rem" }}
      data-tool-ui-id={id}
      data-slot="item-carousel"
    >
      {items.map((item) => (
        <ItemCard
          key={item.id}
          item={item}
          onItemClick={onItemClick}
          onItemAction={onItemAction}
        />
      ))}
    </div>
  );
};

interface ItemCardProps {
  item: Item;
  onItemClick?: (itemId: string) => void;
  onItemAction?: (itemId: string, actionId: string) => void;
}

const ItemCard: FC<ItemCardProps> = ({ item, onItemClick, onItemAction }) => {
  const handleCardClick = () => {
    if (onItemClick) {
      onItemClick(item.id);
    }
  };

  const handleActionClick = (actionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onItemAction) {
      onItemAction(item.id, actionId);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleCardClick();
    }
  };

  return (
    <div
      data-carousel-item="true"
      data-item-id={item.id}
      role="listitem"
      className="flex snap-start snap-always"
    >
      <div
        data-slot="card"
        className={cn(
          "bg-card text-card-foreground border shadow-none",
          "group @container/card relative flex w-44 flex-col gap-0 self-stretch overflow-clip rounded-md p-0",
          "@lg:w-56",
          onItemClick && "cursor-pointer hover:shadow focus-visible:ring-ring focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none touch-manipulation"
        )}
        role={onItemClick ? "button" : undefined}
        tabIndex={onItemClick ? 0 : undefined}
        aria-label={onItemClick ? `View item: ${item.name}` : undefined}
        onClick={onItemClick ? handleCardClick : undefined}
        onKeyDown={onItemClick ? handleKeyDown : undefined}
      >
        {/* Image or Color Block */}
        <div className="bg-muted relative aspect-square w-full overflow-hidden">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div
              className="h-full w-full transition-transform duration-300 group-hover:scale-105"
              role="img"
              aria-label={item.name}
              style={{ backgroundColor: item.color || "#6366f1" }}
            />
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col gap-1 p-3">
          <div className="flex flex-col gap-1">
            <h3 className="line-clamp-2 text-sm leading-tight font-medium">
              {item.name}
            </h3>
            {item.subtitle && (
              <p className="text-muted-foreground line-clamp-1 text-sm">
                {item.subtitle}
              </p>
            )}
          </div>

          {/* Actions */}
          {item.actions && item.actions.length > 0 && (
            <div className="mt-auto flex flex-col-reverse gap-2 pt-2 @[176px]/card:flex-row">
              {item.actions.map((action) => (
                <Button
                  key={action.id}
                  variant={action.variant || "default"}
                  size="sm"
                  disabled={action.disabled}
                  onClick={(e) => handleActionClick(action.id, e)}
                  className={cn(
                    "min-h-11 w-full px-3",
                    "md:min-h-8",
                    "@[176px]/card:h-8 @[176px]/card:w-auto @[176px]/card:flex-1"
                  )}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
