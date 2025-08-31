import React, { useEffect, useRef } from 'react';
import CardFullImage from "./CardFullImage.jsx";
import { useAssetLoader } from '../hooks/useAssetLoader';

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
    const { loadAsset } = useAssetLoader();

    const allCards = drawResultsRef.current.map(item => item.card);
    const card = allCards[currentCardIndex];

    // ⭐ 播放音效
    useEffect(() => {
        if (!showCardOverlay || !card) return;
        
        let soundFileName;
        if (card.稀有度 === '世界' || card.稀有度 === '刹那') {
            soundFileName = '金卡音效.mp3';
        } else if (card.稀有度 === '月') {
            soundFileName = '月卡音效.mp3';
        } else {
            soundFileName = '切换音效.mp3';
        }

        // 使用 Asset 系统加载音频
        const playSound = async () => {
            try {
                const audioUrl = await loadAsset('audio', soundFileName);
                if (audioUrl) {
                    const audio = new Audio(audioUrl);
                    audio.volume = 1;
                    audio.currentTime = 0;
                    await audio.play();
                    cardSoundRef.current = audio;
                }
            } catch (err) {
                console.warn("音效播放失败:", err);
            }
        };

        playSound();
    }, [card, showCardOverlay, loadAsset]);

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