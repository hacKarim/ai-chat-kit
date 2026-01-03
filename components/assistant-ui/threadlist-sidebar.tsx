"use client";

import * as React from "react";
import { Github, MessagesSquare, User, Copy, Check } from "lucide-react";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { ThreadList } from "@/components/assistant-ui/thread-list";
import { getOrCreateSessionId } from "@/lib/session";
import { useState } from "react";

export function ThreadListSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader className="aui-sidebar-header mb-2">
        <div className="aui-sidebar-header-content flex items-center justify-between">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <Link
                  href="/home"
                  rel="noopener noreferrer"
                >
                  <div className="aui-sidebar-header-icon-wrapper flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <MessagesSquare className="aui-sidebar-header-icon size-4" />
                  </div>
                  <div className="aui-sidebar-header-heading mr-6 flex flex-col gap-0.5 leading-none">
                    <span className="aui-sidebar-header-title font-semibold text-2xl">
                      Assistant
                    </span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarHeader>
      <SidebarContent className="aui-sidebar-content px-2">
        <ThreadList />
      </SidebarContent>
      <SidebarRail />
      <SidebarFooter className="aui-sidebar-footer">
        <SidebarMenu>
          <SidebarMenuItem>
            <UserIdDisplay />
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link
                href="/"
                target="_blank"
              >
           
                <div className="aui-sidebar-footer-heading flex flex-col gap-0.5 leading-none">

                  <span>Chat UI kit</span>
                  <span>open source</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

const UserIdDisplay = () => {
  const [copied, setCopied] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  React.useEffect(() => {
    setUserId(getOrCreateSessionId());
  }, []);

  const handleCopy = () => {
    if (userId) {
      navigator.clipboard.writeText(userId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <SidebarMenuButton
      size="lg"
      onClick={handleCopy}
      className="group cursor-pointer"
      title="Click to copy user ID"
    >
      <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary/10 text-sidebar-primary">
        <User className="size-4" />
      </div>
      <div className="flex flex-col gap-0.5 leading-none flex-1 min-w-0">
        <span className="font-semibold text-xs">User ID</span>
        <span className="text-xs text-muted-foreground truncate font-mono">
          {userId ? userId.slice(0, 8) + "..." : "Loading..."}
        </span>
      </div>
      <div className="flex items-center justify-center size-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
        {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
      </div>
    </SidebarMenuButton>
  );
};
