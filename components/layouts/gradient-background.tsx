"use client";

import { useThreadContext } from "@/lib/thread-context";
import { getThreadGradientColor } from "@/lib/utils/gradient-color";

export function GradientBackground() {
  const { currentThreadId } = useThreadContext();
  const gradientColor = getThreadGradientColor(currentThreadId || 'default');

  return (
    <div
      key={currentThreadId}
      className="opacity-50 absolute top-0 z-[-2] h-screen w-screen bg-white transition-all duration-1000"
      style={{
        backgroundImage: `radial-gradient(
          100% 50% at 50% 0%,
          ${gradientColor} 0%,
          rgba(255,255,255,0) 50%,
          rgba(255,255,255,0) 100%
        )`,
      }}
    />
  );
}
