// version: 20250603-v5
const CACHE_NAME = 'beyondworld-cache-v2';
const FILES_TO_CACHE = [
    '/beyondworld/videos/gold.mp4',
    '/beyondworld/videos/no_gold.mp4',
    '/beyondworld/videos/background.mp4',

    '/beyondworld/audios/切换音效.mp3',
    '/beyondworld/audios/展示总结音效.mp3',
    '/beyondworld/audios/抽卡音效.mp3',
    '/beyondworld/audios/月卡音效.mp3',
    '/beyondworld/audios/金卡音效.mp3',
    '/beyondworld/audios/点击音效.mp3',

    '/beyondworld/images/60px-体魄.png',
    '/beyondworld/images/60px-思维.png',
    '/beyondworld/images/60px-感知.png',
    '/beyondworld/images/60px-灵巧.png',
    '/beyondworld/images/60px-魅力.png',
    '/beyondworld/images/background.png',
    '/beyondworld/images/icon.jpg',
    '/beyondworld/images/moon.png',
    '/beyondworld/images/star1.png',
    '/beyondworld/images/star2.png',
    '/beyondworld/images/world.png',
    '/beyondworld/images/重逢.png',
];

// 安装阶段：缓存资源，跳过等待
// self.addEventListener('install', (event) => {
//   self.skipWaiting();
//   event.waitUntil(
//     caches.open(CACHE_NAME)
//       .then(cache => {
//         console.log('[SW] Caching files:', FILES_TO_CACHE);
//         return cache.addAll(FILES_TO_CACHE);
//       })
//       .catch(err => console.error('[SW] Cache failed:', err))
//   );
// });

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      for (const file of FILES_TO_CACHE) {
        try {
          await cache.add(file);
          console.log(`[SW] Cached: ${file}`);
        } catch (err) {
          console.warn(`[SW] Failed to cache ${file}:`, err);
        }
      }
    })()
  );
});



// 激活阶段：清除旧缓存，立即接管控制权
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keyList = await caches.keys();
      await Promise.all(
        keyList.map(key => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          }
        })
      );
      await self.clients.claim();
    })()
  );
});

// 拦截 fetch 请求
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 跳过来自 patchwiki 或其他外部源的请求
  if (url.origin !== self.location.origin) {
    return fetch(event.request); // 外部请求直接返回
  }

  // 处理缓存和其他逻辑
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // 如果缓存中有，直接返回
        return cachedResponse;
      }

      // 否则从网络获取资源并缓存
      return fetch(event.request).then((response) => {
        // 确保只缓存完整的响应（状态码 200）
        if (response.status === 200) {
          // 只缓存静态资源
          if (event.request.url.includes('/images/') || event.request.url.includes('/videos/') || event.request.url.includes('/audios/')) {
            return caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, response.clone());
              return response;
            });
          }
        }
        return response; // 如果是部分响应或其他响应，直接返回，不缓存
      });
    })
  );
});