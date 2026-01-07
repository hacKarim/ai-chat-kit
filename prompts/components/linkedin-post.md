# Component: LinkedIn Post

## Format
```linkedin-post
{
  "id": "string",
  "author": {
    "name": "string",
    "headline": "string",
    "avatarUrl": "string"
  },
  "text": "string",
  "media": [{"type": "image" | "video", "url": "string", "alt": "string"}],
  "linkPreview": {"url": "string", "title": "string", "description": "string", "imageUrl": "string"},
  "stats": {"likes": 0, "comments": 0, "shares": 0},
  "createdAt": "string"
}
```

## Fields

### Required
- `id` (string): Unique identifier
- `author` (object): Post author
  - `name` (string): Full name
  - `avatarUrl` (string): Profile picture URL

### Optional
- `author.headline` (string): Professional headline
- `text` (string): Post content
- `media` (array): Photos/videos
- `linkPreview` (object): Link card
- `stats` (object): Engagement metrics
- `createdAt` (string): ISO 8601 timestamp or relative time

## Example
```linkedin-post
{
  "id": "li-draft-1",
  "author": {
    "name": "Maya Laurent",
    "headline": "Engineering lead",
    "avatarUrl": "/demo/avatar.svg"
  },
  "text": "Three things we learned shipping voice input to production:\n\n1. Silence detection matters more than the model.\n2. People interrupt. Let them.\n3. Show what was heard before acting on it.",
  "stats": {
    "likes": 312,
    "comments": 24,
    "shares": 12
  },
  "createdAt": "2025-12-12T07:45:00Z"
}
```
