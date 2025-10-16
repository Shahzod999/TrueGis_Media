import { useState } from "react";
import { useTranslation } from "react-i18next";
import "./Downloader.scss";
import ToggleTabs from "../../components/common/ToggleTabs/ToggleTabs";
import VideoCard from "../../components/common/VideoCard/VideoCard";
import Button from "../../components/ui/Button/Button";
import Loading from "../../components/common/Loading/Loading";
import {
  useGetPopularVideosQuery,
  useGetUserVideosQuery,
  useDownloadVideoMutation,
  useDeleteVideoMutation,
  Video,
} from "../../api/endpoints/videoApiSlice";
import { useAppDispatch } from "../../hooks/redux";
import { addDownloadedVideo, setIsDownloading } from "../../store/slices/videoSlice";
import { succesToast, errorToast } from "../../store/slices/Toast/toastSlice";

const Downloader = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<"popular" | "user">("popular");
  const [videoUrl, setVideoUrl] = useState("");

  // API hooks
  const { data: popularVideos = [], isLoading: isLoadingPopular, error: popularError } = useGetPopularVideosQuery();

  const { data: userVideos = [], isLoading: isLoadingUser, error: userError } = useGetUserVideosQuery("user123"); // Replace with actual user ID from auth

  const [downloadVideo, { isLoading: isDownloading }] = useDownloadVideoMutation();
  const [deleteVideo] = useDeleteVideoMutation();

  const tabs = [
    { id: "popular", label: t("downloader.popular"), type: "popular" },
    { id: "user", label: t("downloader.myVideos"), type: "user" },
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId as "popular" | "user");
  };

  const handleDownload = async (video?: Video) => {
    try {
      dispatch(setIsDownloading(true));

      let downloadData;
      if (video) {
        // Download from popular videos
        downloadData = { url: video.url, platform: video.platform };
      } else {
        // Download from URL input
        if (!videoUrl.trim()) {
          dispatch(errorToast(t("downloader.errors.emptyUrl")));
          return;
        }
        downloadData = { url: videoUrl };
      }

      const result = await downloadVideo(downloadData).unwrap();

      if (result.success) {
        dispatch(addDownloadedVideo(result.video));
        dispatch(succesToast(t("downloader.success.downloaded")));
        setVideoUrl("");
      }
    } catch (error) {
      dispatch(errorToast(t("downloader.errors.downloadFailed")));
    } finally {
      dispatch(setIsDownloading(false));
    }
  };

  const handleDelete = async (videoId: string) => {
    try {
      await deleteVideo(videoId).unwrap();
      dispatch(succesToast(t("downloader.success.deleted")));
    } catch (error) {
      dispatch(errorToast(t("downloader.errors.deleteFailed")));
    }
  };

  const renderContent = () => {
    if (activeTab === "popular") {
      if (isLoadingPopular) {
        return <Loading />;
      }

      if (popularError) {
        return (
          <div className="downloader__error">
            <p>{t("downloader.errors.loadFailed")}</p>
          </div>
        );
      }

      if (popularVideos.length === 0) {
        return (
          <div className="downloader__empty">
            <p>{t("downloader.noVideos")}</p>
          </div>
        );
      }

      return (
        <div className="downloader__grid">
          {popularVideos.map((video) => (
            <VideoCard key={video.id} video={video} onDownload={handleDownload} showActions={true} isUserVideo={false} />
          ))}
        </div>
      );
    } else {
      if (isLoadingUser) {
        return <Loading />;
      }

      if (userError) {
        return (
          <div className="downloader__error">
            <p>{t("downloader.errors.loadFailed")}</p>
          </div>
        );
      }

      if (userVideos.length === 0) {
        return (
          <div className="downloader__empty">
            <p>{t("downloader.noUserVideos")}</p>
          </div>
        );
      }

      return (
        <div className="downloader__grid">
          {userVideos.map((video) => (
            <VideoCard key={video.id} video={video} onDelete={handleDelete} showActions={true} isUserVideo={true} />
          ))}
        </div>
      );
    }
  };

  return (
    <div className="downloader container">
      <div className="downloader__header container__side">
        <h1 className="downloader__title">{t("downloader.title")}</h1>
        <p className="downloader__subtitle">{t("downloader.subtitle")}</p>
      </div>

      {/* URL Input Section */}
      <div className="downloader__input-section container__side">
        <div className="downloader__input-group">
          <input
            type="text"
            className="downloader__input"
            placeholder={t("downloader.placeholder")}
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            disabled={isDownloading}
          />
          <Button variant="primary" size="medium" onClick={() => handleDownload()} disabled={isDownloading || !videoUrl.trim()}>
            {isDownloading ? t("downloader.downloading") : t("downloader.download")}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="downloader__tabs container__side">
        <ToggleTabs tabs={tabs} onTabChange={handleTabChange} />
      </div>

      {/* Content */}
      <div className="downloader__content container__side">{renderContent()}</div>
    </div>
  );
};

export default Downloader;
