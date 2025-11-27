import React, { useState, useEffect, useRef } from "react";
import LeftIcon from "../icons/LeftIcon.jsx";
import useCardImageIndex from "../hooks/useCardImageIndex.js";
import FadeImage from "./FadeImage.jsx";
import FilterIcon from "../icons/FilterIcon.jsx";
import {playClickSound} from "../utils/playClickSound.js";
import FilterRoleCard from "./FilterRoleCard.jsx";
import GalleryTypeSelectPage from "./GalleryTypeSelectPage.jsx";
import {sortCards} from "../utils/cardSort.js";
import LockIcon from "../icons/LockIcon.jsx";
import { Asset } from './Asset.jsx';

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
        
        // 优先使用sortedCards，如果为空则使用cards
        const sourceCards = (sortedCards && sortedCards.length > 0) ? sortedCards : cards;
        
        // 应用角色筛选
        const filtered = sourceCards.filter(
            card => roleMap[selectedRole] === "全部" || card.主角 === roleMap[selectedRole]
        );
        
        // 应用排序
        setFinalCards(sortCards(filtered, orderChoice));
    }, [selectedRole, sortedCards, orderChoice, cards]);

    const [position, setPosition] = useState(0);
    const positionRef = useRef(0);
    positionRef.current = position;
    const targetPositionRef = useRef(0);
    const animationRef = useRef(null);
    const snapTimeoutRef = useRef(null);

    const maxIndex = Math.max(finalCards.length - 1, 0);
    const clampPosition = (value) => {
        if (!Number.isFinite(value)) return 0;
        return Math.max(0, Math.min(maxIndex, value));
    };

    const animatePosition = () => {
        const current = positionRef.current;
        const target = targetPositionRef.current;
        const diff = target - current;

        if (Math.abs(diff) < 0.001) {
            positionRef.current = target;
            setPosition(target);
            animationRef.current = null;
            return;
        }

        const next = current + diff * 0.15;
        positionRef.current = next;
        setPosition(next);
        animationRef.current = requestAnimationFrame(animatePosition);
    };

    const setPositionWithInertia = (value, immediate = false) => {
        const clamped = clampPosition(value);
        targetPositionRef.current = clamped;

        if (immediate) {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
                animationRef.current = null;
            }
            positionRef.current = clamped;
            setPosition(clamped);
            return;
        }

        if (!animationRef.current) {
            animationRef.current = requestAnimationFrame(animatePosition);
        }
    };

    const snapToNearest = () => {
        const nearest = Math.round(targetPositionRef.current);
        setPositionWithInertia(nearest);
    };

    const scheduleSnap = () => {
        if (snapTimeoutRef.current) clearTimeout(snapTimeoutRef.current);
        snapTimeoutRef.current = setTimeout(() => {
            snapToNearest();
        }, 250);
    };

    useEffect(() => {
        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            if (snapTimeoutRef.current) clearTimeout(snapTimeoutRef.current);
        };
    }, []);

    const scrollToIndex = (index, smooth = false) => {
        const clampedIndex = clampPosition(index);
        setPositionWithInertia(clampedIndex, !smooth);
    };

    useEffect(() => {
        targetPositionRef.current = clampPosition(targetPositionRef.current);
        positionRef.current = targetPositionRef.current;
        setPosition(targetPositionRef.current);
    }, [finalCards.length]);

    const handleWheel = (e) => {
        const delta = (e.deltaY / 200) * (window.innerWidth <= 600 ? 0.8 : 1);
        const base = targetPositionRef.current;
        const newPos = clampPosition(base + delta);
        setPositionWithInertia(newPos);
        scheduleSnap();
    };

    useEffect(() => {
        if (showGallery) {
            scrollToIndex(0, true);
        }
    }, [showGallery]);

    const touchStartRef = useRef(null);
    const handleTouchStart = (e) => {
        const isVertical = window.innerWidth <= 600;
        const startPos = isVertical ? e.touches[0].clientY : e.touches[0].clientX;

        touchStartRef.current = startPos;
    };

    const touchVelocityRef = useRef(0);
    const handleTouchMove = (e) => {
        if (!touchStartRef.current) return;

        const isVertical = window.innerWidth <= 600;
        const currentPos = isVertical ? e.touches[0].clientY : e.touches[0].clientX;
        const delta = touchStartRef.current - currentPos;
        // Increase swipe sensitivity so sliding across the screen moves more thumbnails
        const step = (isVertical ? delta / 120 : delta / 220);

        const newPos = clampPosition(targetPositionRef.current + step);
        setPositionWithInertia(newPos);

        touchVelocityRef.current = step;
        touchStartRef.current = currentPos;
    };

    const handleTouchEnd = () => {
        const momentum = touchVelocityRef.current * 8;
        if (momentum) {
            setPositionWithInertia(targetPositionRef.current + momentum);
            touchVelocityRef.current = 0;
        }
        scheduleSnap();
        touchStartRef.current = null;
    };

    const divRef = useRef(null); // 获取当前绑定的容器的尺寸
    useEffect(() => {
        if (!showGallery) return;
        const container = divRef.current;
        if (!container) return;

        const wheelHandler = (e) => {
            e.preventDefault();
            handleWheel(e);
        };

        container.addEventListener('touchstart', handleTouchStart, { passive: true });
        container.addEventListener('touchmove', handleTouchMove, { passive: false });
        container.addEventListener('touchend', handleTouchEnd, { passive: true });
        container.addEventListener('wheel', wheelHandler, { passive: false });

        return () => {
            container.removeEventListener('touchstart', handleTouchStart);
            container.removeEventListener('touchmove', handleTouchMove);
            container.removeEventListener('touchend', handleTouchEnd);
            container.removeEventListener('wheel', wheelHandler);
        };
    }, [showGallery]);

    // ======================================= 获取当前展示的卡
    const currentCardIndex = finalCards.length
        ? Math.max(0, Math.min(finalCards.length - 1, Math.round(position)))
        : 0;
    const displayCard = finalCards[currentCardIndex];

    useEffect(() => {
        if (finalCards.length > 0) {
            const targetCard = finalCards[currentCardIndex] || finalCards[0];
            setGalleryCard(targetCard);
        }
    }, [position, orderChoice, selectedRole, finalCards, currentCardIndex]);

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
    const isMomentCard = displayCard?.稀有度 === '瞬';
    const isMomentRotated = isMomentCard && imageIndex > 0;

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
    const wheelSpacing = baseSize * 30;
    const visibleRange = 8;
    const arcRotationRad = (-25 * Math.PI) / 180;

    const rarityMap = {
        刹那: 'instant.png',
        世界: 'world.png',
        瞬: 'moment.png',
        月: 'moon.png',
        辰星: 'star1.png',
        星: 'star2.png',
    };

    const [showOrderChoiceView, setShowOrderChoiceView] = useState(false);
    const orderSelectPanelPosition = [
        { bottom: `${baseSize * 36}px`, left: `${baseSize * 70}px` },
        { bottom: `${baseSize * 36}px`, left: `${baseSize * 112}px` },
    ];

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
                    if(displayCard && displayCard.owned !== false) {
                        setShowGalleryFullImage(!showGalleryFullImage);
                    }
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
                        position={orderSelectPanelPosition}
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
                            textShadow: `0 0 ${baseSize}px black, 0 0 ${baseSize * 2}px black`,
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
                            textShadow: `0 0 ${baseSize}px black, 0 0 ${baseSize * 2}px black`,
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
                                isRotated={isMomentRotated}
                                baseSize={baseSize}
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
                                            <Asset
                                                src={`60px-${displayCard?.属性}.png`}
                                                type="image"
                                                className="h-auto"
                                                style={{width: `${baseSize * 10}px`, height: `${baseSize * 10}px`}}
                                            />
                                            <label
                                                style={{fontSize: `${baseSize * 8}px`}}>{displayCard?.卡名}</label>
                                        </div>

                                    </div>
                                </div>
                                <Asset
                                    src={rarityMap[displayCard?.稀有度]}
                                    type="image"
                                    style={{height: `${baseSize * 28}px`}}
                                />
                            </div>
                        </div>
                    )}

                </div>

                {/*滚轮小图*/}
                <div className="absolute inset-0 pointer-events-none">
                    {finalCards.map((card, index) => {
                        const offset = index - position;
                        if (Math.abs(offset) > visibleRange) return null;

                        const scale = Math.max(0.7, 1 - Math.abs(offset) * 0.08);
                        const opacity = Math.max(0.55, 1 - Math.abs(offset) * 0.04);
                        const rotateZ = -offset * 2;
                        const isActive = Math.round(position) === index;
                        const depth = Math.max(0, visibleRange - Math.abs(offset));
                        const zIndex = Math.round(depth * 10);
                        const borderWidth = baseSize * 0.8;
                        const borderColor = 'rgba(255,255,255,0.9)';
                        const thumbShadow = isActive
                            ? `0 0 ${baseSize * 4}px rgba(255,255,255,0.35)`
                            : `0 0 ${baseSize * 2}px rgba(0,0,0,0.35)`;

                        const thumbIndex = card['稀有度'] === '瞬'
                            ? 0
                            : imageIndexes[card.卡名] ?? getImageIndex(card.卡名);
                        const thumbSrc = card["图片信息"]?.[thumbIndex]?.src || defaultWhiteImage;


                        // 计算 t，决定卡片在曲线上的位置
                        const anchorT = 0.18;
                        const spread = 0.1;
                        let t = anchorT + offset * spread;
                        t = Math.max(0, Math.min(1, t));  // clamp

                        // ===== 往下凸的单段曲线（正确方向） =====
                        const P0 = { x: baseSize * 40,  y: baseSize * 40 };  // 左上
                        const P1 = { x: baseSize * 100, y: baseSize * 240 };  // ⭐ 中段最低
                        const P2 = { x: baseSize * 380, y: baseSize * 180 };  // 右下

                        const u = t;

                        // 二阶贝塞尔
                        let curveX =
                        (1 - u) * (1 - u) * P0.x +
                        2 * (1 - u) * u * P1.x +
                        u * u * P2.x;

                        let curveY =
                        (1 - u) * (1 - u) * P0.y +
                        2 * (1 - u) * u * P1.y +
                        u * u * P2.y;

                        // 抖动效果
                        const xo = Math.sign(offset) * Math.log2(1 + Math.abs(offset)) * baseSize * 0.7;
                        const yo = Math.sin(offset * 0.3) * baseSize * 0.7;

                        // 最终位置
                        const finalX = curveX + xo;
                        const finalY = curveY + yo;
                        


                        return (
                            <button
                                key={`${card.卡名}-${index}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    scrollToIndex(index, true);
                                }}
                                className="edge-blur-mask"
                                style={{
                                    pointerEvents: 'auto',
                                    position: 'absolute',
                                    left: `${finalX}px`,
                                    top: `${finalY}px`,
                                    zIndex,
                                    transformOrigin: 'center',
                                    transform: `translate(-50%, -50%) scale(${scale}) rotate(${rotateZ}deg)`,
                                    opacity,
                                    transition: 'opacity 0.2s linear',
                                    border: `${borderWidth}px solid ${borderColor}`,
                                    borderRadius: `${baseSize * 2}px`,
                                    overflow: 'hidden',
                                    background: 'transparent',
                                    lineHeight: 0,
                                    padding: 0,
                                    boxShadow: thumbShadow,
                                }}
                            >
                                <img
                                    src={thumbSrc}
                                    alt={card.卡名}
                                    style={{
                                        width: `${baseSize * 70}px`,
                                        height: `${baseSize * 70 * 9 / 16}px`,
                                        objectFit: 'cover',
                                        display: 'block',
                                        filter: card.owned === false ? 'grayscale(100%)' : 'none',
                                    }}
                                />
                                {card.owned === false && (
                                    <div
                                        className="absolute inset-0 flex items-center justify-center"
                                        style={{backgroundColor: '#00000080'}}
                                    >
                                        <LockIcon color="white" size={baseSize * 8}/>
                                    </div>
                                )}
                                <div
                                    className="absolute flex items-center"
                                    style={{
                                        bottom: `${baseSize * 2}px`,
                                        left: `${baseSize * 2}px`,
                                        gap: `${baseSize}px`,
                                    }}
                                >
                                    <Asset
                                        src={`60px-${card.属性}.png`}
                                        type="image"
                                        style={{width: `${baseSize * 8}px`, pointerEvents: 'none'}}
                                    />
                                    <label
                                        style={{
                                            fontSize: `${baseSize * 6}px`,
                                            color: 'white',
                                            textShadow: '0 0 2px black, 0 0 4px black',
                                            pointerEvents: 'none',
                                        }}
                                    >
                                        {card.卡名}
                                    </label>
                                </div>
                                <Asset
                                    src={rarityMap[card.稀有度]}
                                    type="image"
                                    style={{
                                        position: 'absolute',
                                        right: `${baseSize * 2}px`,
                                        top: `${baseSize * 2}px`,
                                        width: `${baseSize * 18}px`,
                                        pointerEvents: 'none',
                                    }}
                                />
                            </button>
                        );
                    })}
                </div>

            </div>
        )
    );
};

export default GalleryPage;
