import { useState, useEffect } from 'react';

const useResponsiveFontSize = () => {
  const [fontsize, setFontsize] = useState(3);

  const updateFontSize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const longer = Math.max(width, height);
    const shorter = Math.min(width, height);
    // setFontsize((longer / shorter) * 2);
    setFontsize( shorter / 900 * 3)
  };

  useEffect(() => {
    updateFontSize(); // 初始化

    window.addEventListener('resize', updateFontSize);
    window.addEventListener('orientationchange', updateFontSize); // 可选，部分安卓支持

    return () => {
      window.removeEventListener('resize', updateFontSize);
      window.removeEventListener('orientationchange', updateFontSize);
    };
  }, []);

  return fontsize;
};

export default useResponsiveFontSize;
