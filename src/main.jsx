import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import './index.css';
import App from './App.jsx';

const isProduction = process.env.NODE_ENV === 'production';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter basename={isProduction ? '/beyondworld' : ''}> {/* 根据环境设置 basename */}
      <App />
    </HashRouter>
  </StrictMode>
);
