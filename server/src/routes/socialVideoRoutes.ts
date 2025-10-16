import express from "express";
import {
  getVideoFeed,
  getTrendingVideos,
  getVideoById,
  recordView,
  likeVideo,
  dislikeVideo,
  toggleFavorite,
  shareVideo,
  getUserFavorites,
  getVideoStats,
  searchVideos,
  updateVideo,
  deleteVideo,
  getUserUploadedVideos,
} from "../controllers/socialVideoController";

const router = express.Router();

// Public routes
router.get("/feed", getVideoFeed);
router.get("/trending", getTrendingVideos);
router.get("/search", searchVideos);
router.get("/:id", getVideoById);
router.get("/:id/stats", getVideoStats);

// User interaction routes
router.post("/:id/view", recordView);
router.post("/:id/like", likeVideo);
router.post("/:id/dislike", dislikeVideo);
router.post("/:id/favorite", toggleFavorite);
router.post("/:id/share", shareVideo);

// User favorites
router.get("/user/:user_id/favorites", getUserFavorites);

// User uploaded videos
router.get("/user/:telegram_id/uploaded", getUserUploadedVideos);

// Admin routes (you can add authentication middleware here)
router.put("/:id", updateVideo);
router.delete("/:id", deleteVideo);

export default router;

