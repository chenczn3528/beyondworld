import React, { useState, useEffect, useRef } from "react";
import {forceLandscape} from "single-screen-utils";
import { LazyLoadImage } from 'react-lazy-load-image-component';
import LeftIcon from "../icons/LeftIcon.jsx";

const GalleryPage = ({ cards, showGallery, setShowGallery, showGalleryFullImage, setShowGalleryFullImage, galleryCard, setGalleryCard }) => {

    useEffect(()=>{
        forceLandscape();
    },[])

    const [scrollT, setScrollT] = useState(0);
    const timeoutRef = useRef(null);

    const paddingCount = 5; // 前后各留5张空白卡片
    const targetIndex = 1; // 希望第几张显示在视觉焦点位（第三张）
    const totalSlots = cards.length + paddingCount * 2;
    const spacingFactor = 7.5; // 控制卡片间距

    const rawIndex = Math.round(scrollT * (totalSlots - 1)) - paddingCount;
    const currentCardIndex = rawIndex + 1;

    // 控制路径和偏移参数（基于屏幕尺寸百分比）
    const startX = 10;
    const startY = 10;
    const deltaX = 90;
    const deltaY = 70;
    const curveFactor = 20;

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


    const rarityMap = {
      世界: 'images/world.png',
      月: 'images/moon.png',
      辰星: 'images/star1.png',
      星: 'images/star2.png',
    };


    return (
        showGallery && (
            <div
                id="app"
                className="relative w-full h-full z-20"
                onWheel={handleWheel}
                style={{
                    background: "black",
                    overflow: "hidden",
                    position: "relative",
                }}
            >

                <button className="absolute z-[70] top-[5vmin] left-[8vmin] w-auto flex items-center justify-center"
                        onClick={() => setShowGallery(false)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            padding: 10,
                        }}
                >
                    <LeftIcon size={36} color="white"/>
                </button>


                <div className="absolute top-[0] right-[0] h-[100vmin] w-auto">
                    <LazyLoadImage
                        src={cards[currentCardIndex]?.图片信息?.[0]?.srcset2}
                        placeholderSrc={cards[currentCardIndex]?.图片信息?.[0].src}
                        effect="blur"
                        alt="Full View"
                        className="w-auto h-[130vmin] object-cover"
                        onClick={() => {
                            setShowGalleryFullImage(!showGalleryFullImage);
                        }}
                    />
                    <div className="absolute flex flex-row top-[5vmin] right-[3vmin] items-center">
                        <div className="flex flex-row">

                            <div
                                className="flex flex-col items-end justify-end"
                                style={{color: "white", textShadow: '0 0 2px gray, 0 0 4px gray', fontWeight: 800}}
                            >
                                <label style={{fontSize: '4vmin'}}>{cards[currentCardIndex]?.主角}</label>
                                <div className="flex flex-row gap-[1vmin]">
                                    <img
                                        src={`images/60px-${cards[currentCardIndex]?.属性}.png`}
                                        className="w-[7vmin] h-auto"
                                    />
                                    <label style={{fontSize: '6vmin'}}>{cards[currentCardIndex]?.卡名}</label>
                                </div>

                            </div>
                        </div>

                        <img
                            src={rarityMap[cards[currentCardIndex]?.稀有度]}
                            className="w-[22vmin]"
                        />

                    </div>
                </div>


                {Array.from({length: totalSlots}).map((_, i) => {
                    const relativeIndex = (i - scrollT * (totalSlots - 1)) * spacingFactor;
                    const t = relativeIndex / (totalSlots - 1);

                    let opacity = 1;
                    if (t < 0) opacity = Math.max(0, 1 + t);
                    else if (t > 1) opacity = Math.max(0, 1 - (t - 1));

                    const curveOffset = curveFactor * Math.sin(t * Math.PI);
                    const x = startX + t * deltaX;
                    const y = startY + t * deltaY + curveOffset;
                    const defaultWhiteImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMB/WMZ+ZcAAAAASUVORK5CYII=\n";


                    const cardIndex = i - paddingCount;
                    const isRealImage = cardIndex >= 0 && cardIndex < cards.length;
                    const imageSrc = isRealImage ? cards[cardIndex]["图片信息"][0].src : defaultWhiteImage;
                    const imageAttr = isRealImage ? cards[cardIndex]["属性"] : null;
                    const imageCardName = isRealImage ? cards[cardIndex]["卡名"] : null;
                    const imageRarity = isRealImage ? cards[cardIndex]['稀有度'] : null;

                    return (
                        <div key={i} className="w-[50vmin] h-[40vmin]">
                            <div
                                style={{
                                    position: "absolute",
                                    left: `${x - 30}vmin`,
                                    top: `${y}vmin`,
                                    width: "34vmin",
                                    height: "auto",
                                    boxShadow: "0 0 100px 100px rgba(23, 25, 33, 40%)", // 调整阴影大小/浓度
                                    zIndex: 0, // 放到最底层
                                    pointerEvents: "none", // 避免遮挡鼠标交互
                                }}
                            />

                            <div
                                style={{
                                    position: "absolute",
                                    left: `${x - 60}vmin`,
                                    top: `${y + 40}vmin`,
                                    width: "80vmin",
                                    height: "auto",
                                    boxShadow: "0 0 100px 100px rgba(23, 25, 33, 60%)", // 调整阴影大小/浓度
                                    zIndex: 0, // 放到最底层
                                    pointerEvents: "none", // 避免遮挡鼠标交互
                                }}
                            />

                            <img
                                src={imageSrc}
                                alt={`img-${i}`}
                                onClick={() => {
                                    if (isRealImage) scrollToIndex(cardIndex);
                                }}
                                className="edge-blur-mask"
                                style={{
                                    position: "absolute",
                                    left: `${x}vmin`,
                                    top: `${y}vmin`,
                                    width: "36vmin",
                                    height: "auto",
                                    objectFit: "cover",
                                    opacity,
                                    cursor: isRealImage ? "pointer" : "default",
                                    pointerEvents: isRealImage ? "auto" : "none",
                                    transition: "left 0.3s ease, top 0.3s ease, opacity 0.3s ease",
                                    zIndex: totalSlots - i,
                                }}
                            />
                            {imageAttr && (
                                <div>
                                    <img
                                        src={`images/60px-${imageAttr}.png`}
                                        className="absolute w-[5vmin]"
                                        style={{
                                            left: `${x + 1}vmin`,
                                            top: `${y + 1}vmin`,
                                            zIndex: totalSlots - i,
                                            transition: "left 0.3s ease, top 0.3s ease, opacity 0.3s ease",
                                        }}
                                    />

                                    <label
                                        className="absolute"
                                        style={{
                                            fontSize: '3vmin',
                                            color: 'white',
                                            textShadow: '0 0 1px gray, 0 0 2px gray',
                                            transition: "left 0.3s ease, top 0.3s ease, opacity 0.3s ease",
                                            zIndex: totalSlots - i,
                                            left: `${x + 1}vmin`,
                                            transform: 'translateY(-100%)',
                                            top: `${y + 20}vmin`,
                                        }}
                                    >
                                        {imageCardName}
                                    </label>

                                    <img
                                        src={rarityMap[imageRarity]}
                                        className="absolute w-[8vmin]"
                                        style={{
                                            left: `${x + 28}vmin`,
                                            top: `${y}vmin`,
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
        )
    );
};

export default GalleryPage;