import React, {useEffect} from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import {playClickSound} from "../utils/playClickSound.js";

const DetailedImage = ({ card, onClose }) => {

    const rarityMap = {
      世界: 'https://cdn.chenczn3528.dpdns.org/beyondworld/images/world.png',
      月: 'https://cdn.chenczn3528.dpdns.org/beyondworld/images/moon.png',
      辰星: 'https://cdn.chenczn3528.dpdns.org/beyondworld/images/star1.png',
      星: 'https://cdn.chenczn3528.dpdns.org/beyondworld/images/star2.png',
    };

    const attributes = ['思维', '魅力', '体魄', '感知', '灵巧'];

    return (
        <div
            id="app"
            className="fixed inset-[0] z-50 w-full h-full flex justify-center items-center"
            onClick={()=>{playClickSound(); onClose();}}
            style={{backgroundColor: 'rgba(0, 0, 0, 0.8)',}}
        >

            <div className="flex w-full h-full items-center justify-center ml-[8vw]">
                <div className="relative top-[-8vh]">
                    <div className="flex flex-row">
                        <LazyLoadImage
                            src={card.图片信息[0].srcset}
                            placeholderSrc={card.图片信息[0].src}
                            effect="blur"
                            alt="Full View"
                            className="h-[40vmin] w-auto object-contain rounded-lg shadow-2xl edge-blur-mask"
                        />

                        {/* 角标图标：定位在主图右上角 */}
                        <img
                            className="absolute right-[0vw] max-w-[8vw] max-h-[8vh] w-auto h-auto"
                            src={rarityMap[card.稀有度]}
                            alt="Rarity Badge"
                        />
                    </div>

                    {/*重逢卡面*/}
                    <div className="absolute left-[30%] bottom-[-30%] w-[60%] h-[60%]" style={{transform: 'translateX(-100%)'}}>
                        <div className="relative w-full h-full">
                            <LazyLoadImage
                                src={card.图片信息[1].srcset}
                                placeholderSrc={card.图片信息[1].src}
                                effect="blur"
                                alt="Full View"
                                className="h-[24vmin] w-auto object-contain rounded-lg shadow-2xl edge-blur-mask"
                            />

                            {/* 重逢图标：贴在卡面右上角 */}
                            <img
                                src="https://cdn.chenczn3528.dpdns.org/beyondworld/images/重逢.png"
                                alt="重逢图标"
                                className="absolute top-[-1vw] right-[0] w-[20%] h-auto"
                            />
                        </div>
                    </div>

                </div>

                <div className="relative">
                    <div className="ml-[4vmin] flex flex-col">
                        <label style={{color: 'lightgray', fontWeight: 600, fontSize: '3.5vmin'}}>{card.主角}</label>

                        <label style={{color: 'white', fontWeight: 800, fontSize: '6vmin'}}>{card.卡名}</label>

                        <div className="ml-[4vmin] mt-[3vmin] flex flex-row w-[60%] h-[60%]">
                            {attributes.map(attr => (
                                <div key={attr} className="flex flex-col mr-[2vw] items-center">
                                    <img src={`https://cdn.chenczn3528.dpdns.org/beyondworld/images/60px-${attr}.png`} className="w-[7vmin]"/>
                                    <label
                                        style={{
                                            color: card.属性 === attr ? 'gold' : 'white',
                                            fontWeight: 800,
                                            fontSize: '3vmin',
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

      </div>
  );
};

export default DetailedImage;
