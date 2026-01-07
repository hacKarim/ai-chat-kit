# Component: Instagram Post

## Format
```instagram-post
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
  "stats": {"likes": 0, "comments": 0, "shares": 0},
  "createdAt": "string"
}
```

## Fields

### Required
- `id` (string): Unique identifier
- `author` (object): Post author
  - `name` (string): Display name
  - `handle` (string): Instagram handle (without @)
  - `avatarUrl` (string): Profile picture URL

### Optional
- `author.verified` (boolean): Verified account [default: false]
- `text` (string): Post caption
- `media` (array): Photos/videos
- `stats` (object): Engagement metrics
- `createdAt` (string): ISO 8601 timestamp or relative time

## Example
```instagram-post
{
  "id": "ig-draft-1",
  "author": {
    "name": "Maya Laurent",
    "handle": "mayabuilds",
    "avatarUrl": "/demo/avatar.svg"
  },
  "text": "Team offsite, day two. Whiteboards full, coffee empty.",
  "media": [
    {
      "type": "image",
      "url": "/demo/cover-3.svg",
      "alt": "Warm abstract composition"
    }
  ],
  "stats": {
    "likes": 1240,
    "comments": 58
  },
  "createdAt": "2025-12-14T17:05:00Z"
}
```
