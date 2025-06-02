import React, {useEffect, useRef, useState} from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import {playClickSound} from "../utils/playClickSound.js";

const DetailedImage = ({ card, onClose }) => {

    const rarityMap = {
        世界: 'images/world.png',
        月: 'images/moon.png',
        辰星: 'images/star1.png',
        星: 'images/star2.png',
    };

    const attributes = ['思维', '魅力', '体魄', '感知', '灵巧'];

    // ======================================= 获取容器尺寸（16:9下）
    const [baseSize, setBaseSize] = useState(1);
    const divRef = useRef(null); // 获取当前绑定的容器的尺寸

    useEffect(() => {
        const updateSize = () => {
            if (divRef.current) {
                const width = divRef.current.clientWidth;
                const height = divRef.current.clientHeight;

                if (height > 0) {
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




    return (
        <div
            ref={divRef}
            className="absolute w-full h-full z-10"
            // className="flex justify-center items-center"
            onClick={() => {
                playClickSound();
                onClose();
            }}
            style={{backgroundColor: 'rgba(0, 0, 0, 0.8)',}}
        >

            <div className="absolute flex">

                <LazyLoadImage
                    src={card.图片信息[0].srcset}
                    placeholderSrc={card.图片信息[0].src}
                    effect="blur"
                    className="absolute object-contain edge-blur-mask"
                    style={{
                        top: `${baseSize * 40}px`,
                        left: `${baseSize * 80}px`,
                        width: `${baseSize * 140}px`
                    }}
                />
                {/* 角标图标：定位在主图右上角 */}
                <img
                    className="absolute"
                    src={rarityMap[card.稀有度]}
                    style={{
                        top: `${baseSize * 35}px`,
                        left: `${baseSize * 190}px`,
                        width: `${baseSize * 30}px`
                    }}
                />

                <LazyLoadImage
                    src={card.图片信息[1].srcset}
                    placeholderSrc={card.图片信息[1].src}
                    effect="blur"
                    className="absolute object-contain edge-blur-mask"
                    style={{
                        top: `${baseSize * 100}px`,
                        left: `${baseSize * 40}px`,
                        width: `${baseSize * 70}px`
                    }}
                />

                {/* 重逢图标：贴在卡面右上角 */}
                <img
                    src="images/重逢.png"
                    alt="重逢图标"
                    className="absolute"
                    style={{
                        top: `${baseSize * 93}px`,
                        left: `${baseSize * 90}px`,
                        width: `${baseSize * 20}px`
                    }}
                />

                <div
                    className="absolute overflow-hidden"
                    style={{
                        top: `${baseSize * 50}px`,
                        left: `${baseSize * 240}px`,
                        width: `${baseSize * 100}px`,
                        height: `${baseSize * 80}px`,
                    }}
                >
                    <label
                        style={{
                            color: 'lightgray',
                            fontWeight: 600,
                            fontSize: `${baseSize * 10}px`,
                    }}
                        className="absolute"
                    >
                        {card.主角}
                    </label>

                    <label
                        style={{
                            top: `${baseSize * 12}px`,
                            color: 'white',
                            fontWeight: 800,
                            fontSize: `${baseSize * 14}px`,
                        }}
                        className="absolute"
                    >
                        {card.卡名}
                    </label>

                    <div className="absolute flex flex-row" style={{top: `${baseSize * 40}px`}}>
                        {attributes.map(attr => (
                            <div
                                key={attr}
                                className="flex flex-col mr-[3vmin] items-center"
                            >
                                <img
                                    src={`images/60px-${attr}.png`}
                                    className="mb-[0.5vmin]"
                                    style={{width: `${baseSize * 12}px`}}
                                />

                                <label
                                    style={{
                                        color: card.属性 === attr ? 'gold' : 'white',
                                        fontWeight: 800,
                                        fontSize: `${baseSize * 8}px`,
                                    }}
                                >
                                    {card[attr]}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>


            </div>

        </div>
    );
};

export default DetailedImage;
