/**
 * Parse and convert <image> tags to markdown image syntax
 * This handles the custom <image> tags returned by DIFY workflows
 */
export function parseImageTags(text: string): string {
  if (!text) return text;

  // Match <image src="..." /> or <image src="..."></image> tags
  const imageTagRegex = /<image\s+src=["']([^"']+)["']\s*\/?>(?:<\/image>)?/gi;

  // Replace with markdown image syntax
  return text.replace(imageTagRegex, (match, src) => {
    // Extract alt text if available (though DIFY doesn't seem to provide it)
    const altMatch = match.match(/alt=["']([^"']+)["']/i);
    const alt = altMatch ? altMatch[1] : "Workflow generated image";

    // Convert to markdown image syntax: ![alt](url)
    return `![${alt}](${src})`;
  });
}

/**
 * Check if text contains image tags
 */
export function hasImageTags(text: string): boolean {
  if (!text) return false;
  const imageTagRegex = /<image\s+src=["']([^"']+)["']\s*\/?>(?:<\/image>)?/i;
  return imageTagRegex.test(text);
}
