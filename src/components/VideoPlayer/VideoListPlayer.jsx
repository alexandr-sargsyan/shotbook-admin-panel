import React from 'react';
import { usePlatformPlayer } from './usePlatformPlayer';
import './VideoListPlayer.css';

/**
 * Компонент для отображения видео в списке (каталоге)
 * 
 * Особенности:
 * - Автозапуск для всех платформ кроме Instagram (при появлении в viewport)
 * - Lazy loading (загрузка при появлении в viewport)
 * - Без звука (muted) для всех платформ кроме TikTok
 * - С зацикливанием (loop)
 * - С контролами для YouTube и TikTok (как в детальном виде)
 */
const VideoListPlayer = ({ 
  platform, 
  platformVideoId, 
  sourceUrl,
  isVisible = false 
}) => {
  const { renderPlayer } = usePlatformPlayer(platform, platformVideoId, sourceUrl);

  // Включаем контролы для YouTube и TikTok (как в детальном виде)
  // Instagram не поддерживает программное управление controls
  // Facebook использует свой встроенный плеер с контролами
  
  // Автозапуск для всех платформ кроме Instagram
  const hasControls = platform === 'youtube' || platform === 'tiktok';
  const shouldAutoplay = platform !== 'instagram' && isVisible;
  // Для TikTok - со звуком, для остальных - без звука
  const shouldMute = platform !== 'tiktok';

  return (
    <div className="video-list-player">
      <div className="video-container">
        {renderPlayer({
          autoplay: shouldAutoplay, // Автозапуск для YouTube, TikTok, Facebook (кроме Instagram)
          muted: shouldMute,        // Без звука для всех кроме TikTok
          loop: true,                // С зацикливанием
          controls: hasControls,     // С контролами для YouTube и TikTok
          showText: false,           // Для Facebook: не показывать текст поста в списке
        })}
      </div>
    </div>
  );
};

VideoListPlayer.displayName = 'VideoListPlayer';

export default VideoListPlayer;
