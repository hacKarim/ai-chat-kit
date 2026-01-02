import type { FC } from "react";
import {
  ThreadListItemPrimitive,
  ThreadListPrimitive,
  useAssistantState,
  useThreadListItem,
} from "@assistant-ui/react";
import { PlusIcon, XIcon, LayoutDashboard } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { TooltipIconButton } from "@/components/assistant-ui/tooltip-icon-button";
import { Skeleton } from "@/components/ui/skeleton";

export const ThreadList: FC = () => {
  return (
    <ThreadListPrimitive.Root className="aui-root aui-thread-list-root flex flex-col items-stretch gap-1.5">
      <DashboardButton />
      <ThreadListNew />

      {/* Separator */}
      <div className="my-2 border-t border-border/40" />

      {/* History Label */}
      <div className="px-2.5 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Recent
      </div>

      <ThreadListItems />
    </ThreadListPrimitive.Root>
  );
};

const DashboardButton: FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const isActive = pathname === "/home";

  const handleClick = () => {
    if (pathname !== "/home") {
      router.push("/home", { scroll: false });
    }
  };

  return (
    <Button
      className="flex items-center justify-start gap-1 rounded-lg px-2.5 py-2 text-start hover:bg-muted data-active:bg-muted"
      variant="ghost"
      onClick={handleClick}
      data-active={isActive ? "" : undefined}
    >
      <LayoutDashboard className="size-4" />
      Home
    </Button>
  );
};

const ThreadListNew: FC = () => {
  return (
    <ThreadListPrimitive.New asChild>
      <Button
        className="aui-thread-list-new flex items-center justify-start gap-1 rounded-lg px-2.5 py-2 text-start hover:bg-muted data-active:bg-muted"
        variant="ghost"
      >
        <PlusIcon />
        New Thread
      </Button>
    </ThreadListPrimitive.New>
  );
};

const ThreadListItems: FC = () => {
  const isLoading = useAssistantState(({ threads }) => threads.isLoading);

  if (isLoading) {
    return <ThreadListSkeleton />;
  }

  return <ThreadListPrimitive.Items components={{ ThreadListItem }} />;
};

const ThreadListSkeleton: FC = () => {
  return (
    <>
      {Array.from({ length: 5 }, (_, i) => (
        <div
          key={i}
          role="status"
          aria-label="Loading threads"
          aria-live="polite"
          className="aui-thread-list-skeleton-wrapper flex items-center gap-2 rounded-md px-3 py-2"
        >
          <Skeleton className="aui-thread-list-skeleton h-[22px] flex-grow" />
        </div>
      ))}
    </>
  );
};

const ThreadListItem: FC = () => {
  const title = useThreadListItem((t) => t.title);

  return (
    <ThreadListItemPrimitive.Root
      className="aui-thread-list-item group/archive flex items-center gap-2 rounded-lg transition-all hover:bg-muted focus-visible:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none data-active:bg-muted data-[new-chat=true]:hidden"
      data-new-chat={title === "New Chat" ? "true" : undefined}
    >
      <ThreadListItemPrimitive.Trigger className="cursor-pointer aui-thread-list-item-trigger flex-grow px-3 py-2 text-start overflow-hidden">
        <ThreadListItemTitle />
      </ThreadListItemPrimitive.Trigger>
      <ThreadListItemDelete />
    </ThreadListItemPrimitive.Root>
  );
};

const ThreadListItemTitle: FC = () => {
  return (
    <span className="aui-thread-list-item-title text-sm truncate block">
      <ThreadListItemPrimitive.Title />
    </span>
  );
};

const ThreadListItemDelete: FC = () => {
  return (
    <ThreadListItemPrimitive.Archive asChild>
      <TooltipIconButton
        className="aui-thread-list-item-delete mr-3 ml-auto size-4 p-0 text-foreground opacity-0 transition-opacity group-hover/archive:opacity-100 hover:text-destructive cursor-pointer"
        variant="ghost"
        tooltip="Delete conversation"
      >
        <XIcon />
      </TooltipIconButton>
    </ThreadListItemPrimitive.Archive>
  );
};
