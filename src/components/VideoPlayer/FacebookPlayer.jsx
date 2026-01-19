import React, { useEffect, useRef } from 'react';

/**
 * Нормализует Facebook URL, убирая параметры запроса
 * Facebook embed лучше работает с чистыми URL без параметров
 */
const normalizeFacebookUrl = (url) => {
  if (!url) return url;
  
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

/**
 * Facebook Player компонент
 * 
 * Использует официальный Facebook Video Plugin через iframe
 * Поддерживает:
 * - Reels: https://www.facebook.com/reel/{ID}
 * - Watch: https://www.facebook.com/watch/?v={ID}
 * - Обычные видео: https://www.facebook.com/{user}/videos/{ID}/
 * - Посты с видео: https://www.facebook.com/{user}/posts/{ID}
 * 
 * @param {string} sourceUrl - URL видео Facebook
 * @param {boolean} showText - Показывать ли текст поста (по умолчанию false)
 * @param {boolean} autoplay - Автозапуск видео (по умолчанию false)
 */
const FacebookPlayer = ({ sourceUrl, showText = false, autoplay = false }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current && sourceUrl) {
      // Нормализовать URL
      const normalizedUrl = normalizeFacebookUrl(sourceUrl);
      
      // Кодировать URL через encodeURIComponent (как требует Facebook)
      const encodedUrl = encodeURIComponent(normalizedUrl);
      
      // Собрать embed URL с width=400 (число в пикселях, не процент!)
      // Facebook может не поддерживать autoplay через параметр URL напрямую,
      // но пересоздание iframe при изменении autoplay может помочь
      const embedUrl = `https://www.facebook.com/plugins/video.php?href=${encodedUrl}&show_text=${showText ? '1' : '0'}&width=400&autoplay=${autoplay ? '1' : '0'}`;
      
      const iframe = document.createElement('iframe');
      iframe.src = embedUrl;
      
      // HTML атрибуты width и height (обязательно для Facebook API)
      iframe.width = '400';
      iframe.height = '700';
      
      // Style с overflow: hidden и адаптивными размерами
      iframe.style.border = 'none';
      iframe.style.overflow = 'hidden';
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      
      // Остальные атрибуты
      iframe.allow = 'autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share';
      iframe.allowFullscreen = true;
      iframe.frameBorder = '0';
      iframe.scrolling = 'no';

      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(iframe);
    }
  }, [sourceUrl, showText, autoplay]);

  return <div ref={containerRef} className="facebook-player" />;
};

FacebookPlayer.displayName = 'FacebookPlayer';

export default FacebookPlayer;
