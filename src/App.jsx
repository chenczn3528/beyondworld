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

  return (
    <div className="viewport">
      <div className="wrapper" ref={wrapperRef}>
        <div className="game relative border" ref={gameRef}>
          <Home />
        </div>
      </div>
    </div>
  );
}

export default App;