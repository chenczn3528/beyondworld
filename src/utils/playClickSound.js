// utils/playClickSound.js

let clickAudio;

export function playClickSound() {
  if (!clickAudio) {
    clickAudio = new Audio('audios/点击音效.mp3'); // 放在 public 文件夹下
    clickAudio.volume = 1;
  }

  clickAudio.currentTime = 0;
  clickAudio.play().catch((err) => {
    console.warn('点击音效播放失败:', err);
  });
}
