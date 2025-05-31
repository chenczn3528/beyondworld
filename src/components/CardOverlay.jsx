import React, { useEffect, useRef, useState } from 'react';
import CardFullImage from "./CardFullImage.jsx";

const CardOverlay = ({
  showCardOverlay,
  setShowCardOverlay,
  currentCardIndex,
  setCurrentIndex,
  drawResultsRef,
  handleNextCard,
  isSkipped,
  setIsSkipped,
  fontsize,
}) => {
  const [isSecondImage, setIsSecondImage] = useState(false);
  const [isClickable, setIsClickable] = useState(true);
  const cardSoundRef = useRef(null);

  const allCards = drawResultsRef.current.map(item => item.card);
  const firstCard = allCards[0];
  const remainingCards = allCards.slice(1);
  const fiveStarCards = remainingCards.filter(card => card.稀有度 === '世界');



  // ⭐ 跳过后展示：第一张 + 剩余五星卡
  const displayCards = isSkipped ? [firstCard, ...fiveStarCards] : allCards;

  const card = displayCards[currentCardIndex];

  const isCurrentFiveStar = card?.稀有度 === '世界';

  // ⭐ 播放音效
  useEffect(() => {
    if (!showCardOverlay || !card) return;

    let sound;
    if (card.稀有度 === '世界') {
      sound = 'audios/金卡音效.mp3';
    } else if (card.稀有度 === '月') {
      sound = 'audios/月卡音效.mp3';
    } else {
      sound = 'audios/切换音效.mp3';
    }

    const audio = new Audio(sound);
    audio.volume = 1;
    audio.currentTime = 0;
    audio.play().catch(err => console.warn("音效播放失败:", err));
    cardSoundRef.current = audio;
  }, [card, showCardOverlay]);

  // ⭐ 五星卡展示两张图（模拟视频）
  useEffect(() => {
    if (!showCardOverlay || !card) return;

    if (isCurrentFiveStar) {
      setIsSecondImage(false);
      setIsClickable(false);
      const timer = setTimeout(() => {
        setIsSecondImage(true);
        setIsClickable(true);
      }, 3000); // 3秒后可点击
      return () => clearTimeout(timer);
    } else {
      setIsSecondImage(false);
      setIsClickable(true);
    }
  }, [card, showCardOverlay]);

  // ⭐ 跳过后展示完所有五星卡就关闭
  useEffect(() => {
    // console.log("judge", currentCardIndex, displayCards.length)
    if (isSkipped && currentCardIndex >= displayCards.length) {
      setShowCardOverlay(false);
      setIsSkipped(false);
      setCurrentIndex(0);
    }
  }, [isSkipped, currentCardIndex, displayCards.length]);

  // ⭐ 空卡保护
  if (!card) return null;


  return (
    showCardOverlay && (
      <div className="absolute w-full h-full" onClick={handleNextCard}>
        <CardFullImage
          key={currentCardIndex}
          card={card}
          isSecondImage={isCurrentFiveStar && isSecondImage}
          setIsSkipped={setIsSkipped}
          setCurrentIndex={setCurrentIndex}
          isShowCardResult={false}
          fontsize={fontsize}
          onClick={handleNextCard}
        />
      </div>
    )
  );
};

export default CardOverlay;