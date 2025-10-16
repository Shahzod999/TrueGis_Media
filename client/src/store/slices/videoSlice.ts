import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Video } from "../../api/endpoints/videoApiSlice";

interface VideoState {
  downloadedVideos: Video[];
  currentVideo: Video | null;
  downloadProgress: number;
  isDownloading: boolean;
}

const initialState: VideoState = {
  downloadedVideos: [],
  currentVideo: null,
  downloadProgress: 0,
  isDownloading: false,
};

const videoSlice = createSlice({
  name: "video",
  initialState,
  reducers: {
    addDownloadedVideo: (state, action: PayloadAction<Video>) => {
      state.downloadedVideos.unshift(action.payload);
    },
    removeDownloadedVideo: (state, action: PayloadAction<string>) => {
      state.downloadedVideos = state.downloadedVideos.filter(
        (video) => video.id !== action.payload
      );
    },
    setCurrentVideo: (state, action: PayloadAction<Video | null>) => {
      state.currentVideo = action.payload;
    },
    setDownloadProgress: (state, action: PayloadAction<number>) => {
      state.downloadProgress = action.payload;
    },
    setIsDownloading: (state, action: PayloadAction<boolean>) => {
      state.isDownloading = action.payload;
    },
    clearDownloadedVideos: (state) => {
      state.downloadedVideos = [];
    },
  },
});

export const {
  addDownloadedVideo,
  removeDownloadedVideo,
  setCurrentVideo,
  setDownloadProgress,
  setIsDownloading,
  clearDownloadedVideos,
} = videoSlice.actions;

export default videoSlice.reducer;

