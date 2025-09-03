import React, { useEffect, useRef, useState } from 'react';
import { Asset } from './Asset.jsx';
import { useAssetLoader } from '../hooks/useAssetLoader';

const DrawAnimationCards = ({ isFiveStar, onAnimationEnd }) => {
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const { loadAsset } = useAssetLoader();

  const handleVideoLoaded = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration);
    }
  };

  const handleVideoEnded = () => {
    onAnimationEnd();
  };

  useEffect(() => {
    const playMedia = async () => {
      try {
        // 加载视频
        const videoFileName = isFiveStar ? 'gold.mp4' : 'no_gold.mp4';
        const videoUrl = await loadAsset('video', videoFileName);
        
        // 加载音频
        const audioUrl = await loadAsset('audio', '抽卡音频.mp3');
        
        if (videoRef.current && audioRef.current) {
          // 设置视频源
          if (videoRef.current.src !== videoUrl) {
            videoRef.current.src = videoUrl;
          }
          
          // 设置音频源
          if (audioRef.current.src !== audioUrl) {
            audioRef.current.src = audioUrl;
          }
          
          // 为音频应用增益
          try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            const ctx = new AudioCtx();
            if (ctx.state === 'suspended') {
              try { await ctx.resume(); } catch {}
            }
            
            // 获取增益设置
            let sfxGain = 1;
            try {
              const saved = localStorage.getItem('sfxGain');
              if (saved) {
                const parsed = parseFloat(saved);
                if (!Number.isNaN(parsed) && parsed > 0) sfxGain = parsed;
              }
            } catch {}
            
            const source = ctx.createMediaElementSource(audioRef.current);
            const gainNode = ctx.createGain();
            gainNode.gain.value = sfxGain;
            source.connect(gainNode);
            gainNode.connect(ctx.destination);
          } catch (e) {
            // 忽略增益管线错误，保底直接播放
          }
          
          // 播放媒体
          await videoRef.current.play();
          await audioRef.current.play();
        }
      } catch (error) {
        console.warn('媒体播放失败:', error);
      }
    };

    playMedia();
  }, [isFiveStar, loadAsset]);

  useEffect(() => {
    if (videoDuration > 0) {
      const timer = setTimeout(() => {
        onAnimationEnd();
      }, videoDuration * 1000);

      return () => clearTimeout(timer);
    }
  }, [videoDuration, onAnimationEnd]);

  return (
    <div className="absolute z-50 w-full h-full flex items-center justify-center animate-fade-in">
      <div className="relative w-full h-full">
        <video
            preload="auto"
            ref={videoRef}
            className="absolute w-full h-full object-cover"
            onLoadedData={handleVideoLoaded}
            onEnded={handleVideoEnded}
            autoPlay
            playsInline
            muted
            controls={false}
        >
          Your browser does not support the video tag.
        </video>

        <audio
            ref={audioRef}
            preload="auto"
            autoPlay
            // loop
            muted={false}
        >
          Your browser does not support the audio element.
        </audio>
      </div>
    </div>
  );
};

export default DrawAnimationCards;