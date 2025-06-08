import React, {useEffect, useState, useRef, useMemo} from 'react';
import cardData from './assets/cards.json';
import 'react-lazy-load-image-component/src/effects/blur.css';
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


const Home = () => {


    // 加载serviceWorker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker
                .register('service_worker.js')
                .then((reg) => {
                    console.log('✅ SW registered:', reg);

                    // 可选：注销旧的 Service Worker（如果你在更新服务工作者时需要这样做）
                    navigator.serviceWorker.getRegistrations().then((registrations) => {
                        registrations.forEach((registration) => {
                            const expectedScope = location.origin + '/'; // 或者 '/deepspace/'，取决于你的路径
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

    // 是否只抽当前角色的卡
    const [onlySelectedRoleCard, setOnlySelectedRoleCard] = useLocalStorageState('bw_onlySelectedRoleCard', false);
    // 历史记录
    const { history, loading, appendHistory, clearHistory } = useHistoryDB();
    // 图鉴记录卡面是初始还是重逢
    const { getImageIndex, setImageIndex, clearImageIndexes } = useCardImageIndex();




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
        'bw_onlySelectedRoleCard',
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

    const fontsize = useResponsiveFontSize({scale: 0.9});

    const [sortedCards, setSortedCards] = useState([]);



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

        setShowAnimationDrawCards(false);
        setisAnimatingDrawCards(false);
    };



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
        if (card?.star === '世界') {
          setIsFiveStar(true); // 是五星卡片
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
            .filter(card => card?.稀有度 === '世界');

        // 加上当前这张卡（如果是五星）作为第一张
        const currentCard = allResults[currentCardIndex]?.card;
        if (currentCard?.稀有度 === '世界') {
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
        // const isSingleTarget = selectedRole.length === 1 && !isAllRoles;
        const isSingleTarget = !isAllRoles;

        let forceGuaranteeMode = null;

        if (!onlySelectedRoleCard && useSoftGuarantee && isSingleTarget) {
          forceGuaranteeMode = localSoftPityFailed ? 'hard' : 'soft';
        }

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
            forceGuaranteeMode
          );
          rarity = result.rarity;
        } while ((rarity === '星' && !includeThreeStar) || (rarity === '辰星' && !includeThreeStarM));

        // 更新保底状态
        if (rarity === '世界') {
          currentPity = 0;
          currentFourStarCounter = 0;

          if (!onlySelectedRoleCard && useSoftGuarantee && isSingleTarget) {
            const limitedPools = selectedPools.filter(pool => pool !== "世界之间" && !pool.includes("累充"));
            const gotTarget = result.card && selectedRole.includes(result.card.主角) && limitedPools.includes(result.card.获取途径);
            localSoftPityFailed = !gotTarget;
          }
        } else {
          currentPity++;
          currentFourStarCounter = rarity === '月' ? 0 : currentFourStarCounter + 1;
        }

        drawResults.push(result);
        setTotalDrawCount(prev => prev + 1);
        if (rarity === '世界') {
          setTotalFiveStarCount(prev => prev + 1);
        }
      }

      // 状态更新
      setIsDrawing(false);
      drawResultsRef.current = drawResults;
      currentPityRef.current = currentPity;
      currentFourStarRef.current = currentFourStarCounter;
      setSoftPityFailed(localSoftPityFailed);
      setHasFiveStarAnimation(drawResults.some(r => r.rarity === '世界'));
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
      forceGuaranteeMode = null // 'soft' | 'hard' | null
    ) => {
      let rarity;
      let pool = cardData;
      const roll = Math.random() * 100;

      const isAllPools = selectedPools.includes('全部');
      const isAllRoles = selectedRole.includes('随机');
      const limitedPools = selectedPools.filter(pool => pool !== "世界之间" && !pool.includes("累充"));
      const permanentPools = selectedPools.filter(pool => pool == "世界之间" || pool.includes("累充"));

      // 五星概率（动态）
      let dynamicFiveStarRate = 2;
      if (pity >= 60) {
        dynamicFiveStarRate = 2 + (pity - 59) * 10;
      }

      const fourStarRate = 7;

      // 判断稀有度
      if (fourStarCounter >= 9) {
        rarity = roll < dynamicFiveStarRate ? '世界' : '月';
      } else if (roll < dynamicFiveStarRate) {
        rarity = '世界';
      } else if (roll < dynamicFiveStarRate + fourStarRate) {
        rarity = '月';
      } else {
        // rarity = '星'; // 星或辰星统一为稀有度“星”
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
      if (rarity === '世界') {
        if (forceGuaranteeMode === 'hard') {
          // 大保底：限定池中选定角色
          pool = cardData.filter(card =>
            card.稀有度 === '世界' &&
            limitedPools.includes(card.获取途径) &&
            selectedRole.includes(card.主角)
          );
        } else if (forceGuaranteeMode === 'soft') {
          // 小保底歪：常驻池任意 + 限定池中未选定角色
          pool = cardData.filter(card =>
            card.稀有度 === '世界' &&
            (
              permanentPools.includes(card.获取途径) ||
              (limitedPools.includes(card.获取途径) && !selectedRole.includes(card.主角))
            )
          );
        } else if (!isAllRoles) {
            if (onlySelectedRoleCard) {
              // 选了只抽定向角色卡（稀有度不限）
              pool = cardData.filter(card =>
                card.稀有度 === '世界' &&
                selectedRole.includes(card.主角) &&
                (isAllPools || selectedPools.includes(card.获取途径))
              );
            } else {
              // 选了定向角色，没选只抽定向角色的卡，也没选大小保底
                if(limitedPools.length > 0){
                    pool = cardData.filter(card =>
                        card.稀有度 === '世界' &&
                        selectedRole.includes(card.主角) &&
                        limitedPools.includes(card.获取途径)
                    );
                } else {
                    pool = cardData.filter(card =>
                        card.稀有度 === '世界' &&
                        selectedRole.includes(card.主角) &&
                        selectedPools.includes(card.获取途径)
                      );
                }
            }
        } else {
          // 正常五星抽卡（不指定角色）
            if(limitedPools.length > 0){
                pool = cardData.filter(card =>
                    card.稀有度 === '世界' &&
                    (limitedPools.includes(card.获取途径))
                );
            } else {
                pool = cardData.filter(card =>
                    card.稀有度 === '世界' &&
                    (selectedPools.includes(card.获取途径))
                );
            }
        }
      } else if (rarity === '月') {
        pool = cardData.filter(card => card.稀有度 === '月');
        if (onlySelectedRoleCard && !isAllRoles) {
          pool = pool.filter(card => selectedRole.includes(card.主角));
        }
      } else {
        // 星 / 辰星
          if (onlySelectedRoleCard) {
              pool = cardData.filter(card => (includeThreeStarM && card.稀有度 === "辰星")
                  || (includeThreeStar && card.稀有度 === "星") && selectedRole.includes(card.主角));
          } else {
              pool = cardData.filter(card => (includeThreeStarM && card.稀有度 === "辰星")
                  || (includeThreeStar && card.稀有度 === "星"));
          }
      }

      // 抽卡
      if (pool.length === 0) return { card: null, rarity };
      const chosen = pool[Math.floor(Math.random() * pool.length)];
      return { card: chosen, rarity };
    };




    // ========================================================
    // 返回数据时显示的页面
    return (
        <div className="w-full h-full relative overflow-hidden" style={{backgroundColor: 'black'}}>

            {/* 视频层（最底层） */}
            <video
                preload="auto"
                autoPlay
                loop
                playsInline
                muted
                controls={false}
                onEnded={() => {
                    const validDrawId = drawSessionIdRef.current;
                    if (!validDrawId) return;
                    setisAnimatingDrawCards(false);
                    drawSessionIdRef.current = 0; // 重置流程 ID，防止后续重复触发
                }}
                className="absolute top-0 left-0 w-full h-full object-cover z-0">
                <source src="videos/background1.mp4" type="video/mp4"/>
            </video>


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
                fontsize={fontsize}
            />

            <GalleryFullImage
                card={galleryCard}
                showGalleryFullImage={showGalleryFullImage}
                setShowGalleryFullImage={setShowGalleryFullImage}
                fontsize={fontsize}
            />


            {/*展示图鉴中的图片*/}
            <GalleryPage
                cards={galleryHistory}
                showGallery={showGallery}
                setShowGallery={setShowGallery}
                showGalleryFullImage={showGalleryFullImage}
                setShowGalleryFullImage={setShowGalleryFullImage}
                galleryCard={galleryCard}
                setGalleryCard={setGalleryCard}
                sortedCards={sortedCards}
                setSortedCards={setSortedCards}
            />

            {showDetailedImage && (
                <DetailedImage
                    card={detailedImage}  // 确保传递 fullImage，而不是其他东西
                    onClose={() => setShowDetailedImage(false)}
                />
            )}


            {/*展示筛选卡片页*/}
            <CardPoolFilter
                selectedRole={selectedRole}
                setSelectedRole={setSelectedRole}
                useSoftGuarantee={useSoftGuarantee}
                setUseSoftGuarantee={setUseSoftGuarantee}
                includeThreeStar={includeThreeStar}
                setIncludeThreeStar={setIncludeThreeStar}
                includeThreeStarM={includeThreeStarM}
                setIncludeThreeStarM={setIncludeThreeStarM}
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
                totalDrawCount={totalDrawCount}
                totalFiveStarCount={totalFiveStarCount}
                selectedRole={selectedRole}
                setSelectedRole={setSelectedRole}
                onlySelectedRoleCard={onlySelectedRoleCard}
                setonlySelectedRoleCard={setOnlySelectedRoleCard}
                roles={roles}
                includeThreeStar={includeThreeStar}
                setIncludeThreeStar={setIncludeThreeStar}
                useSoftGuarantee={useSoftGuarantee}
                setUseSoftGuarantee={setUseSoftGuarantee}
                pityCount={pityCount}
                softPityFailed={softPityFailed}
                isDrawing={isDrawing}
                isAnimatingDrawCards={isAnimatingDrawCards}
                handleDraw={handleDraw}
                showHistory={showHistory}
                setShowHistory={setShowHistory}
                setHasShownSummary={setHasShownSummary}
                setShowSummary={setShowSummary}
                clearLocalData={clearLocalData}
                // toggleMusic={toggleMusic}
                // isMusicPlaying={isMusicPlaying}
                showProbability={showProbability}
                setShowProbability={setShowProbability}
                handleStartDraw={handleStartDraw} // 抽卡动画处理
                setShowCardPoolFilter={setShowCardPoolFilter}
                showDetailedImage={showDetailedImage}
                setShowDetailedImage={setShowDetailedImage}
                detailedImage={detailedImage}
                setDetailedImage={setDetailedImage}
                showGallery={showGallery}
                setShowGallery={setShowGallery}
                fontsize={fontsize}
                galleryHistory={galleryHistory}
            />

        </div>
    );
};

export default Home;
