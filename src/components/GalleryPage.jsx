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
    const spacingFactor = 12.5; // 控制卡片间距

    const rawIndex = Math.round(scrollT * (totalSlots - 1)) - paddingCount;
    const currentCardIndex = rawIndex + 1;

    // 控制路径和偏移参数（基于屏幕尺寸百分比）
    const startX = -10;
    const startY = -5;
    const deltaX = 100;
    const deltaY = 80;
    const curveFactor = 22;

    const scrollToIndex = (index) => {
        const targetSlot = index + paddingCount;
        const tValue = (targetSlot - targetIndex) / (totalSlots - 1);
        setScrollT(Math.max(0, Math.min(1, tValue)));
    };

    const handleWheel = (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.001 : -0.001;
        const newScroll = Math.min(1, Math.max(0, scrollT + delta));
        setScrollT(newScroll);

        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            const approxIndex = Math.round(newScroll * (totalSlots - 1));
            const alignedIndex = approxIndex - paddingCount;
            scrollToIndex(alignedIndex);
        }, 100);
    };

    useEffect(() => {
        scrollToIndex(0); // ✅ 初始加载时将第0号卡片放到参考位置（第3张）
    }, [showGallery]);

    useEffect(() => {
        setGalleryCard(cards[currentCardIndex] ? cards[currentCardIndex] : cards[0]);
    }, [scrollT]);


    // const rarityMap = {
    //   世界: 'https://cdn.chenczn3528.dpdns.org/beyondworld/images/world.png',
    //   月: 'https://cdn.chenczn3528.dpdns.org/beyondworld/images/moon.png',
    //   辰星: 'https://cdn.chenczn3528.dpdns.org/beyondworld/images/star1.png',
    //   星: 'https://cdn.chenczn3528.dpdns.org/beyondworld/images/star2.png',
    // };

    const rarityMap = {
        世界: 'images/world.png',
        月: 'images/moon.png',
        辰星: 'images/star1.png',
        星: 'images/star2.png',
    };


    const widthBias = fontsize * 0.25;
    const heightBias = fontsize * 0.3;







    return (
        showGallery && (
            <div
                className="relative w-full h-full z-20"
                onWheel={handleWheel}
                style={{
                    background: "black",
                    overflow: "hidden",
                    position: "relative",
                }}
            >

                {/*返回按钮*/}
                <button className="absolute z-[70] w-auto flex items-center justify-center"
                        onClick={() => setShowGallery(false)}
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

                {/*大图*/}
                <div className="relative w-full h-full flex">
                    <LazyLoadImage
                        src={cards[currentCardIndex]?.图片信息?.[0]?.srcset2}
                        placeholderSrc={cards[currentCardIndex]?.图片信息?.[0].src}
                        effect="blur"
                        alt="Full View"
                        className="w-full h-full object-cover"
                        onClick={() => {
                            setShowGalleryFullImage(!showGalleryFullImage);
                        }}
                    />
                    <div className="absolute flex flex-row items-center"
                         style={{top: `${fontsize}px`, right: `${fontsize}px`}}>
                        <div className="flex flex-row">

                            <div
                                className="flex flex-col items-end justify-end"
                                style={{color: "white", textShadow: '0 0 2px gray, 0 0 4px gray', fontWeight: 800}}
                            >
                                <label style={{fontSize: `${fontsize}px`}}>{cards[currentCardIndex]?.主角}</label>
                                <div className="flex flex-row gap-[1px]">
                                    <img
                                        // src={`https://cdn.chenczn3528.dpdns.org/beyondworld/images/60px-${cards[currentCardIndex]?.属性}.png`}
                                        src={`images/60px-${cards[currentCardIndex]?.属性}.png`}
                                        className="h-auto"
                                        style={{width: `${fontsize * 2}px`}}
                                    />
                                    <label
                                        style={{fontSize: `${fontsize * 1.3}px`}}>{cards[currentCardIndex]?.卡名}</label>
                                </div>

                            </div>
                        </div>

                        <img
                            src={rarityMap[cards[currentCardIndex]?.稀有度]}
                            style={{width: `${fontsize * 5}px`}}
                        />

                    </div>
                </div>



                <div>
                    {Array.from({length: totalSlots}).map((_, i) => {
                        const relativeIndex = (i - scrollT * (totalSlots - 1)) * spacingFactor;
                        const t = relativeIndex / (totalSlots - 1);

                        const curveOffset = curveFactor * Math.sin(t * Math.PI * 0.9);
                        const x = startX + t * deltaX;
                        const y = startY + t * deltaY + curveOffset;
                        return (
                            <div key={i}>

                                <div
                                    style={{
                                        position: "absolute",
                                        left: `${x * widthBias}px`,
                                        top: `${y * heightBias}px`,
                                        width: `${fontsize * 16 * 0.9}px`,
                                        height: `${fontsize * 9 * 0.9}px`,
                                        borderRadius: "0%", // 可选，加上更像扩散雾
                                        background: "rgba(0,0,0,0.01)", // 有背景才能产生阴影
                                        boxShadow: "0 0 100px 100px rgba(23, 25, 33, 0.4)",
                                        pointerEvents: "none",
                                        transition: "left 0.3s ease, top 0.3s ease, opacity 0.3s ease",
                                        zIndex: 1,
                                    }}
                                />
                            </div>

                        );
                    })}
                </div>


                {/*小图*/}
                <div className="overflow-y-auto">

                    {Array.from({length: totalSlots}).map((_, i) => {
                        const relativeIndex = (i - scrollT * (totalSlots - 1)) * spacingFactor;
                        const t = relativeIndex / (totalSlots - 1);

                        const curveOffset = curveFactor * Math.sin(t * Math.PI * 0.9);
                        const x = startX + t * deltaX;
                        const y = startY + t * deltaY + curveOffset;
                        const defaultWhiteImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMB/WMZ+ZcAAAAASUVORK5CYII=";


                        const cardIndex = i - paddingCount;
                        const isRealImage = cardIndex >= 0 && cardIndex < cards.length;
                        const imageSrc = isRealImage ? cards[cardIndex]["图片信息"][0].src : defaultWhiteImage;
                        const imageAttr = isRealImage ? cards[cardIndex]["属性"] : null;
                        const imageCardName = isRealImage ? cards[cardIndex]["卡名"] : null;
                        const imageRarity = isRealImage ? cards[cardIndex]['稀有度'] : null;

                        return (
                            <div key={i}>

                                <img
                                    src={imageSrc}
                                    alt={`img-${i}`}
                                    onClick={() => {
                                        if (isRealImage) scrollToIndex(cardIndex);
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
                                {imageAttr && (
                                    <div>
                                        <img
                                            // src={`https://cdn.chenczn3528.dpdns.org/beyondworld/images/60px-${imageAttr}.png`}
                                            src={`images/60px-${imageAttr}.png`}
                                            className="absolute"
                                            style={{
                                                width: `${fontsize * 2}px`,
                                                left: `${(x + 1) * widthBias}px`,
                                                top: `${(y + 1) * heightBias}px`,
                                                zIndex: totalSlots - i,
                                                transition: "left 0.3s ease, top 0.3s ease, opacity 0.3s ease",
                                            }}
                                        />

                                        <label
                                            className="absolute"
                                            style={{
                                                fontSize: `${fontsize}px`,
                                                color: 'white',
                                                textShadow: '0 0 1px gray, 0 0 2px gray',
                                                transition: "left 0.3s ease, top 0.3s ease, opacity 0.3s ease",
                                                zIndex: totalSlots - i,
                                                left: `${(x + 1) * widthBias}px`,
                                                transform: 'translateY(-100%)',
                                                top: `${(y + 27) * heightBias}px`,
                                            }}
                                        >
                                            {imageCardName}
                                        </label>

                                        <img
                                            src={rarityMap[imageRarity]}
                                            className="absolute"
                                            style={{
                                                width: `${fontsize * 3}px`,
                                                left: `${(x + 48) * widthBias}px`,
                                                top: `${y * heightBias}px`,
                                                zIndex: totalSlots - i,
                                                transition: "left 0.3s ease, top 0.3s ease, opacity 0.3s ease",
                                            }}
                                        />
                                    </div>


                                )}

                            </div>

                        );
                    })}

                </div>


            </div>
        )
    );
};

export default GalleryPage;