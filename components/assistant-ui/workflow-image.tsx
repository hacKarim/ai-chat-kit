"use client";

import { useState } from "react";
import { ExternalLink, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkflowImageProps {
  src: string;
  alt?: string;
  title?: string;
  className?: string;
}

export function WorkflowImage({ src, alt = "Generated image", title, className }: WorkflowImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Extract domain from URL
  const getDomain = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return "";
    }
  };

  const domain = getDomain(src);

  if (hasError) {
    return (
      <div className="my-2 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
        <p>Failed to load image</p>
        <p className="text-xs text-muted-foreground mt-1">{src}</p>
      </div>
    );
  }

  return (
    <div
      className={cn("my-4 group relative inline-block max-w-full", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <a
        href={src}
        target="_blank"
        rel="noopener noreferrer"
        className="block overflow-hidden rounded-lg border bg-muted transition-all hover:border-primary/50"
      >
        {/* Loading skeleton */}
        {!isLoaded && (
          <div className="aspect-video w-full animate-pulse bg-muted" />
        )}

        {/* Actual image */}
        <img
          src={src}
          alt={alt}
          className={cn(
            "max-w-full h-auto object-contain transition-opacity duration-200",
            !isLoaded && "hidden"
          )}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          loading="lazy"
        />

        {/* Hover overlay */}
        {isHovered && isLoaded && (
          <div className="absolute inset-0 bg-black/60 transition-opacity duration-200 flex flex-col items-center justify-center gap-2 p-4">
            <div className="text-center">
              {title && (
                <p className="text-white font-medium text-sm mb-2">{title}</p>
              )}
              <div className="flex items-center gap-2 text-white/80 text-xs">
                <ExternalLink className="h-3 w-3" />
                <span>{domain}</span>
              </div>
            </div>
            <div className="mt-2 rounded-full bg-white/20 px-3 py-1.5 text-xs text-white backdrop-blur-sm">
              <Maximize2 className="inline h-3 w-3 mr-1" />
              Click to open
            </div>
          </div>
        )}
      </a>

      {/* Caption/domain below image */}
      {isLoaded && !isHovered && (
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          {domain && (
            <a
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-foreground transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-3 w-3" />
              <span>{domain}</span>
            </a>
          )}
        </div>
      )}
    </div>
  );
}
