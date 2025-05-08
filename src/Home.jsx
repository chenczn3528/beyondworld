import React, {useEffect, useState, useRef} from 'react';
import cardData from './assets/cards.json';
import 'react-lazy-load-image-component/src/effects/blur.css';

const Home = () => {





  // ========================================================
  // 返回数据时显示的页面
  return (
      <div
          style={{
              position: 'relative',
              width: '100vw',
              height: '100vh',
              overflow: 'hidden',
          }}
          tabIndex={0}
      >
          {/* 背景图片 */}
          <img
              src="images/background.jpg"
              alt="背景图"
              style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  height: '100%',
                  width: 'auto',
                  transform: 'translate(-50%, -50%)',
                  objectFit: 'contain',
              }}
          />

          {/* 文字在图片之上 */}
          <label
              style={{
                  position: 'absolute',
                  top: '20px',
                  left: '20px',
                  color: 'white',
                  fontSize: '18px',
                  zIndex: 10,
              }}
          >
              hello
          </label>
      </div>


  );
};

export default Home;
