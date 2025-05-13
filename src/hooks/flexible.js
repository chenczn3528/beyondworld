// flexible.js

const defaultConfig = {
  pageWidth: 750,
  pageHeight: 1334,
  pageFontSize: 32,
  mode: 'portrait', // 默认竖屏模式
};

const flexible = (config = defaultConfig) => {
  const {
    pageWidth = defaultConfig.pageWidth,
    pageHeight = defaultConfig.pageHeight,
    pageFontSize = defaultConfig.pageFontSize,
    mode = defaultConfig.mode,
  } = config;

  const pageAspectRatio = pageWidth / pageHeight;

  function onResize() {
    let clientWidth = document.documentElement.clientWidth;
    let clientHeight = document.documentElement.clientHeight;

    // 横屏强制调整
    if (mode === 'landscape' && clientWidth < clientHeight) {
      [clientWidth, clientHeight] = [clientHeight, clientWidth];
    }

    const aspectRatio = clientWidth / clientHeight;

    let e = 16;

    if (clientWidth > pageWidth) {
      // iPad/PC
      console.log('认为是ipad/pc');
      e = pageFontSize * (clientHeight / pageHeight);
    } else if (aspectRatio > pageAspectRatio) {
      // 宽屏移动端
      console.log('宽屏移动端');
      e = pageFontSize * (clientHeight / pageHeight);
    } else {
      // 正常移动端
      console.log('正常移动端');
      e = pageFontSize * (clientWidth / pageWidth);
    }

    e = parseFloat(e.toFixed(3));
    document.documentElement.style.fontSize = `${e}px`;

    // 修正因系统缩放造成的误差
    const realitySize = parseFloat(window.getComputedStyle(document.documentElement).fontSize);
    if (e !== realitySize) {
      e = (e * e) / realitySize;
      document.documentElement.style.fontSize = `${e}px`;
    }
  }

  const handleResize = () => {
    onResize();
  };

  window.addEventListener('resize', handleResize);
  onResize();

  // 返回一个取消函数，可恢复默认字体大小
  return (defaultSize) => {
    window.removeEventListener('resize', handleResize);
    if (defaultSize) {
      if (typeof defaultSize === 'string') {
        document.documentElement.style.fontSize = defaultSize;
      } else if (typeof defaultSize === 'number') {
        document.documentElement.style.fontSize = `${defaultSize}px`;
      }
    }
  };
};

export default flexible;
