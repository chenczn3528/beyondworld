import { LazyLoadImage } from 'react-lazy-load-image-component';
import {useEffect, useState} from "react";
import FadeImage from "./FadeImage.jsx";

const CardFullImage = (
    {
        card,
        onClick,
        onSkip,
        setCurrentIndex,
        isShowCardResult = false,
        fontsize,
    }) => {

    const rarityMap = {
        世界: 'images/world.png',
        月: 'images/moon.png',
        辰星: 'images/star1.png',
        星: 'images/star2.png',
    };

    const isFiveStar = card.稀有度 === '世界';

    const [showSecondImage, setShowSecondImage] = useState(false);
    const [isClickable, setIsClickable] = useState(false);

    useEffect(() => {
        setShowSecondImage(false);
        setIsClickable(false);

        if (isFiveStar) {
            // 第一个阶段：显示第一张图 3 秒
            const timer1 = setTimeout(() => {
                setShowSecondImage(true);
                // 第二阶段：再等 3 秒才能点击
                const timer2 = setTimeout(() => {
                    setIsClickable(true);
                }, 3000);
                return () => clearTimeout(timer2);
            }, 3000);

            return () => clearTimeout(timer1);
        } else {
            // 非五星卡立即可点击
            setIsClickable(true);
        }
    }, [card]);


    return (
        <div className="relative w-full h-full flex z-100" key={`${card.卡名}`}>
            <div style={{zIndex: 5}} onClick={() => {if(!isFiveStar && isClickable) onClick();}}>
                <FadeImage
                    cardSrc={card?.图片信息?.[0]?.src}
                    cardSrcset={card?.图片信息?.[0]?.srcset2}
                />
            </div>
            {isFiveStar && (
                <div
                    onClick={() => {if (isClickable) onClick();}}
                    style={{zIndex: showSecondImage ? 10 : 0}}>
                    <FadeImage
                        cardSrc={card?.图片信息?.[1]?.src}
                        cardSrcset={card?.图片信息?.[1]?.srcset2}
                    />
                </div>
            )}

            <img
                className="absolute z-25"
                src={rarityMap[card.稀有度]}
                style={{
                    height: `${fontsize * 5}px`,
                    left: `${fontsize * 4}px`,
                    top: `${fontsize * 2}px`,
                }}
            />

            <label
                className="absolute z-25"
                style={{
                    color: 'white',
                    fontSize: `${fontsize * 1.5}px`,
                    fontWeight: 600,
                    left: `${fontsize * 5.5}px`,
                    bottom: `${fontsize * 7.5}px`,
                    textShadow: '0 0 2px gray, 0 0 4px gray',
                }}
            >
                {card.主角}
            </label>

            <div
                className="absolute flex items-center z-25"
                style={{
                    left: `${fontsize * 7.5}px`,
                    bottom: `${fontsize * 4.5}px`,
                }}
            >
                <label
                    style={{
                        color: 'white',
                        fontSize: `${fontsize * 2.3}px`,
                        fontWeight: 800,
                        marginRight: '1px',
                        textShadow: '0 0 2px gray, 0 0 4px gray',
                    }}
                >
                    {card.卡名}
                </label>
                <img
                    src={`images/60px-${card.属性}.png`}
                    alt="图标"
                    style={{
                        height: `${fontsize * 3}px`,
                        width: 'auto',
                    }}
                />
            </div>

            {!(isShowCardResult || isFiveStar) && (
                <button
                    className="absolute z-25"
                    style={{
                        backgroundColor: 'rgba(255,255,255,0.3)',
                        right: `${fontsize * 3}px`,
                        top: `${fontsize * 2}px`,
                        color: 'white',
                        fontSize: `${fontsize}px`,
                        textShadow: '0 0 2px black, 0 0 4px black',
                    }}
                    onClick={() => {
                        setCurrentIndex(0);
                        onSkip();
                    }}
                >
                    跳过
                </button>
            )}
        </div>
    );
};

export default CardFullImage;
