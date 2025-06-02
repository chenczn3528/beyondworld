import React, { useState, useEffect, useRef } from "react";
import LeftIcon from "../icons/LeftIcon.jsx";
import useCardImageIndex from "../hooks/useCardImageIndex.js";

const GalleryPage = ({
    cards,
    showGallery,
    setShowGallery,
    showGalleryFullImage,
    setShowGalleryFullImage,
    sortedCards,
    setSortedCards,
    galleryCard,
    setGalleryCard,
}) => {

    // =======================图鉴排序
    // 稀有度排序映射
    const rarityOrder = {'世界': 4, '月': 3, '辰星': 2, '星': 1};
    const roleOrder = {'顾时夜':4, '易遇':3, '柏源':2, '夏萧因':1};

    // 排序函数
    const sortCards = (cards) => {
        return [...cards].sort((a, b) => {
            // 1. 稀有度（降序）
            const rarityDiff = (rarityOrder[b.稀有度] || 0) - (rarityOrder[a.稀有度] || 0);
            if (rarityDiff !== 0) return rarityDiff;

            // 2. 角色名（升序）
            const roleDiff = (roleOrder[b.主角] || 0) - (roleOrder[a.主角] || 0);
            if (roleDiff !== 0) return roleDiff;

            // 3. 限定池优先（限定 < 常驻）
            const poolDiff = (a.板块 === '限定' ? -1 : 1) - (b.板块 === '限定' ? -1 : 1);
            if (poolDiff !== 0) return poolDiff;

            // 4. 卡片名（升序）
            return (a.卡名 || "").localeCompare(b.卡名 || "");
        });
    };

    useEffect(() => {
        const sorted = sortCards(cards || []);
        setSortedCards(sorted);
    }, [cards]);







    const [scrollT, setScrollT] = useState(0);
    const timeoutRef = useRef(null);

    const paddingCount = 5; // 前后各留5张空白卡片
    const targetIndex = 1; // 希望第几张显示在视觉焦点位（第三张）

    const totalSlots = 300;


    const clippedT = Math.max(0, Math.min(1, scrollT));
    const rawIndex = Math.round(clippedT * (totalSlots - 1)) - paddingCount;
    const currentCardIndex = rawIndex + 1; // ✅ 不再 +1

    // 滑动定位
    const SCROLL_T_MIN = -0.1;
    const SCROLL_T_MAX = 1.1;



     // ======================================= 滚动相关
    const scrollToIndex = (index) => {
        const clampedIndex = Math.max(0, Math.min(sortedCards.length - 1, index)); // 防越界
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
        const realLength = sortedCards.length;
        if (currentCardIndex < 0) {
            setTimeout(() => scrollToIndex(0), 150);
        } else if (currentCardIndex >= realLength) {
            setTimeout(() => scrollToIndex(realLength - 1), 150);
        } else {
            setGalleryCard(sortedCards[currentCardIndex]);
        }
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
        }, 2000);
    };


    useEffect(() => {
        scrollToIndex(0); // ✅ 初始加载时将第0号卡片放到参考位置（第3张）
    }, [showGallery]);


    // ==================== 设置点击进入大图的初始化
    useEffect(() => {
        setGalleryCard(sortedCards[currentCardIndex] ? sortedCards[currentCardIndex] : sortedCards[0]);
    }, [scrollT]);

    useEffect(() => {
        if (sortedCards.length > 0 && !galleryCard) {
            setGalleryCard(sortedCards[0]);
        }
    }, [sortedCards, galleryCard]);





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
        }, 2000);
    };


     // ======================================= 获取当前展示的卡
    const getDisplayCardIndex = () => {
        if (currentCardIndex < 0) return 0;
        if (currentCardIndex >= sortedCards.length) return sortedCards.length - 1;
        return currentCardIndex;
    };

    const displayCard = sortedCards[getDisplayCardIndex()];



    // ======================================= 预加载小图，等大图加载完以后跳出来
    // ======================================= 从大图详情退回小图的时候重新加载图片
    const { getImageIndex, indexMap } = useCardImageIndex();

    const [imageIndexes, setImageIndexes] = useState({});
    const [loaded, setLoaded] = useState(false);

    // ✅ 每当 sortedCards 或 indexMap 改变，重新同步 imageIndexes
    useEffect(() => {
        const init = {};
        sortedCards.forEach(card => {
            init[card.卡名] = indexMap[card.卡名] ?? 0;
        });
        setImageIndexes(init);
    }, [sortedCards, indexMap]);

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

    // ✅ 图片加载逻辑
    useEffect(() => {
        const newTargetImage = getImageUrl(displayCard, imageIndex, 0);
        if (!newTargetImage) return;

        const img = new Image();
        img.src = newTargetImage;
        img.onload = () => {
            setLoaded(true);
        };
        return () => {
            img.onload = null;
        };
    }, [displayCard, imageIndex]);

    const getImageUrl = (card, index, hd = 0) => {
        const info = card?.图片信息?.[index];
        if (!info) return '';
        return hd === 0 ? info.srcset2 : hd === 1 ? info.src || info.srcset2 : info.src;
    };



    // ======================================= 获取容器尺寸（16:9下）
    const [baseSize, setBaseSize] = useState(1);
    const divRef = useRef(null); // 获取当前绑定的容器的尺寸

    useEffect(() => {
        const updateSize = () => {
            if (divRef.current) {
                const width = divRef.current.clientWidth;
                const height = divRef.current.clientHeight;

                if (height > 0) {
                    // const newBaseSize = Math.min(height, width) / 375;
                    const newBaseSize = width / 375;
                    setBaseSize(newBaseSize);
                    return true;
                }
            }
            return false;
        };

        // 初始化时轮询直到能获取有效高度
        const tryInitSize = () => {
            const success = updateSize();
            if (!success) {
                // 如果失败，延迟一帧继续尝试
                requestAnimationFrame(tryInitSize);
            }
        };
        tryInitSize(); // 启动初始化
        window.addEventListener('resize', updateSize); // 响应窗口变化

        return () => {window.removeEventListener('resize', updateSize);};
    }, []);

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


    return (
        showGallery && (
            <div
                ref={divRef}
                className="relative w-full h-full z-20 border"
                id="gallery-scroll-container"
                // onWheel={() => console.log('✅ wheel works')}
                onWheel={handleWheel}
                onTouchMove={handleTouchMove}
                onTouchStart={handleTouchStart}
                style={{
                    background: "white",
                    overflow: "hidden",
                }}
                onClick={() => {setShowGalleryFullImage(!showGalleryFullImage);}}
            >

                {/*返回按钮*/}
                <button className="absolute z-[500] w-auto flex items-center justify-center"
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowGallery(false);
                        }}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            padding: 10,
                            top: `${baseSize * 6}px`,
                            left: `${baseSize * 6}px`,
                        }}
                >
                    <LeftIcon size={baseSize * 16} color="white"/>
                </button>

                {/*大图*/}
                <div key={`${displayCard?.卡名}-${imageIndex}`} className="absolute w-full h-full">
                    {/* 模糊背景 */}
                    <div
                        className="absolute w-full h-full transition-opacity duration-300"
                        style={{
                            backgroundImage: `url(${getImageUrl(displayCard, imageIndex, 1)})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            filter: "blur(20px)",
                            opacity: loaded ? 0 : 1,
                        }}
                    />
                    {/* 高清背景 */}
                    {loaded && (
                        <div
                            className="absolute w-full h-full animate-fadeZoomIn"
                            style={{
                                backgroundImage: `url(${getImageUrl(displayCard, imageIndex, 0)})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                            }}
                        />
                    )}

                    {/*大图标注*/}
                    <div className="absolute flex flex-row items-center z-10"
                         style={{top: `${baseSize * 6}px`, right: `${baseSize * 6}px`}}>
                        <div className="flex flex-row">
                            <div
                                className="flex flex-col items-end justify-end"
                                style={{color: "white", textShadow: '0 0 2px gray, 0 0 4px gray', fontWeight: 800}}
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
                                        boxShadow: "0 0 100px 100px rgba(23, 25, 33, 0.4)",
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
                <div className="relative w-full h-full" >

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
                        const isRealImage = cardIndex >= 0 && cardIndex < sortedCards.length;
                        const card = isRealImage ? sortedCards[cardIndex] : null;

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
                                                textShadow: '0 0 1px gray, 0 0 2px gray',
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