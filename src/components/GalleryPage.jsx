import React, { useState, useEffect, useRef } from "react";
import { LazyLoadImage } from 'react-lazy-load-image-component';
import LeftIcon from "../icons/LeftIcon.jsx";

const GalleryPage = ({
    cards,
    showGallery,
    setShowGallery,
    showGalleryFullImage,
    setShowGalleryFullImage,
    galleryCard,
    setGalleryCard,
    fontsize
}) => {

    const [scrollT, setScrollT] = useState(0);
    const timeoutRef = useRef(null);

    const paddingCount = 5; // 前后各留5张空白卡片
    const targetIndex = 1; // 希望第几张显示在视觉焦点位（第三张）
    const totalSlots = cards.length + paddingCount * 2;


    const clippedT = Math.max(0, Math.min(1, scrollT));
    const rawIndex = Math.round(clippedT * (totalSlots - 1)) - paddingCount;
    const currentCardIndex = rawIndex + 1; // ✅ 不再 +1


    // 滑动定位
    const SCROLL_T_MIN = -10;//-0.1;
    const SCROLL_T_MAX = 10;//1.1;


    const scrollToIndex = (index) => {
        const clampedIndex = Math.max(0, Math.min(cards.length - 1, index)); // 防越界
        const targetSlot = clampedIndex + paddingCount;
        const tValue = (targetSlot - targetIndex) / (totalSlots - 1);
        setScrollT(Math.max(SCROLL_T_MIN, Math.min(SCROLL_T_MAX, tValue)));
    };


    useEffect(() => {
        const container = document.querySelector('#gallery-scroll-container');

        if (!container) return;

        container.addEventListener("wheel", handleWheel, { passive: false });
        container.addEventListener("touchmove", handleTouchMove, { passive: false });

        return () => {
            container.removeEventListener("wheel", handleWheel);
            container.removeEventListener("touchmove", handleTouchMove);
        };
    }, [scrollT]);


    const handleWheel = (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.02 : -0.02;
        const newScroll = scrollT + delta * 0.1;

        // 防止超出限制区间
        if ((newScroll < SCROLL_T_MIN && delta < 0) || (newScroll > SCROLL_T_MAX && delta > 0)) return;

        const clipped = Math.max(SCROLL_T_MIN, Math.min(SCROLL_T_MAX, newScroll));
        setScrollT(clipped);

        clearTimeout(timeoutRef.current);
        const approxIndex = Math.round(Math.max(0, Math.min(1, clipped)) * (totalSlots - 1));
        const alignedIndex = approxIndex - paddingCount;
        timeoutRef.current = setTimeout(() => {
            scrollToIndex(alignedIndex);
        }, 100);
    };


    useEffect(() => {
        scrollToIndex(0); // ✅ 初始加载时将第0号卡片放到参考位置（第3张）
    }, [showGallery]);

    useEffect(() => {
        setGalleryCard(cards[currentCardIndex] ? cards[currentCardIndex] : cards[0]);
    }, [scrollT]);




    const touchStartRef = useRef(null);

    const handleTouchStart = (e) => {
        touchStartRef.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
        if (!touchStartRef.current) return;
        const deltaY = touchStartRef.current - e.touches[0].clientY;
        const direction = deltaY > 0 ? 1 : -1;
        const newScroll = scrollT + direction * 0.002;

        // 防止超出限制区间
        if ((newScroll < SCROLL_T_MIN && direction < 0) || (newScroll > SCROLL_T_MAX && direction > 0)) return;

        const clipped = Math.max(SCROLL_T_MIN, Math.min(SCROLL_T_MAX, newScroll));
        setScrollT(clipped);

        clearTimeout(timeoutRef.current);
        const approxIndex = Math.round(Math.max(0, Math.min(1, clipped)) * (totalSlots - 1));
        const alignedIndex = approxIndex - paddingCount;
        timeoutRef.current = setTimeout(() => {
            scrollToIndex(alignedIndex);
        }, 100);
    };



    const widthBias = fontsize * 0.25;
    const heightBias = fontsize * 0.3;



    const getDisplayCardIndex = () => {
      if (currentCardIndex < 0) return 0;
      if (currentCardIndex >= cards.length) return cards.length - 1;
      return currentCardIndex;
    };

    const displayCard = cards[getDisplayCardIndex()];

    return (
        showGallery && (
            <div
                className="relative w-full h-full z-20"
                id="gallery-scroll-container"
                onTouchStart={handleTouchStart}
                style={{
                    background: "black",
                    overflow: "hidden",
                    backgroundImage : `url(${displayCard["图片信息"][0].srcset2})`,
                    backgroundSize: 'cover'
                }}
                onClick={() => {
                            setShowGalleryFullImage(!showGalleryFullImage);
                        }}
            >

                {/*返回按钮*/}
                <button className="absolute z-[70] w-auto flex items-center justify-center"
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowGallery(false);
                        }}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            padding: 10,
                            top: `${fontsize * 1}px`,
                            left: `${fontsize * 1}px`,
                        }}
                >
                    <LeftIcon size={fontsize * 2} color="white"/>
                </button>



                {/*小图*/}
                <div className="overflow-y-auto">

                    {Array.from({length: totalSlots}).map((_, i) => {

                        // 控制路径和偏移参数（基于屏幕尺寸百分比）
                        const spacingFactor = 13; // 控制卡片间距
                        const startX = -5;
                        const startY = 10;
                        const deltaX = 80;
                        const deltaY = 60;
                        const curveFactor = 20; // y 轴弯曲幅度
                        const angleScale = 0.9; // π/4 = 0.25 * π


                        const relativeIndex = (i - scrollT * (totalSlots - 1)) * spacingFactor;
                        const t = relativeIndex / (totalSlots - 1);

                        const curveOffset = curveFactor * Math.sin(t * Math.PI * angleScale);
                        const x = startX + t * deltaX;
                        const y = startY + t * deltaY + curveOffset;
                        const defaultWhiteImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMB/WMZ+ZcAAAAASUVORK5CYII=";


                        const cardIndex = i - paddingCount;
                        const isRealImage = cardIndex >= 0 && cardIndex < cards.length;
                        const imageSrc = isRealImage ? cards[cardIndex]["图片信息"][0].src : defaultWhiteImage;

                        return (
                            <div key={i}>

                                <img
                                    src={imageSrc}
                                    alt={`img-${i}`}
                                    onClick={(e) => {
                                        if (isRealImage) scrollToIndex(cardIndex);
                                        e.stopPropagation();
                                    }}
                                    className="edge-blur-mask"
                                    style={{
                                        position: "absolute",
                                        left: `${x * widthBias}px`,
                                        top: `${y * heightBias}px`,
                                        width: `${fontsize * 16 * 0.9}px`,
                                        height: `${fontsize * 9 * 0.9}px`,
                                        objectFit: "cover",
                                        cursor: isRealImage ? "pointer" : "default",
                                        pointerEvents: isRealImage ? "auto" : "none",
                                        transition: "left 0.3s ease, top 0.3s ease, opacity 0.3s ease",
                                        zIndex: totalSlots - i,
                                    }}
                                />

                            </div>

                        );
                    })}

                </div>

                {/*让小图能滚动*/}
                <div
                    onWheel={handleWheel}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    style={{
                        position: 'absolute',
                        pointerEvents: "none",
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        zIndex: 0, // 避免挡住其他按钮等
                    }}
                />


            </div>
        )
    );
};

export default GalleryPage;