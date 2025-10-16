import { Request, Response } from "express";
import { exec } from "child_process";
import { promisify } from "util";
import { access, unlink } from "fs/promises";
import { randomBytes } from "crypto";
import { constants } from "fs";
import path from "path";
import SocialVideo from "../models/socialVideoModel";

const execAsync = promisify(exec);

// Generate unique filename
function generateUniqueFilename(): string {
  const timestamp = Date.now();
  const randomString = randomBytes(8).toString("hex");
  return `${timestamp}_${randomString}`;
}

// Detect platform from URL
function detectPlatform(url: string): string {
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
  if (url.includes("instagram.com")) return "instagram";
  if (url.includes("tiktok.com")) return "tiktok";
  if (url.includes("facebook.com") || url.includes("fb.com")) return "facebook";
  if (url.includes("twitter.com") || url.includes("x.com")) return "twitter";
  if (url.includes("vk.com")) return "vk";
  if (url.includes("pinterest.com")) return "pinterest";
  if (url.includes("reddit.com")) return "reddit";
  return "other";
}

// Download video from URL using yt-dlp
export const downloadVideo = async (req: Request, res: Response) => {
  try {
    const { url, user } = req.body;

    // Validation
    if (!url || !url.includes("http")) {
      return res.status(400).json({
        success: false,
        message: "Invalid URL provided",
      });
    }

    if (!user || !user.telegram_id || !user.telegram_name) {
      return res.status(400).json({
        success: false,
        message: "User information is required (telegram_id and telegram_name)",
      });
    }

    // Generate unique filename
    const uniqueName = generateUniqueFilename();
    const downloadPath = process.env.DOWNLOAD_PATH || path.join(process.cwd(), "downloads");
    const videoPath = path.join(downloadPath, `${uniqueName}.mp4`);

    console.log(`📥 Downloading video from: ${url}`);
    console.log(`💾 Saving to: ${videoPath}`);

    // Download video using yt-dlp with better options
    const command = `yt-dlp -o "${videoPath}" "${url}"`;

    const { stdout, stderr } = await execAsync(command, {
      timeout: 300000, // 5 minutes timeout
    });

    if (stderr && !stderr.includes("Deleting")) {
      console.log("⚠️ yt-dlp stderr:", stderr);
    }

    // Check if file exists
    try {
      await access(videoPath, constants.F_OK);
    } catch (error) {
      throw new Error("Downloaded file not found");
    }

    // Get video metadata using yt-dlp
    let metadata: any = {};
    try {
      const metadataCommand = `yt-dlp --dump-json "${url}"`;
      const { stdout: metadataJson } = await execAsync(metadataCommand, {
        timeout: 30000,
      });
      metadata = JSON.parse(metadataJson);
    } catch (metaError) {
      console.log("⚠️ Could not fetch metadata:", metaError);
    }

    // Create video record in database
    const videoData = {
      user: {
        telegram_id: user.telegram_id,
        telegram_name: user.telegram_name,
        telegram_username: user.telegram_username || undefined,
      },
      url: `${uniqueName}.mp4`, // Store relative path
      file_id: user.file_id || `local_${uniqueName}`, // For local storage
      thumbnail: metadata.thumbnail || "",
      source_url: url,
      source_platform: detectPlatform(url),
      title: metadata.title || null,
      description: metadata.description || null,
      duration: metadata.duration || 0,
      file_size: metadata.filesize || 0,
      width: metadata.width || 0,
      height: metadata.height || 0,
      is_public: req.body.is_public !== undefined ? req.body.is_public : true,
      tags: req.body.tags || [],
      category: req.body.category || null,
    };

    const video = new SocialVideo(videoData);
    await video.save();

    console.log("✅ Video saved to database:", video._id);

    res.status(201).json({
      success: true,
      message: "Video downloaded and saved successfully",
      data: {
        video_id: video._id,
        file_path: videoPath,
        platform: videoData.source_platform,
        title: videoData.title,
        duration: videoData.duration,
        file_size: videoData.file_size,
      },
    });
  } catch (error: any) {
    console.error("❌ Error downloading video:", error);

    // Enhanced error messages
    let errorMessage = "Failed to download video";
    let statusCode = 500;

    if (error.message.includes("timeout")) {
      errorMessage = "Download timeout - video is too large or server is slow";
      statusCode = 408;
    } else if (error.message.includes("Invalid URL") || error.message.includes("Unsupported URL")) {
      errorMessage = "Invalid or unsupported URL";
      statusCode = 400;
    } else if (error.message.includes("not found") || error.message.includes("HTTP Error 404")) {
      errorMessage = "Video not found or unavailable";
      statusCode = 404;
    } else if (error.message.includes("private") || error.message.includes("login")) {
      errorMessage = "Video is private or requires authentication";
      statusCode = 403;
    }

    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Upload video file directly (for already downloaded videos)
export const uploadVideo = async (req: Request, res: Response) => {
  try {
    const { user, source_url, title, description, tags, category, is_public } = req.body;

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No video file uploaded",
      });
    }

    // Validation
    if (!user || !user.telegram_id || !user.telegram_name) {
      return res.status(400).json({
        success: false,
        message: "User information is required",
      });
    }

    const platform = source_url ? detectPlatform(source_url) : "other";

    // Create video record
    const videoData = {
      user: {
        telegram_id: user.telegram_id,
        telegram_name: user.telegram_name,
        telegram_username: user.telegram_username || undefined,
      },
      url: req.file.filename,
      file_id: `local_${req.file.filename}`,
      thumbnail: "",
      source_url: source_url || null,
      source_platform: platform,
      title: title || null,
      description: description || null,
      duration: 0,
      file_size: req.file.size,
      width: 0,
      height: 0,
      is_public: is_public !== undefined ? is_public : true,
      tags: tags || [],
      category: category || null,
    };

    const video = new SocialVideo(videoData);
    await video.save();

    console.log("✅ Video uploaded and saved:", video._id);

    res.status(201).json({
      success: true,
      message: "Video uploaded successfully",
      data: {
        video_id: video._id,
        file_name: req.file.filename,
        file_size: req.file.size,
        platform: platform,
      },
    });
  } catch (error: any) {
    console.error("❌ Error uploading video:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload video",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Download audio from video URL
export const downloadAudio = async (req: Request, res: Response) => {
  try {
    const { url } = req.body;

    if (!url || !url.includes("http")) {
      return res.status(400).json({
        success: false,
        message: "Invalid URL provided",
      });
    }

    const uniqueName = generateUniqueFilename();
    const downloadPath = process.env.DOWNLOAD_PATH || path.join(process.cwd());
    const audioPath = path.join(downloadPath, "downloads", `${uniqueName}.mp3`);

    // Download audio using yt-dlp
    const command = `yt-dlp -f "bestaudio/best" -x --audio-format mp3 -o "${audioPath}" "${url}"`;

    await execAsync(command, {
      timeout: 300000,
    });

    // Check if file exists
    await access(audioPath, constants.F_OK);

    res.status(200).json({
      success: true,
      message: "Audio downloaded successfully",
      data: {
        file_path: audioPath,
        file_name: `${uniqueName}.mp3`,
      },
    });
  } catch (error: any) {
    console.error("❌ Error downloading audio:", error);
    res.status(500).json({
      success: false,
      message: "Failed to download audio",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get video file (serve video)
export const getVideoFile = async (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    const downloadPath = process.env.DOWNLOAD_PATH || path.join(process.cwd(), "downloads");
    const videoPath = path.join(downloadPath, filename);

    // Check if file exists
    await access(videoPath, constants.F_OK);

    res.sendFile(videoPath);
  } catch (error: any) {
    console.error("❌ Error serving video file:", error);
    res.status(404).json({
      success: false,
      message: "Video file not found",
    });
  }
};

// Delete video file from disk
export const deleteVideoFile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Find video in database
    const video = await SocialVideo.findById(id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    // Delete file from disk
    const downloadPath = process.env.DOWNLOAD_PATH || path.join(process.cwd(), "downloads");
    const videoPath = path.join(downloadPath, video.url);

    try {
      await unlink(videoPath);
      console.log("🗑️ Video file deleted from disk:", videoPath);
    } catch (fileError) {
      console.log("⚠️ Could not delete video file:", fileError);
    }

    // Mark as deleted in database
    video.is_deleted = true;
    video.updated_at = new Date();
    await video.save();

    res.status(200).json({
      success: true,
      message: "Video deleted successfully",
    });
  } catch (error: any) {
    console.error("❌ Error deleting video:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete video",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
