import React, {useEffect} from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import {playClickSound} from "../utils/playClickSound.js";

const DetailedImage = ({ card, onClose, fontsize }) => {

    // const rarityMap = {
    //   世界: 'https://cdn.chenczn3528.dpdns.org/beyondworld/images/world.png',
    //   月: 'https://cdn.chenczn3528.dpdns.org/beyondworld/images/moon.png',
    //   辰星: 'https://cdn.chenczn3528.dpdns.org/beyondworld/images/star1.png',
    //   星: 'https://cdn.chenczn3528.dpdns.org/beyondworld/images/star2.png',
    // };

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
                        top: `${fontsize * 9}px`,
                        left: `${fontsize * 14}px`,
                        width: `${fontsize * 20}px`
                    }}
                />
                {/* 角标图标：定位在主图右上角 */}
                <img
                    className="absolute"
                    src={rarityMap[card.稀有度]}
                    style={{
                        top: `${fontsize * 8.5}px`,
                        left: `${fontsize * 30.7}px`,
                        width: `${fontsize * 3}px`
                    }}
                />

                <LazyLoadImage
                    src={card.图片信息[1].srcset}
                    placeholderSrc={card.图片信息[1].src}
                    effect="blur"
                    className="absolute object-contain edge-blur-mask"
                    style={{
                        top: `${fontsize * 18}px`,
                        left: `${fontsize * 9}px`,
                        width: `${fontsize * 10}px`
                    }}
                />

                {/* 重逢图标：贴在卡面右上角 */}
                <img
                    // src="https://cdn.chenczn3528.dpdns.org/beyondworld/images/重逢.png"
                    src="images/重逢.png"
                    alt="重逢图标"
                    className="absolute"
                    style={{
                        top: `${fontsize * 17.5}px`,
                        left: `${fontsize * 17}px`,
                        width: `${fontsize * 2}px`
                    }}
                />

                <div
                    className="absolute overflow-hidden"
                    style={{
                        top: `${fontsize * 10}px`,
                        left: `${fontsize * 34.5}px`,
                        width: `${fontsize * 13}px`,
                        height: `${fontsize * 10}px`,
                    }}
                >
                    <label
                        style={{
                            color: 'lightgray',
                            fontWeight: 600,
                            fontSize: `${fontsize}px`,
                    }}
                        className="absolute"
                    >
                        {card.主角}
                    </label>

                    <label
                        style={{
                            top: `${fontsize * 1.4}px`,
                            color: 'white',
                            fontWeight: 800,
                            fontSize: `${fontsize * 1.5}px`,
                        }}
                        className="absolute"
                    >
                        {card.卡名}
                    </label>

                    <div className="absolute flex flex-row" style={{top: `${fontsize * 5}px`}}>
                        {attributes.map(attr => (
                            <div
                                key={attr}
                                className="flex flex-col mr-[2vmin] items-center"
                            >
                                {/*<img src={`https://cdn.chenczn3528.dpdns.org/beyondworld/images/60px-${attr}.png`}*/}
                                {/*     className="w-[7vmin]"/>*/}
                                <img
                                    src={`images/60px-${attr}.png`}
                                    className="mb-[0.5vmin]"
                                    style={{width: `${fontsize * 1.5}px`}}
                                />

                                <label
                                    style={{
                                        color: card.属性 === attr ? 'gold' : 'white',
                                        fontWeight: 800,
                                        fontSize: `${fontsize * 0.6}px`,
                                    }}
                                >
                                    {card[attr]}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>


            </div>


            {/*<div className="absolute flex border">*/}


            {/*    <div className="relative">*/}
            {/*        <div className="ml-[4vmin] flex flex-col">*/}
            {/*            <label style={{color: 'lightgray', fontWeight: 600, fontSize: '3.5vmin'}}>{card.主角}</label>*/}

            {/*            <label style={{color: 'white', fontWeight: 800, fontSize: '6vmin'}}>{card.卡名}</label>*/}

            {/*            <div className="ml-[4vmin] mt-[3vmin] flex flex-row w-[60%] h-[60%]">*/}
            {/*                {attributes.map(attr => (*/}
            {/*                    <div key={attr} className="flex flex-col mr-[2vw] items-center">*/}
            {/*                        /!*<img src={`https://cdn.chenczn3528.dpdns.org/beyondworld/images/60px-${attr}.png`}*!/*/}
            {/*                        /!*     className="w-[7vmin]"/>*!/*/}
            {/*                        <img src={`images/60px-${attr}.png`} className="w-[7vmin]"/>*/}

            {/*                        <label*/}
            {/*                            style={{*/}
            {/*                                color: card.属性 === attr ? 'gold' : 'white',*/}
            {/*                                fontWeight: 800,*/}
            {/*                                fontSize: '3vmin',*/}
            {/*                            }}*/}
            {/*                        >*/}
            {/*                            {card[attr]}*/}
            {/*                        </label>*/}
            {/*                    </div>*/}
            {/*                ))}*/}
            {/*            </div>*/}
            {/*        </div>*/}
            {/*    </div>*/}
            {/*</div>*/}

        </div>
    );
};

export default DetailedImage;
