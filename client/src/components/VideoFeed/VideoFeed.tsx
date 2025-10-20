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

// ======================== Constants ========================
const MAX_DESCRIPTION_LENGTH = 100;
const VIEW_RECORD_DELAY = 3000;
const SCROLL_THROTTLE_DELAY = 100;
const PRELOAD_THRESHOLD = 3;
const INTERSECTION_THRESHOLD = 0.7;
const VOLUME_INDICATOR_TIMEOUT = 1000;

// ======================== Helpers ========================
/**
 * Get current user from Telegram WebApp
 */
const getCurrentUser = () => ({
  telegram_id: window.Telegram?.WebApp?.initDataUnsafe?.user?.id || 7632668745,
  telegram_name: window.Telegram?.WebApp?.initDataUnsafe?.user?.first_name || "User",
  telegram_username: window.Telegram?.WebApp?.initDataUnsafe?.user?.username,
});

/**
 * Format count for display (1K, 1M, etc)
 */
const formatCount = (count: number): string => {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
};

/**
 * Get video URL with proper base URL
 * Handles both cloud storage URLs and legacy local URLs
 */
const getVideoUrl = (videoUrl: string): string => {
  // If it's already a full URL (cloud storage), return as is
  if (videoUrl.startsWith("http://") || videoUrl.startsWith("https://")) {
    return videoUrl;
  }

  // Legacy support: for local files, construct local URL
  const apiBaseUrl = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:3000";
  return `${apiBaseUrl}/downloads/${videoUrl}`;
};

// ======================== Types ========================
interface VideoItemProps {
  video: Video;
  isActive: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  onLike: (id: string) => void;
  onFavorite: (id: string) => void;
  onShare: (id: string) => void;
}

