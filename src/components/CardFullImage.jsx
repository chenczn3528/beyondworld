import React from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';

const CardFullImage = ({ card, onClick, setIsSkipped, isSecondImage = false }) => {

    const rarityMap = {
      世界: 'images/world.png',
      月: 'images/moon.png',
      辰星: 'images/star1.png',
      星: 'images/star2.png',
    };

    const isFiveStar = card.稀有度 === '世界';

    return (
        <div
            style={{backgroundColor: 'black'}}
            className="fixed z-10 w-full h-full flex justify-center items-center"
        >
            <LazyLoadImage
                src={isSecondImage ? card.图片信息[1].srcset2 : card.图片信息[0].srcset2}
                placeholderSrc={isSecondImage ? card.图片信息[1].src : card.图片信息[0].src}
                effect="blur"
                alt="Full View"
                className="h-full w-auto object-contain rounded-lg shadow-2xl"
                onClick={onClick}
            />

            <img
                className="absolute"
                src={rarityMap[card.稀有度]}
                style={{
                    height: '12vmin',
                    width: 'auto',
                    left: '18vmin',
                    top: '4vmin',
                }}
            />

            <label
                className="absolute"
                style={{
                    color: 'white',
                    fontSize: '3.5vmin',
                    fontWeight: 800,
                    left: '20vmin',
                    bottom: '20vmin',
                    textShadow: '0 0 2px gray, 0 0 4px gray',
                }}
            >
                {card.主角}
            </label>

            <div
                className="absolute flex items-center"
                style={{
                    left: '21vmin',
                    bottom: '12vmin',
                }}
            >
                <label
                    style={{
                        color: 'white',
                        fontSize: '5vmin',
                        fontWeight: 800,
                        marginRight: '1vmin', // 文字和图片之间留点间距
                        textShadow: '0 0 2px gray, 0 0 4px gray',
                    }}
                >
                    {card.卡名}
                </label>
                <img
                    src={`images/60px-${card.属性}.png`}
                    alt="图标"
                    style={{
                        height: '5vmin',
                        width: 'auto',
                    }}
                />
            </div>


            {!isFiveStar && (
                <button
                    className="absolute"
                    style={{
                        backgroundColor: 'rgba(255,255,255,0.3)',
                        right: '14vmin',
                        top: '3vmin',
                        color: 'white',
                        fontSize: '2vmin',
                    }}
                    onClick={() => {
                        setIsSkipped(true);
                    }}
                >
                    跳过
                </button>
            )}


        </div>

    );
};

export default CardFullImage;
