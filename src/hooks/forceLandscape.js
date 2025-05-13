// forceLandscape.js

const forceLandscape = (id = '#app') => {
  const handler = () => {
    const width = document.documentElement.clientWidth;
    const height = document.documentElement.clientHeight;
    const targetDom = document.querySelector(id);
    if (!targetDom) return;

    if (width > height) {
      // 横屏
      targetDom.style.position = 'absolute';
      targetDom.style.width = `${width}px`;
      targetDom.style.height = `${height}px`;
      targetDom.style.left = '0px';
      targetDom.style.top = '0px';
      targetDom.style.transform = 'none';
      targetDom.style.transformOrigin = '50% 50%';
    } else {
      // 竖屏时旋转
      targetDom.style.position = 'absolute';
      targetDom.style.width = `${height}px`;
      targetDom.style.height = `${width}px`;
      targetDom.style.left = `${-(height - width) / 2}px`;
      targetDom.style.top = `${(height - width) / 2}px`;
      targetDom.style.transform = 'rotate(90deg)';
      targetDom.style.transformOrigin = '50% 50%';
    }
  };

  const handleResize = () => {
    setTimeout(() => {
      handler();
    }, 300);
  };

  window.addEventListener('resize', handleResize);

  handler();
};

export default forceLandscape;
