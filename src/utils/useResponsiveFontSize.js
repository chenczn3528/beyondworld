import { useState, useEffect } from 'react';

const useResponsiveFontSize = () => {
  const [fontsize, setFontsize] = useState(16);

  const updateFontSize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const shorter = Math.min(width, height);

    let base, scale, min, max;

    if (shorter < 400) {
      // 小手机
      base = 30;
      scale = 0.85;
      min = 12;
      max = 20;
    } else if (shorter < 600) {
      // 普通手机 + 小平板
      base = 25;
      scale = 0.95;
      min = 14;
      max = 24;
    } else {
      // 大平板
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
    const updateFontSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const shorter = Math.min(width, height);

      // 判断设备类型和设置 font size（跟前面一样）
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

    // 立即调用一次
    updateFontSize();

    // 加一个小延迟的 version，解决某些设备 orientation 时尺寸没更新的问题
    const delayedUpdate = () => setTimeout(updateFontSize, 150);

    window.addEventListener('resize', updateFontSize);
    window.addEventListener('orientationchange', delayedUpdate);

    return () => {
      window.removeEventListener('resize', updateFontSize);
      window.removeEventListener('orientationchange', delayedUpdate);
    };
  }, []);


  return fontsize;
};

export default useResponsiveFontSize;
