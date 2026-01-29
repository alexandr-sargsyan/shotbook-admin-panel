import React, { useState } from 'react';
import VideoCard from '../components/VideoCard/VideoCard';
import VideoDetailPlayer from '../components/VideoPlayer/VideoDetailPlayer';
import './VideoPreview.css';

const VideoPreview = () => {
  const [url, setUrl] = useState('');
  const [detectedPlatform, setDetectedPlatform] = useState(null);
  const [videoData, setVideoData] = useState(null);
  const [error, setError] = useState('');

  // Функция для автоматического определения платформы по URL (аналогично PlatformNormalizationService)
  const detectPlatform = (url) => {
    if (!url || !url.trim()) {
      return null;
    }

    const urlLower = url.toLowerCase().trim();

    if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) {
      return 'youtube';
    }

    if (urlLower.includes('tiktok.com')) {
      return 'tiktok';
    }

    if (urlLower.includes('instagram.com')) {
      return 'instagram';
    }

    if (urlLower.includes('facebook.com')) {
      return 'facebook';
    }

    return null;
  };

  // Обработчик изменения URL - автоматически определяем платформу
  const handleUrlChange = (e) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    
    const platform = detectPlatform(newUrl);
    setDetectedPlatform(platform);
    
    // Очищаем ошибку и данные при изменении URL
    if (error) setError('');
    if (videoData) setVideoData(null);
  };

  // Функции для извлечения video_id из URL (скопированы из PlatformNormalizationService)
  const extractYouTubeId = (url) => {
    const patterns = [
      /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
      /youtu\.be\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
      /m\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }
    return null;
  };

  const extractTikTokId = (url) => {
    // Стандартный формат: /@username/video/{ID}
    const match = url.match(/tiktok\.com\/@[^\/]+\/video\/(\d+)/);
    if (match) {
      return match[1];
    }

    // Мобильная версия
    const mobileMatch = url.match(/m\.tiktok\.com\/v\/(\d+)/);
    if (mobileMatch) {
      return mobileMatch[1];
    }

    return null;
  };

  const extractInstagramId = (url) => {
    const patterns = [
      /instagram\.com\/p\/([a-zA-Z0-9_-]+)/,
      /instagram\.com\/reel\/([a-zA-Z0-9_-]+)/,
      /instagram\.com\/tv\/([a-zA-Z0-9_-]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }
    return null;
  };

  const normalizeFacebookUrl = (url) => {
    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname;
      const search = urlObj.search;

      // Для /watch/?v= сохраняем параметр v
      if (path.includes('/watch') && search) {
        const params = new URLSearchParams(search);
        const videoId = params.get('v');
        if (videoId) {
          return `https://www.facebook.com/watch/?v=${videoId}`;
        }
      }

      // Для остальных - только путь без параметров
      return `https://www.facebook.com${path}`;
    } catch (error) {
      console.warn('Facebook: Не удалось нормализовать URL:', url, error);
      return url;
    }
  };

  const extractFacebookId = (url) => {
    const normalizedUrl = normalizeFacebookUrl(url);

    // Формат: /reel/{ID}
    const reelMatch = normalizedUrl.match(/facebook\.com\/reel\/([a-zA-Z0-9_-]+)/);
    if (reelMatch) {
      return reelMatch[1];
    }

    // Формат: /watch/?v={ID}
    const watchMatch = normalizedUrl.match(/facebook\.com\/watch\/\?v=(\d+)/);
    if (watchMatch) {
      return watchMatch[1];
    }

    // Формат: /{user}/videos/{ID}/
    const videosMatch = normalizedUrl.match(/facebook\.com\/([^\/]+)\/videos\/(\d+)/);
    if (videosMatch) {
      return videosMatch[2];
    }

    // Формат: /{user}/posts/{ID}
    const postsMatch = normalizedUrl.match(/facebook\.com\/([^\/]+)\/posts\/(\d+)/);
    if (postsMatch) {
      return postsMatch[2];
    }

    return null;
  };

  const handleTest = () => {
    setError('');
    setVideoData(null);

    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    // Автоматически определяем платформу
    const platform = detectPlatform(url);
    
    if (!platform) {
      setError('Could not detect platform from URL. Supported platforms: YouTube, TikTok, Instagram, Facebook');
      return;
    }

    let videoId = null;

    switch (platform) {
      case 'youtube':
        videoId = extractYouTubeId(url);
        break;
      case 'tiktok':
        videoId = extractTikTokId(url);
        break;
      case 'instagram':
        videoId = extractInstagramId(url);
        break;
      case 'facebook':
        videoId = extractFacebookId(url);
        break;
      default:
        setError('Unsupported platform');
        return;
    }

    if (!videoId) {
      setError(`Could not extract video ID from URL for platform: ${platform}`);
      return;
    }

    setVideoData({
      platform,
      platform_video_id: videoId,
      source_url: url,
      title: 'Test Video',
    });
  };

  return (
    <div className="video-preview-page">
      <div className="video-preview-header">
        <h1>Video Preview</h1>
        <p>Test how videos will appear on the site</p>
      </div>

      <div className="video-preview-controls">
        <div className="control-group">
          <label htmlFor="url">Video URL:</label>
          <input
            type="text"
            id="url"
            value={url}
            onChange={handleUrlChange}
            placeholder="https://www.youtube.com/watch?v=..."
            className="url-input"
          />
          {detectedPlatform && (
            <div className="detected-platform">
              Detected platform: <strong>{detectedPlatform.charAt(0).toUpperCase() + detectedPlatform.slice(1)}</strong>
            </div>
          )}
        </div>

        <button onClick={handleTest} className="test-button">
          Test
        </button>

        {error && <div className="error-message">{error}</div>}
      </div>

      {videoData && (
        <div className="video-preview-content">
          <div className="preview-section">
            <h2>List View Preview</h2>
            <p className="preview-description">How the video appears in the catalog</p>
            <div className="preview-container">
              <VideoCard video={videoData} />
            </div>
          </div>

          <div className="preview-section">
            <h2>Detail View Preview</h2>
            <p className="preview-description">How the video appears on the detail page</p>
            <div className="preview-container">
              <VideoDetailPlayer
                platform={videoData.platform}
                platformVideoId={videoData.platform_video_id}
                sourceUrl={videoData.source_url}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPreview;
