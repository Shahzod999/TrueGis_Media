import { Request, Response } from "express";
import SocialVideo from "../models/socialVideoModel";

// Get feed of videos (Instagram Reels style - paginated, infinite scroll)
export const getVideoFeed = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, category, platform, user_id } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    const query: any = {
      is_public: true,
      is_deleted: false,
      is_blocked: false,
    };

    if (category) query.category = category;
    if (platform) query.source_platform = platform;
    if (user_id) query["user.telegram_id"] = parseInt(user_id as string);

    // Get videos sorted by published date (newest first)
    const videos = await SocialVideo.find(query)
      .sort({ published_at: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await SocialVideo.countDocuments(query);

    res.status(200).json({
      success: true,
      data: videos,
      pagination: {
        current_page: pageNum,
        total_pages: Math.ceil(total / limitNum),
        total_videos: total,
        has_more: pageNum * limitNum < total,
      },
    });
  } catch (error: any) {
    console.error("Error getting video feed:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get video feed",
      error: error.message,
    });
  }
};

// Get trending videos (most views/likes in last 24h)
export const getTrendingVideos = async (req: Request, res: Response) => {
  try {
    const { limit = 20 } = req.query;
    const limitNum = parseInt(limit as string);

    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const videos = await SocialVideo.find({
      is_public: true,
      is_deleted: false,
      is_blocked: false,
      published_at: { $gte: oneDayAgo },
    })
      .sort({ view_count: -1, like_count: -1 })
      .limit(limitNum)
      .lean();

    res.status(200).json({
      success: true,
      data: videos,
      count: videos.length,
    });
  } catch (error: any) {
    console.error("Error getting trending videos:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get trending videos",
      error: error.message,
    });
  }
};

// Get single video by ID
export const getVideoById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const video = await SocialVideo.findById(id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    res.status(200).json({
      success: true,
      data: video,
    });
  } catch (error: any) {
    console.error("Error getting video:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get video",
      error: error.message,
    });
  }
};

// Record video view
export const recordView = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { user_id, watch_time = 0 } = req.body;

    const video = await SocialVideo.findById(id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    // Add view if user hasn't viewed this video yet
    if (!video.views.includes(user_id)) {
      video.views.push(user_id);
      video.view_count += 1;
    }

    // Update analytics
    video.analytics.last_view_at = new Date();
    video.analytics.total_watch_time += watch_time;
    
    if (video.view_count > 0) {
      video.analytics.average_watch_time = 
        video.analytics.total_watch_time / video.view_count;
    }

    // Calculate engagement rate
    const totalEngagements = 
      video.like_count + 
      video.comment_count + 
      video.share_count + 
      video.favorite_count;
    
    video.analytics.engagement_rate = 
      video.view_count > 0 ? (totalEngagements / video.view_count) * 100 : 0;

    // Update peak views if needed
    if (video.view_count > video.analytics.peak_views) {
      video.analytics.peak_views = video.view_count;
      video.analytics.peak_views_date = new Date();
    }

    await video.save();

    res.status(200).json({
      success: true,
      message: "View recorded",
      data: {
        view_count: video.view_count,
        analytics: video.analytics,
      },
    });
  } catch (error: any) {
    console.error("Error recording view:", error);
    res.status(500).json({
      success: false,
      message: "Failed to record view",
      error: error.message,
    });
  }
};

// Like video
export const likeVideo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "user_id is required",
      });
    }

    const video = await SocialVideo.findById(id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    // Toggle like
    const likeIndex = video.likes.indexOf(user_id);
    const dislikeIndex = video.dislikes.indexOf(user_id);

    if (likeIndex > -1) {
      // Unlike
      video.likes.splice(likeIndex, 1);
      video.like_count -= 1;
    } else {
      // Like
      video.likes.push(user_id);
      video.like_count += 1;

      // Remove dislike if exists
      if (dislikeIndex > -1) {
        video.dislikes.splice(dislikeIndex, 1);
        video.dislike_count -= 1;
      }
    }

    await video.save();

    res.status(200).json({
      success: true,
      message: likeIndex > -1 ? "Like removed" : "Video liked",
      data: {
        like_count: video.like_count,
        dislike_count: video.dislike_count,
        is_liked: likeIndex === -1,
      },
    });
  } catch (error: any) {
    console.error("Error liking video:", error);
    res.status(500).json({
      success: false,
      message: "Failed to like video",
      error: error.message,
    });
  }
};

// Dislike video
export const dislikeVideo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "user_id is required",
      });
    }

    const video = await SocialVideo.findById(id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    // Toggle dislike
    const dislikeIndex = video.dislikes.indexOf(user_id);
    const likeIndex = video.likes.indexOf(user_id);

    if (dislikeIndex > -1) {
      // Remove dislike
      video.dislikes.splice(dislikeIndex, 1);
      video.dislike_count -= 1;
    } else {
      // Dislike
      video.dislikes.push(user_id);
      video.dislike_count += 1;

      // Remove like if exists
      if (likeIndex > -1) {
        video.likes.splice(likeIndex, 1);
        video.like_count -= 1;
      }
    }

    await video.save();

    res.status(200).json({
      success: true,
      message: dislikeIndex > -1 ? "Dislike removed" : "Video disliked",
      data: {
        like_count: video.like_count,
        dislike_count: video.dislike_count,
        is_disliked: dislikeIndex === -1,
      },
    });
  } catch (error: any) {
    console.error("Error disliking video:", error);
    res.status(500).json({
      success: false,
      message: "Failed to dislike video",
      error: error.message,
    });
  }
};

