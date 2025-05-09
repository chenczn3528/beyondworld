import React, {useEffect, useState, useRef} from 'react';
import cardData from './assets/cards.json';
import 'react-lazy-load-image-component/src/effects/blur.css';
import Carousel from "./components/Carousel";

const Home = () => {
    const filtered_cardData = cardData.filter(card => card.稀有度 === '世界');

    // console.log(filtered_cardData.length)
    //
    // const images = filtered_cardData.map(card => card.图片信息[0]?.src);
    // console.log(images)



  // ========================================================
  // 返回数据时显示的页面
  return (

      <div
          className="relative w-screen h-screen cursor-pointer overflow-hidden outline-none focus:outline-none"
          tabIndex={0}
      >
          {/* 视频层（最底层） */}
          <video
              preload="auto"
              autoPlay
              loop
              playsInline
              muted
              controls={false}
              // onEnded={() => {
              //   const validDrawId = drawSessionIdRef.current;
              //   if (!validDrawId) return;
              //   setisAnimatingDrawCards(false);
              //   drawSessionIdRef.current = 0; // 重置流程 ID，防止后续重复触发
              // }}
              className="fixed top-0 left-0 w-full h-full object-cover z-0">
              <source src="videos/background.mp4" type="video/mp4"/>
          </video>

          {/*/!* 文字在图片之上 *!/*/}
          {/*<label*/}
          {/*    style={{*/}
          {/*        position: 'absolute',*/}
          {/*        top: '20px',*/}
          {/*        left: '20px',*/}
          {/*        color: 'white',*/}
          {/*        fontSize: '18px',*/}
          {/*        zIndex: 10,*/}
          {/*    }}*/}
          {/*>*/}
          {/*    hello*/}
          {/*</label>*/}


          <div
              style={{
                  width: '100vw',
                  height: '80vh',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  zIndex: 2,
                  // border: "3px dashed red",
              }}
          >
              <Carousel cardData={filtered_cardData}/>
          </div>

          <div
              style={{
                  width: '100vw',
                  height: '40vh',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  zIndex: 1,
              }}
          >
              <button>
                  一抽
              </button>

              <button>
                  十抽
              </button>
          </div>


      </div>


  );
};

export default Home;
