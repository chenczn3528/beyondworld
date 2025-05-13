import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

// 渲染 App 组件
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
