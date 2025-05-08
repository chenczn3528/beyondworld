import {useState, useRef} from 'react';

const Carousel = ( {cardData} ) => {

  const [current, setCurrent] = useState(1); // 默认中间是第三张图片
  const startX = useRef(0);
  const deltaX = useRef(0);

  // 处理触摸开始
  const handleTouchStart = (e) => {
    startX.current = e.touches ? e.touches[0].clientX : e.clientX;
  };

  // 处理触摸移动
  const handleTouchMove = (e) => {
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    deltaX.current = x - startX.current;
  };

  // 处理触摸结束，切换图
  const handleTouchEnd = () => {
    if (deltaX.current > 50) {
      setCurrent((prev) => Math.max(0, prev - 1)); // 向右滑动，切换到左边的图
    } else if (deltaX.current < -50) {
      setCurrent((prev) => Math.min(cardData.length - 1, prev + 1)); // 向左滑动，切换到右边的图
    }
    deltaX.current = 0;
  };

  // 处理点击小图切换
  const handleClickImage = (index) => {
    setCurrent(index);
  };

  return (
      <div
          className="w-full h-screen bg-black flex items-center justify-center relative"
          style={{
            width: "60%",
            height: "60%",
            position: "absolute",
            left: "50%",
            top: "40%",
            transform: "translate(-50%, -50%)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            overflow: "hidden"
          }}
      >

        <div
            className="absolute w-[50%] h-[50%] left-1/2 translate-x-[-50%] bottom-10 bg-transparent flex items-center justify-center overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleTouchStart}
            onMouseMove={(e) => e.buttons === 1 && handleTouchMove(e)}
            onMouseUp={handleTouchEnd}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            {/* 渲染5张图片 */}
            {cardData.map((card, index) => {
              const offset = index - current;

              // 左右两侧图像的隐藏逻辑
              if (Math.abs(offset) > 2) return null;

              const baseStyle = {
                transition: "all 0.4s ease",
                position: "absolute",
                top: "50%",
                left: "50%",
                transformStyle: "preserve-3d",
                zIndex: offset === 0 ? 10 : 5,
              };

              let transform = "";
              if (offset === -2) {
                transform = "translate(-200%, -50%) rotateY(90deg) scale(0.8)";
              } else if (offset === -1) {
                transform = "translate(-100%, -50%) rotateY(60deg) scale(0.9)";
              } else if (offset === 0) {
                transform = "translate(-50%, -50%) rotateY(0deg) scale(1)";
              } else if (offset === 1) {
                transform = "translate(50%, -50%) rotateY(-60deg) scale(0.9)";
              } else if (offset === 2) {
                transform = "translate(200%, -50%) rotateY(-90deg) scale(0.8)";
              }

              return (
                  <div
                      key={index}
                      style={{...baseStyle, transform}}
                      className="w-[180px] h-[250px] relative cursor-pointer"
                      onClick={() => handleClickImage(index)}
                  >
                    <img
                        src={card.图片信息[0]?.src}
                        alt={`slide-${index}`}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        className="rounded-lg shadow-xl cursor-pointer"
                    />
                    {/* 文字部分 */}
                    <div
                      style={{
                            position: "absolute",
                            bottom: "8px",
                            left: "50%",
                            transform: "translateX(-50%)",
                            color: "white",
                            backgroundColor: "rgba(0, 0, 0, 0.5)",
                            padding: "4px 8px",
                            borderRadius: "6px",
                            fontSize: "14px",
                            pointerEvents: "none",
                            whiteSpace: "nowrap",
                          }}
                    >
                      {card.卡名}
                    </div>
                  </div>


              );
            })}
          </div>
        </div>


      </div>
  );
};

export default Carousel
