import React, { useEffect, useRef, useState } from 'react';
import CardFullImage from "./CardFullImage.jsx";

const CardOverlay = ({
    showCardOverlay,
    setShowCardOverlay,
    currentCardIndex,
    setCurrentCardIndex,
    drawResultsRef,
    handleNextCard,
    isSkipped,
    setIsSkipped,
    fontsize,
}) => {
    const cardSoundRef = useRef(null);

    const allCards = drawResultsRef.current.map(item => item.card);
    const firstCard = allCards[0];
    // ✅ 精准排除第一张卡，不误伤同样的五星卡
    const fiveStarCards = allCards.slice(1).filter(
        card => card.稀有度 === '世界' && card !== firstCard
    );
    // ⭐ 跳过后展示第一张 + 剩余五星卡
    const displayCards = isSkipped ? [firstCard, ...fiveStarCards] : allCards;

    const card = displayCards[currentCardIndex];

    // console.log("drawResultsRef", drawResultsRef)


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



    // ⭐ 跳过后展示完所有五星卡就关闭
    useEffect(() => {
        if (isSkipped && currentCardIndex >= displayCards.length) {
            setShowCardOverlay(false);
            setIsSkipped(false);
            setCurrentCardIndex(0);
        }
    }, [isSkipped, currentCardIndex, displayCards.length]);

    // ⭐ 空卡保护
    if (!card) return null;



    const handleSkip = () => {
        const allCards = drawResultsRef.current.map(item => item.card);
        const firstCard = allCards[0];
        const remainingCards = allCards.slice(1);

        // ⭐ 世界卡去重（避免 firstCard 重复）
        const fiveStarCards = remainingCards.filter(
            card => card.稀有度 === '世界' && !(card.主角 === firstCard.主角 && card.世界 === firstCard.世界)
        );

        setIsSkipped(true);

        // ⭐ 跳过后默认直接展示五星卡
        if (fiveStarCards.length > 0) {
            setCurrentCardIndex(1); // index 1 是第一张五星卡
        } else {
            setCurrentCardIndex(0); // 没有五星，回到第一张（通常只展示1张）
        }
    };




    return (
        showCardOverlay && (
            <div className="absolute w-full h-full">
                <CardFullImage
                    key={currentCardIndex}
                    card={card}
                    onClick={handleNextCard}
                    onSkip={handleSkip}
                    isShowCardResult={false}
                    setCurrentIndex={setCurrentCardIndex}
                    fontsize={fontsize}
                />
            </div>
        )
    );
};

export default CardOverlay;