// Add to favorites
export const toggleFavorite = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "user_id is required",
      });
    }

    const video = await SocialVideo.findById(id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    // Toggle favorite
    const favoriteIndex = video.favorites.indexOf(user_id);

    if (favoriteIndex > -1) {
      // Remove from favorites
      video.favorites.splice(favoriteIndex, 1);
      video.favorite_count -= 1;
    } else {
      // Add to favorites
      video.favorites.push(user_id);
      video.favorite_count += 1;
    }

    await video.save();

    res.status(200).json({
      success: true,
      message: favoriteIndex > -1 ? "Removed from favorites" : "Added to favorites",
      data: {
        favorite_count: video.favorite_count,
        is_favorite: favoriteIndex === -1,
      },
    });
  } catch (error: any) {
    console.error("Error toggling favorite:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle favorite",
      error: error.message,
    });
  }
};

// Share video
export const shareVideo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "user_id is required",
      });
    }

    const video = await SocialVideo.findById(id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    // Record share
    if (!video.shares.includes(user_id)) {
      video.shares.push(user_id);
      video.share_count += 1;
      await video.save();
    }

    res.status(200).json({
      success: true,
      message: "Share recorded",
      data: {
        share_count: video.share_count,
      },
    });
  } catch (error: any) {
    console.error("Error sharing video:", error);
    res.status(500).json({
      success: false,
      message: "Failed to share video",
      error: error.message,
    });
  }
};

// Get user's favorite videos
export const getUserFavorites = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const videos = await SocialVideo.find({
      favorites: parseInt(user_id),
      is_deleted: false,
    })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await SocialVideo.countDocuments({
      favorites: parseInt(user_id),
      is_deleted: false,
    });

    res.status(200).json({
      success: true,
      data: videos,
      pagination: {
        current_page: pageNum,
        total_pages: Math.ceil(total / limitNum),
        total_videos: total,
        has_more: pageNum * limitNum < total,
      },
    });
  } catch (error: any) {
    console.error("Error getting favorites:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get favorites",
      error: error.message,
    });
  }
};

// Get video statistics
export const getVideoStats = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const video = await SocialVideo.findById(id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        video_id: video._id,
        views: video.view_count,
        likes: video.like_count,
        dislikes: video.dislike_count,
        comments: video.comment_count,
        shares: video.share_count,
        favorites: video.favorite_count,
        analytics: video.analytics,
      },
    });
  } catch (error: any) {
    console.error("Error getting video stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get video stats",
      error: error.message,
    });
  }
};

// Search videos
export const searchVideos = async (req: Request, res: Response) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const searchRegex = new RegExp(q as string, "i");

    const videos = await SocialVideo.find({
      is_public: true,
      is_deleted: false,
      is_blocked: false,
      $or: [
        { title: searchRegex },
        { description: searchRegex },
        { tags: searchRegex },
        { "user.telegram_name": searchRegex },
        { "user.telegram_username": searchRegex },
      ],
    })
      .sort({ view_count: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await SocialVideo.countDocuments({
      is_public: true,
      is_deleted: false,
      is_blocked: false,
      $or: [
        { title: searchRegex },
        { description: searchRegex },
        { tags: searchRegex },
        { "user.telegram_name": searchRegex },
        { "user.telegram_username": searchRegex },
      ],
    });

    res.status(200).json({
      success: true,
      data: videos,
      pagination: {
        current_page: pageNum,
        total_pages: Math.ceil(total / limitNum),
        total_videos: total,
        has_more: pageNum * limitNum < total,
      },
    });
  } catch (error: any) {
    console.error("Error searching videos:", error);
    res.status(500).json({
      success: false,
      message: "Failed to search videos",
      error: error.message,
    });
  }
};

// Update video (admin/owner only)
export const updateVideo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Don't allow updating critical fields
    delete updates._id;
    delete updates.user;
    delete updates.file_id;
    delete updates.url;
    delete updates.created_at;

    const video = await SocialVideo.findByIdAndUpdate(
      id,
      { ...updates, updated_at: new Date() },
      { new: true, runValidators: true }
    );

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Video updated successfully",
      data: video,
    });
  } catch (error: any) {
    console.error("Error updating video:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update video",
      error: error.message,
    });
  }
};

// Delete video (soft delete)
export const deleteVideo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const video = await SocialVideo.findByIdAndUpdate(
      id,
      { is_deleted: true, updated_at: new Date() },
      { new: true }
    );

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Video deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting video:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete video",
      error: error.message,
    });
  }
};

// Get user's uploaded videos
export const getUserUploadedVideos = async (req: Request, res: Response) => {
  try {
    const { telegram_id } = req.params;
    const { page = 1, limit = 10, include_deleted = false } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    const query: any = {
      "user.telegram_id": parseInt(telegram_id),
    };

    // By default, exclude deleted videos
    if (include_deleted !== "true") {
      query.is_deleted = false;
    }

    const videos = await SocialVideo.find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await SocialVideo.countDocuments(query);

    res.status(200).json({
      success: true,
      data: videos,
      pagination: {
        current_page: pageNum,
        total_pages: Math.ceil(total / limitNum),
        total_videos: total,
        has_more: pageNum * limitNum < total,
      },
    });
  } catch (error: any) {
    console.error("Error getting user uploaded videos:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get user uploaded videos",
      error: error.message,
    });
  }
};

