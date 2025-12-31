/* eslint-disable @next/next/no-img-element */
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  RATIO_CLASS_MAP,
  getFitClass,
  OVERLAY_GRADIENT,
  sanitizeHref,
} from "../shared/media";
import type { SerializableImage, Source } from "./schema";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { X } from "lucide-react";

const FALLBACK_LOCALE = "en-US";

function ImageProgress() {
  return (
    <div className="flex w-full motion-safe:animate-pulse flex-col gap-3 p-5">
      <div className="flex items-center gap-3 text-xs">
        <div className="bg-muted h-6 w-6 rounded-full" />
        <div className="bg-muted h-3 w-28 rounded" />
      </div>
      <div className="bg-muted h-40 w-full rounded" />
      <div className="bg-muted h-4 w-3/4 rounded" />
    </div>
  );
}

export interface ImageProps extends SerializableImage {
  className?: string;
  isLoading?: boolean;
  onNavigate?: (href: string, image: SerializableImage) => void;
}

export function Image(props: ImageProps) {
  const {
    className,
    isLoading,
    onNavigate,
    ...serializable
  } = props;

  const {
    id,
    src,
    alt,
    title,
    href: rawHref,
    domain,
    ratio = "auto",
    fit = "contain",
    source,
    locale: providedLocale,
  } = serializable;

  const [isFullscreenOpen, setIsFullscreenOpen] = React.useState(false);

  const locale = providedLocale ?? FALLBACK_LOCALE;
  const sanitizedHref = sanitizeHref(rawHref);
  const resolvedSourceUrl = sanitizeHref(source?.url);

  const imageData: SerializableImage = {
    ...serializable,
    href: sanitizedHref,
    source: source
      ? { ...source, url: resolvedSourceUrl }
      : undefined,
    locale,
  };

  const sourceLabel = source?.label ?? domain;
  const fallbackInitial = (sourceLabel ?? "").trim().charAt(0).toUpperCase();
  const hasSource = Boolean(sourceLabel || source?.iconUrl);

  const handleSourceClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const targetUrl = resolvedSourceUrl ?? source?.url ?? sanitizedHref ?? src;
    if (!targetUrl) return;
    if (onNavigate) {
      onNavigate(targetUrl, imageData);
    } else if (typeof window !== "undefined") {
      window.open(targetUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleImageClick = () => {
    // Open fullscreen modal instead of new tab
    setIsFullscreenOpen(true);
  };

  return (
    <>
      <article
        className={cn("relative w-full min-w-80 max-w-md", className)}
        lang={locale}
        aria-busy={isLoading}
        data-tool-ui-id={id}
        data-slot="image"
      >
        <div
          className={cn(
            "group @container relative isolate flex w-full min-w-0 flex-col overflow-hidden rounded-xl",
            "border border-border bg-card text-sm shadow-xs",
          )}
        >
          {isLoading ? (
            <ImageProgress />
          ) : (
            <div
              className={cn(
                "bg-muted group relative w-full overflow-hidden cursor-pointer",
                ratio !== "auto" ? RATIO_CLASS_MAP[ratio] : "min-h-[160px]",
              )}
              onClick={handleImageClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleImageClick();
                }
              }}
            >
              <img
                src={src}
                alt={alt}
                loading="lazy"
                decoding="async"
                className={cn(
                  "absolute inset-0 h-full w-full",
                  getFitClass(fit),
                  "transition-transform duration-300 group-hover:scale-[1.01]",
                )}
              />
              {(title || hasSource) && (
                <>
                  <div
                    className="pointer-events-none absolute inset-x-0 top-0 z-20 h-32 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                    style={{ backgroundImage: OVERLAY_GRADIENT }}
                  />
                  <div className="absolute inset-x-0 top-0 z-30 flex items-start justify-between gap-3 px-5 pt-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                      {title && (
                        <div className="line-clamp-2 font-semibold text-white drop-shadow-sm">
                          {title}
                        </div>
                      )}
                      {hasSource && (
                        <SourceAttribution
                          source={source}
                          sourceLabel={sourceLabel}
                          fallbackInitial={fallbackInitial}
                          hasClickableUrl={Boolean(resolvedSourceUrl)}
                          onSourceClick={handleSourceClick}
                        />
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </article>

      {/* Fullscreen Modal */}
      <Dialog open={isFullscreenOpen} onOpenChange={setIsFullscreenOpen}>
        <DialogContent
          showCloseButton={false}
          className="!max-w-none !w-screen !h-screen !max-h-screen !p-0 !border-0 !bg-black/95 !top-0 !left-0 !translate-x-0 !translate-y-0 !rounded-none flex items-center justify-center"
        >
          {/* Hidden title for accessibility */}
          <VisuallyHidden>
            <DialogTitle>{title || alt || "Image viewer"}</DialogTitle>
          </VisuallyHidden>

          {/* Close button */}
          <button
            onClick={() => setIsFullscreenOpen(false)}
            className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            aria-label="Close fullscreen"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Image container */}
          <div className="relative w-full h-full flex items-center justify-center p-8">
            <img
              src={src}
              alt={alt}
              className="max-w-full max-h-full object-contain"
            />
          </div>

          {/* Image info overlay at bottom */}
          {(title || hasSource) && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6">
              {title && (
                <h3 className="text-white text-lg font-semibold mb-2">
                  {title}
                </h3>
              )}
              {hasSource && (
                <SourceAttribution
                  source={source}
                  sourceLabel={sourceLabel}
                  fallbackInitial={fallbackInitial}
                  hasClickableUrl={Boolean(resolvedSourceUrl)}
                  onSourceClick={handleSourceClick}
                />
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

interface SourceAttributionProps {
  source?: Source;
  sourceLabel?: string;
  fallbackInitial: string;
  hasClickableUrl: boolean;
  onSourceClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

function SourceAttribution({
  source,
  sourceLabel,
  fallbackInitial,
  hasClickableUrl,
  onSourceClick,
}: SourceAttributionProps) {
  const content = (
    <div className="flex items-center gap-2">
      {source?.iconUrl ? (
        <img
          src={source.iconUrl}
          alt=""
          aria-hidden="true"
          className="h-6 w-6 rounded-full object-cover"
          loading="lazy"
          decoding="async"
        />
      ) : fallbackInitial ? (
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs font-semibold text-white uppercase">
          {fallbackInitial}
        </div>
      ) : null}
      {sourceLabel && (
        <span className="text-sm font-medium text-white/90 drop-shadow-sm">
          {sourceLabel}
        </span>
      )}
    </div>
  );

  if (hasClickableUrl) {
    return (
      <button
        type="button"
        onClick={onSourceClick}
        className="inline-flex w-fit items-center gap-2 text-left focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
      >
        {content}
      </button>
    );
  }

  return <div className="inline-flex w-fit items-center gap-2">{content}</div>;
}
