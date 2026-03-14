import React, {useEffect, useState, useRef, useMemo} from 'react';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { useData } from './contexts/DataContext.jsx';
import useLocalStorageState from "./hooks/useLocalStorageState.js";
import SettingsLayer from "./components/SettingsLayer.jsx";
import DrawAnimationCards from "./components/DrawAnimationCards.jsx";
import CardOverlay from "./components/CardOverlay.jsx";
import HistoryModal from "./components/HistoryModal.jsx";
import CardSummary from "./components/CardSummary.jsx";
import CardPoolFilter from "./components/CardPoolFilter.jsx";
import {getAvailablePools, getDynamicAttributeCounts} from "./utils/cardDataUtils.js";
import GalleryFullImage from "./components/GalleryFullImage.jsx";
import DetailedImage from "./components/DetailedImage.jsx";
import GalleryPage from "./components/GalleryPage.jsx";
import useResponsiveFontSize from "./utils/useResponsiveFontSize.js";
import {useHistoryDB} from "./hooks/useHistoryDB.js";
import useCardImageIndex from "./hooks/useCardImageIndex.js";
import FilterPage from "./components/FilterPage.jsx";
import MusicPage from "./components/MusicPage.jsx";
import { Asset } from './components/Asset.jsx';
import { useAssetLoader } from './hooks/useAssetLoader.js';
import { setAssetLoader } from './utils/playClickSound.js';
import { initCacheManager } from './utils/cacheManager.js';


