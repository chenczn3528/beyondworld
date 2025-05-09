import React, { useState, useRef } from 'react';

const Carousel = ({ cardData }) => {
  const [current, setCurrent] = useState(2); // 默认中间是第三张图片
  const startX = useRef(0);
  const deltaX = useRef(0);

  const handleTouchStart = (e) => {
    startX.current = e.touches ? e.touches[0].clientX : e.clientX;
  };

  const handleTouchMove = (e) => {
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    deltaX.current = x - startX.current;
  };

  const handleTouchEnd = () => {
    if (deltaX.current > 50) {
      setCurrent((prev) => Math.max(0, prev - 1)); // 向右滑动，切换到左边的图
    } else if (deltaX.current < -50) {
      setCurrent((prev) => Math.min(cardData.length - 1, prev + 1)); // 向左滑动，切换到右边的图
    }
    deltaX.current = 0;
  };

  // 控制图片变换
  const renderImage = (card, index) => {
    const offset = index - current;

    // 左右两侧图像的隐藏逻辑
    if (Math.abs(offset) > 2) return null;

    const baseStyle = {
      transition: "all 0.4s ease",
      position: "absolute",
      top: "50%",
      left: "50%",
      transformStyle: "preserve-3d",
      zIndex: 0,
    };

    let transform = "";
    let zIndex = 5;

    if (offset === -2) {
      transform = "translateX(-120%) scale(0.8)"; // 最左边的图
      zIndex = 2;
    } else if (offset === -1) {
      transform = "translateX(-80%) scale(0.9)"; // 左侧的图
      zIndex = 3;
    } else if (offset === 0) {
      transform = "translateX(-40%) scale(1)"; // 中间的图
      zIndex = 5;
    } else if (offset === 1) {
      transform = "translateX(0%) scale(0.9)"; // 右侧的图
      zIndex = 3;
    } else if (offset === 2) {
      transform = "translateX(40%) scale(0.8)"; // 最右边的图
      zIndex = 2;
    }

    return (
      <div
        key={index}
        style={{
          ...baseStyle,
          transform,
          zIndex: zIndex,
          width: '50vw',
          height: 'auto',
          objectFit: 'contain',
        }}
        className="cursor-pointer"
      >
        <img
          src={card.图片信息[0]?.src}
          alt={`slide-${index}`}
          className="w-full h-auto object-contain rounded-lg shadow-xl"
          onClick={() => handleClickImage(index)} // 点击小图切换
        />
      </div>
    );
  };

  // 处理点击切换图
  const handleClickImage = (index) => {
    setCurrent(index);
  };

  return (
    <div className="w-full min-h-screen bg-black flex items-center justify-center">
      {/* 轮播图的容器不再使用 absolute 定位，而是使用 flex 布局来居中 */}
      <div
        className="w-[80vw] h-[60vh] bg-transparent flex items-center justify-center overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseMove={(e) => e.buttons === 1 && handleTouchMove(e)}
        onMouseUp={handleTouchEnd}
      >
        <div className="relative w-full h-full flex items-center justify-center">
          {/* 渲染卡片 */}
          {cardData.map((card, index) => renderImage(card, index))}
        </div>
      </div>
    </div>
  );
};

export default Carousel;
