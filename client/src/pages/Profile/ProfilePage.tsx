import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetUserUploadedVideosQuery, useGetUserFavoritesQuery } from "../../api/endpoints/socialVideoApiSlice";
import "./ProfilePage.scss";
import SVG from "react-inlinesvg";

const getCurrentUser = () => ({
  telegram_id: window.Telegram?.WebApp?.initDataUnsafe?.user?.id || 7632668745,
  telegram_name: window.Telegram?.WebApp?.initDataUnsafe?.user?.first_name || "User",
  telegram_username: window.Telegram?.WebApp?.initDataUnsafe?.user?.username,
});

// Helper to get thumbnail URL through proxy
const getThumbnailUrl = (thumbnail: string) => {
  if (!thumbnail) return "";

  const apiBaseUrl = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:3000";
  console.log(`${apiBaseUrl}/api/proxy/image?url=${encodeURIComponent(thumbnail)}`);

  // Check if it's a Telegram file_id
  if (thumbnail.startsWith("AAMC") || thumbnail.startsWith("BAAC") || thumbnail.startsWith("AgAC")) {
    return "";
  }

  // If it's an external URL (Instagram, etc.), use proxy
  if (thumbnail.startsWith("http")) {
    return `${apiBaseUrl}/api/proxy/image?url=${encodeURIComponent(thumbnail)}`;
  }
  // If it's a local file
  return `${apiBaseUrl}/downloads/${thumbnail}`;
};

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState<"videos" | "favorites">("videos");
  const navigate = useNavigate();
  const user = getCurrentUser();

  const { data: uploadedData, isLoading: uploadedLoading } = useGetUserUploadedVideosQuery({
    telegram_id: user.telegram_id,
    page: 1,
    limit: 20,
  });

  const { data: favoritesData, isLoading: favoritesLoading } = useGetUserFavoritesQuery({
    user_id: user.telegram_id,
    page: 1,
    limit: 20,
  });

  const uploadedVideos = uploadedData?.data || [];
  const favoriteVideos = favoritesData?.data || [];
  const isLoading = activeTab === "videos" ? uploadedLoading : favoritesLoading;

  const videos = activeTab === "videos" ? uploadedVideos : favoriteVideos;
  const totalCount = activeTab === "videos" ? uploadedData?.pagination.total_videos || 0 : favoritesData?.pagination.total_videos || 0;

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar">{user.telegram_name.charAt(0).toUpperCase()}</div>
        <h2 className="profile-name">{user.telegram_name}</h2>
        {user.telegram_username && <p className="profile-username">@{user.telegram_username}</p>}

        <div className="profile-stats">
          <div className="stat">
            <span className="stat-value">{uploadedData?.pagination.total_videos || 0}</span>
            <span className="stat-label">Videos</span>
          </div>
          <div className="stat">
            <span className="stat-value">{favoritesData?.pagination.total_videos || 0}</span>
            <span className="stat-label">Favorites</span>
          </div>
        </div>
      </div>

      <div className="profile-page-container">
        <div className="profile-tabs">
          <button className={`tab ${activeTab === "videos" ? "active" : ""}`} onClick={() => setActiveTab("videos")}>
            <SVG src="/svg/reels.svg" />
            My Videos
          </button>
          <button className={`tab ${activeTab === "favorites" ? "active" : ""}`} onClick={() => setActiveTab("favorites")}>
            <SVG src="/svg/favorite.svg" />
            Favorites
          </button>
        </div>

        <div className="profile-content">
          {isLoading ? (
            <div className="loading">Loading...</div>
          ) : videos.length === 0 ? (
            <div className="empty">
              <p>{activeTab === "videos" ? "No videos yet" : "No favorites yet"}</p>
              <p className="hint">{activeTab === "videos" ? "Upload your first video!" : "Like videos to add them to favorites"}</p>
            </div>
          ) : (
            <div className="video-grid">
              {videos.map((video) => (
                <div key={video._id} className="video-card" onClick={() => navigate(`/?video=${video._id}`)}>
                  <div className="video-thumbnail">
                    {video.thumbnail && getThumbnailUrl(video.thumbnail) ? (
                      <img
                        src={getThumbnailUrl(video.thumbnail)}
                        alt={video.title || "Video"}
                        onError={(e) => {
                          // Hide image and show placeholder on error
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                        }}
                      />
                    ) : null}
                    {(!video.thumbnail || !getThumbnailUrl(video.thumbnail)) && (
                      <div className="thumbnail-placeholder">
                        <span className="icon">🎬</span>
                      </div>
                    )}

                    {/* Play icon overlay */}
                    <div className="play-overlay">
                      <div className="play-icon">▶️</div>
                    </div>

                    <div className="video-duration">
                      {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, "0")}
                    </div>
                  </div>
                  <div className="video-info">
                    <p className="video-title">{video.title || "Untitled Video"}</p>
                    <div className="video-stats">
                      <span>
                        <SVG src="/svg/eye.svg" /> {video.view_count}
                      </span>
                      <span>
                        <SVG src="/svg/like.svg" /> {video.like_count}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && videos.length > 0 && (
            <div className="load-more">
              <p>
                Showing {videos.length} of {totalCount} videos
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
