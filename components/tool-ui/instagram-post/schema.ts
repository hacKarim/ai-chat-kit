import type { BaseAuthor, MediaItem, BaseStats } from "../shared/schema";

export interface InstagramAuthor extends BaseAuthor {
  handle: string;
  verified?: boolean;
}

export interface InstagramPostData {
  id: string;
  author: InstagramAuthor;
  text?: string;
  media?: MediaItem[];
  stats?: BaseStats;
  createdAt?: string;
}

export function parseSerializableInstagramPost(data: unknown): InstagramPostData {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid Instagram post data");
  }

  const post = data as any;

  if (!post.author) {
    throw new Error("Instagram post must have author");
  }

  return {
    id: post.id ? String(post.id) : crypto.randomUUID(),
    author: {
      name: String(post.author.name),
      handle: String(post.author.handle),
      avatarUrl: String(post.author.avatarUrl),
      verified: Boolean(post.author.verified),
    },
    text: post.text ? String(post.text) : undefined,
    media: post.media || undefined,
    stats: post.stats || undefined,
    createdAt: post.createdAt ? String(post.createdAt) : undefined,
  };
}
