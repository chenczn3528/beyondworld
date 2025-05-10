import React from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';

const CardFullImage = ({ card, onClick, setIsSkipped, isSecondImage = false, }) => {

    console.log("full image:",card);

    const rarityMap = {
      世界: 'images/world.png',
      月: 'images/moon.png',
      辰星: 'images/star1.png',
      星: 'images/star2.png',
    };

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                backgroundColor: 'black',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
            }}
        >
            <LazyLoadImage
                src={isSecondImage ? card.图片信息[1].srcset2 : card.图片信息[0].srcset2}
                placeholderSrc={isSecondImage ? card.图片信息[1].src : card.图片信息[0].src}
                effect="blur"
                alt="Full View"
                className="h-screen object-contain rounded-lg shadow-2xl"
                onClick={onClick}
            />


            <img
                className="absolute"
                src={rarityMap[card.稀有度]}
                style={{
                    height: '8vw',
                    width: 'auto',
                    left: '10vw',
                    top: '8vh',
                }}
            />

            <label
                className="absolute"
                style={{
                    color: 'white',
                    fontSize: '2vw',
                    fontWeight: 800,
                    left: '10vw',
                    bottom: '23vh',
                    textShadow: '0 0 2px gray, 0 0 4px gray',
                }}
            >
                {card.主角}
            </label>

            <div
                className="absolute flex items-center"
                style={{
                    left: '11vw',
                    bottom: '15vh',
                }}
            >
                <label
                    style={{
                        color: 'white',
                        fontSize: '3vw',
                        fontWeight: 800,
                        marginRight: '0.5vw', // 文字和图片之间留点间距
                        textShadow: '0 0 2px gray, 0 0 4px gray',
                    }}
                >
                    {card.卡名}
                </label>
                <img
                    src={`images/60px-${card.属性}.png`}
                    alt="图标"
                    style={{
                        height: '3vw',
                        width: 'auto',
                    }}
                />
            </div>


            <button
                className="absolute"
                style={{
                    backgroundColor: 'rgba(255,255,255,0.3)',
                    right: '10vw',
                    top: '6vh',
                    color: 'white',
                    fontSize: '1vw',
                    height: '3vw',
                }}
                onClick={()=>{
                    setIsSkipped(true);
                    console.log("跳过")
                }}
            >
                跳过
            </button>


        </div>

    );
};

export default CardFullImage;
