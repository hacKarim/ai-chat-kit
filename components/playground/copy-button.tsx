"use client";

import { useState } from "react";

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
      }}
      className="rounded-full border px-3 py-1 text-xs text-muted-foreground hover:border-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-signal"
    >
      {copied ? "Copied" : label}
    </button>
  );
}
