import React, { useRef } from 'react';
import VideoListPlayer from '../VideoPlayer/VideoListPlayer';
import './VideoCard.css';

const VideoCard = ({ video }) => {
  const cardRef = useRef(null);

  // Для превью в админ-панели видео всегда видно
  const isVisible = true;
  const shouldLoad = true;

  const hasVideo = video && video.platform && video.platform_video_id;

  return (
    <div className="video-card" ref={cardRef}>
      <div className="video-title-top">
        <h3 className="video-title">{video.title || 'Test Video'}</h3>
      </div>

      <div className="video-preview">
        {hasVideo && shouldLoad ? (
          <div className="video-player-wrapper">
            <VideoListPlayer
              platform={video.platform}
              platformVideoId={video.platform_video_id}
              sourceUrl={video.source_url}
              isVisible={isVisible}
            />
          </div>
        ) : (
          <div className="video-placeholder">
            <span className="video-icon">🎬</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoCard;
