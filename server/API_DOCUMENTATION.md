# 🎬 TrueGIS Social Video API - Documentation

Beautiful Instagram Reels-style video management API for TrueGIS platform.

## 📋 Table of Contents

- [Overview](#overview)
- [Base URL](#base-url)
- [Video Feed Endpoints](#video-feed-endpoints)
- [User Interaction Endpoints](#user-interaction-endpoints)
- [User Favorites](#user-favorites)
- [Video Management](#video-management)
- [Response Format](#response-format)
- [Error Handling](#error-handling)

## 🌟 Overview

This API provides a complete backend solution for managing and displaying videos similar to Instagram Reels. It includes features like infinite scroll feed, trending videos, likes, dislikes, favorites, views tracking, and comprehensive analytics.

## 🔗 Base URL

```
http://localhost:3000/api/videos
```

## 📱 Video Feed Endpoints

### Get Video Feed (Main Feed)

Get paginated video feed with infinite scroll support.

```http
GET /api/videos/feed
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number for pagination |
| `limit` | number | 10 | Number of videos per page |
| `category` | string | - | Filter by category |
| `platform` | string | - | Filter by platform (instagram, tiktok, youtube) |
| `user_id` | number | - | Filter by user's telegram_id |

**Example Request:**

```bash
curl "http://localhost:3000/api/videos/feed?page=1&limit=20"
```

**Example Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "68f0e0f2a6fa3cace66c523e",
      "user": {
        "telegram_id": 7632668745,
        "telegram_name": "Shahzod",
        "telegram_username": "promise_resolved"
      },
      "url": "1760616685204_7a6750576f3e6e52.mp4",
      "file_id": "BAACAgIAAxkDAAINnWjw4PJzYOZ82cpJA5xYXevt1wLOAAJ8gQACbT2AS5Bc955MjM0bNgQ",
      "thumbnail": "AAMCAgADGQMAAg2daPDg8nNg5nzZykkDnFhd6-3XAs4AAnyBAAJtPYBLkFz3nkyMzRsBAAdtAAM2BA",
      "source_url": "https://www.instagram.com/reel/DPBnnDeCNlE/?igsh=MWM4ZGtoOGZibTgxYQ==",
      "source_platform": "instagram",
      "duration": 11,
      "view_count": 1234,
      "like_count": 56,
      "favorite_count": 12,
      "share_count": 8,
      "is_public": true,
      "published_at": "2025-10-16T12:11:30.389Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 5,
    "total_videos": 50,
    "has_more": true
  }
}
```

---

### Get Trending Videos

Get trending videos based on views and likes in the last 24 hours.

```http
GET /api/videos/trending
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | number | 20 | Number of trending videos to return |

**Example Request:**

```bash
curl "http://localhost:3000/api/videos/trending?limit=10"
```

---

### Search Videos

Search videos by title, description, tags, or user name.

```http
GET /api/videos/search
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | ✅ | Search query |
| `page` | number | - | Page number (default: 1) |
| `limit` | number | - | Results per page (default: 10) |

**Example Request:**

```bash
curl "http://localhost:3000/api/videos/search?q=dance&page=1&limit=20"
```

---

### Get Single Video

Get detailed information about a specific video.

```http
GET /api/videos/:id
```

**Example Request:**

```bash
curl "http://localhost:3000/api/videos/68f0e0f2a6fa3cace66c523e"
```

---

### Get Video Statistics

Get comprehensive statistics for a video.

```http
GET /api/videos/:id/stats
```

**Example Response:**

```json
{
  "success": true,
  "data": {
    "video_id": "68f0e0f2a6fa3cace66c523e",
    "views": 1234,
    "likes": 56,
    "dislikes": 2,
    "comments": 12,
    "shares": 8,
    "favorites": 15,
    "analytics": {
      "last_view_at": "2025-10-16T14:30:00.000Z",
      "peak_views": 1234,
      "peak_views_date": "2025-10-16T12:00:00.000Z",
      "average_watch_time": 8.5,
      "total_watch_time": 10489,
      "engagement_rate": 7.48
    }
  }
}
```

---

## 👆 User Interaction Endpoints

### Record View

Record a view for a video and update watch time analytics.

```http
POST /api/videos/:id/view
```

**Request Body:**

```json
{
  "user_id": 7632668745,
  "watch_time": 8
}
```

**Example Response:**

```json
{
  "success": true,
  "message": "View recorded",
  "data": {
    "view_count": 1235,
    "analytics": {
      "last_view_at": "2025-10-16T14:35:00.000Z",
      "average_watch_time": 8.52,
      "engagement_rate": 7.50
    }
  }
}
```

---

### Like Video

Toggle like on a video. If already liked, removes the like.

```http
POST /api/videos/:id/like
```

**Request Body:**

```json
{
  "user_id": 7632668745
}
```

**Example Response:**

```json
{
  "success": true,
  "message": "Video liked",
  "data": {
    "like_count": 57,
    "dislike_count": 2,
    "is_liked": true
  }
}
```

---

### Dislike Video

Toggle dislike on a video.

```http
POST /api/videos/:id/dislike
```

**Request Body:**

```json
{
  "user_id": 7632668745
}
```

---

### Toggle Favorite

Add or remove video from user's favorites.

```http
POST /api/videos/:id/favorite
```

**Request Body:**

```json
{
  "user_id": 7632668745
}
```

**Example Response:**

```json
{
  "success": true,
  "message": "Added to favorites",
  "data": {
    "favorite_count": 16,
    "is_favorite": true
  }
}
```

---

### Share Video

Record a share action for a video.

```http
POST /api/videos/:id/share
```

**Request Body:**

```json
{
  "user_id": 7632668745
}
```

---

## 👤 User Content

### Get User's Favorite Videos

Get paginated list of videos favorited by a user.

```http
GET /api/videos/user/:user_id/favorites
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Videos per page |

**Example Request:**

```bash
curl "http://localhost:3000/api/videos/user/7632668745/favorites?page=1&limit=20"
```

---

### Get User's Uploaded Videos

Get all videos uploaded by a specific user (by telegram_id).

```http
GET /api/videos/user/:telegram_id/uploaded
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Videos per page |
| `include_deleted` | boolean | false | Include deleted videos in results |

**Example Request:**

```bash
curl "http://localhost:3000/api/videos/user/7632668745/uploaded?page=1&limit=20"
```

**Example Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "68f0e0f2a6fa3cace66c523e",
      "user": {
        "telegram_id": 7632668745,
        "telegram_name": "Shahzod",
        "telegram_username": "promise_resolved"
      },
      "url": "1760616685204_7a6750576f3e6e52.mp4",
      "source_platform": "instagram",
      "view_count": 1234,
      "like_count": 56,
      "created_at": "2025-10-16T12:11:30.389Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 3,
    "total_videos": 25,
    "has_more": true
  }
}
```

---

## 📥 Video Download & Upload

### Download Video from URL

Download video from any supported URL using yt-dlp and save to database.

```http
POST /api/download/download
```

**Request Body:**

```json
{
  "url": "https://www.instagram.com/reel/DPBnnDeCNlE/",
  "user": {
    "telegram_id": 7632668745,
    "telegram_name": "Shahzod",
    "telegram_username": "promise_resolved"
  },
  "is_public": true,
  "tags": ["instagram", "reel"],
  "category": "entertainment"
}
```

**Supported Platforms:**
- YouTube (youtube.com, youtu.be)
- Instagram (instagram.com)
- TikTok (tiktok.com)
- Facebook (facebook.com, fb.com)
- Twitter/X (twitter.com, x.com)
- VK (vk.com)
- Pinterest (pinterest.com)
- Reddit (reddit.com)
- And many more...

**Example Response:**

```json
{
  "success": true,
  "message": "Video downloaded and saved successfully",
  "data": {
    "video_id": "68f0e0f2a6fa3cace66c523e",
    "file_path": "/path/to/1760616685204_7a6750576f3e6e52.mp4",
    "platform": "instagram",
    "title": "Amazing Dance Video",
    "duration": 11,
    "file_size": 493005
  }
}
```

**Error Codes:**
- `400` - Invalid URL
- `403` - Video is private or requires authentication
- `404` - Video not found
- `408` - Download timeout
- `500` - Server error

---

### Upload Video File

Upload video file directly (multipart/form-data).

```http
POST /api/download/upload
```

**Form Data:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `video` | file | ✅ | Video file (max 500MB) |
| `user` | JSON string | ✅ | User info: `{"telegram_id": 123, "telegram_name": "Name"}` |
| `source_url` | string | - | Original source URL |
| `title` | string | - | Video title |
| `description` | string | - | Video description |
| `tags` | JSON array | - | Tags: `["tag1", "tag2"]` |
| `is_public` | boolean | - | Public visibility (default: true) |

**Example using cURL:**

```bash
curl -X POST "http://localhost:3000/api/download/upload" \
  -F "video=@/path/to/video.mp4" \
  -F 'user={"telegram_id": 7632668745, "telegram_name": "Shahzod"}' \
  -F "title=My Video" \
  -F "is_public=true"
```

**Example Response:**

```json
{
  "success": true,
  "message": "Video uploaded successfully",
  "data": {
    "video_id": "68f0e0f2a6fa3cace66c523e",
    "file_name": "1760616685204_7a6750576f3e6e52.mp4",
    "file_size": 5242880,
    "platform": "other"
  }
}
```

---

### Download Audio from URL

Download audio (MP3) from video URL.

```http
POST /api/download/download-audio
```

**Request Body:**

```json
{
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
}
```

**Example Response:**

```json
{
  "success": true,
  "message": "Audio downloaded successfully",
  "data": {
    "file_path": "/path/to/1760616685204_7a6750576f3e6e52.mp3",
    "file_name": "1760616685204_7a6750576f3e6e52.mp3"
  }
}
```

---

### Get Video File

Serve/stream video file.

```http
GET /api/download/file/:filename
```

**Example:**

```bash
curl "http://localhost:3000/api/download/file/1760616685204_7a6750576f3e6e52.mp4"
```

Or access directly in browser:
```
http://localhost:3000/api/download/file/1760616685204_7a6750576f3e6e52.mp4
```

---

### Delete Video File

Delete video file from disk and mark as deleted in database.

```http
DELETE /api/download/file/:id
```

**Example:**

```bash
curl -X DELETE "http://localhost:3000/api/download/file/68f0e0f2a6fa3cace66c523e"
```

---

## 🛠 Video Management

### Update Video

Update video metadata (admin/owner only).

```http
PUT /api/videos/:id
```

**Request Body (all fields optional):**

```json
{
  "title": "Amazing Dance Video",
  "description": "Check out this incredible performance!",
  "tags": ["dance", "performance", "viral"],
  "category": "entertainment",
  "is_public": true,
  "is_blocked": false
}
```

**Example Response:**

```json
{
  "success": true,
  "message": "Video updated successfully",
  "data": {
    "_id": "68f0e0f2a6fa3cace66c523e",
    "title": "Amazing Dance Video",
    "updated_at": "2025-10-16T15:00:00.000Z"
  }
}
```

---

### Delete Video

Soft delete a video (sets `is_deleted` to true).

```http
DELETE /api/videos/:id
```

**Example Response:**

```json
{
  "success": true,
  "message": "Video deleted successfully"
}
```

---

## 📊 Response Format

All API responses follow this structure:

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message (development only)"
}
```

---

## ⚠️ Error Handling

### Common Error Codes

| Status Code | Description |
|-------------|-------------|
| `200` | Success |
| `400` | Bad Request - Invalid parameters |
| `404` | Not Found - Video doesn't exist |
| `500` | Internal Server Error |

---

## 🎯 Usage Examples

### React/Next.js Integration

```typescript
// Get video feed
const getVideoFeed = async (page: number = 1) => {
  const response = await fetch(
    `http://localhost:3000/api/videos/feed?page=${page}&limit=10`
  );
  const data = await response.json();
  return data;
};

// Like a video
const likeVideo = async (videoId: string, userId: number) => {
  const response = await fetch(
    `http://localhost:3000/api/videos/${videoId}/like`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId }),
    }
  );
  return response.json();
};

// Record view
const recordView = async (videoId: string, userId: number, watchTime: number) => {
  const response = await fetch(
    `http://localhost:3000/api/videos/${videoId}/view`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, watch_time: watchTime }),
    }
  );
  return response.json();
};
```

### Mobile App Integration

```javascript
// Get trending videos
fetch('http://localhost:3000/api/videos/trending?limit=20')
  .then(res => res.json())
  .then(data => {
    console.log('Trending videos:', data.data);
  });

