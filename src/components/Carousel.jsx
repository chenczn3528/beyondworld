import React, { useState, useRef, useEffect } from 'react';
import DetailedImage from './DetailedImage.jsx';

const Carousel = ({ cardData,showDetailedImage , setShowDetailedImage }) => {

  const [current, setCurrent] = useState(2); // 默认中间是第三张图片
  const startX = useRef(0);
  const deltaX = useRef(0);

  const [fullImage, setFullImage] = useState(null);


  const rarityMap = {
      世界: 'images/world.png',
      月: 'images/moon.png',
      辰星: 'images/star1.png',
      星: 'images/star2.png',
    };

  useEffect(() => {
  const interval = setInterval(() => {
    setCurrent(prev => (prev + 1) % cardData.length); // 循环播放
  }, 4500); // 每 3 秒切换一次

  return () => clearInterval(interval); // 清除定时器
}, [cardData.length]);


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
      transition: "all 2s ease",
      position: "absolute",
      top: "50%",
      left: "50%",
      transformStyle: "preserve-3d",
      zIndex: 0,
    };

    let transform = "";
    let zIndex = 5;

    if (offset === -2) {
      transform = "translate(-100%, -50%) scale(0.8)";
      zIndex = 2;
    } else if (offset === -1) {
      transform = "translate(-80%, -50%) scale(0.9)";
      zIndex = 3;
    } else if (offset === 0) {
      transform = "translate(-50%, -50%) scale(1)";
      zIndex = 5;
    } else if (offset === 1) {
      transform = "translate(-20%, -50%) scale(0.9)";
      zIndex = 3;
    } else if (offset === 2) {
      transform = "translate(0%, -50%) scale(0.8)";
      zIndex = 2;
    }


    return (
        <div
            key={index}
            style={{
              ...baseStyle,
              transform,
              zIndex: zIndex,
              maxWidth: '100%',
              maxHeight: '100%',
            }}
            className="cursor-pointer flex items-center justify-center"
        >
          <div className="relative">
            {/* 主图 */}
            <img
                src={card.图片信息[0]?.src}
                alt={`slide-${index}`}
                className="max-w-full max-h-full object-contain rounded-lg shadow-xl edge-blur-mask"
                onClick={() => {
                  if (index === current) {
                    setFullImage(card);
                    setShowDetailedImage(true);
                  } else {
                    handleClickImage(index);
                  }
                }}
            />

              <div className="absolute flex flex-row justify-end top-[0vmin] right-[2vmin]">
                  {/* 卡片标题 */}
                <label
                    className="font-normal"
                    style={{
                      color: 'white',
                      fontSize: '2.5vmin',
                      fontWeight: 800,
                      textAlign: 'right', // 文字右对齐
                      textShadow: '0 0 2px gray, 0 0 4px gray',
                    }}
                >
                  {card.主角} · {card.卡名}
                </label>
                {/* 稀有度角标 */}
                <img
                    className="w-[8vmin] h-auto"
                    src={rarityMap[card.稀有度]}
                    alt="Rarity Badge"
                />
              </div>


          </div>
        </div>


    );
  };

  // 处理点击切换图
  const handleClickImage = (index) => {
    setCurrent(index);
  };

  return (
      <div className="w-full bg-black flex items-center justify-center relative">
        {/* 将轮播图居中，使用 absolute 定位 */}
        <div
            className="absolute w-[150vmin] h-[150vmin] left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2
             bg-transparent flex items-center justify-center overflow-hidden"
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

        {showDetailedImage && (
          <DetailedImage
            card={fullImage}  // 确保传递 fullImage，而不是其他东西
            onClose={() => setShowDetailedImage(false)}
          />
        )}


    </div>
  );
};

export default Carousel;
