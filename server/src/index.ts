import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import botStart from "./telegram/bot";
import cookieParser from "cookie-parser";
import connectDB from "./config/db";
import socialVideoRoutes from "./routes/socialVideoRoutes";
import videoDownloadRoutes from "./routes/videoDownloadRoutes";
import path from "path";
import fs from "fs";
import axios from "axios";

dotenv.config();

// Инициализация бота с обработкой ошибок
try {
  botStart();
  console.log("Telegram bot started successfully");
} catch (error) {
  console.error("Failed to start Telegram bot:", error);
}

// Подключение к базе данных
connectDB();

// Create downloads directory if it doesn't exist
const downloadPath = path.join(process.cwd(), "downloads");
if (!fs.existsSync(downloadPath)) {
  fs.mkdirSync(downloadPath, { recursive: true });
  console.log(`📁 Created downloads directory: ${downloadPath}`);
} else {
  console.log(`📂 Using downloads directory: ${downloadPath}`);
}

const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

const app = express();

// const corsOpts = {
//   origin: (origin: any, callback: any) => {
//     const allowedOrigins = [
//       "http://138.197.178.202",
//       "http://localhost:5173",
//       "http://localhost:3001",
//       "http://localhost:3000",
//       "https://true-gis-admin-psi.vercel.app",
//       "http://192.168.43.22:5173",
//       "http://192.168.43.22",
//       "http://172.20.10.10",
//       "http://172.20.10.10:5173",
//       "https://true-gis-bot-admin.vercel.app",
//       "https://gxfl20sh-5173.euw.devtunnels.ms",
//       "https://media.admin13.uz",
//     ];
//     if (allowedOrigins.includes(origin) || !origin) {
//       callback(null, true); // Allow requests from allowed origins or non-browser tools
//     } else {
//       callback(null, false); // Reject instead of throwing error
//     }
//   },
//   methods: ["POST", "GET", "HEAD", "PUT", "DELETE", "OPTIONS"],
//   credentials: true,
//   optionsSuccessStatus: 200,
// };

// app.use(cors(corsOpts));

app.use(
  cors({
    origin: "*",
    methods: ["POST", "GET", "HEAD", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

// Middleware для логирования запросов
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/downloads", express.static(downloadPath));

// Тестовый маршрут для проверки работы API
app.get("/", (_req, res) => {
  res.json({
    message: "API is working",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Тестовый маршрут для проверки API
app.get("/api", (_req, res) => {
  res.json({
    message: "TrueGIS Social Video API",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    routes: {
      videos: "/api/videos",
      download: "/api/download",
    },
  });
});

app.use("/api/videos", socialVideoRoutes);
app.use("/api/download", videoDownloadRoutes);

// Proxy endpoint for Instagram thumbnails and other external images
app.get("/api/proxy/image", async (req, res) => {
  try {
    const { url } = req.query;

    if (!url || typeof url !== "string") {
      return res.status(400).json({
        success: false,
        message: "URL parameter is required",
      });
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return res.status(400).json({
        success: false,
        message: "Invalid URL provided",
      });
    }

    // Fetch image from external source
    const response = await axios.get(url, {
      responseType: "arraybuffer",
      timeout: 10000,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        Referer: "https://www.instagram.com/",
        Origin: "https://www.instagram.com",
        "sec-ch-ua": '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "image",
        "sec-fetch-mode": "no-cors",
        "sec-fetch-site": "cross-site",
      },
    });

    // Set appropriate headers
    const contentType = response.headers["content-type"] || "image/jpeg";
    res.set({
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400", // Cache for 24 hours
    });

    res.send(response.data);
  } catch (error: any) {
    console.error("Error proxying image:", error.message);

    // Return a 1x1 transparent pixel as fallback
    const transparentPixel = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      "base64"
    );

    res.set("Content-Type", "image/png");
    res.status(200).send(transparentPixel);
  }
});

// Обработка 404 ошибок
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Глобальный обработчик ошибок
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Global error handler:", error);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? error.message : undefined,
  });
});

// Vercel использует serverless функции, поэтому не используем традиционный метод listen
// но сохраняем его для локальной разработки
app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`MongoDB URL: ${process.env.MONGODB_URI ? "Configured" : "Not configured"}`);
});

// Экспортируем app для Vercel
export default app;
