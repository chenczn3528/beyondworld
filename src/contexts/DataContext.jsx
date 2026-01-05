import React, { createContext, useContext } from 'react';
import { useDataLoader } from '../hooks/useDataLoader.js';

const DataContext = createContext(null);

/**
 * 数据 Context Provider
 * 提供全局的数据访问，包括动态加载的卡片数据、卡池分类和歌曲列表
 */
export function DataProvider({ children }) {
  const data = useDataLoader();

  return (
    <DataContext.Provider value={data}>
      {children}
    </DataContext.Provider>
  );
}

/**
 * 使用数据 Context 的 Hook
 */
export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
}

