let assetLoader;
const loaderWaiters = [];
let clickAudioUrl = null;
let clickAudioUrlPromise = null;

const notifyLoaderReady = (loader) => {
  if (!loaderWaiters.length) return;
  loaderWaiters.splice(0).forEach(resolve => {
    try {
      resolve(loader);
    } catch {}
  });
};

const waitForAssetLoader = () => {
  if (assetLoader) return Promise.resolve(assetLoader);
  return new Promise((resolve) => {
    loaderWaiters.push(resolve);
  });
};

export function setAssetLoader(loader) {
  assetLoader = loader;
  notifyLoaderReady(loader);
}

const ensureClickAudioUrl = async () => {
  if (clickAudioUrl) {
    return clickAudioUrl;
  }
  if (!assetLoader) {
    await waitForAssetLoader();
  }
  if (!assetLoader) return null;

  if (!clickAudioUrlPromise) {
    clickAudioUrlPromise = assetLoader
      .loadAsset('audio', '点击音效.mp3')
      .then((url) => {
        clickAudioUrlPromise = null;
        if (url) {
          clickAudioUrl = url;
        }
        return clickAudioUrl;
      })
      .catch((err) => {
        clickAudioUrlPromise = null;
        throw err;
      });
  }
  return clickAudioUrlPromise;
};

export async function playClickSound() {
  try {
    const loader = assetLoader || await waitForAssetLoader();
    if (!loader) {
      console.warn('Asset loader 未初始化，无法播放点击音效');
      return;
    }

    const audioUrl = await ensureClickAudioUrl();
    if (!audioUrl) {
      console.warn('未能通过 Asset 系统加载点击音效');
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
