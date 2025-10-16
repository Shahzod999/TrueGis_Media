import express from "express";
import multer from "multer";
import path from "path";
import {
  downloadVideo,
  uploadVideo,
  downloadAudio,
  getVideoFile,
  deleteVideoFile,
} from "../controllers/videoDownloadController";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const downloadPath = process.env.DOWNLOAD_PATH || path.join(process.cwd(), "downloads");
    cb(null, downloadPath);
  },
  filename: (_req, file, cb) => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const ext = path.extname(file.originalname);
    cb(null, `${timestamp}_${randomString}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB max file size
  },
  fileFilter: (_req, file, cb) => {
    // Accept only video files
    const allowedMimes = [
      "video/mp4",
      "video/mpeg",
      "video/quicktime",
      "video/x-msvideo",
      "video/x-flv",
      "video/webm",
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only video files are allowed."));
    }
  },
});

// Download video from URL
router.post("/download", downloadVideo);

// Upload video file directly
router.post("/upload", upload.single("video"), uploadVideo);

// Download audio from URL
router.post("/download-audio", downloadAudio);

// Get video file (serve video)
router.get("/file/:filename", getVideoFile);

// Delete video file
router.delete("/file/:id", deleteVideoFile);

export default router;

