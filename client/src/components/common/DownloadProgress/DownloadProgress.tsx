import React from "react";
import "./DownloadProgress.scss";

interface DownloadProgressProps {
  progress: number;
  fileName?: string;
}

const DownloadProgress: React.FC<DownloadProgressProps> = ({
  progress,
  fileName = "Загрузка...",
}) => {
  return (
    <div className="download-progress">
      <div className="download-progress__info">
        <span className="download-progress__filename">{fileName}</span>
        <span className="download-progress__percentage">{progress}%</span>
      </div>
      <div className="download-progress__bar">
        <div
          className="download-progress__fill"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default DownloadProgress;

