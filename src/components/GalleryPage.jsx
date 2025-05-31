import React, { useState, useEffect, useRef } from "react";
import LeftIcon from "../icons/LeftIcon.jsx";
import useCardImageIndex from "../hooks/useCardImageIndex.js";

const GalleryPage = ({
    cards,
    showGallery,
    setShowGallery,
    showGalleryFullImage,
    setShowGalleryFullImage,
    // galleryCard,
    setGalleryCard,
}) => {
    const { getImageIndex } = useCardImageIndex();

    const [scrollT, setScrollT] = useState(0);
    const timeoutRef = useRef(null);

    const paddingCount = 5; // 前后各留5张空白卡片
    const targetIndex = 1; // 希望第几张显示在视觉焦点位（第三张）
    // const totalSlots = cards.length + paddingCount * 2;



    const totalSlots = 300;






    const clippedT = Math.max(0, Math.min(1, scrollT));
    const rawIndex = Math.round(clippedT * (totalSlots - 1)) - paddingCount;
    const currentCardIndex = rawIndex + 1; // ✅ 不再 +1


    // 滑动定位
    const SCROLL_T_MIN = -10;//-0.1;
    const SCROLL_T_MAX = 10;//1.1;



     // ======================================= 滚动相关
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


     // ======================================= 获取当前展示的卡
    const getDisplayCardIndex = () => {
        if (currentCardIndex < 0) return 0;
        if (currentCardIndex >= cards.length) return cards.length - 1;
        return currentCardIndex;
    };

    const displayCard = cards[getDisplayCardIndex()];



    // ======================================= 预加载小图，等大图加载完以后跳出来
    // ======================================= 从大图详情退回小图的时候重新加载图片
    const [imageIndex, setImageIndex] = useState(getImageIndex(displayCard?.卡名));

    const [imageIndexes, setImageIndexes] = useState(() => {
        // 初始化所有小图的 index
        const init = {};
        cards.forEach(card => {
            init[card.卡名] = getImageIndex(card.卡名);
        });
        return init;
    });

    useEffect(() => {
        const handler = (e) => {
            const { cardName, newIndex } = e.detail;
            setImageIndexes(prev => ({
                ...prev,
                [cardName]: newIndex, // 仅更新对应那张卡的索引
            }));
        };
        window.addEventListener('custom:imageIndexChanged', handler);
        return () => window.removeEventListener('custom:imageIndexChanged', handler);
    }, []);

    // 大图通信
    useEffect(() => {
        const handler = (e) => {
            const { cardName, newIndex } = e.detail;
            if (cardName === displayCard?.卡名) {
                setImageIndex(newIndex); // ✅ 正确设置新索引
                setLoaded(false);        // ✅ 触发重新加载
            }
        };
        window.addEventListener('custom:imageIndexChanged', handler);
        return () => window.removeEventListener('custom:imageIndexChanged', handler);
    }, [displayCard?.卡名]); // ✅ 用卡名作为依赖


    useEffect(() => {
        setImageIndex(getImageIndex(displayCard?.卡名));
    }, [displayCard]);

    // 0：高清大图，1：模糊加载用的，高清大图或小图，2：小图
    const getImageUrl = (card, index, hd = 0) => {
        const info = card?.图片信息?.[index];
        if (!info) return "";
        return hd === 0 ? info.srcset2 :
            hd === 1 ? info.src || info.srcset2 : info.src;
    };

    // 先加载小图，再让大图渐入
    const [loaded, setLoaded] = useState(false);
    useEffect(() => {
        const newTargetImage = getImageUrl(displayCard, imageIndex, 0);
        if (!newTargetImage) return;

        const img = new Image();
        img.src = newTargetImage;
        img.onload = () => {
            setLoaded(true);
        };
        // 清理副作用（可选）
        return () => {
            img.onload = null;
        };
    }, [displayCard, showGalleryFullImage, imageIndex]);






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
                    console.log(`width: ${width}, height: ${height}, baseSize: ${newBaseSize}`);
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


    return (
        showGallery && (
            <div
                ref={divRef}
                className="relative w-full h-full z-20 border"
                id="gallery-scroll-container"
                onTouchStart={handleTouchStart}
                style={{
                    background: "white",
                    overflow: "hidden",
                }}
                onClick={() => {setShowGalleryFullImage(!showGalleryFullImage);}}
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
                            top: `${baseSize * 6}px`,
                            left: `${baseSize * 6}px`,
                        }}
                >
                    <LeftIcon size={baseSize * 16} color="white"/>
                </button>


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
                </div>




                {/*小图*/}
                <div className="relative w-full h-full" >

                    {Array.from({length: totalSlots}).map((_, i) => {



                        // const spacing = 30; // 固定间距（单位像素，可调整）
                        // const startX = -35;
                        // const startY = 180;
                        //
                        // const curveFactor = 100;
                        // const a = -4;
                        // const h = 0.7;
                        //
                        // const relativeIndex = i - scrollT * cards.length;
                        // const x0 = relativeIndex * spacing;
                        //
                        // // 用固定 x 计算归一化比例（用于控制缩放等）
                        // const maxX = 3 * spacing; // 你可以调整可视范围影响的最大 x
                        // const normalizedX = Math.min(1, Math.max(0, x0 / maxX));
                        //
                        // // ✅ 二次函数：模拟 y 方向偏移（没有旋转）
                        // const t = relativeIndex / (cards.length - 1); // 控制二次函数的输入范围
                        // const curveValue = a * (t - h) ** 2;
                        // const y0 = curveFactor * curveValue;
                        //
                        // // ✅ x 越大，图片越小
                        // const minScale = 0.6;
                        // const maxScale = 1.0;
                        // const scale = maxScale - (maxScale - minScale) * normalizedX;
                        //
                        // // ✅ x 越小，竖直方向间距越大
                        // const spacingStretch = -120;
                        // const extraSpacing = (1 - normalizedX) * spacingStretch;
                        //
                        // const x = startX + x0;
                        // const y = startY + y0 + extraSpacing;
                        //
                        //
                        const defaultWhiteImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAGUlEQVR42mNgGAWjgP///xkYGBgAADEMAQEGAP8GC04EtW8gAAAAAElFTkSuQmCC";
                        //
                        // const cardIndex = i - paddingCount;
                        // const isRealImage = cardIndex >= 0 && cardIndex < cards.length;
                        //
                        // const card = cards[cardIndex];
                        // const cardName = card?.卡名;
                        // const imageIndex = isRealImage
                        //     ? imageIndexes[cardName] ?? getImageIndex(cardName)
                        //     : null;
                        //
                        // const imageSrc = isRealImage
                        //     ? card["图片信息"]?.[imageIndex]?.src || defaultWhiteImage
                        //     : defaultWhiteImage;



                        const spacing = 50;
                        const startX = 0;
                        const startY = 60;
                        const curveFactor = 80;
                        const a = -0.08;
                        const h = 0.51;

                        const relativeIndex = i - scrollT * (totalSlots - 1);
                        const x0 = relativeIndex * spacing;
                        const t = relativeIndex / (totalSlots - 1);
                        const curveValue = a * (t - h) ** 2;
                        const y0 = curveFactor * curveValue;

                        const maxX = 8 * spacing;
                        const normalizedX = Math.min(1, Math.max(0, x0 / maxX));
                        const scale = 1 - 0.5 * normalizedX;
                        const extraSpacing = (1 - normalizedX) * 80;

                        const x = startX + x0;
                        const y = startY + y0 + extraSpacing;





                        const cardIndex = i - paddingCount;
                        const isRealImage = cardIndex >= 0 && cardIndex < cards.length;
                        const card = isRealImage ? cards[cardIndex] : null;

                        const imageIndex = isRealImage
                            ? imageIndexes[card.卡名] ?? getImageIndex(card.卡名)
                            : null;

                        const imageSrc = isRealImage
                            ? card["图片信息"]?.[imageIndex]?.src || defaultWhiteImage
                            : defaultWhiteImage;


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
                                        width: `${baseSize * 100 * scale}px`,
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