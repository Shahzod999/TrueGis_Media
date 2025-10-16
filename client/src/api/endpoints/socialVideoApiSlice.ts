import { apiSlice } from "../apiSlice";

// Types
export interface User {
  telegram_id: number;
  telegram_name: string;
  telegram_username?: string;
}

export interface Analytics {
  last_view_at: string | null;
  peak_views: number;
  peak_views_date: string | null;
  average_watch_time: number;
  total_watch_time: number;
  engagement_rate: number;
}

export interface Video {
  _id: string;
  user: User;
  url: string;
  file_id: string;
  thumbnail: string;
  source_url: string;
  source_platform: string;
  title: string | null;
  description: string | null;
  duration: number;
  file_size: number;
  width: number;
  height: number;
  view_count: number;
  like_count: number;
  dislike_count: number;
  comment_count: number;
  share_count: number;
  favorite_count: number;
  is_public: boolean;
  is_deleted: boolean;
  is_blocked: boolean;
  tags: string[];
  category: string | null;
  created_at: string;
  updated_at: string;
  published_at: string;
  analytics: Analytics;
}

export interface VideoFeedParams {
  page?: number;
  limit?: number;
  category?: string;
  platform?: string;
  user_id?: number;
}

export interface VideoFeedResponse {
  success: boolean;
  data: Video[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_videos: number;
    has_more: boolean;
  };
}

export interface InteractionBody {
  user_id: number;
  watch_time?: number;
}

export interface InteractionResponse {
  success: boolean;
  message: string;
  data: {
    like_count?: number;
    dislike_count?: number;
    favorite_count?: number;
    share_count?: number;
    view_count?: number;
    is_liked?: boolean;
    is_disliked?: boolean;
    is_favorite?: boolean;
    analytics?: Analytics;
  };
}

export interface DownloadVideoBody {
  url: string;
  user: User;
  is_public?: boolean;
  tags?: string[];
  category?: string;
}

export interface DownloadVideoResponse {
  success: boolean;
  message: string;
  data: {
    video_id: string;
    file_path: string;
    platform: string;
    title: string | null;
    duration: number;
    file_size: number;
  };
}

export const socialVideoApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get video feed (main feed)
    getVideoFeed: builder.query<VideoFeedResponse, VideoFeedParams>({
      query: (params) => ({
        url: "/videos/feed",
        params,
      }),
      providesTags: ["Videos"],
    }),

    // Get trending videos
    getTrendingVideos: builder.query<VideoFeedResponse, { limit?: number }>({
      query: (params) => ({
        url: "/videos/trending",
        params,
      }),
      providesTags: ["Videos"],
    }),

    // Search videos
    searchVideos: builder.query<VideoFeedResponse, { q: string; page?: number; limit?: number }>({
      query: (params) => ({
        url: "/videos/search",
        params,
      }),
    }),

    // Get single video
    getVideoById: builder.query<{ success: boolean; data: Video }, string>({
      query: (id) => `/videos/${id}`,
    }),

    // Get video statistics
    getVideoStats: builder.query<{ success: boolean; data: any }, string>({
      query: (id) => `/videos/${id}/stats`,
    }),

    // Record view
    recordView: builder.mutation<InteractionResponse, { id: string; body: InteractionBody }>({
      query: ({ id, body }) => ({
        url: `/videos/${id}/view`,
        method: "POST",
        body,
      }),
    }),

    // Like video
    likeVideo: builder.mutation<InteractionResponse, { id: string; body: InteractionBody }>({
      query: ({ id, body }) => ({
        url: `/videos/${id}/like`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Videos"],
    }),

    // Dislike video
    dislikeVideo: builder.mutation<InteractionResponse, { id: string; body: InteractionBody }>({
      query: ({ id, body }) => ({
        url: `/videos/${id}/dislike`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Videos"],
    }),

    // Toggle favorite
    toggleFavorite: builder.mutation<InteractionResponse, { id: string; body: InteractionBody }>({
      query: ({ id, body }) => ({
        url: `/videos/${id}/favorite`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Videos", "Favorites"],
    }),

    // Share video
    shareVideo: builder.mutation<InteractionResponse, { id: string; body: InteractionBody }>({
      query: ({ id, body }) => ({
        url: `/videos/${id}/share`,
        method: "POST",
        body,
      }),
    }),

    // Get user favorites
    getUserFavorites: builder.query<VideoFeedResponse, { user_id: number; page?: number; limit?: number }>({
      query: ({ user_id, ...params }) => ({
        url: `/videos/user/${user_id}/favorites`,
        params,
      }),
      providesTags: ["Favorites"],
    }),

    // Get user uploaded videos
    getUserUploadedVideos: builder.query<VideoFeedResponse, { telegram_id: number; page?: number; limit?: number; include_deleted?: boolean }>({
      query: ({ telegram_id, ...params }) => ({
        url: `/videos/user/${telegram_id}/uploaded`,
        params,
      }),
      providesTags: ["UserVideos"],
    }),

    // Update video
    updateVideo: builder.mutation<{ success: boolean; message: string; data: Video }, { id: string; body: Partial<Video> }>({
      query: ({ id, body }) => ({
        url: `/videos/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Videos", "UserVideos"],
    }),

    // Delete video (soft delete)
    deleteVideo: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/videos/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Videos", "UserVideos"],
    }),

    // Download video from URL
    downloadVideo: builder.mutation<DownloadVideoResponse, DownloadVideoBody>({
      query: (body) => ({
        url: "/download/download",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Videos", "UserVideos"],
    }),

    // Upload video file
    uploadVideoFile: builder.mutation<{ success: boolean; message: string; data: any }, FormData>({
      query: (formData) => ({
        url: "/download/upload",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Videos", "UserVideos"],
    }),

    // Download audio from URL
    downloadAudio: builder.mutation<{ success: boolean; message: string; data: any }, { url: string }>({
      query: (body) => ({
        url: "/download/download-audio",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useGetVideoFeedQuery,
  useGetTrendingVideosQuery,
  useSearchVideosQuery,
  useGetVideoByIdQuery,
  useGetVideoStatsQuery,
  useRecordViewMutation,
  useLikeVideoMutation,
  useDislikeVideoMutation,
  useToggleFavoriteMutation,
  useShareVideoMutation,
  useGetUserFavoritesQuery,
  useGetUserUploadedVideosQuery,
  useUpdateVideoMutation,
  useDeleteVideoMutation,
  useDownloadVideoMutation,
  useUploadVideoFileMutation,
  useDownloadAudioMutation,
} = socialVideoApiSlice;

