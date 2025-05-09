import React from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';

const FullScreenImage = ({ card, onClose }) => {

    const rarityMap = {
      世界: 'images/world.png',
      月: 'images/moon.png',
      辰星: 'images/star1.png',
      星: 'images/star2.png',
    };

  return (
      <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
          onClick={onClose}
          style={{
              position: 'fixed',
              top: 0, left: 0,
              width: '100vw',
              height: '100vh',
              zIndex: 1, // 强制在最上层
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
          }}
      >

          <div className="flex items-center justify-start w-full h-full ml-[15%] mb-[15%]">
              <div className="relative w-[40vw] h-[40vh]">
                  <LazyLoadImage
                      src={card.图片信息[0].srcset}
                      placeholderSrc={card.图片信息[0].src}
                      effect="blur"
                      alt="Full View"
                      className="w-full h-full object-contain rounded-lg shadow-2xl"
                      onClick={(e) => e.stopPropagation()}
                  />
                  {/* 角标图片，覆盖在右上角 */}
                  <img
                      className="absolute top-0 right-0 w-[5vw] h-auto ml-[-13%]"
                      src={rarityMap[card.稀有度]}
                      alt="Rarity Badge"
                  />
                  {/*重逢卡面*/}
                  <img
                      src={card.图片信息[1].srcset}  // 假设第二张图片存在
                      alt="Bottom Left Image"
                      className="absolute top-0 left-0 w-[25vw] h-auto ml-[-125%] mt-[45%]"
                  />

                  <img
                      src='images/重逢.png'
                      className="absolute top-0 left-0 w-[4vw] h-auto ml-[-73%] mt-[42%]"
                  />
              </div>

              <div className="relative w-[40vw] h-[40vh] mt-[15%] mr-[5%]">
                  <div className="ml-[5%] flex flex-col">
                      <label style={{color: 'lightgray', fontWeight: 600, fontSize: '2vw'}}>{card.主角}</label>

                      <label style={{color: 'white', fontWeight: 800, fontSize: '3vw'}}>{card.卡名}</label>

                      <div className="ml-[5%] mt-[5%] flex flex-row">
                          <div className="flex flex-col items-center">
                              <img src="images/60px-思维.png" className="w-[3vw]"/>
                              <label style={{color: 'white', fontWeight: 800, fontSize: '1.5vw'}}>{card.思维}</label>
                          </div>
                          <div className="flex flex-col ml-[2vw] items-center">
                              <img src="images/60px-魅力.png" className="w-[3vw]"/>
                              <label style={{color: 'white', fontWeight: 800, fontSize: '1.5vw'}}>{card.魅力}</label>
                          </div>
                          <div className="flex flex-col ml-[2vw] items-center">
                              <img src="images/60px-体魄.png" className="w-[3vw]"/>
                              <label style={{color: 'white', fontWeight: 800, fontSize: '1.5vw'}}>{card.体魄}</label>
                          </div>
                          <div className="flex flex-col ml-[2vw] items-center">
                              <img src="images/60px-思维.png" className="w-[3vw]"/>
                              <label style={{color: 'white', fontWeight: 800, fontSize: '1.5vw'}}>{card.思维}</label>
                          </div>
                          <div className="flex flex-col ml-[2vw] items-center">
                              <img src="images/60px-灵巧.png" className="w-[3vw]"/>
                              <label style={{color: 'white', fontWeight: 800, fontSize: '1.5vw'}}>{card.灵巧}</label>
                          </div>
                      </div>
                  </div>


              </div>
          </div>

      </div>
  );
};

export default FullScreenImage;
