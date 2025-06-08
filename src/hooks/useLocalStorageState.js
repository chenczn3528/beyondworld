// hooks/useLocalStorageState.js
import { useState, useEffect } from 'react';

export default function useLocalStorageState(key, defaultValue) {
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState(() => {
    const saved = localStorage.getItem(key);
    try {
      return saved !== null ? JSON.parse(saved) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    // 模拟异步加载完成（其实是同步执行的，但这能确保加载完毕再标记）
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem(key, JSON.stringify(state));
    }
  }, [key, state, loading]);

  return [state, setState, loading];
}
