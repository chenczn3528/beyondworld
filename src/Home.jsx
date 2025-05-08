import React, {useEffect, useState, useRef} from 'react';
import cardData from './assets/cards.json';
import 'react-lazy-load-image-component/src/effects/blur.css';

const Home = () => {





  // ========================================================
  // 返回数据时显示的页面
  return (
      <div
        className="relative w-screen h-screen cursor-pointer overflow-hidden outline-none focus:outline-none"
        style={{ overflow: 'hidden' }} // 强制禁止滚动
        tabIndex={0}
      >
        <img
          src="images/background.jpg"
          alt="背景图"
          className="h-full w-auto object-contain"
          style={{ objectFit: 'contain' }}
        />
          <label
              className="fixed mt-[20px] ml-[20px]"
              style={{"font-color": "white"}}>
              hello
          </label>
      </div>
    );
};

export default Home;
