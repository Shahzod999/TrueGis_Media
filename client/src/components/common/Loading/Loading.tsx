import "./Loading.scss";

const Loading = () => {
  return (
    <div className="loading-overlay  fullscreen">
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    </div>
  );
};

export default Loading;