// ======================== VideoItem Component ========================
const VideoItem = ({ video, isActive, isMuted, onToggleMute, onLike, onFavorite, onShare }: VideoItemProps) => {
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const viewRecordedRef = useRef(false);
  const viewTimerRef = useRef<number | undefined>(undefined);

  // Local state
  const [isLiked, setIsLiked] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [localLikeCount, setLocalLikeCount] = useState(video.like_count);
  const [localFavoriteCount, setLocalFavoriteCount] = useState(video.favorite_count);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  // API mutations
  const [recordView] = useRecordViewMutation();

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handlePlayback = async () => {
      try {
        if (isActive) {
          // Start video from beginning
          videoElement.currentTime = 0;
          await videoElement.play();

          // Record view after delay (only once)
          if (!viewRecordedRef.current) {
            viewTimerRef.current = setTimeout(() => {
              const user = getCurrentUser();
              recordView({
                id: video._id,
                body: {
                  user_id: user.telegram_id,
                  watch_time: 3,
                },
              });
              viewRecordedRef.current = true;
            }, VIEW_RECORD_DELAY);
          }
        } else {
          // Pause and reset video
          videoElement.pause();
          videoElement.currentTime = 0;

          // Reset view tracking
          viewRecordedRef.current = false;
          if (viewTimerRef.current) {
            clearTimeout(viewTimerRef.current);
          }
        }
      } catch (error) {
        console.error("Error controlling video playback:", error);
      }
    };

    handlePlayback();

    return () => {
      if (viewTimerRef.current) {
        clearTimeout(viewTimerRef.current);
      }
    };
  }, [isActive, video._id, recordView]);

  // ========== Effect: Handle mute state changes (separate from playback) ==========
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // ========== Event Handlers ==========
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

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShare(video._id);
  };

  const handleVideoClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const isVideoClick = target.classList.contains("video-player");

    if (isVideoClick) {
      e.stopPropagation();
      onToggleMute();
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const isDescriptionClick = target.closest(".description-container");

    if (!isDescriptionClick && isDescriptionExpanded) {
      setIsDescriptionExpanded(false);
    }
  };

  const toggleDescription = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDescriptionExpanded(!isDescriptionExpanded);
  };

  // ========== Render ==========
  const videoUrl = getVideoUrl(video.url);
  const shouldTruncateDescription = video.description && video.description.length > MAX_DESCRIPTION_LENGTH;

  return (
    <div className="video-item" onClick={handleVideoClick}>
      <video
        ref={videoRef}
        src={videoUrl}
        poster={video.thumbnail}
        loop
        playsInline
        muted={isMuted}
        className="video-player"
        onLoadedData={() => console.log("Video loaded:", videoUrl)}
        preload="metadata"
      />

      {/* Volume indicator badge */}
      <div className="volume-badge">{isMuted ? <SVG src="/svg/soundOff.svg" /> : <SVG src="/svg/soundOn.svg" />}</div>

      {/* Video overlay with info and actions */}
      <div className="video-overlay" onClick={handleOverlayClick}>
        {/* Video Information */}
        <div className="video-info">
          {/* User info */}
          <div className="user-info">
            <div className="user-avatar">{video.user.telegram_name.charAt(0).toUpperCase()}</div>
            <span className="username">{video.user.telegram_name || `@${video.user.telegram_username}`}</span>
          </div>

          {/* Title */}
          {video.title && <p className="title">{video.title}</p>}

          {/* Description with expand/collapse */}
          {video.description && (
            <div className={`description-container ${isDescriptionExpanded ? "expanded" : ""}`}>
              <p className="description">{video.description}</p>
              {shouldTruncateDescription && (
                <button className="expand-btn" onClick={toggleDescription}>
                  {isDescriptionExpanded ? "Свернуть" : "Ещё"}
                </button>
              )}
            </div>
          )}

          {/* View count */}
          <div className="stats">
            {formatCount(video.view_count)} <SVG src="/svg/eye.svg" />
          </div>

          {/* Tags */}
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

        {/* Action buttons */}
        <div className="actions">
          {/* Like */}
          <div className={`action-btn ${isLiked ? "active" : ""}`} onClick={handleLike}>
            <span className="icon">{isLiked ? <SVG src="/svg/likeOn.svg" /> : <SVG src="/svg/like.svg" />}</span>
            <span className="count">{formatCount(localLikeCount)}</span>
          </div>

          {/* Favorite */}
          <div className={`action-btn ${isFavorited ? "active" : ""}`} onClick={handleFavorite}>
            <span className="icon">{isFavorited ? <SVG src="/svg/favoriteOn.svg" /> : <SVG src="/svg/favorite.svg" />}</span>
            <span className="count">{formatCount(localFavoriteCount)}</span>
          </div>

          {/* Share */}
          <div className="action-btn" onClick={handleShare}>
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

// ======================== VideoFeed Component ========================
export const VideoFeed = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const videoIdFromUrl = searchParams.get("video");

  // State
  const [page, setPage] = useState(1);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [showVolumeIndicator, setShowVolumeIndicator] = useState(false);
  const [initialScrollDone, setInitialScrollDone] = useState(false);
  const [allVideos, setAllVideos] = useState<Video[]>([]);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isLoadingMoreRef = useRef(false);

  // API queries
  const { data, isLoading, error } = useGetVideoFeedQuery({ page, limit: 10 });
  const { data: singleVideoData } = useGetVideoByIdQuery(videoIdFromUrl || "", {
    skip: !videoIdFromUrl,
  });

  // API mutations
  const [likeVideo] = useLikeVideoMutation();
  const [toggleFavorite] = useToggleFavoriteMutation();
  const [shareVideo] = useShareVideoMutation();

  const user = getCurrentUser();

  // ========== Effect: Accumulate videos from pagination ==========
  useEffect(() => {
    if (data?.data) {
      setAllVideos((prev) => {
        // Avoid duplicates
        const newVideos = data.data.filter((newVideo) => !prev.some((existingVideo) => existingVideo._id === newVideo._id));
        return [...prev, ...newVideos];
      });
      isLoadingMoreRef.current = false;
    }
  }, [data]);

  // ========== Effect: Prepend specific video from URL ==========
  useEffect(() => {
    if (singleVideoData?.data && videoIdFromUrl && !initialScrollDone) {
      setAllVideos((prev) => {
        const existingIndex = prev.findIndex((v) => v._id === videoIdFromUrl);
        if (existingIndex === -1) {
          // Add to beginning
          return [singleVideoData.data, ...prev];
        } else {
          // Move to beginning
          const videoToMove = prev[existingIndex];
          return [videoToMove, ...prev.filter((v) => v._id !== videoIdFromUrl)];
        }
      });
    }
  }, [singleVideoData, videoIdFromUrl, initialScrollDone]);

  // ========== Effect: Auto-scroll to specific video from URL ==========
  useEffect(() => {
    if (!videoIdFromUrl || !containerRef.current || allVideos.length === 0 || initialScrollDone) {
      return;
    }

    const timer = setTimeout(() => {
      const videoIndex = allVideos.findIndex((v) => v._id === videoIdFromUrl);

      if (videoIndex !== -1) {
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
  }, [videoIdFromUrl, allVideos, initialScrollDone, setSearchParams]);

  // ========== Effect: Handle scroll to determine active video and load more ==========
  useEffect(() => {
    if (!containerRef.current || allVideos.length === 0) return;

    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const containerCenter = containerRect.top + containerRect.height / 2;

      let closestIndex = 0;
      let minDistance = Infinity;

      // Find video closest to center of screen
      allVideos.forEach((_, index) => {
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
      if (closestIndex >= allVideos.length - PRELOAD_THRESHOLD && data?.pagination.has_more && !isLoadingMoreRef.current && !isLoading) {
        isLoadingMoreRef.current = true;
        setPage((prev) => prev + 1);
      }
    };

    // Throttle scroll events
    let scrollTimeout: ReturnType<typeof setTimeout>;
    const throttledScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(handleScroll, SCROLL_THROTTLE_DELAY);
    };

    const container = containerRef.current;
    container.addEventListener("scroll", throttledScroll);
    handleScroll(); // Initial check

    return () => {
      container.removeEventListener("scroll", throttledScroll);
      clearTimeout(scrollTimeout);
    };
  }, [allVideos.length, data?.pagination.has_more, isLoading, data]);

  // ========== Effect: Intersection Observer for active video detection ==========
  useEffect(() => {
    if (!containerRef.current || allVideos.length === 0) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > INTERSECTION_THRESHOLD) {
            const index = Number(entry.target.getAttribute("data-index"));
            setActiveVideoIndex(index);
          }
        });
      },
      {
        threshold: [INTERSECTION_THRESHOLD],
        root: containerRef.current,
      }
    );

    const videoElements = containerRef.current.querySelectorAll("[data-index]");
    videoElements.forEach((el) => observerRef.current?.observe(el));

    return () => {
      observerRef.current?.disconnect();
    };
  }, [allVideos.length]);

  // ========== Event Handlers ==========
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

      // Show Telegram popup if available
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
    setShowVolumeIndicator(true);
    setTimeout(() => setShowVolumeIndicator(false), VOLUME_INDICATOR_TIMEOUT);
  }, []);

  // ========== Render States ==========
  if (isLoading && allVideos.length === 0) {
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

  if (allVideos.length === 0) {
    return (
      <div className="video-feed empty">
        <div className="empty-message">
          <p>No videos yet</p>
          <p>Be the first to upload!</p>
        </div>
      </div>
    );
  }

  // ========== Main Render ==========
  return (
    <div className="video-feed" ref={containerRef}>
      {/* Global volume indicator */}
      {showVolumeIndicator && (
        <div className="global-volume-indicator">
          <span className="volume-icon">{isMuted ? <SVG src="/svg/soundOff.svg" /> : <SVG src="/svg/soundOn.svg" />}</span>
        </div>
      )}

      {/* Video list */}
      {allVideos.map((video, index) => (
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

      {/* Loading indicator for pagination */}
      {isLoading && allVideos.length > 0 && <div className="loading-more">Loading more videos...</div>}
    </div>
  );
};

export default VideoFeed;
