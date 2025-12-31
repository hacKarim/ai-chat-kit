import type { BaseAuthor, MediaItem, LinkPreview, BaseStats } from "../shared/schema";

export interface LinkedInAuthor extends BaseAuthor {
  headline?: string;
}

export interface LinkedInPostData {
  id: string;
  author: LinkedInAuthor;
  text?: string;
  media?: MediaItem[];
  linkPreview?: LinkPreview;
  stats?: BaseStats;
  createdAt?: string;
}

export function parseSerializableLinkedInPost(data: unknown): LinkedInPostData {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid LinkedIn post data");
  }

  const post = data as any;

  if (!post.id || !post.author) {
    throw new Error("LinkedIn post must have id and author");
  }

  return {
    id: String(post.id),
    author: {
      name: String(post.author.name),
      avatarUrl: String(post.author.avatarUrl),
      headline: post.author.headline ? String(post.author.headline) : undefined,
    },
    text: post.text ? String(post.text) : undefined,
    media: post.media || undefined,
    linkPreview: post.linkPreview || undefined,
    stats: post.stats || undefined,
    createdAt: post.createdAt ? String(post.createdAt) : undefined,
  };
}
