import React, { useEffect, useRef, useState } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import CardFullImage from "./CardFullImage.jsx";

const CardOverlay = ({
  showCardOverlay,
  currentCardIndex,
  drawResultsRef,
  videoPlayed,
  setVideoPlayed,
  handleNextCard,
  isSkipped,
  setIsSkipped,
}) => {
  const isCurrentFiveStar = drawResultsRef.current[currentCardIndex]?.card?.稀有度 === '世界';

  const [isSecondImage, setIsSecondImage] = useState(false);
  const [isClickable, setIsClickable] = useState(true); // 控制点击是否有效
  const cardSoundRef = useRef(null);

  // 音效播放逻辑
  useEffect(() => {
    if (!showCardOverlay) return;

    const card = drawResultsRef.current[currentCardIndex]?.card;
    if (!card) return;

    let soundEffect;
    if (card.稀有度 === '世界') {
      soundEffect = 'audios/金卡音效.mp3';
    } else if (card.稀有度 === '月') {
      soundEffect = 'audios/月卡音效.mp3';
    } else {
      soundEffect = 'audios/切换音效.mp3';
    }

    cardSoundRef.current = new Audio(soundEffect);
    cardSoundRef.current.volume = 1;
    cardSoundRef.current.currentTime = 0;
    cardSoundRef.current.play().catch((err) => console.warn('卡片展示音效播放失败:', err));
  }, [currentCardIndex, showCardOverlay]);

  // 控制五星卡展示两张图逻辑
  useEffect(() => {
    if (!showCardOverlay) return;

    if (isCurrentFiveStar) {
      setIsClickable(false); // 禁止点击
      setIsSecondImage(false); // 回到第一张图
      const timer = setTimeout(() => {
        setIsSecondImage(true); // 显示第二张图
        setIsClickable(true); // 允许点击
      }, 3000); // 三秒后切换

      return () => clearTimeout(timer);
    } else {
      setIsSecondImage(false);
      setIsClickable(true);
    }
  }, [showCardOverlay, currentCardIndex]);

  const card = drawResultsRef.current[currentCardIndex]?.card;

  return (
    showCardOverlay && (
      <div
        className="fixed inset-0 z-30 bg-black bg-opacity-70"
        onClick={() => {
          if (isClickable) {
            handleNextCard();
          }
        }}
      >
        <CardFullImage
          card={card}
          isSecondImage={isCurrentFiveStar && isSecondImage}
          setIsSkipped={setIsSkipped}
        />
      </div>
    )
  );
};

export default CardOverlay;
