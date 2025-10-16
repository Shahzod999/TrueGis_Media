import React, { useState } from "react";
import { Video } from "../../../api/endpoints/videoApiSlice";
import "./VideoCard.scss";
import { ReactSVG } from "react-svg";
import Button from "../../ui/Button/Button";

interface VideoCardProps {
  video: Video;
  onDownload?: (video: Video) => void;
  onDelete?: (videoId: string) => void;
  showActions?: boolean;
  isUserVideo?: boolean;
}

const VideoCard: React.FC<VideoCardProps> = ({
  video,
  onDownload,
  onDelete,
  showActions = true,
  isUserVideo = false,
}) => {
  const [imageError, setImageError] = useState(false);

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Сегодня";
    } else if (diffDays === 1) {
      return "Вчера";
    } else if (diffDays < 7) {
      return `${diffDays} дн. назад`;
    } else if (diffDays < 30) {
      return `${Math.floor(diffDays / 7)} нед. назад`;
    } else {
      return date.toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "short",
      });
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case "youtube":
        return "#FF0000";
      case "instagram":
        return "#E1306C";
      case "tiktok":
        return "#000000";
      case "facebook":
        return "#1877F2";
      default:
        return "#007aff";
    }
  };

  return (
    <div className="video-card">
      <div className="video-card__thumbnail">
        {!imageError ? (
          <img
            src={video.thumbnail}
            alt={video.title}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="video-card__thumbnail-placeholder">
            <ReactSVG src="/svg/heart.svg" />
          </div>
        )}
        <div className="video-card__duration">{video.duration}</div>
        <div
          className="video-card__platform"
          style={{ backgroundColor: getPlatformColor(video.platform) }}
        >
          {video.platform}
        </div>
      </div>
      <div className="video-card__content">
        <h3 className="video-card__title">{video.title}</h3>
        <div className="video-card__meta">
          <span className="video-card__views">
            👁 {formatViews(video.views)}
          </span>
          <span className="video-card__date">{formatDate(video.createdAt)}</span>
        </div>
        {showActions && (
          <div className="video-card__actions">
            {!isUserVideo && onDownload && (
              <Button
                size="small"
                variant="primary"
                fullWidth
                onClick={() => onDownload(video)}
              >
                Скачать
              </Button>
            )}
            {isUserVideo && onDelete && (
              <Button
                size="small"
                variant="secondary"
                fullWidth
                onClick={() => onDelete(video.id)}
              >
                Удалить
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoCard;

