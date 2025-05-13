// forceLandscape.js

export const forceLandscape = (id = '#app') => {
  const handler = () => {
    let width = document.documentElement.clientWidth;
    let height = document.documentElement.clientHeight;
    let targetDom = document.querySelector(id);
    if (!targetDom) return;

    // 如果宽度比高度大，则认为处于横屏状态
    if (width > height) {
      targetDom.style.position = 'absolute';
      targetDom.style.width = `${width}px`;
      targetDom.style.height = `${height}px`;
      targetDom.style.left = `${0}px`;
      targetDom.style.top = `${0}px`;
      targetDom.style.transform = 'none';
      targetDom.style.transformOrigin = '50% 50%';
    } else {
      targetDom.style.position = 'absolute';
      targetDom.style.width = `${height}px`;
      targetDom.style.height = `${width}px`;
      targetDom.style.left = `${0 - (height - width) / 2}px`;
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

  // 初始触发
  handler();
};
