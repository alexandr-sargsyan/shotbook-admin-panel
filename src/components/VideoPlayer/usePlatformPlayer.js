import React from 'react';
import YouTubePlayer from './YouTubePlayer';
import TikTokPlayer from './TikTokPlayer';
import InstagramPlayer from './InstagramPlayer';
import FacebookPlayer from './FacebookPlayer';

/**
 * Хук для выбора и рендеринга правильного плеера в зависимости от платформы
 */
export const usePlatformPlayer = (platform, platformVideoId, sourceUrl) => {
  const renderPlayer = (playerProps = {}) => {
    if (!platform || !platformVideoId) {
      return <div className="video-error">Video not available</div>;
    }

    switch (platform) {
      case 'youtube':
        return (
          <YouTubePlayer
            videoId={platformVideoId}
            autoplay={playerProps.autoplay}
            muted={playerProps.muted}
            loop={playerProps.loop}
            controls={playerProps.controls}
          />
        );
      
      case 'tiktok':
        return (
          <TikTokPlayer
            videoId={platformVideoId}
            autoplay={playerProps.autoplay}
            muted={playerProps.muted}
            loop={playerProps.loop}
            controls={playerProps.controls}
          />
        );
      
      case 'instagram':
        return (
          <InstagramPlayer
            postId={platformVideoId}
            sourceUrl={sourceUrl}
          />
        );
      
      case 'facebook':
        return (
          <FacebookPlayer
            sourceUrl={sourceUrl}
            showText={playerProps.showText}
            autoplay={playerProps.autoplay}
          />
        );
      
      default:
        return <div className="video-error">Unsupported platform</div>;
    }
  };

  return { renderPlayer };
};
