"use client";

import { memo, useMemo } from "react";
import { Image } from "@/components/tool-ui/image";
import { MarkdownText } from "./markdown-text";

interface TextSegment {
  type: "text" | "image";
  content: string;
  imageProps?: {
    src: string;
    alt?: string;
    title?: string;
  };
}

/**
 * Parse text content to extract <image> tags and create segments
 */
function parseTextWithImages(text: string): TextSegment[] {
  if (!text) return [];

  const segments: TextSegment[] = [];
  const imageTagRegex = /<image\s+src=["']([^"']+)["'](?:\s+alt=["']([^"']+)["'])?(?:\s+title=["']([^"']+)["'])?\s*\/?>(?:<\/image>)?/gi;

  let lastIndex = 0;
  let match;

  while ((match = imageTagRegex.exec(text)) !== null) {
    // Add text before the image tag
    if (match.index > lastIndex) {
      const textContent = text.substring(lastIndex, match.index).trim();
      if (textContent) {
        segments.push({ type: "text", content: textContent });
      }
    }

    // Add image segment
    segments.push({
      type: "image",
      content: match[0],
      imageProps: {
        src: match[1],
        alt: match[2] || "Workflow generated image",
        title: match[3],
      },
    });

    lastIndex = imageTagRegex.lastIndex;
  }

  // Add remaining text after last image tag
  if (lastIndex < text.length) {
    const remainingText = text.substring(lastIndex).trim();
    if (remainingText) {
      segments.push({ type: "text", content: remainingText });
    }
  }

  // If no images found, return the entire text as a single segment
  if (segments.length === 0 && text.trim()) {
    segments.push({ type: "text", content: text });
  }

  return segments;
}

interface TextWithImagesProps {
  text: string;
}

function TextWithImagesImpl({ text }: TextWithImagesProps) {
  const segments = useMemo(() => parseTextWithImages(text), [text]);

  return (
    <>
      {segments.map((segment, index) => {
        if (segment.type === "image" && segment.imageProps) {
          // Extract domain from URL
          const getDomain = (url: string) => {
            try {
              const urlObj = new URL(url);
              return urlObj.hostname;
            } catch {
              return undefined;
            }
          };

          return (
            <div key={`${segment.imageProps.src}-${index}`} className="my-4">
              <Image
                id={`workflow-image-${index}`}
                assetId={`workflow-${Date.now()}-${index}`}
                src={segment.imageProps.src}
                alt={segment.imageProps.alt || "Workflow generated image"}
                title={segment.imageProps.title}
                domain={getDomain(segment.imageProps.src)}
                href={segment.imageProps.src}
                ratio="auto"
              />
            </div>
          );
        }

        // Render text segments with markdown
        return <MarkdownText key={`text-${index}`} text={segment.content} />;
      })}
    </>
  );
}

export const TextWithImages = memo(TextWithImagesImpl);
