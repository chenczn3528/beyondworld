import React, { useState, useEffect, useRef } from "react";
import LeftIcon from "../icons/LeftIcon.jsx";
import useCardImageIndex from "../hooks/useCardImageIndex.js";
import FadeImage from "./FadeImage.jsx";
import {Filter} from "lucide-react";
import FilterIcon from "../icons/FilterIcon.jsx";
import {playClickSound} from "../utils/playClickSound.js";
import FilterRoleCard from "./FilterRoleCard.jsx";
import GalleryTypeSelectPage from "./GalleryTypeSelectPage.jsx";
import {sortCards} from "../utils/cardSort.js";
import LockIcon from "../icons/LockIcon.jsx";

const GalleryPage = ({
    baseSize,
    cards,
    showGallery,
    setShowGallery,
    showGalleryFullImage,
    setShowGalleryFullImage,
    showFilterPage,
    setShowFilterPage,
    sortedCards,
    setSortedCards,
    galleryCard,
    setGalleryCard,
    selectedRole,
    setSelectedRole,
    orderChoice,
    setOrderChoice,
}) => {

    const roleMap = {0: '顾时夜', 1: '易遇', 3: '夏萧因', 2: '柏源', 4: '全部'};
    const rarityOrderMap = ['稀有度', '主属性数值', '全部', '思维', '魅力', '体魄', '感知', '灵巧'];

    const [showFilterCard, setShowFilterCard] = useState(false);



    const [finalCards, setFinalCards] = useState([]);
    useEffect(() => {
        if (!cards || cards.length === 0) return;
        if (!sortedCards || sortedCards.length === 0) {
            // sortedCards 还没处理好，先用 cards 展示（带角色筛选）
            const fallback = cards.filter(
                card => roleMap[selectedRole] === "全部" || card.主角 === roleMap[selectedRole]
            );
            setFinalCards(sortCards(fallback, orderChoice));
            return;
        }
        // 正常情况，用 sortedCards 展示
        const filtered = sortedCards.filter(
            card => roleMap[selectedRole] === "全部" || card.主角 === roleMap[selectedRole]
        );
        setFinalCards(sortCards(filtered, orderChoice));
    }, [selectedRole, sortedCards, orderChoice, cards]);




    const [scrollT, setScrollT] = useState(0);
    const timeoutRef = useRef(null);

    const paddingCount = 5; // 前后各留5张空白卡片
    const targetIndex = 1; // 希望第几张显示在视觉焦点位（第三张）

    const totalSlots = 300;


    const clippedT = Math.max(0, Math.min(1, scrollT));
    const rawIndex = Math.round(clippedT * (totalSlots - 1)) - paddingCount;
    const currentCardIndex = rawIndex + 1; // ✅ 不再 +1

    // 滑动定位
    const SCROLL_T_MIN = -0.2;
    const SCROLL_T_MAX = 1.1;






     // ======================================= 滚动相关
    const scrollToIndex = (index) => {
        const clampedIndex = Math.max(0, Math.min(finalCards.length - 1, index)); // 防越界
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

    useEffect(() => {
        const realLength = finalCards.length;
        if (currentCardIndex < -1) {
            setTimeout(() => scrollToIndex(0), 150);
        } else if (currentCardIndex >= realLength) {
            setTimeout(() => scrollToIndex(realLength - 1), 150);
        } else {
            setGalleryCard(finalCards[currentCardIndex]);
        }
    }, [scrollT]);


    const handleWheel = (e) => {
        // e.preventDefault();

        // ✅ 修正滚动方向判断
        const delta = e.deltaY > 0 ? 0.02 : -0.02;

        const newScroll = scrollT + delta * 0.1;

        // 防止超出限制区间
        if ((newScroll < SCROLL_T_MIN && delta < 0) || (newScroll > SCROLL_T_MAX && delta > 0)) return;

        const clipped = Math.max(SCROLL_T_MIN, Math.min(SCROLL_T_MAX, newScroll));
        setScrollT(clipped);

        clearTimeout(timeoutRef.current);
        const approxIndex = Math.floor(Math.max(0, Math.min(1, clipped)) * (totalSlots - 1));

        const alignedIndex = approxIndex - paddingCount;
        timeoutRef.current = setTimeout(() => {
            scrollToIndex(alignedIndex);
        }, 2000);
    };


    useEffect(() => {
        if (!showGallery) return; // 不显示时不绑定

        const container = divRef.current;
        if (!container) return;

        const wheelHandler = (e) => {
            e.preventDefault();
            handleWheel(e);
        };

        container.addEventListener('wheel', wheelHandler, { passive: false });

        return () => {
            container.removeEventListener('wheel', wheelHandler);
        };
    }, [showGallery]);





    useEffect(() => {
        scrollToIndex(0); // ✅ 初始加载时将第0号卡片放到参考位置（第3张）
    }, [showGallery]);






    const touchStartRef = useRef(null);
    const initialTouchRef = useRef(null); // 用来记录 touchstart 时的原始位置
    const scrollTRef = useRef(0);
    scrollTRef.current = scrollT;

    const handleTouchStart = (e) => {
        const isVertical = window.innerWidth <= 600;
        const startPos = isVertical ? e.touches[0].clientY : e.touches[0].clientX;

        touchStartRef.current = startPos;
        initialTouchRef.current = startPos; // 用来和 touchend 对比判断方向
    };


    const handleTouchMove = (e) => {
        if (!touchStartRef.current) return;

        const isVertical = window.innerWidth <= 600;
        const currentPos = isVertical ? e.touches[0].clientY : e.touches[0].clientX;
        const delta = touchStartRef.current - currentPos;

        const scrollStep = 0.00005;
        let newScroll = scrollTRef.current + delta * scrollStep;

        if (newScroll < SCROLL_T_MIN) newScroll = SCROLL_T_MIN;
        if (newScroll > SCROLL_T_MAX) newScroll = SCROLL_T_MAX;

        if (scrollTRef.current !== newScroll) {
            setScrollT(newScroll);
        }
        touchStartRef.current = currentPos;
    };


    const handleTouchEnd = (e) => {
        const isVertical = window.innerWidth <= 600;
        const endPos = isVertical ? e.changedTouches[0].clientY : e.changedTouches[0].clientX;
        const delta = endPos - initialTouchRef.current;

        const threshold = 30; // 滑动阈值，避免误触
        let targetIndex = currentCardIndex;

        if (delta > threshold) {
            targetIndex = currentCardIndex - 1; // 右滑
        } else if (delta < -threshold) {
            targetIndex = currentCardIndex + 1; // 左滑
        }

        // 限制范围
        targetIndex = Math.max(0, Math.min(finalCards.length - 1, targetIndex));
        scrollToIndex(targetIndex);
    };


    const divRef = useRef(null); // 获取当前绑定的容器的尺寸
    useEffect(() => {
        const container = divRef.current;
            if (!container) return;

        container.addEventListener('touchstart', handleTouchStart, { passive: true });
        container.addEventListener('touchmove', handleTouchMove, { passive: false });
        container.addEventListener('touchend', handleTouchEnd, { passive: true });

        return () => {
            container.removeEventListener('touchstart', handleTouchStart);
            container.removeEventListener('touchmove', handleTouchMove);
            container.removeEventListener('touchend', handleTouchEnd);
        };
    }, [currentCardIndex]);









    // ======================================= 获取当前展示的卡
    const getDisplayCardIndex = () => {
        if (currentCardIndex < 0) return 0;
        if (currentCardIndex >= finalCards.length) return finalCards.length - 1;
        return currentCardIndex;
    };

    const displayCard = finalCards[getDisplayCardIndex()];
    console.log(displayCard)
    // ==================== 设置点击进入大图的初始化
    useEffect(() => {
        setGalleryCard(finalCards[currentCardIndex] ? finalCards[currentCardIndex] : finalCards[0]);
    }, [scrollT, orderChoice, selectedRole, finalCards]);

    useEffect(() => {
        if (finalCards.length > 0 && !galleryCard) {
            setGalleryCard(finalCards[0]);
        }
    }, [finalCards, galleryCard, orderChoice, selectedRole]);



    // ======================================= 从大图详情退回小图的时候重新加载图片
    const { getImageIndex, indexMap } = useCardImageIndex();

    const [imageIndexes, setImageIndexes] = useState({});

    // ✅ 每当 finalCards 或 indexMap 改变，重新同步 imageIndexes
    useEffect(() => {
        const init = {};
        finalCards.forEach(card => {
            init[card.卡名] = indexMap[card.卡名] ?? 0;
        });
        setImageIndexes(init);
    }, [finalCards, indexMap, orderChoice, selectedRole]);

    // ✅ 当前显示卡的大图 index
    const imageIndex = imageIndexes[displayCard?.卡名] ?? 0;

    // ✅ 监听来自大图页面的修改事件
    useEffect(() => {
        const handler = (e) => {
            const { cardName, newIndex } = e.detail;
            setImageIndexes(prev => ({
                ...prev,
                [cardName]: newIndex,
            }));
        };
        window.addEventListener('custom:imageIndexChanged', handler);
        return () => window.removeEventListener('custom:imageIndexChanged', handler);
    }, []);

    const getImageUrl = (card, index, hd = 0) => {
        const info = card?.图片信息?.[index];
        if (!info) return '';
        return hd === 0 ? info.srcset2 : hd === 1 ? info.src || info.srcset2 : info.src;
    };



    const defaultWhiteImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAGUlEQVR42mNgGAWjgP///xkYGBgAADEMAQEGAP8GC04EtW8gAAAAAElFTkSuQmCC";
    const startX = 30;
    const startY = -5;
    const curveFactor = 10;
    const baseSpacing = 35;
    const a = -0.7; // 控制曲率，必须为负值
    const maxDistance = 12; // 最多影响几张卡，超过则固定缩小
    const rad = (-80 * Math.PI) / 180;

    const rarityMap = {
        世界: 'images/world.png',
        月: 'images/moon.png',
        辰星: 'images/star1.png',
        星: 'images/star2.png',
    };

    const [showOrderChoiceView, setShowOrderChoiceView] = useState(false);
    const position = [
        {bottom:`${baseSize * 50}px`, left: `${baseSize * 16}px`},
        {bottom:`${baseSize * 50}px`, left: `${baseSize * 58}px`}
    ]


    return (
        showGallery && (
            <div
                ref={divRef}
                className="relative w-full h-full z-20"
                id="gallery-scroll-container"
                onTouchMove={handleTouchMove}
                onTouchStart={handleTouchStart}
                style={{
                    background: "white",
                    overflow: "hidden",
                }}
                onClick={() => {
                    playClickSound();
                    if(!displayCard.owned === false) setShowGalleryFullImage(!showGalleryFullImage);
                }}
            >


                {/*返回按钮*/}
                <button className="absolute z-[300] w-auto flex items-center justify-center"
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowGallery(false);
                        }}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            padding: 0,
                            top: `${baseSize * 6}px`,
                            left: `${baseSize * 6}px`,
                        }}
                >
                    <LeftIcon size={baseSize * 24} color="white"/>
                </button>


                {showFilterCard && (
                    <FilterRoleCard
                        baseSize={baseSize}
                        onClose={setShowFilterCard}
                        selectedRole={selectedRole}
                        setSelectedRole={setSelectedRole}
                        showShadow={true}
                    />
                )}


                {showOrderChoiceView && (
                    <GalleryTypeSelectPage
                        baseSize={baseSize}
                        onClose={setShowOrderChoiceView}
                        position={position}
                        orderChoice={orderChoice}
                        setOrderChoice={setOrderChoice}
                    />
                )}


                <div
                    className="absolute w-[35%] h-full z-10 no-click"
                    onClick={(e) => {
                        e.stopPropagation()
                    }}
                >
                    {/*选角色*/}
                    <button
                        className="absolute z-[500]"
                        style={{
                            marginLeft: `${baseSize * 6}px`,
                            fontSize: `${baseSize * 6}px`,
                            width: `${baseSize * 50}px`,
                            bottom: `${baseSize * 12}px`,
                            left: `${baseSize * 12}px`,
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            color: 'white',
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            playClickSound();
                            setShowFilterCard(true);
                        }}
                    >
                        {roleMap[selectedRole]}
                    </button>





                    {/*选排序*/}
                    <button
                        className="absolute z-[500]"
                        style={{
                            // visibility: 'hidden',
                            marginLeft: `${baseSize * 6}px`,
                            fontSize: `${baseSize * 6}px`,
                            width: `${baseSize * 50}px`,
                            bottom: `${baseSize * 32}px`,
                            left: `${baseSize * 12}px`,
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            color: 'white',
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            playClickSound();
                            setShowOrderChoiceView(true);
                        }}
                    >
                        {orderChoice === 2 ? "属性数值" : rarityOrderMap[orderChoice]}
                    </button>

                    {/*选更具体的筛选*/}
                    <button className="absolute z-[500] w-auto flex items-center justify-center"
                            onClick={(e) => {
                                e.stopPropagation();
                                playClickSound();
                                setShowFilterPage(true);
                            }}
                            style={{
                                // visibility: 'hidden',
                                background: 'transparent',
                                padding: `${baseSize * 2}px`,
                                border: 'none',
                                bottom: `${baseSize * 12}px`,
                                left: `${baseSize * 70}px`,
                            }}
                    >
                        <FilterIcon size={baseSize * 10} color="white"/>
                    </button>
                </div>


                {/*大图*/}
                <div key={`${displayCard?.卡名}-${imageIndex}`} className="absolute w-full h-full">
                    {displayCard && (
                        <div className="absolute w-full h-full">
                            <FadeImage
                                cardSrc={getImageUrl(displayCard, imageIndex, 1)}
                                cardSrcset={getImageUrl(displayCard, imageIndex, 0)}
                            />

                            {displayCard.owned === false && (
                                <div
                                    className="absolute w-full h-full flex justify-center items-center"
                                    style={{backgroundColor: '#00000060'}}
                                >
                                    <LockIcon color="lightgray" size={baseSize * 16} />
                                </div>
                            )}


                            {/*大图标注*/}
                            <div className="absolute flex flex-row items-center z-10"
                                 style={{top: `${baseSize * 6}px`, right: `${baseSize * 6}px`}}>
                                <div className="flex flex-row">
                                    <div
                                        className="flex flex-col items-end justify-end"
                                        style={{
                                            color: "white",
                                            textShadow: `0 0 ${baseSize * 2}px gray, 0 0 ${baseSize * 2}px gray`,
                                            fontWeight: 800,
                                            width: `${baseSize * 80}px`
                                        }}
                                    >
                                        <label style={{fontSize: `${baseSize * 5.5}px`}}>{displayCard?.主角}</label>
                                        <div className="flex flex-row gap-[1px]">
                                            <img
                                                src={`images/60px-${displayCard?.属性}.png`}
                                                className="h-auto"
                                                style={{width: `${baseSize * 10}px`, height: `${baseSize * 10}px`}}
                                            />
                                            <label
                                                style={{fontSize: `${baseSize * 8}px`}}>{displayCard?.卡名}</label>
                                        </div>

                                    </div>
                                </div>
                                <img
                                    src={rarityMap[displayCard?.稀有度]}
                                    style={{height: `${baseSize * 28}px`}}
                                />
                            </div>
                        </div>
                    )}

                </div>


                {/*阴影*/}
                <div>
                    {Array.from({length: totalSlots}).map((_, i) => {
                        const centerIndex = scrollT * (totalSlots - 1); // 当前视觉焦点的位置（非整数）
                        const relativeIndex = i - centerIndex; // 焦点图卡的 relativeIndex === 0，即抛物线顶点

                        const dynamicSpacing = baseSpacing * (1 + 0.8 * Math.exp(-Math.abs(relativeIndex))); // h = 1
                        const x0 = relativeIndex * dynamicSpacing;

                        // 抛物线函数，顶点在 relativeIndex === 0
                        const curveValue = a * (relativeIndex) ** 2;
                        const y0 = curveFactor * curveValue;

                        // scale，离中心越远越小
                        const normalizedDist = Math.min(1, Math.abs(relativeIndex - 1) / maxDistance);
                        const scale = 1 - 0.7 * normalizedDist; // 最大为1，最小为0.6（你可调）

                        // 坐标
                        const rawX = startX + x0;
                        const rawY = startY + y0;
                        const x = rawX * Math.cos(rad) + rawY * Math.sin(rad);
                        const y = -rawX * Math.sin(rad) + rawY * Math.cos(rad);
                        return (
                            <div key={i}>

                                <div
                                    style={{
                                        position: "absolute",
                                        left: `${(x - 480) * baseSize}px`,
                                        top: `${y * baseSize}px`,
                                        width: `${baseSize * 500 * scale}px`,
                                        borderRadius: "0%", // 可选，加上更像扩散雾
                                        background: "rgba(0,0,0,0.01)", // 有背景才能产生阴影
                                        boxShadow: `0 0 ${baseSize * 60}px ${baseSize * 60}px rgba(23, 25, 33, 0.4)`,
                                        pointerEvents: "none",
                                        transition: "left 0.3s ease, top 0.3s ease, opacity 0.3s ease",
                                        zIndex: 0,
                                    }}
                                />
                            </div>

                        );
                    })}
                </div>

                {/*小图*/}
                <div className="relative w-full h-full">

                    {Array.from({length: totalSlots}).map((_, i) => {
                        const centerIndex = scrollT * (totalSlots - 1); // 当前视觉焦点的位置（非整数）
                        const relativeIndex = i - centerIndex; // 焦点图卡的 relativeIndex === 0，即抛物线顶点

                        const dynamicSpacing = baseSpacing * (1 + 0.8 * Math.exp(-Math.abs(relativeIndex))); // h = 1
                        const x0 = relativeIndex * dynamicSpacing;

                        // 抛物线函数，顶点在 relativeIndex === 0
                        const curveValue = a * (relativeIndex) ** 2;
                        const y0 = curveFactor * curveValue;

                        // scale，离中心越远越小
                        const normalizedDist = Math.min(1, Math.abs(relativeIndex - 1) / maxDistance);
                        const scale = 1 - 0.7 * normalizedDist; // 最大为1，最小为0.6（你可调）

                        // 坐标
                        const rawX = startX + x0;
                        const rawY = startY + y0;
                        const x = rawX * Math.cos(rad) + rawY * Math.sin(rad);
                        const y = -rawX * Math.sin(rad) + rawY * Math.cos(rad);

                        const cardIndex = i - paddingCount;
                        const isRealImage = cardIndex >= 0 && cardIndex < finalCards.length;
                        const card = isRealImage ? finalCards[cardIndex] : null;

                        const imageIndex = isRealImage
                            ? imageIndexes[card.卡名] ?? getImageIndex(card.卡名)
                            : null;

                        const imageSrc = isRealImage
                            ? card["图片信息"]?.[imageIndex]?.src || defaultWhiteImage
                            : defaultWhiteImage;

                        const imageAttr = isRealImage ? card["属性"] : null;
                        const imageCardName = isRealImage ? card["卡名"] : null;
                        const imageRarity = isRealImage ? card['稀有度'] : null;

                        return (
                            <div key={i}>
                                <img
                                    src={imageSrc}
                                    onClick={(e) => {
                                        if (isRealImage) scrollToIndex(cardIndex);
                                        e.stopPropagation();
                                    }}
                                    className="edge-blur-mask"
                                    style={{
                                        position: "absolute",
                                        left: `${x * baseSize}px`,
                                        top: `${y * baseSize}px`,
                                        width: `${baseSize * 80 * scale}px`,
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
                                            src={`images/60px-${imageAttr}.png`}
                                            className="absolute"
                                            style={{
                                                width: `${baseSize * 8 * scale}px`,
                                                left: `${(x + 1) * baseSize}px`,
                                                top: `${(y + 1) * baseSize}px`,
                                                zIndex: totalSlots - i,
                                                transition: "left 0.3s ease, top 0.3s ease, opacity 0.3s ease",
                                            }}
                                        />

                                        <label
                                            className="absolute"
                                            style={{
                                                fontSize: `${baseSize * 5 * scale}px`,
                                                color: 'white',
                                                textShadow: `0 0 ${baseSize}px gray, 0 0 ${baseSize * 2}px gray`,
                                                transition: "left 0.3s ease, top 0.3s ease, opacity 0.3s ease",
                                                zIndex: totalSlots - i,
                                                left: `${(x + 2) * baseSize}px`,
                                                top: `${y * baseSize + 340 / 9 * scale * baseSize}px`,
                                            }}
                                        >
                                            {imageCardName}
                                        </label>

                                        <img
                                            src={rarityMap[imageRarity]}
                                            className="absolute"
                                            style={{
                                                width: `${baseSize * 20 * scale}px`,
                                                left: `${x * baseSize + 540 / 9 * scale * baseSize}px`,
                                                top: `${y * baseSize}px`,
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