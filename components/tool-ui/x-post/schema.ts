import type { BaseAuthor, MediaItem, LinkPreview, BaseStats } from "../shared/schema";

export interface XAuthor extends BaseAuthor {
  handle: string;
  verified?: boolean;
}

export interface XPostData {
  id: string;
  author: XAuthor;
  text?: string;
  media?: MediaItem[];
  linkPreview?: LinkPreview;
  quotedPost?: XPostData;
  stats?: BaseStats;
  createdAt?: string;
}

export function parseSerializableXPost(data: unknown): XPostData {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid X post data");
  }

  const post = data as any;

  if (!post.id || !post.author) {
    throw new Error("X post must have id and author");
  }

  return {
    id: String(post.id),
    author: {
      name: String(post.author.name),
      handle: String(post.author.handle),
      avatarUrl: String(post.author.avatarUrl),
      verified: Boolean(post.author.verified),
    },
    text: post.text ? String(post.text) : undefined,
    media: post.media || undefined,
    linkPreview: post.linkPreview || undefined,
    quotedPost: post.quotedPost ? parseSerializableXPost(post.quotedPost) : undefined,
    stats: post.stats || undefined,
    createdAt: post.createdAt ? String(post.createdAt) : undefined,
  };
}
