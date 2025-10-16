import { apiSlice } from "../apiSlice";
import { mockPopularVideos, mockUserVideos } from "../../mocks/videoMockData";

export interface Video {
  id: string;
  title: string;
  thumbnail: string;
  url: string;
  platform:string;
  duration: string;
  views: number;
  createdAt: string;
  isDownloaded?: boolean;
  userId?: string;
}

export interface DownloadRequest {
  url: string;
  platform?: string;
}

export interface DownloadResponse {
  success: boolean;
  video: Video;
  downloadUrl: string;
}

export const videoApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPopularVideos: builder.query<Video[], void>({
      queryFn: async () => {
        // Mock implementation - replace with real API call
        await new Promise((resolve) => setTimeout(resolve, 500));
        return { data: mockPopularVideos };
      },
    }),
    getUserVideos: builder.query<Video[], string>({
      queryFn: async () => {
        // Mock implementation - replace with real API call
        await new Promise((resolve) => setTimeout(resolve, 500));
        return { data: mockUserVideos };
      },
    }),
    downloadVideo: builder.mutation<DownloadResponse, DownloadRequest>({
      queryFn: async (body) => {
        // Mock implementation - replace with real API call
        await new Promise((resolve) => setTimeout(resolve, 1500));
        
        const platform = body.platform || "youtube";
        const newVideo: Video = {
          id: `download-${Date.now()}`,
          title: "Downloaded video from " + platform,
          thumbnail: `https://picsum.photos/seed/${Date.now()}/640/360`,
          url: body.url,
          platform: platform,
          duration: "5:00",
          views: 1000,
          createdAt: new Date().toISOString(),
          isDownloaded: true,
        };
        
        return {
          data: {
            success: true,
            video: newVideo,
            downloadUrl: body.url,
          },
        };
      },
    }),
    deleteVideo: builder.mutation<{ success: boolean }, string>({
      queryFn: async () => {
        // Mock implementation - replace with real API call
        await new Promise((resolve) => setTimeout(resolve, 300));
        return { data: { success: true } };
      },
    }),
  }),
});

export const {
  useGetPopularVideosQuery,
  useGetUserVideosQuery,
  useDownloadVideoMutation,
  useDeleteVideoMutation,
} = videoApiSlice;

