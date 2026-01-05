"use client";

import { getThreadGradientColor } from "@/lib/utils/gradient-color";

/**
 * Soft radial wash behind the thread. The colour is derived from `seed`
 * (a thread id works well), so every conversation gets its own tint.
 */
export function GradientBackground({ seed = "default" }: { seed?: string }) {
  const gradientColor = getThreadGradientColor(seed);

  return (
    <div
      key={seed}
      className="pointer-events-none absolute inset-0 z-0 opacity-50 transition-all duration-1000"
      style={{
        backgroundImage: `radial-gradient(
          100% 50% at 50% 0%,
          ${gradientColor} 0%,
          transparent 50%,
          transparent 100%
        )`,
      }}
    />
  );
}
