import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Asset } from './Asset';
import { useAssetStorage } from '../hooks/useAssetStorage';
import LeftIcon from '../icons/LeftIcon';

const AssetTest = ({ onClose }) => {
  const { storeAllAssets, getStorageStats, clearStorage, status, progress, currentAsset } = useAssetStorage();
  const [stats, setStats] = useState(null);
  // 自动刷新：移除开关，始终自动刷新
  const [fileSizeInfo, setFileSizeInfo] = useState(null);
  const [gitInfo] = useState(() => ({
    hash: typeof __BUILD_GIT_HASH__ !== 'undefined' ? __BUILD_GIT_HASH__ : null,
    dateIso: typeof __BUILD_GIT_DATE_ISO__ !== 'undefined' ? __BUILD_GIT_DATE_ISO__ : null,
    message: typeof __BUILD_GIT_MESSAGE__ !== 'undefined' ? __BUILD_GIT_MESSAGE__ : null,
  }));
  const [showLog, setShowLog] = useState(false);

  // const fontsize = useResponsiveFontSize({scale: 0.9});

  // ======================================= 获取容器尺寸（16:9下）
  const [baseSize, setBaseSize] = useState(() => 1 / 3.5);
  const divRef = useRef(null); // 获取当前绑定的容器的尺寸
  const [isLandscape, setIsLandscape] = useState(() => {
    if (typeof window === 'undefined') {
      return true;
    }
    return window.innerWidth >= window.innerHeight;
  });

  useEffect(() => {
      const updateSize = () => {
          if (divRef.current) {
              const width = divRef.current.clientWidth;
              const height = divRef.current.clientHeight;

              if (height > 0) {
                  const newBaseSize = width / 375;
                  setBaseSize(newBaseSize / 3.5);
                  return true;
              }
          }
          return false;
      };

      // 初始化时轮询直到能获取有效高度
      const tryInitSize = () => {
          const success = updateSize();
          if (!success) {
              // 如果失败，延迟一帧继续尝试
              requestAnimationFrame(tryInitSize);
          }
      };
      tryInitSize(); // 启动初始化
      window.addEventListener('resize', updateSize); // 响应窗口变化

      return () => {window.removeEventListener('resize', updateSize);};
  }, []);

  useEffect(() => {
    const handleOrientation = () => {
      if (typeof window === 'undefined') {
        return;
      }
      setIsLandscape(window.innerWidth >= window.innerHeight);
    };

    handleOrientation();
    window.addEventListener('resize', handleOrientation);

    return () => {
      window.removeEventListener('resize', handleOrientation);
    };
  }, []);

  // 加载统计信息 - 使用 useCallback 避免无限循环
  const loadStats = useCallback(async () => {
    try {
      const [storageStats, assetsModule] = await Promise.all([
        getStorageStats(),
        import('../assets/assets_config.js')
      ]);

      const assetsConfig = assetsModule.assetsConfig || {};
      setFileSizeInfo(assetsConfig);

      const assetsByType = assetsConfig.assets || {};
      const countFromConfig = assetsConfig.totalFiles
        ?? Object.values(assetsByType).reduce((total, list) => {
          const files = Array.isArray(list) ? list : [];
          return total + files.length;
        }, 0);
      const sizeFromConfig = assetsConfig.totalSize
        ?? Object.values(assetsByType).reduce((total, list) => {
          const files = Array.isArray(list) ? list : [];
          return total + files.reduce((sum, item) => sum + (item?.size || 0), 0);
        }, 0);

      const completedAssets = storageStats?.completedAssets || 0;
      const totalAssets = countFromConfig || storageStats?.totalAssets || 0;
      const totalSize = sizeFromConfig || storageStats?.totalSize || 0;
      const incompleteAssets = Math.max(totalAssets - completedAssets, 0);

      setStats({
        totalAssets,
        completedAssets,
        incompleteAssets,
        totalSize
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  }, [getStorageStats]);

  // 存储所有素材
  const handleStoreAll = useCallback(async () => {
    try {
      await storeAllAssets();
      // 存储完成后自动刷新统计信息
      await loadStats();
    } catch (error) {
      console.error('Failed to store assets:', error);
    }
  }, [storeAllAssets, loadStats]);

  // 清空存储
  const handleClear = useCallback(async () => {
    try {
      await clearStorage();
      await loadStats();
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  }, [clearStorage, loadStats]);

  // 监听状态变化，自动刷新统计信息
  useEffect(() => {
    if (status === 'completed') {
      loadStats();
    }
  }, [status, loadStats]);

  // 只在组件挂载时加载一次统计信息
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // 渲染进度条
  const renderProgressBar = () => {
    // 非存储状态：按本地已完成/配置总数计算百分比，保证刷新后仍显示本地进度
    const expectedTotal = (fileSizeInfo?.assets?.video?.length || 0)
      + (fileSizeInfo?.assets?.audio?.length || 0)
      + (fileSizeInfo?.assets?.image?.length || 0)
      + (fileSizeInfo?.assets?.sign?.length || 0);
    const completed = stats?.completedAssets || 0;
    const localProgress = expectedTotal > 0 ? Math.round((completed / expectedTotal) * 100) : 0;
    const displayProgress = status === 'storing' ? progress : localProgress;

    return (
      <div style={{ marginBottom: `${baseSize * 2}px` }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          marginBottom: `${baseSize * 10}px`,
          fontSize: `${baseSize * 20}px`,
          fontWeight: '800',
        }}>
          <span>存储进度</span>
          <span>{displayProgress}%</span>
        </div>
        <div style={{ 
          width: '100%', 
          height: `${baseSize * 18}px`, 
          backgroundColor: '#374151', 
          borderRadius: '10px',
          overflow: 'hidden'
        }}>
          <div style={{ 
            width: `${displayProgress}%`, 
            height: '100%', 
            backgroundColor: '#2563eb',
            transition: 'width 0.3s ease',
            borderRadius: '10px'
          }} />
        </div>
        {status === 'storing' && currentAsset && (
          <p style={{ 
            margin: '8px 0 0 0', 
            fontSize: `${baseSize * 18}px`, 
            color: '#9ca3af' 
          }}>
            当前: {currentAsset.name} ({(currentAsset.size / 1024 / 1024).toFixed(2)} MB)
          </p>
        )}
      </div>
    );
  };

  // 渲染文件大小信息
  const renderFileSizeInfo = () => {
    if (!fileSizeInfo) return null;
    
    const formatSize = (bytes) => {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };
    
    return (
      <div style={{
        padding: `${baseSize * 16}px`,
        backgroundColor: '#1f2937', 
        borderRadius: '12px'
      }}>
        <label style={{ 
          display: 'block',
          fontSize: `${baseSize * 20}px`, 
          fontWeight: '800', 
        }}>
          文件大小信息
        </label>
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: isLandscape ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: `${baseSize * 12}px`,
          fontSize: `${baseSize * 18}px`
        }}>
          <div>
            <p style={{ margin: '4px 0', color: '#9ca3af' }}>视频文件</p>
            <p style={{ margin: '4px 0' }}>
              数量: {fileSizeInfo.assets.video.length}，总大小: {formatSize(
                fileSizeInfo.assets.video.reduce((sum, file) => sum + (file.size || 0), 0)
              )}
            </p>
          </div>
          <div>
            <p style={{ margin: '4px 0', color: '#9ca3af' }}>音频文件</p>
            <p style={{ margin: '4px 0' }}>
              数量: {fileSizeInfo.assets.audio.length}，总大小: {formatSize(
                fileSizeInfo.assets.audio.reduce((sum, file) => sum + (file.size || 0), 0)
              )}
            </p>
          </div>
          <div>
            <p style={{ margin: '4px 0', color: '#9ca3af' }}>图片文件</p>
            <p style={{ margin: '4px 0' }}>
              数量: {fileSizeInfo.assets.image.length}，总大小: {formatSize(
                fileSizeInfo.assets.image.reduce((sum, file) => sum + (file.size || 0), 0)
              )}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      ref={divRef}
      style={{
        padding: isLandscape ? `${baseSize * 28}px ${baseSize * 48}px` : `${baseSize * 36}px ${baseSize * 24}px`,
        backgroundColor: '#111827',
        color: 'white',
        minHeight: '100vh',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: `${baseSize * 16}px`
      }}
    >
      <button
        className="absolute items-center z-20"
        onClick={onClose}
        style={{ background: 'transparent', border: 'none', padding: 0 }}
      >
        <LeftIcon size={baseSize * 48} color="white" />
      </button>

      <label
        style={{
          display: 'block',
          fontSize: `${baseSize * 30}px`,
          fontWeight: 'bold',
          textAlign: 'center'
        }}
      >
        动画素材缓存
      </label>

      {/* 更新日志切换按钮 */}
      {(gitInfo.dateIso || gitInfo.hash || gitInfo.message) && (
        <button
          onClick={() => setShowLog(v => !v)}
          style={{
            position: 'absolute',
            top: `${baseSize * 32}px`,
            right: `${baseSize * 32}px`,
            zIndex: 6,
            backgroundColor: '#334155',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            padding: `${baseSize * 8}px ${baseSize * 12}px`,
            cursor: 'pointer'
          }}
        >
          {showLog ? '隐藏更新日志' : '更新日志'}
        </button>
      )}

      {/* 更新日志 */}
      {showLog && (gitInfo.dateIso || gitInfo.hash || gitInfo.message) && (
        <div
          style={{
            padding: `${baseSize * 18}px`,
            backgroundColor: '#1f2937',
            borderRadius: '8px',
            border: '1px solid #374151',
            position: 'absolute',
            top: `${baseSize * 76}px`,
            right: `${baseSize * 32}px`,
            width: `${baseSize * 360}px`,
            zIndex: 5
          }}
        >
          <div style={{ fontSize: `${baseSize * 18}px`, color: '#d1d5db', lineHeight: 1.6 }}>
            {gitInfo.dateIso && <div>• 更新时间：{new Date(gitInfo.dateIso).toLocaleString()}</div>}
            {gitInfo.message && <div>• 更新说明：{gitInfo.message}</div>}
          </div>
        </div>
      )}

      <label
        style={{
          color: '#9ca3af',
          fontSize: `${baseSize * 18}px`,
          textAlign: isLandscape ? 'left' : 'center',
          marginTop: `${baseSize * 4}px`
        }}
      >
        解决各种视频音频播放很卡的问题，先点击“存储所有素材”按钮，存储完后点击“刷新网页”按钮，退出页面再开始抽卡
      </label>

      <div
        style={{
          display: 'flex',
          flexDirection: isLandscape ? 'row' : 'column',
          gap: `${baseSize * (isLandscape ? 28 : 20)}px`,
          alignItems: 'stretch',
          marginTop: `${baseSize * 12}px`
        }}
      >
        <div
          style={{
            flex: isLandscape ? '0 0 clamp(320px, 32vw, 420px)' : 'unset',
            width: isLandscape ? 'clamp(320px, 32vw, 420px)' : '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: `${baseSize * 16}px`
          }}
        >
          <div
            style={{
              padding: `${baseSize * 16}px`,
              backgroundColor: '#1f2937',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: `${baseSize * 16}px`
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isLandscape ? 'repeat(2, minmax(0, 1fr))' : 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: `${baseSize * 12}px`
              }}
            >
              <button
                onClick={handleStoreAll}
                disabled={status === 'storing'}
                style={{
                  padding: `${baseSize * 16}px`,
                  backgroundColor: status === 'storing' ? '#6b7280' : '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: status === 'storing' ? 'not-allowed' : 'pointer',
                  fontSize: `${baseSize * 16}px`,
                  fontWeight: 600
                }}
                onMouseEnter={(e) => {
                  if (status !== 'storing') {
                    e.target.style.backgroundColor = '#1d4ed8';
                  }
                }}
                onMouseLeave={(e) => {
                  if (status !== 'storing') {
                    e.target.style.backgroundColor = '#2563eb';
                  }
                }}
              >
                {status === 'storing' ? '存储中...' : '存储所有素材'}
              </button>

              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: `${baseSize * 16}px`,
                  backgroundColor: '#059669',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: `${baseSize * 16}px`,
                  fontWeight: 600
                }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = '#047857')}
                onMouseLeave={(e) => (e.target.style.backgroundColor = '#059669')}
              >
                刷新网页
              </button>

              <button
                onClick={handleClear}
                style={{
                  padding: `${baseSize * 16}px`,
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: `${baseSize * 16}px`,
                  fontWeight: 600
                }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = '#b91c1c')}
                onMouseLeave={(e) => (e.target.style.backgroundColor = '#dc2626')}
              >
                清空存储
              </button>

              <button
                onClick={() => onClose()}
                style={{
                  padding: `${baseSize * 16}px`,
                  backgroundColor: '#059669',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: `${baseSize * 16}px`,
                  fontWeight: 600
                }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = '#047857')}
                onMouseLeave={(e) => (e.target.style.backgroundColor = '#059669')}
              >
                开始抽卡
              </button>
            </div>

            {renderProgressBar()}

            {stats && (
              <div
                style={{
                  display: 'grid',
                  gap: `${baseSize * 0}px`,
                  backgroundColor: '#2d3748',
                  borderRadius: '8px',
                  padding: `${baseSize * 14}px`,
                  fontSize: `${baseSize * 16}px`
                }}
              >
                <span>总素材数: {stats.totalAssets}</span>
                <span>已完成: {stats.completedAssets}</span>
                <span>未完成: {stats.incompleteAssets}</span>
                <span>总大小: {(stats.totalSize / 1024 / 1024).toFixed(2)} MB</span>
              </div>
            )}
          </div>

          {renderFileSizeInfo()}

          <div
            style={{
              backgroundColor: '#1f2937',
              padding: `${baseSize * 14}px`,
              borderRadius: '12px',
              fontSize: `${baseSize * 16}px`,
              color: '#d1d5db',
              display: 'grid',
              gap: `${baseSize * 6}px`
            }}
          >
            <label
              style={{
                fontSize: `${baseSize * 18}px`,
                fontWeight: 600
              }}
            >
              调试信息
            </label>
            <span>当前状态: {status}</span>
            <span>进度: {progress}%</span>
            <pre
              style={{
                margin: 0,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                fontFamily: 'ui-monospace, SFMono-Regular, SFMono-Bold, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace',
                fontSize: `${baseSize * 14}px`,
                color: '#9ca3af'
              }}
            >
              {JSON.stringify(stats, null, 2)}
            </pre>
          </div>
        </div>

        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: `${baseSize * 20}px`,
            minHeight: 0
          }}
        >
          <div
            style={{
              backgroundColor: '#1f2937',
              padding: `${baseSize * 16}px`,
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: `${baseSize * 16}px`
            }}
          >
            <label
              style={{
                fontSize: `${baseSize * 20}px`,
                fontWeight: 600
              }}
            >
              视频
            </label>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isLandscape ? 'repeat(auto-fit, minmax(220px, 1fr))' : '1fr',
                gap: `${baseSize * 12}px`
              }}
            >
              {(fileSizeInfo?.assets?.video || []).map(v => {
                const name = v.path.replace(/^.*\//, '');
                return (
                  <div
                    key={v.path}
                    style={{
                      backgroundColor: '#111827',
                      padding: `${baseSize * 12}px`,
                      borderRadius: 8,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: `${baseSize * 8}px`
                    }}
                  >
                    <div style={{ color: '#d1d5db', fontSize: `${baseSize * 16}px` }}>{name}</div>
                    <Asset type="video" src={name} controls style={{ width: '100%', height: 'auto' }} />
                  </div>
                );
              })}
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#1f2937',
              padding: `${baseSize * 16}px`,
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: `${baseSize * 16}px`
            }}
          >
            <label
              style={{
                fontSize: `${baseSize * 20}px`,
                fontWeight: 600
              }}
            >
              音频
            </label>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isLandscape ? 'repeat(auto-fit, minmax(240px, 1fr))' : '1fr',
                gap: `${baseSize * 12}px`
              }}
            >
              {(fileSizeInfo?.assets?.audio || []).map(a => {
                const name = a.path.replace(/^.*\//, '');
                return (
                  <div
                    key={a.path}
                    style={{
                      backgroundColor: '#111827',
                      padding: `${baseSize * 12}px`,
                      borderRadius: 8,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: `${baseSize * 8}px`
                    }}
                  >
                    <div style={{ color: '#d1d5db', fontSize: `${baseSize * 16}px` }}>{name}</div>
                    <Asset type="audio" src={name} controls style={{ width: '100%' }} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 之前的复杂选择器已移除，现直接在上方按顺序列表展示。

export default AssetTest;
