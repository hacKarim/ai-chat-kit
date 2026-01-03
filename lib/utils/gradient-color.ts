/**
 * Generates a deterministic gradient color based on a thread/discussion ID
 * @param threadId - The thread/discussion identifier
 * @returns An RGBA color string for the gradient
 */
export function getThreadGradientColor(threadId: string): string {
  if (!threadId) {
    return 'rgba(1,165,192,0.18)'; // Default blue
  }

  const colors = [
    'rgba(1,165,192,0.18)',     // #01A5C0 - Blue
    'rgba(184,25,88,0.18)',     // #B81958 - Pink/Red
    'rgba(139,92,246,0.18)',    // Purple
    'rgba(34,197,94,0.18)',     // Green
    'rgba(249,115,22,0.18)',    // Orange
    'rgba(236,72,153,0.18)',    // Pink
    'rgba(20,184,166,0.18)',    // Teal
    'rgba(234,179,8,0.18)',     // Yellow
  ];

  // Better hash function for improved distribution
  let hash = 0;
  for (let i = 0; i < threadId.length; i++) {
    const char = threadId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash | 0; // Convert to 32-bit integer
  }

  // Add additional mixing for better distribution
  hash = Math.abs(hash);
  hash = hash ^ (hash >>> 16);

  const index = hash % colors.length;

  return colors[index];
}
