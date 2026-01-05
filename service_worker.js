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

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
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

  // 跳过来自外部源的请求（如 GitHub Raw API），直接返回，不缓存
  if (url.origin !== self.location.origin) {
    return fetch(event.request);
  }

  // 对于 HTML、JS、CSS 等核心文件，使用网络优先策略，确保获取最新版本
  const isCoreFile = event.request.url.endsWith('.html') || 
                     event.request.url.endsWith('.js') || 
                     event.request.url.endsWith('.css') ||
                     event.request.url.includes('/index.html') ||
                     event.request.url.includes('/assets/') && (event.request.url.endsWith('.js') || event.request.url.endsWith('.css'));

  if (isCoreFile) {
    // 网络优先策略：先尝试网络，失败则使用缓存
    event.respondWith(
      fetch(event.request, {
        cache: 'no-store', // 完全绕过缓存
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
      })
        .then((response) => {
          // 网络请求成功，返回最新版本
          return response;
        })
        .catch(() => {
          // 网络请求失败，尝试从缓存获取（离线支持）
          return caches.match(event.request);
        })
    );
    return;
  }

  // 对于数据文件（JSON），也使用网络优先策略
  if (event.request.url.endsWith('.json') || event.request.url.includes('/data/')) {
    event.respondWith(
      fetch(event.request, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
      })
        .then((response) => response)
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // 对于静态资源（图片、视频、音频），使用缓存优先策略（性能优化）
  if (event.request.url.includes('/images/') || 
      event.request.url.includes('/videos/') || 
      event.request.url.includes('/audios/')) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          // 缓存中有，先返回缓存，同时在后台更新
          fetch(event.request).then((response) => {
            if (response.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, response.clone());
              });
            }
          }).catch(() => {}); // 后台更新失败不影响用户体验
          return cachedResponse;
        }

        // 缓存中没有，从网络获取并缓存
        return fetch(event.request).then((response) => {
          if (response.status === 200) {
            return caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, response.clone());
              return response;
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // 其他请求：网络优先
  event.respondWith(
    fetch(event.request, { cache: 'no-store' })
      .then((response) => response)
      .catch(() => caches.match(event.request))
  );
});
