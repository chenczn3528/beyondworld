import React, { useEffect, useRef, useState } from 'react';

const DrawAnimationCards = ({ isFiveStar, onAnimationEnd }) => {
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const [videoDuration, setVideoDuration] = useState(0);

  const handleVideoLoaded = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration);
    }
  };

  const handleVideoEnded = () => {
    onAnimationEnd();
  };

  useEffect(() => {
    if (videoRef.current && audioRef.current) {
      videoRef.current.play();
      audioRef.current.play();
    }
  }, [isFiveStar]);

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
          <source
              // src={isFiveStar ? 'https://cdn.chenczn3528.dpdns.org/beyondworld/videos/gold.mp4' : 'https://cdn.chenczn3528.dpdns.org/beyondworld/videos/no_gold.mp4'}

              src={isFiveStar ? 'videos/gold.mp4' : 'videos/no_gold.mp4'}
              type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>

        <audio
            ref={audioRef}
            preload="auto"
            autoPlay
            loop
            muted={false}
        >
          <source
              // src='https://cdn.chenczn3528.dpdns.org/beyondworld/audios/抽卡音频.mp3'
              src='audios/抽卡音频.mp3'
              type="audio/mp3"
          />
          Your browser does not support the audio element.
        </audio>
      </div>
    </div>
  );
};

export default DrawAnimationCards;