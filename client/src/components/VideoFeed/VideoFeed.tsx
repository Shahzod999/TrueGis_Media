import { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  useGetVideoFeedQuery,
  useGetVideoByIdQuery,
  useLikeVideoMutation,
  useToggleFavoriteMutation,
  useShareVideoMutation,
  useRecordViewMutation,
  Video,
} from "../../api/endpoints/socialVideoApiSlice";
import "./VideoFeed.scss";
import SVG from "react-inlinesvg";

// Mock user - replace with real user from Telegram WebApp
const getCurrentUser = () => ({
  telegram_id: window.Telegram?.WebApp?.initDataUnsafe?.user?.id || 7632668745,
  telegram_name: window.Telegram?.WebApp?.initDataUnsafe?.user?.first_name || "User",
  telegram_username: window.Telegram?.WebApp?.initDataUnsafe?.user?.username,
});

interface VideoItemProps {
  video: Video;
  isActive: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  onLike: (id: string) => void;
  onFavorite: (id: string) => void;
  onShare: (id: string) => void;
}

const VideoItem = ({ video, isActive, isMuted, onToggleMute, onLike, onFavorite, onShare }: VideoItemProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [localLikeCount, setLocalLikeCount] = useState(video.like_count);
  const [localFavoriteCount, setLocalFavoriteCount] = useState(video.favorite_count);
  const [videoError, setVideoError] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [recordView] = useRecordViewMutation();

  const MAX_DESCRIPTION_LENGTH = 100;

  useEffect(() => {
    if (!videoRef.current) return;

    const playVideo = async () => {
      try {
        if (isActive && videoRef.current) {
          // Сбрасываем видео чтобы начать с начала
          videoRef.current.currentTime = 0;
          videoRef.current.muted = isMuted;

          // Пытаемся воспроизвести
          await videoRef.current.play();

          // Record view after 3 seconds
          const timer = setTimeout(() => {
            const user = getCurrentUser();
            recordView({
              id: video._id,
              body: {
                user_id: user.telegram_id,
                watch_time: 3,
              },
            });
          }, 3000);

          return () => clearTimeout(timer);
        } else if (videoRef.current) {
          videoRef.current.pause();
          videoRef.current.currentTime = 0; // Сбрасываем время для следующего воспроизведения
        }
      } catch (error) {
        console.error("Error playing video:", error);
      }
    };

    playVideo();
  }, [isActive, video._id, recordView, isMuted]);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    setLocalLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
    onLike(video._id);
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorited(!isFavorited);
    setLocalFavoriteCount((prev) => (isFavorited ? prev - 1 : prev + 1));
    onFavorite(video._id);
  };

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  // Get API base URL from env or default
  const apiBaseUrl = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:3000";

  const videoUrl = video.url.startsWith("http") ? video.url : `${apiBaseUrl}/downloads/${video.url}`;

  const handleVideoError = () => {
    console.error("Failed to load video:", videoUrl);
    setVideoError(true);
  };

  const handleVideoClick = (e: React.MouseEvent) => {
    // Toggle mute/unmute when clicking on video
    const target = e.target as HTMLElement;
    const isVideoClick = target.classList.contains("video-player");

    if (isVideoClick) {
      e.stopPropagation();
      onToggleMute();
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    // Close description if it's expanded and click is outside description area
    const target = e.target as HTMLElement;
    const isDescriptionClick = target.closest(".description-container");

    if (!isDescriptionClick && isDescriptionExpanded) {
      setIsDescriptionExpanded(false);
    }
  };

  return (
    <div className="video-item" onClick={handleVideoClick}>
      {videoError ? (
        <div className="video-error">
          <p>❌ Failed to load video</p>
          <p className="error-url">{video.url}</p>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            src={videoUrl}
            poster={video.thumbnail}
            loop
            playsInline
            muted={isMuted}
            className="video-player"
            onError={handleVideoError}
            onLoadedData={() => console.log("Video loaded:", videoUrl)}
            preload="metadata"
          />

          {/* Permanent volume indicator in corner */}
          <div className="volume-badge">{isMuted ? "🔇" : "🔊"}</div>
        </>
      )}

      <div className="video-overlay" onClick={handleOverlayClick}>
        <div className="video-info">
          <div className="user-info">
            <div className="user-avatar">{video.user.telegram_name.charAt(0).toUpperCase()}</div>
            <span className="username">@{video.user.telegram_username || video.user.telegram_name}</span>
          </div>

          {video.title && <p className="title">{video.title}</p>}

          {video.description && (
            <div className="description-container">
              <p className="description">
                {isDescriptionExpanded
                  ? video.description
                  : video.description.length > MAX_DESCRIPTION_LENGTH
                  ? `${video.description.substring(0, MAX_DESCRIPTION_LENGTH)}...`
                  : video.description}
              </p>
              {video.description.length > MAX_DESCRIPTION_LENGTH && (
                <button
                  className="expand-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDescriptionExpanded(!isDescriptionExpanded);
                  }}
                >
                  {isDescriptionExpanded ? "Свернуть" : "Ещё"}
                </button>
              )}
            </div>
          )}

          <div className="stats">👁️ {formatCount(video.view_count)} views</div>

          {video.tags && video.tags.length > 0 && (
            <div className="tags">
              {video.tags.map((tag, index) => (
                <span key={index} className="tag">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="actions">
          <div className={`action-btn ${isLiked ? "active" : ""}`} onClick={handleLike}>
            <span className="icon">
              <SVG src="/svg/like.svg" />
            </span>
            <span className="count">{formatCount(localLikeCount)}</span>
          </div>

          <div className={`action-btn ${isFavorited ? "active" : ""}`} onClick={handleFavorite}>
            <span className="icon">
              <SVG src="/svg/favorite.svg" />
            </span>
            <span className="count">{formatCount(localFavoriteCount)}</span>
          </div>

          <div
            className="action-btn"
            onClick={(e) => {
              e.stopPropagation();
              onShare(video._id);
            }}
          >
            <span className="icon">
              <SVG src="/svg/share.svg" />
            </span>
            <span className="count">{formatCount(video.share_count)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const VideoFeed = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const videoIdFromUrl = searchParams.get("video");

  const [page, setPage] = useState(1);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [showVolumeIndicator, setShowVolumeIndicator] = useState(false);
  const [initialScrollDone, setInitialScrollDone] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const { data, isLoading, error } = useGetVideoFeedQuery({ page, limit: 10 });
  console.log(data, error);

  // Load specific video if ID is in URL
  const { data: singleVideoData } = useGetVideoByIdQuery(videoIdFromUrl || "", {
    skip: !videoIdFromUrl,
  });

  const [likeVideo] = useLikeVideoMutation();
  const [toggleFavorite] = useToggleFavoriteMutation();
  const [shareVideo] = useShareVideoMutation();

  // Combine feed videos with the specific video if needed
  let videos = data?.data || [];

  // If we have a specific video from URL, add it to the beginning
  if (singleVideoData?.data && videoIdFromUrl && !initialScrollDone) {
    const existingIndex = videos.findIndex((v) => v._id === videoIdFromUrl);
    if (existingIndex === -1) {
      // Video not in feed, add it to the beginning
      videos = [singleVideoData.data, ...videos];
    } else {
      // Video is in feed, move it to the beginning
      const videoToMove = videos[existingIndex];
      videos = [videoToMove, ...videos.filter((v) => v._id !== videoIdFromUrl)];
    }
  }

  const user = getCurrentUser();

  const handleLike = useCallback(
    (id: string) => {
      likeVideo({
        id,
        body: { user_id: user.telegram_id },
      });
    },
    [likeVideo, user.telegram_id]
  );

  const handleFavorite = useCallback(
    (id: string) => {
      toggleFavorite({
        id,
        body: { user_id: user.telegram_id },
      });
    },
    [toggleFavorite, user.telegram_id]
  );

  const handleShare = useCallback(
    (id: string) => {
      shareVideo({
        id,
        body: { user_id: user.telegram_id },
      });

      // Copy link to clipboard
      const link = `${window.location.origin}/video/${id}`;
      navigator.clipboard.writeText(link);

      // Show Telegram share if available
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.showPopup({
          title: "Share Video",
          message: "Link copied to clipboard!",
          buttons: [{ type: "ok" }],
        });
      }
    },
    [shareVideo, user.telegram_id]
  );

  const handleToggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);

    // Show volume indicator
    setShowVolumeIndicator(true);
    setTimeout(() => setShowVolumeIndicator(false), 1000);
  }, []);

  // Auto-scroll to specific video from URL
  useEffect(() => {
    if (!videoIdFromUrl || !containerRef.current || videos.length === 0 || initialScrollDone) return;

    // Wait a bit for DOM to render
    const timer = setTimeout(() => {
      const videoIndex = videos.findIndex((v) => v._id === videoIdFromUrl);

      if (videoIndex !== -1) {
        // Scroll to the video
        const videoElement = containerRef.current?.querySelector(`[data-index="${videoIndex}"]`) as HTMLElement;

        if (videoElement) {
          videoElement.scrollIntoView({ behavior: "smooth", block: "start" });
          setActiveVideoIndex(videoIndex);
          setInitialScrollDone(true);

          // Remove video param from URL after scrolling
          setTimeout(() => {
            setSearchParams({});
          }, 1000);
        }
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [videoIdFromUrl, videos, initialScrollDone, setSearchParams]);

  // Используем более надежный подход для определения видимого видео
  useEffect(() => {
    if (!containerRef.current || videos.length === 0) return;

    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const containerCenter = containerRect.top + containerRect.height / 2;

      let closestIndex = 0;
      let minDistance = Infinity;

      // Находим видео, которое ближе всего к центру экрана
      videos.forEach((_, index) => {
        const videoElement = container.querySelector(`[data-index="${index}"] .video-item`) as HTMLElement;
        if (videoElement) {
          const videoRect = videoElement.getBoundingClientRect();
          const videoCenter = videoRect.top + videoRect.height / 2;
          const distance = Math.abs(videoCenter - containerCenter);

          if (distance < minDistance) {
            minDistance = distance;
            closestIndex = index;
          }
        }
      });

      setActiveVideoIndex(closestIndex);

      // Load more videos when near the end
      if (closestIndex >= videos.length - 3 && data?.pagination.has_more) {
        setPage((prev) => prev + 1);
      }
    };

    // Используем throttle для оптимизации
    let scrollTimeout: ReturnType<typeof setTimeout>;
    const throttledScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(handleScroll, 100);
    };

    const container = containerRef.current;
    container.addEventListener("scroll", throttledScroll);

    // Initial check
    handleScroll();

    return () => {
      container.removeEventListener("scroll", throttledScroll);
      clearTimeout(scrollTimeout);
    };
  }, [videos.length, data?.pagination.has_more, videos]);

  // Альтернативный вариант с Intersection Observer (оставляем как запасной)
  useEffect(() => {
    if (!containerRef.current || videos.length === 0) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.7) {
            const index = Number(entry.target.getAttribute("data-index"));
            setActiveVideoIndex(index);
          }
        });
      },
      {
        threshold: [0.7],
        root: containerRef.current,
      }
    );

    const videoElements = containerRef.current.querySelectorAll("[data-index]");
    videoElements.forEach((el) => observerRef.current?.observe(el));

    return () => {
      observerRef.current?.disconnect();
    };
  }, [videos.length]);

  if (isLoading && videos.length === 0) {
    return (
      <div className="video-feed loading">
        <div className="loader">Loading videos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="video-feed error">
        <div className="error-message">
          <p>Failed to load videos</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="video-feed empty">
        <div className="empty-message">
          <p>No videos yet</p>
          <p>Be the first to upload!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="video-feed" ref={containerRef}>
      {/* Global volume indicator */}
      {showVolumeIndicator && (
        <div className="global-volume-indicator">
          <span className="volume-icon">{isMuted ? "🔇" : "🔊"}</span>
        </div>
      )}

      {videos.map((video, index) => (
        <div key={video._id} data-index={index}>
          <VideoItem
            video={video}
            isActive={index === activeVideoIndex}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            onLike={handleLike}
            onFavorite={handleFavorite}
            onShare={handleShare}
          />
        </div>
      ))}

      {isLoading && videos.length > 0 && <div className="loading-more">Loading more...</div>}
    </div>
  );
};

export default VideoFeed;
