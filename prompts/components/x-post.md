# Component: X Post

## Format
```x-post
{
  "id": "string",
  "author": {
    "name": "string",
    "handle": "string",
    "avatarUrl": "string",
    "verified": false
  },
  "text": "string",
  "media": [{"type": "image" | "video", "url": "string", "alt": "string"}],
  "linkPreview": {"url": "string", "title": "string", "description": "string"},
  "quotedPost": {...},
  "stats": {"likes": 0, "comments": 0, "shares": 0},
  "createdAt": "string"
}
```

## Fields

### Required
- `id` (string): Unique identifier
- `author` (object): Post author
  - `name` (string): Display name
  - `handle` (string): X handle (without @)
  - `avatarUrl` (string): Profile picture URL

### Optional
- `author.verified` (boolean): Verified account [default: false]
- `text` (string): Post text
- `media` (array): Photos/videos
- `linkPreview` (object): Link card
- `quotedPost` (object): Quoted/retweeted post (recursive)
- `stats` (object): Engagement metrics
- `createdAt` (string): ISO 8601 timestamp or relative time

## Example
```x-post
{
  "id": "x-draft-1",
  "author": {
    "name": "Maya Laurent",
    "handle": "mayabuilds",
    "avatarUrl": "/demo/avatar.svg",
    "verified": true
  },
  "text": "We cut cold start from 2.1 s to 640 ms by moving one import.\n\nThe write-up, with flame graphs, is on the blog.",
  "stats": {
    "likes": 482,
    "comments": 37,
    "shares": 91
  },
  "createdAt": "2025-12-15T09:30:00Z"
}
```
