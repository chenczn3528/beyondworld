import React, { useEffect, useRef } from 'react';
import CardFullImage from "./CardFullImage.jsx";

const CardOverlay = ({
    showCardOverlay,
    currentCardIndex,
    setCurrentCardIndex,
    drawResultsRef,
    handleNextCard,
    fontsize,
    handleSkip,
}) => {
    const cardSoundRef = useRef(null);


    const allCards = drawResultsRef.current.map(item => item.card);
    const card = allCards[currentCardIndex];



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

    // ⭐ 空卡保护
    if (!card) return null;




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