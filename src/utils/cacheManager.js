/**
 * 缓存管理工具
 * 处理域名变更、缓存清理等操作
 */

const DOMAIN_KEY = 'bw_last_domain';
const CACHE_VERSION_KEY = 'bw_cache_version';

/**
 * 检查域名是否变更
 */
export function checkDomainChange() {
  const currentDomain = window.location.hostname;
  const lastDomain = localStorage.getItem(DOMAIN_KEY);
  
  if (lastDomain && lastDomain !== currentDomain) {
    console.log(`🔄 检测到域名变更: ${lastDomain} -> ${currentDomain}`);
    return true;
  }
  
  // 保存当前域名
  localStorage.setItem(DOMAIN_KEY, currentDomain);
  return false;
}

/**
 * 清理所有缓存（包括 Service Worker 缓存和 localStorage）
 */
export async function clearAllCaches() {
  try {
    // 清理 Service Worker 缓存
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => {
          console.log(`🗑️ 清理缓存: ${cacheName}`);
          return caches.delete(cacheName);
        })
      );
    }

    // 注销所有 Service Worker
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(
        registrations.map(registration => {
          console.log(`🗑️ 注销 Service Worker: ${registration.scope}`);
          return registration.unregister();
        })
      );
    }

    console.log('✅ 所有缓存已清理');
    return true;
  } catch (error) {
    console.error('❌ 清理缓存失败:', error);
    return false;
  }
}

/**
 * 清理特定域名的缓存
 */
export async function clearDomainCache(domain) {
  try {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      // 清理包含域名信息的缓存
      const domainCaches = cacheNames.filter(name => name.includes(domain));
      await Promise.all(domainCaches.map(name => caches.delete(name)));
    }
    console.log(`✅ 已清理域名 ${domain} 的缓存`);
    return true;
  } catch (error) {
    console.error('❌ 清理域名缓存失败:', error);
    return false;
  }
}

/**
 * 初始化缓存管理
 * 在应用启动时调用，检查域名变更并清理旧缓存
 */
export async function initCacheManager() {
  const domainChanged = checkDomainChange();
  
  if (domainChanged) {
    console.log('🔄 检测到域名变更，清理旧缓存...');
    // 可以选择是否自动清理，或者提示用户
    // 这里选择自动清理，确保新域名使用最新内容
    await clearAllCaches();
    
    // 重新注册 Service Worker
    if ('serviceWorker' in navigator) {
      try {
        await navigator.serviceWorker.register('service_worker.js?t=' + Date.now());
        console.log('✅ Service Worker 已重新注册');
      } catch (error) {
        console.error('❌ Service Worker 重新注册失败:', error);
      }
    }
  }
}

/**
 * 强制刷新页面（清除所有缓存后刷新）
 */
export async function forceRefresh() {
  await clearAllCaches();
  // 添加时间戳确保获取最新版本
  window.location.href = window.location.href.split('?')[0] + '?t=' + Date.now();
}

