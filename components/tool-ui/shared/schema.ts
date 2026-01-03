/**
 * Shared types for social post components
 */

export interface Action {
  id: string;
  label: string;
  prompt?: string; // The message to send when clicked
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  disabled?: boolean;
}

export interface BaseAuthor {
  name: string;
  avatarUrl: string;
}

export interface MediaItem {
  type: "image" | "video";
  url: string;
  alt?: string;
  aspectRatio?: number;
}

export interface LinkPreview {
  url: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  domain?: string;
}

export interface BaseStats {
  likes?: number;
  shares?: number;
  comments?: number;
}
