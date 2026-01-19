import React, { useEffect, useRef } from 'react';

const TikTokPlayer = ({ videoId, autoplay, muted, loop, controls = false }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    // Параметры для TikTok player v1 (официальный Embed Player для разработчиков)
    // Настройки согласно TikTok Settings
    const params = new URLSearchParams({
      autoplay: autoplay ? '1' : '0',
      loop: loop ? '1' : '0',
      muted: muted ? '1' : '0',
      controls: controls ? '1' : '0',
      progress_bar: '1',           // Показывать прогресс-бар
      play_button: '0',            // Скрыть кнопку воспроизведения
      volume_control: '0',         // Скрыть контроль громкости
      fullscreen_button: '0',      // Скрыть кнопку полноэкранного режима
      timestamp: '1',              // Показывать временную метку
      music_info: '0',             // Скрыть информацию о музыке
      description: '0',             // Скрыть описание
      rel: '0',                     // Не показывать связанные видео
      native_context_menu: '0',    // Отключить нативное контекстное меню
      closed_caption: '0',         // Отключить субтитры
    });

    // TikTok player v1 URL - это видеоплеер, а не карточка поста
    const embedUrl = `https://www.tiktok.com/player/v1/${videoId}?${params.toString()}`;

    // Создать iframe
    if (containerRef.current) {
      const iframe = document.createElement('iframe');
      iframe.src = embedUrl;
      iframe.allow = 'autoplay; fullscreen; encrypted-media';
      iframe.allowFullscreen = true;
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.border = 'none';

      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(iframe);
    }
  }, [videoId, autoplay, muted, loop, controls]);

  return <div ref={containerRef} className="tiktok-player" />;
};

TikTokPlayer.displayName = 'TikTokPlayer';

export default TikTokPlayer;
