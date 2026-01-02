"use client";

import { FC } from "react";
import { cn } from "@/lib/utils";
import * as LucideIcons from "lucide-react";
import type { SerializableFileDownload } from "./schema";

interface FileDownloadProps extends SerializableFileDownload {
  className?: string;
}

export const FileDownload: FC<FileDownloadProps> = ({
  id,
  fileName,
  description,
  fileUrl,
  fileSize,
  icon = "File",
  className,
}) => {
  const Icon = (LucideIcons as any)[icon] || LucideIcons.File;

  const handleDownload = () => {
    // Create a temporary link element and trigger download
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className={cn(
        "@container/file-download flex w-full max-w-md min-w-80 flex-col text-foreground",
        className
      )}
      data-slot="file-download"
      data-tool-ui-id={id}
      role="button"
      aria-label={`Download ${fileName}`}
    >
      <button
        onClick={handleDownload}
        className="bg-card/60 flex w-full flex-col overflow-hidden rounded-2xl border px-5 py-2.5 shadow-xs transition-colors cursor-pointer hover:bg-secondary"
      >
        <div className="flex items-start gap-3 py-1">
          <span className="flex h-6 items-center">
            <Icon
              className="text-primary size-4 shrink-0"
              aria-hidden="true"
            />
          </span>
          <div className="flex flex-col text-left flex-1">
            <span className="text-base leading-6 font-medium text-pretty @md/file-download:text-sm">
              {fileName}
            </span>
            {(description || fileSize) && (
              <span className="text-muted-foreground text-sm font-normal text-pretty">
                {description}
                {description && fileSize && " • "}
                {fileSize}
              </span>
            )}
          </div>
          <span className="flex h-6 items-center">
            <LucideIcons.Download
              className="text-muted-foreground size-4 shrink-0"
              aria-hidden="true"
            />
          </span>
        </div>
      </button>
    </div>
  );
};
