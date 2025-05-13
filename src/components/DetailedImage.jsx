import React, {useEffect} from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import {forceLandscape} from "single-screen-utils";

const DetailedImage = ({ card, onClose }) => {

    useEffect(()=>{
        forceLandscape();
    },[])

    const rarityMap = {
      世界: 'images/world.png',
      月: 'images/moon.png',
      辰星: 'images/star1.png',
      星: 'images/star2.png',
    };

    return (
        <div
            id="app"
            className="fixed inset-0 z-50 w-full h-full top-[0] left-[0] flex justify-center items-center"
            onClick={onClose}
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
                            onClick={(e) => e.stopPropagation()}
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
                            <img
                                src={card.图片信息[1].src}
                                alt="重逢卡面"
                                className="w-full h-full object-contain edge-blur-mask"
                            />

                            {/* 重逢图标：贴在卡面右上角 */}
                            <img
                                src="images/重逢.png"
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
                            <div className="flex flex-col items-center">
                                <img src="images/60px-思维.png" className="w-[3vw]"/>
                                <label style={{color: 'white', fontWeight: 800, fontSize: '3vmin'}}>{card.思维}</label>
                            </div>
                            <div className="flex flex-col ml-[2vw] items-center">
                                <img src="images/60px-魅力.png" className="w-[3vw]"/>
                                <label style={{color: 'white', fontWeight: 800, fontSize: '3vmin'}}>{card.魅力}</label>
                            </div>
                            <div className="flex flex-col ml-[2vw] items-center">
                                <img src="images/60px-体魄.png" className="w-[3vw]"/>
                                <label style={{color: 'white', fontWeight: 800, fontSize: '3vmin'}}>{card.体魄}</label>
                            </div>
                            <div className="flex flex-col ml-[2vw] items-center">
                                <img src="images/60px-思维.png" className="w-[3vw]"/>
                                <label style={{color: 'white', fontWeight: 800, fontSize: '3vmin'}}>{card.思维}</label>
                            </div>
                            <div className="flex flex-col ml-[2vw] items-center">
                                <img src="images/60px-灵巧.png" className="w-[3vw]"/>
                                <label style={{color: 'white', fontWeight: 800, fontSize: '3vmin'}}>{card.灵巧}</label>
                            </div>
                      </div>
                  </div>
              </div>
          </div>

      </div>
  );
};

export default DetailedImage;