const Home = ({isPortrait, openAssetTest}) => {
    // 使用动态加载的数据
    const { cardData, poolCategories, songsList, loading: dataLoading } = useData();

    // 初始化缓存管理（检查域名变更等）
    useEffect(() => {
        initCacheManager();
    }, []);

    // 初始化 Asset Loader 并设置给 playClickSound
    const assetLoader = useAssetLoader();
    const faviconOriginalHrefRef = useRef(null);
    const faviconBlobUrlRef = useRef(null);
    useEffect(() => {
        setAssetLoader(assetLoader);
    }, [assetLoader]);

    useEffect(() => {
        if (!assetLoader) return;
        let cancelled = false;

        const updateFavicon = async () => {
            try {
                const iconUrl = await assetLoader.loadAsset('image', 'icon.jpg');
                if (!iconUrl || cancelled) return;
                const linkEl = document.querySelector("link[rel='icon']");
                if (!linkEl) return;
                if (!faviconOriginalHrefRef.current) {
                    faviconOriginalHrefRef.current = linkEl.href;
                }

                if (
                    faviconBlobUrlRef.current &&
                    faviconBlobUrlRef.current !== iconUrl &&
                    faviconBlobUrlRef.current.startsWith('blob:')
                ) {
                    try { URL.revokeObjectURL(faviconBlobUrlRef.current); } catch {}
                }

                linkEl.href = iconUrl;
                faviconBlobUrlRef.current = iconUrl.startsWith('blob:') ? iconUrl : null;
            } catch (err) {
                console.warn('更新网站图标失败：', err);
            }
        };

        updateFavicon();

        return () => {
            cancelled = true;
        };
    }, [assetLoader]);

    useEffect(() => {
        return () => {
            if (faviconBlobUrlRef.current && faviconBlobUrlRef.current.startsWith('blob:')) {
                try { URL.revokeObjectURL(faviconBlobUrlRef.current); } catch {}
            }
            if (faviconOriginalHrefRef.current) {
                const linkEl = document.querySelector("link[rel='icon']");
                if (linkEl) {
                    linkEl.href = faviconOriginalHrefRef.current;
                }
            }
        };
    }, []);

    // 加载serviceWorker
    if ('serviceWorker' in navigator) {
        let swRefreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (swRefreshing) return;
            swRefreshing = true;
            window.location.reload();
        });

        window.addEventListener('load', () => {
            // 注册 Service Worker，添加时间戳确保获取最新版本
            const swUrl = `service_worker.js?t=${Date.now()}`;
            navigator.serviceWorker
                .register(swUrl)
                .then((reg) => {
                    console.log('✅ SW registered:', reg);

                    // 启动时主动检查更新
                    reg.update();

                    // 检查 Service Worker 更新
                    reg.addEventListener('updatefound', () => {
                        const newWorker = reg.installing;
                        if (newWorker) {
                            newWorker.addEventListener('statechange', () => {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    // 有新版本可用，提示用户刷新
                                    console.log('🔄 发现新版本，建议刷新页面');
                                    if (reg.waiting) {
                                        reg.waiting.postMessage({ type: 'SKIP_WAITING' });
                                    } else {
                                        newWorker.postMessage({ type: 'SKIP_WAITING' });
                                    }
                                }
                            });
                        }
                    });

                    // 定期检查更新（每小时检查一次）
                    setInterval(() => {
                        reg.update();
                    }, 3600000); // 1小时

                    // 注销不同域名的旧 Service Worker
                    navigator.serviceWorker.getRegistrations().then((registrations) => {
                        registrations.forEach((registration) => {
                            const expectedScope = location.origin + '/';
                            if (registration.scope !== expectedScope) {
                                registration.unregister().then((success) => {
                                    console.log('🗑️ Unregistered old SW:', registration.scope, success);
                                });
                            }
                        });
                    });
                })
                .catch((err) => {
                    console.error('❌ SW registration failed:', err);
                });
        });
    }



    const { valuesList } = useMemo(() => {
        return getDynamicAttributeCounts(cardData);
    }, [cardData]);

    const { availablePools, permanentPools } = useMemo(
        () => getAvailablePools(cardData),
        [cardData]
    );
    const chargePoolSet = useMemo(() => {
        const entries = poolCategories?.recharge?.cards || [];
        const pools = new Set();
        entries.forEach(entry => {
            const card = cardData.find(item => item.卡名 === entry.name);
            const pool = card?.获取途径 || entry.pool;
            if (pool) pools.add(pool);
        });
        return pools;
    }, [cardData]);
    const allPools = [...permanentPools, ...availablePools];



    // ======================================================== 数据存储与恢复
    // 总抽卡数
    const [totalDrawCount, setTotalDrawCount] = useLocalStorageState('bw_totalDrawCount', 0);
    // 选择的角色
    const [selectedRole, setSelectedRole] = useLocalStorageState('bw_selectedRole', ['随机']);
    // 选择的池子
    const [selectedPools, setSelectedPools, poolsLoading] = useLocalStorageState("bw_selectedPools", allPools);
    // 总出金数
    const [totalFiveStarCount, setTotalFiveStarCount] = useLocalStorageState('bw_totalFiveStarCount', 0);
    // 下次出金还需要多少
    const [pityCount, setPityCount] = useLocalStorageState('bw_pityCount', 0);
    // 是否开启大小保底机制
    const [useSoftGuarantee, setUseSoftGuarantee] = useLocalStorageState('bw_useSoftGuarantee', true);
    // 目前是小保底还是大保底
    const [softPityFailed, setSoftPityFailed] = useLocalStorageState('bw_softPityFailed', false);
    // 是否包括星卡
    const [includeThreeStar, setIncludeThreeStar] = useLocalStorageState('bw_includeThreeStar', true);
    // 是否包括辰星卡
    const [includeThreeStarM, setIncludeThreeStarM] = useLocalStorageState('bw_includeThreeStar', true);
    // 是否包括崩坍和累充
    const [includeMoneyCard, setIncludeMoneyCard] = useLocalStorageState("bw_includeMoneyCard", true);
    // 是否只抽当前角色的卡
    const [onlySelectedRoleCard, setOnlySelectedRoleCard] = useLocalStorageState('bw_onlySelectedRoleCard', false);
    // 历史记录
    const { history, loading, appendHistory, clearHistory } = useHistoryDB();
    // 图鉴记录卡面是初始还是重逢
    const { getImageIndex, setImageIndex, clearImageIndexes } = useCardImageIndex();

    const [gallerySelectedRole, setGallerySelectedRole] = useLocalStorageState("bw_gallerySelectedRole", 4);
    // const [gallerySelectedRole, setGallerySelectedRole] = useState(4);

    const [orderChoice, setOrderChoice] = useLocalStorageState("bw_orderChoice", 0);

    const [rarityChoice, setRarityChoice] = useLocalStorageState("bw_rarityChoice", ["全部"]);

    const [worldChoice, setWorldChoice] = useLocalStorageState("bw_worldChoice", ["全部"]);

    const [typeChoice, setTypeChoice] = useLocalStorageState("bw_typeChoice", ["全部"]);

    const [musicID, setMusicID] = useLocalStorageState("bw_musicID", songsList && songsList.length > 0 ? songsList[0]["id"].slice(0,10) : "")
    const showVideoButtons = true;
    const [simulationResult, setSimulationResult] = useState(null);
    const [simulationStatus, setSimulationStatus] = useState('idle');
    const [showSimulationModal, setShowSimulationModal] = useState(false);


    // 清除缓存数据
    const keysToClear = [
        'bw_totalDrawCount',
        'bw_selectedRole',
        'bw_selectedPools',
        'bw_totalFiveStarCount',
        'bw_pityCount',
        'bw_useSoftGuarantee',
        'bw_softPityFailed',
        'bw_includeThreeStar',
        'bw_includeThreeStarM',
        'bw_includeMoneyCard',
        'bw_onlySelectedRoleCard',
        'bw_gallerySelectedRole', // 在图鉴里选择了哪个角色
        'bw_orderChoice',
        'bw_rarityChoice',
        'bw_worldChoice',
        'bw_typeChoice',
        'bw_musicID',
    ];

    const clearLocalData = () => {
        keysToClear.forEach(key => localStorage.removeItem(key));
        clearHistory();
        clearImageIndexes();
        location.reload();
    };


    // ======================================================== 其余变量
    const [currentCardIndex, setCurrentCardIndex] = useState(0); // 当前的卡片索引
    const [cards, setCards] = useState([]); // 存储抽卡后的卡片信息
    const [drawnCards, setDrawnCards] = useState([]); // 存储已抽到的卡片的数组
    const drawResultsRef = useRef([]); // 引用存储抽卡结果的数组，避免重新渲染时丢失数据，保存每次抽卡的结果，以便后续处理和展示

    const roles = ['随机', ...new Set(cardData.map(card => card.主角))]; // 存储可选择的角色列表

    const drawSessionIdRef = useRef(0); // 全局流程控制 ID，抽卡直接出现结果的bug
    const [isDrawing, setIsDrawing] = useState(false); // 防止重复抽卡

    const [isSkipped, setIsSkipped] = useState(false); // 设置跳过视频的状态
    const isSingleDraw = drawnCards.length === 1; //是否是一抽，一抽的话不要显示跳过按钮

    const currentPityRef = useRef(0); // 引用存储当前保底计数器的值，在每次抽卡时更新，用于确定保底是否触发
    const currentFourStarRef = useRef(0); // 四星保底计数器的值

    const [showHistory, setShowHistory] = useState(false); // 是否显示抽卡历史
    const [isAnimatingDrawCards, setisAnimatingDrawCards] = useState(false); // 是否正在进行抽卡动画

    const [isFiveStar, setIsFiveStar] = useState(false); // 判断当前卡片是否五星卡片
    const [hasFiveStarAnimation, setHasFiveStarAnimation] = useState(false); // 一抽或十抽里是否包含五星卡

    const displayResultsRef = useRef([]); // 跳过时展示的卡片

    const [lastFiveStarWasTarget, setLastFiveStarWasTarget] = useState(true); // 上一次五星是否是定向角色


    const [showCardOverlay, setShowCardOverlay] = useState(false); // 控制是否显示卡片结果的覆盖层，为true时展示抽到的卡片

    const [showSummary, setShowSummary] = useState(false); // 是否显示结算十抽的卡片
    const [summaryCards, setSummaryCards] = useState([]); // 存储结算十抽的卡片
    const [hasShownSummary, setHasShownSummary] = useState(false); // 是否已经展示过结算页面
    const [showGallery, setShowGallery] = useState(false); // 是否展示图鉴
    const [showProbability, setShowProbability] = useState(false); // 是否展示概率测试界面

    const [galleryHistory, setGalleryHistory] = useState([]);  // 图鉴历史

    const [showCardPoolFilter, setShowCardPoolFilter] = useState(false); // 展示筛选页面

    const [detailedImage, setDetailedImage] = useState(null); // 轮播图的内容设置
    const [showDetailedImage, setShowDetailedImage] = useState(false); // 是否展示轮播图
    const [showGalleryFullImage, setShowGalleryFullImage] = useState(false); // 图鉴图片的内容设置
    const [galleryCard, setGalleryCard] = useState(null);


    const [showFilterPage, setShowFilterPage] = useState(false);  // 是否显示选图鉴展示的大界面

    const fontsize = useResponsiveFontSize({scale: 0.9});

    const [sortedCards, setSortedCards] = useState([]);

    const [showMusicPageZIndex, setShowMusicPageZIndex] = useState(-1);


    // 属性取值统计
    // const countFieldValues = (cards, field) => {
    //   const countMap = {};
    //
    //   cards.forEach(card => {
    //     const value = card[field];
    //     if (value != null) {
    //       countMap[value] = (countMap[value] || 0) + 1;
    //     }
    //   });
    //
    //   return countMap;
    // };
    // console.log(countFieldValues(cardData, "来源"))




    // ========================================================  用于抽卡动画相关
    const [showAnimationDrawCards, setShowAnimationDrawCards] = useState(false);

    // ------------------------------- 每次抽卡开始时触发动画组件加载
    const handleStartDraw = () => {
        setShowAnimationDrawCards(true);
    };


    // ------------------------------- 抽卡动画播放完成后的处理逻辑
    const handleDrawCardsAnimationEnd = async () => {
        const finalResults = drawResultsRef.current;
        const finalPity = currentPityRef.current;

        setPityCount(finalPity);
        setCards(finalResults.map(r => r.card));

        // 这里初始化图片索引
        finalResults.forEach(({ card }) => {
            const currentIndex = getImageIndex(card.卡名);
            if (currentIndex === undefined || currentIndex === null) {
                setImageIndex(card.卡名, 0);
            }
        });


        // 保存到 IndexedDB 中
        const newEntries = finalResults.map(r => ({
            卡名: r.card.卡名,
            主角: r.card.主角,
            稀有度: r.card.稀有度,
            获取途径: r.card.获取途径,
            timestamp: new Date().toISOString(),
        }));

        await appendHistory(newEntries); // 自动维护 100000 条限制

        // 立即更新galleryHistory，不等待history的异步更新
        const enriched = newEntries
            .map((entry) => {
                const fullCard = cardData.find((card) => card.卡名 === entry.卡名);
                return fullCard ? { ...fullCard, timestamp: entry.timestamp } : null;
            })
            .filter(Boolean);
        
        setGalleryHistory(prev => {
            const combined = [...prev, ...enriched];
            return removeDuplicates(combined);
        });

        setShowAnimationDrawCards(false);
        setisAnimatingDrawCards(false);
    };



    // // ======================================================== 首次进入对话框
    // const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);
    
    // useEffect(() => {
    //     // 检查是否是第一次进入
    //     let hasShownWelcome = localStorage.getItem('bw_welcomeShown');
    //     if (hasShownWelcome === null) {
    //         localStorage.setItem('bw_welcomeShown', 'false');
    //         hasShownWelcome = 'false';
    //     }
    //     if (hasShownWelcome !== 'true') {
    //         setShowWelcomeDialog(true);
    //     }
    // }, []);

    // const handleWelcomeDialogClose = () => {
    //     setShowWelcomeDialog(false);
    //     localStorage.setItem('bw_welcomeShown', 'true');
    //     localStorage.clear();
    //     localStorage.setItem('bw_welcomeShown', 'true');
    //     clearHistory();
    // };

    // ======================================================== 图鉴相关
    // ------------------------------- 去重逻辑
    const removeDuplicates = (arr) => {
        const seen = new Set();
        return arr.filter((item) => {
            const key = item.卡名;
            const isDup = seen.has(key);
            seen.add(key);
            return !isDup;
        });
    };

    // ------------------------------- 初始化 galleryHistory
    useEffect(() => {
        if (!loading && history.length > 0) {
            // 合并精简记录和完整卡牌数据
            const enriched = history
                .map((entry) => {
                    const fullCard = cardData.find((card) => card.卡名 === entry.卡名);
                    return fullCard ? { ...fullCard, timestamp: entry.timestamp } : null;
                })
                .filter(Boolean); // 移除找不到的

            const uniqueHistory = removeDuplicates(enriched);
            setGalleryHistory(uniqueHistory);
        }
    }, [loading, history]);



    // ======================================================== 输出当前卡片信息
    useEffect(() => {
        const card = drawResultsRef.current[currentCardIndex]?.card;
        if (card) {
            console.log('当前展示卡片：', {
                名称: card.卡名,
                角色: card.主角,
                星级: card.稀有度,
            });
        }
    }, [currentCardIndex]);



    // ======================================================== 判断当前卡片是不是五星
    useEffect(() => {
        const card = drawResultsRef.current[currentCardIndex]?.card;
        if (card?.star === '世界' || card?.稀有度 === '刹那') {
          setIsFiveStar(true); // 是五星卡片或刹那卡片
        } else {
          setIsFiveStar(false); // 不是五星卡片，直接展示卡片
        }
    }, [currentCardIndex]);



    // ======================================================== 抽卡动画结束后开始展示卡片
    // ------------------------------- 控制卡片展示或结算页展示
    useEffect(() => {
        const allResults = drawResultsRef.current || [];

        if (
            allResults.length > 0 &&
            !hasShownSummary &&
            !isDrawing &&
            !isAnimatingDrawCards &&
            !showAnimationDrawCards
        ) {
            if (isSkipped) {
                // 跳过时只展示 displayResultsRef 里的卡
                if (displayResultsRef.current.length === 0) {
                    setShowCardOverlay(false);
                    setShowSummary(true);
                    setHasShownSummary(true);
                } else {
                    setCurrentCardIndex(0);
                    setShowCardOverlay(true);
                    setShowSummary(false);
                }
            } else {
                displayResultsRef.current = allResults;
                setCurrentCardIndex(0);
                setShowCardOverlay(true);
                setShowSummary(false);
            }
        }
    }, [isSkipped, showAnimationDrawCards, isDrawing, isAnimatingDrawCards, hasShownSummary]);



    // ------------------------------- 每次点下一张卡时都先重置视频播放状态
    const handleNextCard = () => {
        if (showSummary) return;
        if (currentCardIndex < displayResultsRef.current.length - 1) {
            setCurrentCardIndex(currentCardIndex + 1);
        } else {
            setShowCardOverlay(false);
            setSummaryCards(drawnCards);
            if (!hasShownSummary) {
                setShowSummary(true);
                setHasShownSummary(true);
            }
            // ✅ Reset skip flag only here
            if (isSkipped) setIsSkipped(false);
        }
    };

    const handleSkip = () => {
        const allResults = drawResultsRef.current || [];
        const remainingResults = allResults.slice(currentCardIndex); // ✅ 当前之后的卡

        // 提取剩下未展示卡中的五星
        const fiveStarCards = remainingResults
            .map(item => item.card)
            .filter(card => card?.稀有度 === '世界' || card?.稀有度 === '刹那');

        // 加上当前这张卡（如果是五星）作为第一张
        const currentCard = allResults[currentCardIndex]?.card;
        if (currentCard?.稀有度 === '世界' || currentCard?.稀有度 === '刹那') {
            fiveStarCards.unshift(currentCard);
        }

        // 去重：用“名称 + 编号”作为唯一 key
        const seen = new Set();
        const uniqueFiveStars = [];
        for (const card of fiveStarCards) {
            const key = `${card?.卡名 || ''}-${card?.主角 || ''}`;
            if (!seen.has(key)) {
                seen.add(key);
                uniqueFiveStars.push({ card }); // 保持结构一致
            }
        }

        if (uniqueFiveStars.length === 0) {
            // 没有五星卡，直接结算
            setShowCardOverlay(false);
            setShowSummary(true);
            setHasShownSummary(true);
            setIsSkipped(false);
            setCurrentCardIndex(0);
            displayResultsRef.current = [];
        } else {
            // 展示唯一的五星卡（未展示过 + 当前卡）
            displayResultsRef.current = uniqueFiveStars;
            setCurrentCardIndex(0);
            setShowCardOverlay(true);
            setShowSummary(false);
            setHasShownSummary(false);
            setIsSkipped(true);
        }
    };


    useEffect(() => {
        if (isSkipped && currentCardIndex >= displayResultsRef.current.length) {
            setShowCardOverlay(false);
            setIsSkipped(false);
            setCurrentCardIndex(0);
            // 展示结算
            setShowSummary(true);
            setHasShownSummary(true);
        }
    }, [isSkipped, currentCardIndex]);



    useEffect(()=>{
        drawResultsRef.current.forEach((item, index) => {
            console.log(`第 ${index + 1} 张卡:\t`, item.rarity, "\t", item.card.卡名);
        });
    },[history.length])



    // 抽卡逻辑
    const handleDraw = async (count) => {
      if (isDrawing || isAnimatingDrawCards) return;

      setIsDrawing(true);
      setisAnimatingDrawCards(true);

      const currentDrawId = Date.now();
      drawSessionIdRef.current = currentDrawId;

      setShowSummary(false);
      setShowCardOverlay(false);
      setHasShownSummary(false);
      setCurrentCardIndex(0);
      setIsSkipped(false);
      displayResultsRef.current = [];
      drawResultsRef.current = [];

      let drawResults = [];
      let currentPity = pityCount;
      let currentFourStarCounter = currentFourStarRef.current;
      let localSoftPityFailed = softPityFailed;

      for (let i = 0; i < count; i++) {
        let result;
        let rarity;

        const isAllRoles = selectedRole.includes('随机');
        const isGuaranteedMode = useSoftGuarantee && !onlySelectedRoleCard && !isAllRoles;

        let forceGuaranteeMode = null;

        if (isGuaranteedMode) {
          forceGuaranteeMode = localSoftPityFailed ? 'hard' : 'soft';
        }

        // 十抽保底机制：每十抽必出月卡及以上
        const isTenDrawGuarantee = (i + 1) % 10 === 0 && 
          drawResults.filter(r => r.rarity === '月' || r.rarity === '瞬' || r.rarity === '世界' || r.rarity === '刹那').length === 0;

        // 调用抽卡
        do {
          result = getRandomCard(
            currentPity,
            currentFourStarCounter,
            selectedRole,
            onlySelectedRoleCard,
            includeThreeStar,
            includeThreeStarM,
            selectedPools,
            cardData,
            forceGuaranteeMode,
            isTenDrawGuarantee
          );
          rarity = result.rarity;
        } while ((rarity === '星' && !includeThreeStar) || (rarity === '辰星' && !includeThreeStarM));

        // 更新保底状态
        if (rarity === '世界' || rarity === '刹那') {
          currentPity = 0;
          currentFourStarCounter = 0;

          if (isGuaranteedMode) {
            const limitedPools = selectedPools.filter(pool => pool !== "世界之间" && !chargePoolSet.has(pool));
            const chargeSelectedPools = selectedPools.filter(pool => chargePoolSet.has(pool));
            if(limitedPools.length > 0 || chargeSelectedPools.length > 0){
                const targetPools = limitedPools.length > 0 ? limitedPools : chargeSelectedPools;
                const gotTarget = result.card && selectedRole.includes(result.card.主角) && targetPools.includes(result.card.获取途径);
                localSoftPityFailed = !gotTarget;
            } else {
                const gotTarget = result.card && selectedRole.includes(result.card.主角) && permanentPools.includes(result.card.获取途径);
                localSoftPityFailed = !gotTarget;
            }
          }
        } else {
          currentPity++;
          currentFourStarCounter = (rarity === '月' || rarity === '瞬') ? 0 : currentFourStarCounter + 1;
        }

        drawResults.push(result);
        setTotalDrawCount(prev => prev + 1);
        if (rarity === '世界' || rarity === '刹那') {
          setTotalFiveStarCount(prev => prev + 1);
        }
      }

      // 状态更新
      setIsDrawing(false);
      drawResultsRef.current = drawResults;
      currentPityRef.current = currentPity;
      currentFourStarRef.current = currentFourStarCounter;
      setSoftPityFailed(localSoftPityFailed);
      setHasFiveStarAnimation(drawResults.some(r => r.rarity === '世界' || r.rarity === '刹那'));
      setShowAnimationDrawCards(true);
      setDrawnCards(drawResults.map(r => r.card).filter(Boolean));
    };



    const getRandomCard = (
      pity,
      fourStarCounter,
      selectedRole = ['随机'],
      onlySelectedRoleCard = false,
      includeThreeStar = true,
      includeThreeStarM = true,
      selectedPools = ['全部'],
      cardData = [],
      forceGuaranteeMode = null, // 'soft' | 'hard' | null
      isTenDrawGuarantee = false // 新增参数，表示是否是十抽保底
    ) => {
      let rarity;
      let pool = cardData;
      const roll = Math.random() * 100;

      const isAllPools = selectedPools.includes('全部');
      const isAllRoles = selectedRole.includes('随机');
      const limitedPools = selectedPools.filter(pool => pool !== "世界之间" && !chargePoolSet.has(pool));
      const chargeSelectedPools = selectedPools.filter(pool => chargePoolSet.has(pool));
      const excludedKeywords = ["崩坍", "累充", "活动", "奇遇瞬间"];
      const allowPaidCards = includeMoneyCard || chargeSelectedPools.length > 0;

      const applyPaidFilter = (list) => {
        if (allowPaidCards) return list;
        return list.filter(card => !excludedKeywords.some(keyword => card.获取途径.includes(keyword)));
      };

      const buildFiveStarPool = (targetRarity) => {
        if (!['世界', '刹那'].includes(targetRarity)) return [];

        const selectWithRoleAndPool = (predicate) =>
          cardData.filter(card =>
            card.稀有度 === targetRarity &&
            predicate(card)
          );

        let result;
        const isAllRolesSelected = selectedRole.includes('随机');
        const isRoleSelected = (card) => isAllRolesSelected || selectedRole.includes(card.主角);
        const isRoleUnselected = (card) => !isAllRolesSelected && !selectedRole.includes(card.主角);
        const preferredLimitedPools = limitedPools.length > 0
          ? limitedPools
          : (chargeSelectedPools.length > 0 ? chargeSelectedPools : selectedPools);

        if (forceGuaranteeMode === 'hard') {
          if (limitedPools.length > 0) {
            result = selectWithRoleAndPool(card =>
              limitedPools.includes(card.获取途径) &&
              isRoleSelected(card)
            );
          } else if (chargeSelectedPools.length > 0) {
            result = selectWithRoleAndPool(card =>
              chargeSelectedPools.includes(card.获取途径) &&
              isRoleSelected(card)
            );
          } else {
            result = selectWithRoleAndPool(card =>
              selectedPools.includes(card.获取途径) &&
              isRoleSelected(card)
            );
          }
        } else if (forceGuaranteeMode === 'soft') {
          result = selectWithRoleAndPool(card =>
            permanentPools.includes(card.获取途径) ||
            (preferredLimitedPools.includes(card.获取途径) && isRoleUnselected(card))
          );
        } else if (!isAllRoles) {
          if (onlySelectedRoleCard) {
            result = selectWithRoleAndPool(card =>
              selectedRole.includes(card.主角) &&
              (isAllPools || selectedPools.includes(card.获取途径))
            );
          } else if (limitedPools.length > 0) {
            result = selectWithRoleAndPool(card =>
              selectedRole.includes(card.主角) &&
              limitedPools.includes(card.获取途径)
            );
          } else if (chargeSelectedPools.length > 0) {
            result = selectWithRoleAndPool(card =>
              selectedRole.includes(card.主角) &&
              chargeSelectedPools.includes(card.获取途径)
            );
          } else {
            result = selectWithRoleAndPool(card =>
              selectedRole.includes(card.主角) &&
              selectedPools.includes(card.获取途径)
            );
          }
        } else {
          if (limitedPools.length > 0) {
            result = selectWithRoleAndPool(card =>
              limitedPools.includes(card.获取途径)
            );
          } else if (chargeSelectedPools.length > 0) {
            result = selectWithRoleAndPool(card =>
              chargeSelectedPools.includes(card.获取途径)
            );
          } else {
            result = selectWithRoleAndPool(card =>
              selectedPools.includes(card.获取途径)
            );
          }
        }

        return applyPaidFilter(result);
      };

      const buildFourStarPool = (targetRarity) => {
        if (!['月', '瞬'].includes(targetRarity)) return [];
        let result = cardData.filter(card => card.稀有度 === targetRarity);
        if (onlySelectedRoleCard && !isAllRoles) {
          result = result.filter(card => selectedRole.includes(card.主角));
        }
        return applyPaidFilter(result);
      };

      const buildLowStarPool = (targetRarity) => {
        if (!['星', '辰星'].includes(targetRarity)) return [];

        let result;
        if (onlySelectedRoleCard && selectedRole[0] !== "随机") {
          result = cardData.filter(card =>
            ((includeThreeStarM && card.稀有度 === "辰星") ||
              (includeThreeStar && card.稀有度 === "星")) &&
            selectedRole.includes(card.主角)
          );
        } else {
          result = cardData.filter(card =>
            (includeThreeStarM && card.稀有度 === "辰星") ||
            (includeThreeStar && card.稀有度 === "星")
          );
        }

        const filtered = result.filter(card => card.稀有度 === targetRarity);
        if (targetRarity === '辰星' && includeThreeStarM) {
          return filtered;
        }
        return applyPaidFilter(filtered);
      };

      // 五星概率（动态）
      let dynamicFiveStarRate = 2;
      if (pity > 60) {
        dynamicFiveStarRate = 2 + (pity - 59) * 10;
      }

      const fourStarRate = 10;

      // 判断稀有度
      if (isTenDrawGuarantee) {
        // 十抽保底：必出四星（瞬/月）
        rarity = includeMoneyCard ? (Math.random() < 0.2 ? '瞬' : '月') : '月';
      } else if (fourStarCounter >= 9) {
        // 四星保底时，在"世界"和"刹那"之间随机选择
        if (roll < dynamicFiveStarRate) {
          rarity = Math.random() < 0.2 ? '刹那' : '世界';
        } else {
          // 四星：若未包含“崩坍累充”，则不出“瞬”，只出“月”；否则 瞬/月 等概率
          rarity = includeMoneyCard ? (Math.random() < 0.2 ? '瞬' : '月') : '月';
        }
      } else if (roll < dynamicFiveStarRate) {
        // 非保底时，在"世界"和"刹那"之间随机选择
        rarity = Math.random() < 0.2 ? '刹那' : '世界';
      } else if (roll < dynamicFiveStarRate + fourStarRate) {
        // 四星：若未包含“崩坍累充”，则不出“瞬”，只出“月”；否则 瞬/月 等概率
        rarity = includeMoneyCard ? (Math.random() < 0.2 ? '瞬' : '月') : '月';
      } else {
        // rarity = '星'; // 星或辰星统一为稀有度"星"
        // 单独判断辰星/星星
        const lowRoll = Math.random();
        if (includeThreeStarM && !includeThreeStar) {
          rarity = '辰星';
        } else if (includeThreeStar && !includeThreeStarM) {
          rarity = '星';
        } else {
          // 如果都选了，随机一个
          rarity = lowRoll < 0.2 ? '辰星' : '星';
        }
      }

      // 筛选卡池
      if (rarity === '刹那' || rarity === '世界') {
        pool = buildFiveStarPool(rarity);
        if (pool.length === 0) {
          const altRarity = rarity === '刹那' ? '世界' : '刹那';
          const altPool = buildFiveStarPool(altRarity);
          if (altPool.length === 0) return { card: null, rarity };
          pool = altPool;
          rarity = altRarity;
        }
        const chargeCandidates = chargeSelectedPools.length > 0
          ? pool.filter(card => chargePoolSet.has(card.获取途径))
          : [];
        const finalCandidates = chargeCandidates.length > 0 ? chargeCandidates : pool;
        const chosen = finalCandidates[Math.floor(Math.random() * finalCandidates.length)];
        return { card: chosen, rarity };
      } else if (rarity === '月' || rarity === '瞬') {
        pool = buildFourStarPool(rarity);
        if (pool.length === 0) return { card: null, rarity };
        const chosen = pool[Math.floor(Math.random() * pool.length)];
        return { card: chosen, rarity };
      }

      // 星 / 辰星
      pool = buildLowStarPool(rarity);

      if (pool.length === 0) {
        // 逐级回退：优先月卡，再尝试世界/刹那
        const fallbackOrder = ['月', '世界'];
        for (const fallback of fallbackOrder) {
          if (fallback === '月') {
            const fallbackPool = buildFourStarPool('月');
            if (fallbackPool.length > 0) {
              pool = fallbackPool;
              rarity = '月';
              break;
            }
          } else {
            let fallbackPool = buildFiveStarPool('世界');
            let fallbackRarity = '世界';
            if (fallbackPool.length === 0) {
              fallbackPool = buildFiveStarPool('刹那');
              fallbackRarity = '刹那';
            }
            if (fallbackPool.length > 0) {
              pool = fallbackPool;
              rarity = fallbackRarity;
              break;
            }
          }
        }
      }

      if (pool.length === 0) return { card: null, rarity };
      const chosen = pool[Math.floor(Math.random() * pool.length)];
      return { card: chosen, rarity };
    };

    const simulateProbability = (defaultDraws = 10000) => {
      const drawInput = window.prompt('模拟抽卡次数（默认140）', String(defaultDraws));
      if (drawInput === null) return;
      const drawCount = Math.max(1, parseInt(drawInput || String(defaultDraws), 10));
      setShowSimulationModal(false);
      setSimulationResult(null);
      setSimulationStatus('running');

      setTimeout(() => {
        let pity = 0;
        let fourCounter = 0;
        let localSoft = softPityFailed;
        let totalFiveStar = 0;
        let totalWorld = 0;
        let totalInstant = 0;
        let totalMoon = 0;
        let totalInstantFourStar = 0;
        let totalStar = 0;
        const worldCounts = {};
        const instantCounts = {};
        let totalOff = 0;
        const offCounts = {};
        const offPermanentCounts = {};
        const roleOrder = ['顾时夜', '易遇', '柏源', '夏萧因'];
        const limitedPools = selectedPools.filter((pool) => pool !== '世界之间' && !chargePoolSet.has(pool));
        const chargeSelectedPools = selectedPools.filter((pool) => chargePoolSet.has(pool));
        const hasPoolTarget = limitedPools.length > 0 || chargeSelectedPools.length > 0;
        const targetPools = hasPoolTarget ? (limitedPools.length > 0 ? limitedPools : chargeSelectedPools) : [];
        const hasRoleTarget = !selectedRole.includes('随机') && selectedRole.length < roleOrder.length;
        const shouldTrackOff = useSoftGuarantee && (hasPoolTarget || hasRoleTarget);
        const hasGuaranteedMode = shouldTrackOff;
        const runResults = [];

        for (let i = 0; i < drawCount; i += 1) {
          const isAllRoles = selectedRole.includes('随机');
          const isGuaranteedMode = useSoftGuarantee && !onlySelectedRoleCard && (hasPoolTarget || !isAllRoles);
          const isRoleSelected = (card) => isAllRoles || selectedRole.includes(card.主角);
          let forceMode = null;
          if (isGuaranteedMode) {
            forceMode = localSoft ? 'hard' : 'soft';
          }

          const hasHighBefore = runResults.filter((rarity) =>
            rarity === '月' || rarity === '瞬' || rarity === '世界' || rarity === '刹那'
          ).length > 0;
          const isTenDrawGuarantee = ((i + 1) % 10 === 0) && !hasHighBefore;

          const result = getRandomCard(
            pity,
            fourCounter,
            selectedRole,
            onlySelectedRoleCard,
            includeThreeStar,
            includeThreeStarM,
            selectedPools,
            cardData,
            forceMode,
            isTenDrawGuarantee
          );

          const { rarity } = result;
          runResults.push(rarity);

          if (rarity === '世界' || rarity === '刹那') {
            totalFiveStar += 1;
            pity = 0;
            fourCounter = 0;

            if (rarity === '世界') {
              totalWorld += 1;
              const roleName = result.card && result.card.主角;
              if (roleName) {
                worldCounts[roleName] = (worldCounts[roleName] || 0) + 1;
              }
            } else if (rarity === '刹那') {
              totalInstant += 1;
              const roleName = result.card && result.card.主角;
              if (roleName) {
                instantCounts[roleName] = (instantCounts[roleName] || 0) + 1;
              }
            }

            if (isGuaranteedMode) {
              let gotTarget = false;
              if (hasPoolTarget) {
                gotTarget = result.card
                  && isRoleSelected(result.card)
                  && targetPools.includes(result.card.获取途径);
                localSoft = !gotTarget;
              } else {
                gotTarget = result.card
                  && isRoleSelected(result.card)
                  && permanentPools.includes(result.card.获取途径);
                localSoft = !gotTarget;
              }
            }

            if (shouldTrackOff && result.card && result.card.主角) {
              const roleHit = !hasRoleTarget || selectedRole.includes(result.card.主角);
              const poolHit = !hasPoolTarget || targetPools.includes(result.card.获取途径);
              if (!roleHit || !poolHit) {
                totalOff += 1;
                const offRole = result.card.主角;
                offCounts[offRole] = (offCounts[offRole] || 0) + 1;
                if (permanentPools.includes(result.card.获取途径)) {
                  offPermanentCounts[offRole] = (offPermanentCounts[offRole] || 0) + 1;
                }
              }
            }
          } else {
            pity += 1;
            if (rarity === '月') {
              totalMoon += 1;
            } else if (rarity === '瞬') {
              totalInstantFourStar += 1;
            } else if (rarity === '星' || rarity === '辰星') {
              totalStar += 1;
            }
            if (rarity === '月' || rarity === '瞬') {
              fourCounter = 0;
            } else {
              fourCounter += 1;
            }
          }
        }

        const averageInterval = totalFiveStar > 0 ? (drawCount / totalFiveStar).toFixed(2) : '∞';
        const totalFiveStarCards = totalWorld + totalInstant;
        const roleStats = roleOrder.map((role) => {
          const count = (worldCounts[role] || 0) + (instantCounts[role] || 0);
          const percent = totalFiveStarCards > 0 ? ((count / totalFiveStarCards) * 100).toFixed(2) : '0.00';
          return { role, count, percent };
        });
        const offStats = roleOrder.map((role) => {
          const count = offCounts[role] || 0;
          const roleTotal = (worldCounts[role] || 0) + (instantCounts[role] || 0);
          const percent = roleTotal > 0 ? ((count / roleTotal) * 100).toFixed(2) : '0.00';
          const offPermanent = offPermanentCounts[role] || 0;
          const offLimited = Math.max(0, count - offPermanent);
          return { role, count, percent, offPermanent, offLimited };
        });
        const offRate = totalFiveStarCards > 0 ? ((totalOff / totalFiveStarCards) * 100).toFixed(2) : '0.00';
        setSimulationResult({
          drawCount,
          totalFiveStar,
          averageInterval,
          totalWorld,
          totalInstant,
          totalMoon,
          totalInstantFourStar,
          totalStar,
          roleStats,
          hasGuaranteedMode,
          totalOff,
          offRate,
          offStats
        });
        setSimulationStatus('done');
        setShowSimulationModal(true);
      }, 50);
    };





    // ======================================= 获取容器尺寸（16:9下）
    const [baseSize, setBaseSize] = useState(1);
    const divRef = useRef(null); // 获取当前绑定的容器的尺寸

    useEffect(() => {
        const updateSize = () => {
            if (divRef.current) {
                const width = divRef.current.clientWidth;
                const height = divRef.current.clientHeight;

                if (height > 0) {
                    const newBaseSize = width / 375;
                    setBaseSize(newBaseSize);
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





    // ========================================================
    // 返回数据时显示的页面
    return (
        <div className="w-full h-full relative overflow-hidden" style={{backgroundColor: 'black'}} ref={divRef}>

            {/* 背景层（最底层） */}
            <Asset
                src="background1.png"
                type="image"
                alt="background"
                className="absolute top-0 left-0 w-full h-full object-cover z-0"
            />


            {/* 抽卡动画层 */}
            {showAnimationDrawCards && (
                <DrawAnimationCards
                    isFiveStar={hasFiveStarAnimation}
                    onAnimationEnd={handleDrawCardsAnimationEnd}
                />
            )}

            {/*十抽后结算层*/}
            {showSummary && drawResultsRef.current.length > 1 && (
                <CardSummary
                    drawResults={drawResultsRef.current}  // 传递卡片数据
                    onClose={() => setShowSummary(false)}  // 关闭总结页面的回调
                    setHasShownSummary={setHasShownSummary}
                    setShowSummary={setShowSummary}
                    handleDraw={handleDraw}
                    handleStartDraw={handleStartDraw}
                    fontsize={fontsize}
                />
            )}

            {/*抽卡展示卡片*/}
            <CardOverlay
                showCardOverlay={showCardOverlay}
                currentCardIndex={currentCardIndex}
                setCurrentCardIndex={setCurrentCardIndex}
                drawResultsRef={displayResultsRef}
                handleNextCard={handleNextCard}
                fontsize={fontsize}
                handleSkip={handleSkip}
            />

            {/*展示历史记录*/}
            <HistoryModal
                showHistory={showHistory}
                setShowHistory={setShowHistory}
                history={history}
                fontsize={baseSize * 6.5}
            />

            <GalleryFullImage
                baseSize={baseSize}
                card={galleryCard}
                showGalleryFullImage={showGalleryFullImage}
                setShowGalleryFullImage={setShowGalleryFullImage}
                fontsize={fontsize}
                showVideoButtons={showVideoButtons}
                isPortrait={isPortrait}
            />

            <MusicPage
                baseSize={baseSize}
                songsList={songsList}
                showMusicPageZIndex={showMusicPageZIndex}
                setShowMusicPageZIndex={setShowMusicPageZIndex}
                musicID={musicID}
                setMusicID={setMusicID}
            />

            {showFilterPage && (
                <FilterPage
                    baseSize={baseSize}
                    cards={galleryHistory}
                    onClose={setShowFilterPage}
                    onCloseHome={() => {setShowFilterPage(false);setShowGallery(false);}}
                    selectedRole={gallerySelectedRole}
                    setSelectedRole={setGallerySelectedRole}
                    orderChoice={orderChoice}
                    setOrderChoice={setOrderChoice}
                    rarityChoice={rarityChoice}
                    setRarityChoice={setRarityChoice}
                    worldChoice={worldChoice}
                    setWorldChoice={setWorldChoice}
                    typeChoice={typeChoice}
                    setTypeChoice={setTypeChoice}
                    sortedCards={sortedCards}
                    setSortedCards={setSortedCards}
                    setGalleryCard={setGalleryCard}
                    showGalleryFullImage={showGalleryFullImage}
                    setShowGalleryFullImage={setShowGalleryFullImage}
                />
            )}


            {/*展示图鉴中的图片*/}
            <GalleryPage
                baseSize={baseSize}
                cards={galleryHistory}
                showGallery={showGallery}
                setShowGallery={setShowGallery}
                showFilterPage={showFilterPage}
                setShowFilterPage={setShowFilterPage}
                showGalleryFullImage={showGalleryFullImage}
                setShowGalleryFullImage={setShowGalleryFullImage}
                galleryCard={galleryCard}
                setGalleryCard={setGalleryCard}
                sortedCards={sortedCards}
                setSortedCards={setSortedCards}
                selectedRole={gallerySelectedRole}
                setSelectedRole={setGallerySelectedRole}
                orderChoice={orderChoice}
                setOrderChoice={setOrderChoice}
            />

            {showDetailedImage && (
                <DetailedImage
                    baseSize={baseSize}
                    card={detailedImage}  // 确保传递 fullImage，而不是其他东西
                    onClose={() => setShowDetailedImage(false)}
                />
            )}


            {/*展示筛选卡片页*/}
            <CardPoolFilter
                baseSize={baseSize}
                selectedRole={selectedRole}
                setSelectedRole={setSelectedRole}
                useSoftGuarantee={useSoftGuarantee}
                setUseSoftGuarantee={setUseSoftGuarantee}
                includeThreeStar={includeThreeStar}
                setIncludeThreeStar={setIncludeThreeStar}
                includeThreeStarM={includeThreeStarM}
                setIncludeThreeStarM={setIncludeThreeStarM}
                includeMoneyCard={includeMoneyCard}
                setIncludeMoneyCard={setIncludeMoneyCard}
                onlySelectedRoleCard={onlySelectedRoleCard}
                setOnlySelectedRoleCard={setOnlySelectedRoleCard}
                showCardPoolFilter={showCardPoolFilter}
                setShowCardPoolFilter={setShowCardPoolFilter}
                valuesList={valuesList}
                selectedPools={selectedPools}
                setSelectedPools={setSelectedPools}
                poolsLoaded={!poolsLoading}
            />


            {/* 控件层（中间层） */}
            <SettingsLayer
                baseSize={baseSize}
                totalDrawCount={totalDrawCount}
                totalFiveStarCount={totalFiveStarCount}
                selectedRole={selectedRole}
                useSoftGuarantee={useSoftGuarantee}
                pityCount={pityCount}
                softPityFailed={softPityFailed}
                handleDraw={handleDraw}
                setShowHistory={setShowHistory}
                setHasShownSummary={setHasShownSummary}
                setShowSummary={setShowSummary}
                clearLocalData={clearLocalData}
                handleStartDraw={handleStartDraw} // 抽卡动画处理
                setShowCardPoolFilter={setShowCardPoolFilter}
                showDetailedImage={showDetailedImage}
                setShowDetailedImage={setShowDetailedImage}
                setDetailedImage={setDetailedImage}
                setShowGallery={setShowGallery}
                galleryHistory={galleryHistory}
                showMusicPageZIndex={showMusicPageZIndex}
                setShowMusicPageZIndex={setShowMusicPageZIndex}
                selectedPools={selectedPools}
                cardData={cardData}
                openAssetTest={openAssetTest}
                simulateProbability={simulateProbability}
                simulationResult={simulationResult}
                showSimulationModal={showSimulationModal}
                setShowSimulationModal={setShowSimulationModal}
                simulationStatus={simulationStatus}
            />

        </div>
    );
};

export default Home;
