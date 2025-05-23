import { useState, useEffect } from 'react';

const useResponsiveFontSize = () => {
  const [fontsize, setFontsize] = useState(3);

  useEffect(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const longer = Math.max(width, height);
    const shorter = Math.min(width, height);

    setFontsize((longer / shorter) * 2);
  }, []);

  return fontsize;
};

export default useResponsiveFontSize;
