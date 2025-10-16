import { useState } from "react";
import { useDownloadVideoMutation } from "../../api/endpoints/socialVideoApiSlice";
import "./VideoUploader.scss";

const getCurrentUser = () => ({
  telegram_id: window.Telegram?.WebApp?.initDataUnsafe?.user?.id || 7632668745,
  telegram_name: window.Telegram?.WebApp?.initDataUnsafe?.user?.first_name || "User",
  telegram_username: window.Telegram?.WebApp?.initDataUnsafe?.user?.username,
});

const VideoUploader = () => {
  const [url, setUrl] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [downloadVideo, { isLoading, isSuccess, isError, error }] = useDownloadVideoMutation();

  const user = getCurrentUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim()) {
      alert("Please enter a video URL");
      return;
    }

    try {
      const result = await downloadVideo({
        url: url.trim(),
        user: {
          telegram_id: user.telegram_id,
          telegram_name: user.telegram_name,
          telegram_username: user.telegram_username,
        },
        is_public: isPublic,
      }).unwrap();

      console.log("Video downloaded:", result);
      
      // Show success message
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.showPopup({
          title: "Success! ✅",
          message: "Video downloaded successfully!",
          buttons: [{ type: "ok" }],
        });
      } else {
        alert("Video downloaded successfully!");
      }

      // Reset form
      setUrl("");
    } catch (err: any) {
      console.error("Download error:", err);
      
      const errorMessage = err?.data?.message || "Failed to download video";
      
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.showPopup({
          title: "Error ❌",
          message: errorMessage,
          buttons: [{ type: "ok" }],
        });
      } else {
        alert(errorMessage);
      }
    }
  };

  const detectPlatform = (url: string) => {
    if (url.includes("instagram.com")) return "Instagram";
    if (url.includes("tiktok.com")) return "TikTok";
    if (url.includes("youtube.com") || url.includes("youtu.be")) return "YouTube";
    if (url.includes("facebook.com")) return "Facebook";
    if (url.includes("twitter.com") || url.includes("x.com")) return "Twitter/X";
    return null;
  };

  const platform = url ? detectPlatform(url) : null;

  return (
    <div className="video-uploader">
      <div className="uploader-header">
        <h3 className="uploader-title">📥 Download Video</h3>
        <p className="uploader-subtitle">Paste a link from Instagram, TikTok, YouTube, etc.</p>
      </div>

      <form onSubmit={handleSubmit} className="uploader-form">
        <div className="form-group">
          <label htmlFor="url">Video URL</label>
          <input
            id="url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.instagram.com/reel/..."
            className="form-input"
            disabled={isLoading}
            autoFocus
          />
          {platform && (
            <div className="platform-badge">
              <span className="badge">{platform}</span>
            </div>
          )}
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              disabled={isLoading}
            />
            <span>Публичное видео (доступно всем)</span>
          </label>
        </div>

        <button 
          type="submit" 
          className="submit-btn"
          disabled={isLoading || !url.trim()}
        >
          {isLoading ? (
            <>
              <span className="spinner"></span>
              Downloading...
            </>
          ) : (
            <>
              <span>📥</span>
              Download Video
            </>
          )}
        </button>

        {isSuccess && (
          <div className="success-message">
            ✅ Video downloaded successfully!
          </div>
        )}

        {isError && (
          <div className="error-message">
            ❌ {(error as any)?.data?.message || "Failed to download video"}
          </div>
        )}
      </form>

      <div className="supported-platforms">
        <p className="platforms-title">Supported platforms:</p>
        <div className="platforms-list">
          <span className="platform-chip">Instagram</span>
          <span className="platform-chip">TikTok</span>
          <span className="platform-chip">YouTube</span>
          <span className="platform-chip">Facebook</span>
          <span className="platform-chip">Twitter/X</span>
          <span className="platform-chip">VK</span>
          <span className="platform-chip">Pinterest</span>
          <span className="platform-chip">Reddit</span>
        </div>
      </div>
    </div>
  );
};

export default VideoUploader;

