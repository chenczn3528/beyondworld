import { useEffect, useRef, useState } from 'react';
import './App.css';
import Home from './Home.jsx';

function App() {
    const wrapperRef = useRef();
    const gameRef = useRef();
    const [isPortrait, setIsPortrait] = useState(window.innerHeight >= window.innerWidth);

    const resize = () => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        const aspect = 16 / 9;
        const portrait = h >= w;
        setIsPortrait(portrait);

        const wrapper = wrapperRef.current;
        const game = gameRef.current;

        let gameW, gameH;

        if (portrait) {
            gameW = h;
            gameH = h / aspect;
            wrapper.style.width = `${h}px`;
            wrapper.style.height = `${w}px`;
            wrapper.style.transform = `translate(-50%, -50%) rotate(90deg)`;
        } else {
            if (w / h > aspect) {
                gameH = h;
                gameW = h * aspect;
            } else {
                gameW = w;
                gameH = w / aspect;
            }
            wrapper.style.width = `${w}px`;
            wrapper.style.height = `${h}px`;
            wrapper.style.transform = `translate(-50%, -50%) rotate(0deg)`;
        }
        game.style.width = `${gameW}px`;
        game.style.height = `${gameH}px`;
    };

    useEffect(() => {
        resize();
        window.addEventListener('resize', resize);
        return () => window.removeEventListener('resize', resize);
    }, []);



  // App.jsx 中添加 useEffect
    useEffect(() => {
        const updateRealVh = () => {
            const realHeight = window.visualViewport?.height || window.innerHeight;
            document.documentElement.style.setProperty('--real-vh', `${realHeight}px`);
        };

        updateRealVh();
        window.visualViewport?.addEventListener('resize', updateRealVh);
        window.addEventListener('resize', updateRealVh);
        return () => {
            window.visualViewport?.removeEventListener('resize', updateRealVh);
            window.removeEventListener('resize', updateRealVh);
        };
    }, []);







    // 不许缩放
    useEffect(() => {
        // 动态添加meta（如果你不确定index.html是否生效）
        let meta = document.querySelector('meta[name=viewport]');
        if (!meta) {
          meta = document.createElement('meta');
          meta.name = 'viewport';
          document.head.appendChild(meta);
        }
        meta.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no';

        // 禁止捏合缩放和双击缩放
        const preventPinch = (e) => {
          if (e.touches.length > 1) e.preventDefault();
        };
        let lastTouchEnd = 0;
        const preventDoubleTap = (e) => {
          const now = Date.now();
          if (now - lastTouchEnd <= 300) e.preventDefault();
          lastTouchEnd = now;
        };
        document.addEventListener('touchstart', preventPinch, { passive: false });
        document.addEventListener('touchend', preventDoubleTap, { passive: false });

        return () => {
          document.removeEventListener('touchstart', preventPinch);
          document.removeEventListener('touchend', preventDoubleTap);
        };
  }, []);





    // 不许滚动（iOS）
    // useEffect(() => {
    //   let startY = 0;
    //
    //   const touchStart = (e) => {
    //     startY = e.touches[0].clientY;
    //   };
    //
    //   const touchMove = (e) => {
    //     const el = e.target;
    //
    //     // 找到最近的可滚动父元素
    //     let scrollable = el.closest('.content');
    //     if (!scrollable) {
    //       e.preventDefault();  // 没找到滚动区域阻止滚动
    //       return;
    //     }
    //
    //     const scrollTop = scrollable.scrollTop;
    //     const scrollHeight = scrollable.scrollHeight;
    //     const offsetHeight = scrollable.offsetHeight;
    //     const currentY = e.touches[0].clientY;
    //     const deltaY = currentY - startY;
    //
    //     if (
    //       (scrollTop === 0 && deltaY > 0) ||  // 到顶部继续往下拉
    //       (scrollTop + offsetHeight >= scrollHeight && deltaY < 0)  // 到底部继续往上拉
    //     ) {
    //       e.preventDefault();  // 阻止穿透导致的外层页面滑动
    //     }
    //   };
    //
    //   document.addEventListener('touchstart', touchStart, { passive: false });
    //   document.addEventListener('touchmove', touchMove, { passive: false });
    //
    //   return () => {
    //     document.removeEventListener('touchstart', touchStart);
    //     document.removeEventListener('touchmove', touchMove);
    //   };
    // }, []);




    return (
        <div className="viewport">
            <div className="wrapper" ref={wrapperRef}>
                <div className="game relative" ref={gameRef}>
                    <div className="scrollable-content">
                        <Home/>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;