// Toggle favorite
const toggleFavorite = async (videoId, userId) => {
  const response = await fetch(
    `http://localhost:3000/api/videos/${videoId}/favorite`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId }),
    }
  );
  return response.json();
};
```

---

## 🗄️ Database Schema

### Video Document Structure

```typescript
{
  _id: ObjectId,
  user: {
    telegram_id: number,
    telegram_name: string,
    telegram_username?: string
  },
  url: string,
  file_id: string,
  thumbnail: string,
  source_url: string,
  source_platform: "instagram" | "tiktok" | "youtube" | "other",
  title?: string,
  description?: string,
  duration: number,
  file_size: number,
  width: number,
  height: number,
  views: number[],           // Array of user IDs
  view_count: number,
  likes: number[],           // Array of user IDs
  like_count: number,
  dislikes: number[],        // Array of user IDs
  dislike_count: number,
  favorites: number[],       // Array of user IDs
  favorite_count: number,
  shares: number[],          // Array of user IDs
  share_count: number,
  is_public: boolean,
  is_deleted: boolean,
  is_blocked: boolean,
  tags: string[],
  category?: string,
  analytics: {
    last_view_at?: Date,
    peak_views: number,
    peak_views_date?: Date,
    average_watch_time: number,
    total_watch_time: number,
    engagement_rate: number
  },
  created_at: Date,
  updated_at: Date,
  published_at: Date
}
```

---

## 🚀 Getting Started

1. Make sure MongoDB is running with the `truegis_delivery` database
2. Set environment variables:
   ```env
   MONGODB_URI=mongodb://localhost:27017/truegis_delivery
   PORT=3000
   ```
3. Start the server:
   ```bash
   npm run server
   ```
4. API will be available at `http://localhost:3000`

---

## 📝 Notes

- All user interactions use `telegram_id` as the user identifier
- Videos are soft-deleted (never actually removed from database)
- Analytics are calculated in real-time
- Engagement rate = (likes + comments + shares + favorites) / views * 100
- All timestamps are in ISO 8601 format

---

## 🎨 Frontend Integration Tips

1. **Infinite Scroll**: Use the `has_more` flag in pagination to know when to load more
2. **Real-time Updates**: Update like/view counts immediately on user interaction
3. **Video Preloading**: Use the `thumbnail` field for previews
4. **Analytics Dashboard**: Use the `/stats` endpoint for detailed video analytics
5. **Search**: Implement debounced search using the `/search` endpoint

---

Made with ❤️ for TrueGIS Platform

