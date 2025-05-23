import { useState, useEffect } from 'react';

const useResponsiveFontSize = () => {
  const [fontsize, setFontsize] = useState(16);

  const updateFontSize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const shorter = Math.min(width, height);

    let base, scale, min, max;

    if (shorter < 400) {
      base = 30;
      scale = 0.85;
      min = 12;
      max = 20;
    } else if (shorter < 600) {
      base = 25;
      scale = 0.95;
      min = 14;
      max = 24;
    } else {
      base = 34;
      scale = 0.85;
      min = 16;
      max = 26;
    }

    let size = (shorter / base) * scale;
    size = Math.max(min, Math.min(max, size));
    setFontsize(size);
  };

  useEffect(() => {
    updateFontSize();

    window.addEventListener('resize', updateFontSize);
    window.addEventListener('orientationchange', () => {
      setTimeout(updateFontSize, 100); // 等待刷新完毕后再判断
    });

    // fallback 定时轮询（防止某些浏览器不触发事件）
    const interval = setInterval(() => {
      updateFontSize();
    }, 500);

    return () => {
      window.removeEventListener('resize', updateFontSize);
      window.removeEventListener('orientationchange', updateFontSize);
      clearInterval(interval);
    };
  }, []);

  return fontsize;
};

export default useResponsiveFontSize;
