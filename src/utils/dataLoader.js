/**
 * 数据加载工具
 * 支持从 GitHub Raw Content API 获取最新数据，失败时回退到本地数据
 */

// 固定的 GitHub 仓库配置
const GITHUB_CONFIG = {
  owner: 'chenczn3528', // GitHub 用户名
  repo: 'beyondWorld',   // 仓库名称
  branch: 'main',       // 分支名称
};

/**
 * 获取 GitHub Raw Content URL
 */
function getGitHubRawUrl(filename) {
  return `https://raw.githubusercontent.com/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/${GITHUB_CONFIG.branch}/src/assets/${filename}`;
}

/**
 * 从当前部署站点获取数据（如果数据文件在 public 目录）
 */
function getLocalUrl(filename) {
  // 尝试从当前站点根目录获取
  const basePath = window.location.pathname.replace(/\/[^/]*$/, '');
  return `${basePath}/data/${filename}`;
}

/**
 * 加载 JSON 数据
 * @param {string} filename - 文件名（如 'cards.json'）
 * @param {object} fallbackData - 回退数据（通常是打包时的静态数据）
 * @returns {Promise<object>} 加载的数据
 */
export async function loadDataFile(filename, fallbackData) {
  // 添加时间戳参数，确保每次获取最新数据（绕过浏览器和 Service Worker 缓存）
  const timestamp = Date.now();
  
  // 1. 首先尝试从当前站点获取（如果数据文件在 public/data 目录）
  // 优先使用本地部署的数据，更可靠，不依赖外部服务
  try {
    const localUrl = getLocalUrl(filename);
    const urlWithCacheBust = `${localUrl}?t=${timestamp}&r=${Math.random()}`;
    const response = await fetch(urlWithCacheBust, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ 从网站本身获取最新数据: ${filename} (URL: ${localUrl})`);
      return data;
    }
  } catch (error) {
    console.warn(`⚠️ 从本地站点加载 ${filename} 失败:`, error.message || error);
  }
  
  // 2. 尝试从 GitHub 获取最新数据（作为备用）
  const githubUrl = getGitHubRawUrl(filename);
  if (githubUrl) {
    try {
      // 添加时间戳和随机数，确保每次都是新请求
      const urlWithCacheBust = `${githubUrl}?t=${timestamp}&r=${Math.random()}`;
      const response = await fetch(urlWithCacheBust, {
        cache: 'no-store', // 使用 no-store 而不是 no-cache，完全绕过缓存
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ 从 GitHub 动态获取最新数据: ${filename} (URL: ${githubUrl})`);
        return data;
      } else {
        console.warn(`⚠️ 从 GitHub 加载 ${filename} 失败: HTTP ${response.status}`);
      }
    } catch (error) {
      console.warn(`⚠️ 从 GitHub 加载 ${filename} 失败:`, error.message || error);
    }
  }
  
  // 3. 回退到构建时打包的静态数据（已嵌入到 JS bundle 中，无需网络请求）
  console.log(`ℹ️ 使用构建时打包的静态数据: ${filename} (数据版本: 构建时的版本，非最新)`);
  return fallbackData;
}


