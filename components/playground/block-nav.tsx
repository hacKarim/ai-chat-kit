"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { blocks } from "@/components/tool-ui/registry";
import { cn } from "@/lib/utils";

export function BlockNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Blocks" className="md:sticky md:top-6 md:self-start">
      <ul className="flex gap-1 overflow-x-auto pb-2 md:block md:space-y-0.5 md:overflow-visible md:pb-0">
        {blocks.map((block) => {
          const active = pathname === `/blocks/${block.name}`;
          return (
            <li key={block.name} className="shrink-0">
              <Link
                href={`/blocks/${block.name}`}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "block rounded-lg px-3 py-1.5 text-sm focus-visible:outline-2 focus-visible:outline-signal",
                  active
                    ? "bg-signal-soft font-medium text-signal"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {block.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
