import React, {useEffect, useRef, useState} from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import clsx from "clsx";
import CardFullImage from "./CardFullImage.jsx";
import {playClickSound} from "../utils/playClickSound.js";

const CardSummary = ({
    drawResults,
    onClose,
    setShowSummary,
    setHasShownSummary,
    handleDraw,
    handleStartDraw,
    fontsize,
}) => {

    let scale = 0.65;
    const picWidthRatio = 16 * scale;
    const picHeightRatio = 9 * scale;



  // ========================================================
  // 设置音效
  const summaryAudioRef = useRef(null);
  const [fullImage, setFullImage] = useState(null);
  const [showFullImage, setShowFullImage] = useState(false);

  useEffect(() => {
    // summaryAudioRef.current = new Audio("https://cdn.chenczn3528.dpdns.org/beyondworld/audios/展示总结音效.mp3");
    summaryAudioRef.current = new Audio("audios/展示总结音效.mp3");
    summaryAudioRef.current.volume = 1;
    summaryAudioRef.current.currentTime = 0;

    summaryAudioRef.current
      .play()
      .catch((err) => console.warn("播放十抽总结音效失败：", err));
  }, []); // 组件加载时播放一次

  const rarityPriority = {
    "世界": 4,
    "月": 3,
    "辰星": 2,
    "星": 1,
  };

  const layoutPositions = [
    // row, index
    [0, 1], // 第一行中间
    [1, 1], // 第二行第二张
    [1, 2], // 第二行第三张
    [2, 1], // 第三行中间
    [0, 0], [0, 2], // 第一行边
    [1, 0], [1, 3], // 第二行边
    [2, 0], [2, 2], // 第三行边
  ];

  const createEmptyGrid = () => [
    [null, null, null], // row 0: 3 slots
    [null, null, null, null], // row 1: 4 slots
    [null, null, null], // row 2: 3 slots
  ];

  // 按稀有度优先级排序
  const sortedCards = [...drawResults].sort((a, b) => {
    return rarityPriority[b.card.稀有度] - rarityPriority[a.card.稀有度];
  });

  const grid = createEmptyGrid();

  // console.log("sortedCards", sortedCards)

  layoutPositions.forEach(([row, col], idx) => {
    const card = sortedCards[idx];
    if (card) {
      grid[row][col] = card;
    }
  });

  return (
    <div className="absolute w-full h-full flex items-center justify-center">
      {/*底部图片（绝对定位） */}
      <img
        src="images/bg_main2.jpg"
        alt="底部装饰"
        className="absolute z-30 w-full h-full"
      />

        {/*结算图片*/}
      <div
          className="absolute z-30"
          style={{
              bottom: `${fontsize * 6.5}px`,
              top: `${fontsize * 2.5}px`,
              left: `${fontsize * 2.5}px`,
              right: `${fontsize * 2.5}px`
      }}
      >
        {grid.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center z-20" style={{marginTop: `${fontsize * 1}px`,marginBottom: `${fontsize * 0.5}px`, gap: `${fontsize}px`}}>
            {row.map((card, colIndex) => {
              let glowStyle = {};

              if (card && (card.card.稀有度 === "世界" || card.card.稀有度 === "刹那")) {
                glowStyle = {
                  boxShadow: '0 -10px 20px rgba(255, 215, 0, 0.9), 0 10px 20px rgba(255, 215, 0, 0.9)',
                };
              } else if (card && card.card.稀有度 === "月") {
                glowStyle = {
                  boxShadow: '0 -10px 20px rgba(168, 85, 247, 0.9), 0 10px 20px rgba(168, 85, 247, 0.9)',
                };
              }

              return (
                  <div key={colIndex} className={clsx("relative flex items-center justify-center")}>
                    {card && (
                        <>
                          <LazyLoadImage
                              src={card.card.图片信息[0].srcset}
                              placeholderSrc={card.card.图片信息[0].src}
                              effect="blur"
                              alt={card.card.卡名}
                              className="object-contain flex justify-center"
                              style={{...glowStyle, maxWidth: `${fontsize * picWidthRatio}px`, maxHeight: `${fontsize * picHeightRatio}px`}}
                              onClick={()=>{
                                  playClickSound();
                                  setFullImage(card.card);
                                  setShowFullImage(true);
                              }}
                          />

                          <img
                              src={
                                  card.card.稀有度 === "刹那"
                                    ? "images/instant.png"
                                    : card.card.稀有度 === "世界"
                                        ? "images/world.png"
                                        : card.card.稀有度 === "月"
                                            ? "images/moon.png"
                                            : card.card.稀有度 === "辰星"
                                                ? "images/star1.png"
                                                : "images/star2.png"
                              }
                              className="absolute h-auto z-10"
                              style={{top: `${fontsize * -1.1}px`, right: "0px", height: `${fontsize * 2.5}px`,}}
                          />

                          <div
                              className="absolute top-[0] left-[0] rounded-full flex items-center justify-center z-10"
                              style={{background: "radial-gradient(circle, rgba(256,256,256,0.5) 0%, rgba(128,128,128,0) 60%)"}}
                          >
                            <img
                                src={`images/60px-${card.card.属性}.png`}
                                style={{height: `${fontsize * 1.5}px`}}
                                alt="属性图标"
                            />
                          </div>

                          <div
                              className="absolute bottom-[0] left-[1px] flex flex-row z-10 items-center"
                              style={{
                                fontSize: `${fontsize * 0.8}px`,
                                fontWeight: '800',
                                color: 'white',
                                textShadow: '0 0 2px gray, 0 0 4px gray',
                              }}
                          >
                            <label>{card.card.主角}·{card.card.卡名}</label>
                          </div>
                        </>
                    )}
                  </div>

              );
            })}
          </div>
        ))}
      </div>

        {/*按钮*/}
      <div
          className="absolute z-30 w-full flex items-center justify-center"
          style={{bottom: `${fontsize * 2.5}px`, gap: `${fontsize * 4}px`}}
      >
        <button
            style={{
              fontSize: `${fontsize}px`,
              backgroundColor: 'rgba(122,138,166,0.8)',
              boxShadow: '0 0 10px #111214, 0 0 20px #111214',
              color: 'white',
              textShadow: '0 0 5px gray',
              width: `${fontsize * 8}px`,
          }}
            onClick={()=>{playClickSound();onClose();}}
        >
          确定
        </button>
        <button
            style={{
              fontSize: `${fontsize}px`,
              backgroundColor: 'rgba(239,218,160,0.8)',
              boxShadow: '0 0 10px gold, 0 0 20px gold',
              color: 'white',
              textShadow: '0 0 5px gray',
              width: `${fontsize * 8}px`,
          }}
            onClick={(e) => {
                        setHasShownSummary(false);
                        setShowSummary(false);
                        handleDraw(10);
                        handleStartDraw();
                        e.stopPropagation(); // 阻止冒泡
                    }}
        >
          再次抽取
        </button>
      </div>


        <div className="absolute w-full h-full" style={{backgroundColor: 'black'}}>
            {showFullImage && (
            <CardFullImage
                key={fullImage.卡名}
                card={fullImage}
                onClick={()=>{playClickSound(); setShowFullImage(false)}}
                isShowCardResult={true}
                fontsize={fontsize}
            />
            )}
        </div>


    </div>
  );
};

export default CardSummary;
