import { Request, Response } from "express";
import { exec } from "child_process";
import { promisify } from "util";
import { access, unlink, readFile } from "fs/promises";
import { randomBytes } from "crypto";
import { constants } from "fs";
import path from "path";
import FormData from "form-data";
import axios from "axios";
import SocialVideo from "../models/socialVideoModel";

const execAsync = promisify(exec);

// Storage API endpoint
const STORAGE_API_URL = "https://dev.admin13.uz/homepage/v1/uploads/video/single";
const STORAGE_FOLDER = "videos";

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

// Types for storage API response
interface StorageApiResponse {
  success: boolean;
  message: string;
  data: {
    url: string;
    key: string;
    folder: string;
  };
}

// Upload video to external storage
async function uploadToStorage(filePath: string): Promise<{ url: string; key: string }> {
  try {
    console.log(`☁️ Uploading video to storage: ${filePath}`);

    // Read file as buffer
    const fileBuffer = await readFile(filePath);
    const fileName = path.basename(filePath);

    // Create form data
    const formData = new FormData();
    formData.append("video", fileBuffer, {
      filename: fileName,
      contentType: "video/mp4",
    });
    formData.append("folder", STORAGE_FOLDER);

    // Upload to storage
    const response = await axios.post<StorageApiResponse>(STORAGE_API_URL, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      timeout: 300000, // 5 minutes
    });

    if (response.data && response.data.success && response.data.data) {
      console.log("✅ Video uploaded to storage:", response.data.data.url);
      return {
        url: response.data.data.url,
        key: response.data.data.key,
      };
    } else {
      throw new Error("Invalid response from storage API");
    }
  } catch (error: any) {
    console.error("❌ Error uploading to storage:", error.message);
    throw new Error(`Failed to upload to storage: ${error.message}`);
  }
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
    const downloadPath = path.join(process.cwd(), "downloads");
    const videoPath = path.join(downloadPath, `${uniqueName}.mp4`);

    console.log(`📥 Downloading video from: ${url}`);
    console.log(`💾 Saving to: ${videoPath}`);

    // Determine platform and cookies
    const platform = detectPlatform(url);
    let cookiesOption = "";
    
    if (platform === "instagram") {
      const cookiesPath = path.join(process.cwd(), "important", "instagram.txt");
      cookiesOption = `--cookies "${cookiesPath}"`;
      console.log("🍪 Using Instagram cookies");
    } else if (platform === "youtube") {
      const cookiesPath = path.join(process.cwd(), "important", "youtube.txt");
      cookiesOption = `--cookies "${cookiesPath}"`;
      console.log("🍪 Using YouTube cookies");
    }

    // Download video using yt-dlp with cookies
    const command = `yt-dlp ${cookiesOption} --no-playlist -o "${videoPath}" "${url}"`;
    console.log(`🔧 Command: ${command}`);

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

    // Get video metadata using yt-dlp (with cookies if available)
    let metadata: any = {};
    try {
      const metadataCommand = `yt-dlp ${cookiesOption} --dump-json "${url}"`;
      const { stdout: metadataJson } = await execAsync(metadataCommand, {
        timeout: 30000,
      });
      metadata = JSON.parse(metadataJson);
      console.log("✅ Metadata fetched successfully");
    } catch (metaError) {
      console.log("⚠️ Could not fetch metadata, using defaults");
    }

    // Upload video to external storage
    let storageUrl: string;
    let storageKey: string;
    
    try {
      const uploadResult = await uploadToStorage(videoPath);
      storageUrl = uploadResult.url;
      storageKey = uploadResult.key;
      console.log("✅ Video uploaded to storage successfully");
    } catch (uploadError: any) {
      console.error("❌ Failed to upload to storage:", uploadError.message);
      // Clean up local file
      try {
        await unlink(videoPath);
      } catch (unlinkError) {
        console.error("⚠️ Failed to delete local file:", unlinkError);
      }
      throw new Error(`Storage upload failed: ${uploadError.message}`);
    }

    // Create video record in database with storage URL
    const videoData = {
      user: {
        telegram_id: user.telegram_id,
        telegram_name: user.telegram_name,
        telegram_username: user.telegram_username || undefined,
      },
      url: storageUrl, // Store cloud storage URL
      file_id: storageKey, // Store storage key
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

    // Delete local file after successful upload and database save
    try {
      await unlink(videoPath);
      console.log("🗑️ Local video file deleted:", videoPath);
    } catch (unlinkError) {
      console.error("⚠️ Failed to delete local file (not critical):", unlinkError);
    }

    res.status(201).json({
      success: true,
      message: "Video downloaded, uploaded to storage, and saved successfully",
      data: {
        video_id: video._id,
        storage_url: storageUrl,
        storage_key: storageKey,
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
    const videoPath = req.file.path;

    // Upload video to external storage
    let storageUrl: string;
    let storageKey: string;
    
    try {
      const uploadResult = await uploadToStorage(videoPath);
      storageUrl = uploadResult.url;
      storageKey = uploadResult.key;
      console.log("✅ Video uploaded to storage successfully");
    } catch (uploadError: any) {
      console.error("❌ Failed to upload to storage:", uploadError.message);
      // Clean up local file
      try {
        await unlink(videoPath);
      } catch (unlinkError) {
        console.error("⚠️ Failed to delete local file:", unlinkError);
      }
      throw new Error(`Storage upload failed: ${uploadError.message}`);
    }

    // Create video record with storage URL
    const videoData = {
      user: {
        telegram_id: user.telegram_id,
        telegram_name: user.telegram_name,
        telegram_username: user.telegram_username || undefined,
      },
      url: storageUrl, // Store cloud storage URL
      file_id: storageKey, // Store storage key
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

    // Delete local file after successful upload
    try {
      await unlink(videoPath);
      console.log("🗑️ Local video file deleted:", videoPath);
    } catch (unlinkError) {
      console.error("⚠️ Failed to delete local file (not critical):", unlinkError);
    }

    res.status(201).json({
      success: true,
      message: "Video uploaded to storage and saved successfully",
      data: {
        video_id: video._id,
        storage_url: storageUrl,
        storage_key: storageKey,
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
    const downloadPath = path.join(process.cwd(), "downloads");
    const audioPath = path.join(downloadPath, `${uniqueName}.mp3`);

    console.log(`🎵 Downloading audio from: ${url}`);
    console.log(`💾 Saving to: ${audioPath}`);

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
    const downloadPath = path.join(process.cwd(), "downloads");
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
    const downloadPath = path.join(process.cwd(), "downloads");
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
