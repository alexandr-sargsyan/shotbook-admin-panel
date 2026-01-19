import React, { useEffect, useRef } from 'react';

const InstagramPlayer = ({ postId, sourceUrl }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    // Instagram использует embed.js
    if (containerRef.current && sourceUrl) {
      // Создать blockquote для Instagram embed
      const blockquote = document.createElement('blockquote');
      blockquote.className = 'instagram-media';
      blockquote.setAttribute('data-instgrm-permalink', sourceUrl);
      blockquote.setAttribute('data-instgrm-version', '14');

      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(blockquote);

      // Загрузить embed.js скрипт
      if (!document.querySelector('script[src*="instagram.com/embed.js"]')) {
        const script = document.createElement('script');
        script.src = 'https://www.instagram.com/embed.js';
        script.async = true;
        document.body.appendChild(script);
      } else {
        // Если скрипт уже загружен, вызвать обработку
        if (window.instgrm) {
          window.instgrm.Embeds.process();
        }
      }
    }
  }, [postId, sourceUrl]);

  return <div ref={containerRef} className="instagram-player" />;
};

InstagramPlayer.displayName = 'InstagramPlayer';

export default InstagramPlayer;
