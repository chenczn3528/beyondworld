import React from 'react';
import Home from './Home';

function App() {
  return <Home />;
}

export default App;


// import React, { useEffect } from 'react';
// import { dynamicRem, forceLandscape } from 'single-screen-utils';
// import Home from "./Home.jsx";
//
// const App = () => {
//   useEffect(() => {
//     // 初始化 forceLandscape，强制横屏
//     const destroyLandscape = forceLandscape({
//       id: '#app',
//     });
//
//     // 初始化 dynamicRem，设置设计稿宽高
//     const destroyRem = dynamicRem({
//       pageWidth: 390,    // 设计稿的宽度
//       pageHeight: 844,  // 设计稿的高度
//     });
//
//     // 返回清理函数，当组件卸载时调用
//     return () => {
//       destroyLandscape();  // 清除 forceLandscape
//       destroyRem();        // 清除 dynamicRem
//     };
//   }, []);  // 空依赖数组，表示仅在组件挂载时执行一次
//
//   return (
//     <div id="app">
//       <Home />
//     </div>
//   );
// };
//
// export default App;


