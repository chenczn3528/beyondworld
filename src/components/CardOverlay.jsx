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
        } else if (card.稀有度 === '月' || card.稀有度 === '瞬') {
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

                    // 使用 WebAudio 增益放大（可配置）
                    try {
                        const AudioCtx = window.AudioContext || window.webkitAudioContext;
                        const ctx = new AudioCtx();
                        if (ctx.state === 'suspended') {
                            try { await ctx.resume(); } catch {}
                        }
                        const source = ctx.createMediaElementSource(audio);
                        const gainNode = ctx.createGain();
                        let sfxGain = 1;
                        try {
                            const saved = localStorage.getItem('sfxGain');
                            if (saved) {
                                const parsed = parseFloat(saved);
                                if (!Number.isNaN(parsed) && parsed > 0) sfxGain = parsed;
                            }
                        } catch {}
                        gainNode.gain.value = sfxGain;
                        source.connect(gainNode);
                        gainNode.connect(ctx.destination);
                    } catch (e) {
                        // 失败则忽略增益管线，直接播放
                    }

                    audio.currentTime = 0;
                    await audio.play();
                    cardSoundRef.current = audio;
                }
            } catch (err) {
                console.warn("音效播放失败:", err);
            }
        };

        playSound();
    }, [card, showCardOverlay, loadAsset, currentCardIndex]);

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