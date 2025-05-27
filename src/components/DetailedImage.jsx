import React from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import {playClickSound} from "../utils/playClickSound.js";

const DetailedImage = ({ card, onClose, fontsize }) => {

    const rarityMap = {
        世界: 'images/world.png',
        月: 'images/moon.png',
        辰星: 'images/star1.png',
        星: 'images/star2.png',
    };

    const attributes = ['思维', '魅力', '体魄', '感知', '灵巧'];

    return (
        <div
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
                        top: `${fontsize * 8}px`,
                        left: `${fontsize * 12}px`,
                        width: `${fontsize * 28}px`
                    }}
                />
                {/* 角标图标：定位在主图右上角 */}
                <img
                    className="absolute"
                    src={rarityMap[card.稀有度]}
                    style={{
                        top: `${fontsize * 7.2}px`,
                        left: `${fontsize * 35.8}px`,
                        width: `${fontsize * 4}px`
                    }}
                />

                <LazyLoadImage
                    src={card.图片信息[1].srcset}
                    placeholderSrc={card.图片信息[1].src}
                    effect="blur"
                    className="absolute object-contain edge-blur-mask"
                    style={{
                        top: `${fontsize * 21}px`,
                        left: `${fontsize * 5}px`,
                        width: `${fontsize * 14}px`
                    }}
                />

                {/* 重逢图标：贴在卡面右上角 */}
                <img
                    src="images/重逢.png"
                    alt="重逢图标"
                    className="absolute"
                    style={{
                        top: `${fontsize * 20.3}px`,
                        left: `${fontsize * 16.5}px`,
                        width: `${fontsize * 2.5}px`
                    }}
                />

                <div
                    className="absolute overflow-hidden"
                    style={{
                        top: `${fontsize * 10}px`,
                        left: `${fontsize * 42.5}px`,
                        width: `${fontsize * 18}px`,
                        height: `${fontsize * 16}px`,
                    }}
                >
                    <label
                        style={{
                            color: 'lightgray',
                            fontWeight: 600,
                            fontSize: `${fontsize * 1.4}px`,
                    }}
                        className="absolute"
                    >
                        {card.主角}
                    </label>

                    <label
                        style={{
                            top: `${fontsize * 1.9}px`,
                            color: 'white',
                            fontWeight: 800,
                            fontSize: `${fontsize * 2}px`,
                        }}
                        className="absolute"
                    >
                        {card.卡名}
                    </label>

                    <div className="absolute flex flex-row" style={{top: `${fontsize * 6}px`}}>
                        {attributes.map(attr => (
                            <div
                                key={attr}
                                className="flex flex-col mr-[3vmin] items-center"
                            >
                                <img
                                    src={`images/60px-${attr}.png`}
                                    className="mb-[0.5vmin]"
                                    style={{width: `${fontsize * 2}px`}}
                                />

                                <label
                                    style={{
                                        color: card.属性 === attr ? 'gold' : 'white',
                                        fontWeight: 800,
                                        fontSize: `${fontsize * 1}px`,
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
