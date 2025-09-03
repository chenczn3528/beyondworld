// utils/playClickSound.js
import { useAssetLoader } from '../hooks/useAssetLoader';

let clickAudio;
let assetLoader;

// 初始化 Asset Loader
const initAssetLoader = () => {
  if (!assetLoader) {
    // 这里需要从 React 组件外部获取 useAssetLoader
    // 由于这是工具函数，我们需要一个不同的方法
    return null;
  }
  return assetLoader;
};

// 设置 Asset Loader（从组件中调用）
export function setAssetLoader(loader) {
  assetLoader = loader;
}

export async function playClickSound() {
  try {
    // 如果没有 Asset Loader，回退到原来的方式
    if (!assetLoader) {
      if (!clickAudio) {
        clickAudio = new Audio('audios/点击音效.mp3');
        clickAudio.volume = 1;
      }
      clickAudio.currentTime = 0;
      await clickAudio.play();
      return;
    }

    // 使用 Asset 系统加载音频
    const audioUrl = await assetLoader.loadAsset('audio', '点击音效.mp3');
    if (!audioUrl) {
      // 回退到原来的方式
      if (!clickAudio) {
        clickAudio = new Audio('audios/点击音效.mp3');
        clickAudio.volume = 1;
      }
      clickAudio.currentTime = 0;
      await clickAudio.play();
      return;
    }

    // 创建新的音频实例
    const audio = new Audio(audioUrl);
    audio.volume = 1;

    // 应用增益设置
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        try { await ctx.resume(); } catch {}
      }
      
      // 获取增益设置
      let sfxGain = 1;
      try {
        const saved = localStorage.getItem('sfxGain');
        if (saved) {
          const parsed = parseFloat(saved);
          if (!Number.isNaN(parsed) && parsed > 0) sfxGain = parsed;
        }
      } catch {}
      
      const source = ctx.createMediaElementSource(audio);
      const gainNode = ctx.createGain();
      gainNode.gain.value = sfxGain;
      source.connect(gainNode);
      gainNode.connect(ctx.destination);
    } catch (e) {
      // 忽略增益管线错误，保底直接播放
    }

    audio.currentTime = 0;
    await audio.play();
  } catch (err) {
    console.warn('点击音效播放失败:', err);
  }
}
