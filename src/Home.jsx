import React, {useEffect, useState, useRef, useMemo} from 'react';
import cardData from './assets/cards.json';
import 'react-lazy-load-image-component/src/effects/blur.css';
import useLocalStorageState from "./hooks/useLocalStorageState.js";
import SettingsLayer from "./components/SettingsLayer.jsx";
import DrawAnimationCards from "./components/DrawAnimationCards.jsx";
import CardOverlay from "./components/CardOverlay.jsx";
import HistoryModal from "./components/HistoryModal.jsx";
import { forceLandscape, useDynamicRem } from 'single-screen-utils';
import CardSummary from "./components/CardSummary.jsx";
import CardPoolFilter from "./components/CardPoolFilter.jsx";
import {getAvailablePools, getDynamicAttributeCounts} from "./utils/cardDataUtils.js";
import CardFullImage from "./components/CardFullImage.jsx";
import GalleryFullImage from "./components/GalleryFullImage.jsx";
import DetailedImage from "./components/DetailedImage.jsx";
import GalleryPage from "./components/GalleryPage.jsx";
import adaptableFontsize from "./utils/adaptableFontsize.js";


const Home = () => {


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
    const [selectedPools, setSelectedPools] = useLocalStorageState("bw_selectedPools", allPools);
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
    const [history, setHistory] = useLocalStorageState('bw_history', []);



    // 清除缓存数据
    const keysToClear = [
        'bw_totalDrawCount',
        'bw_totalFiveStarCount',
        'bw_pityCount',
        'bw_useSoftGuarantee',
        'bw_softPityFailed',
        'bw_selectedRole',
        'bw_includeThreeStar',
        'bw_includeThreeStarM',
        'bw_onlySelectedRoleCard',
        'bw_history',
        'bw_selectedPools',
    ];

    const clearLocalData = () => {
        keysToClear.forEach(key => localStorage.removeItem(key));
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

    const [videoPlayed, setVideoPlayed] = useState(false);  // 出金动画播放状态
    const [lastFiveStarWasTarget, setLastFiveStarWasTarget] = useState(true); // 上一次五星是否是定向角色


    const [showCardOverlay, setShowCardOverlay] = useState(false); // 控制是否显示卡片结果的覆盖层，为true时展示抽到的卡片

    const [showSummary, setShowSummary] = useState(false); // 是否显示结算十抽的卡片
    const [summaryCards, setSummaryCards] = useState([]); // 存储结算十抽的卡片
    const [hasShownSummary, setHasShownSummary] = useState(false); // 是否已经展示过结算页面
    const [showGallery, setShowGallery] = useState(false); // 是否展示图鉴
    const [showProbability, setShowProbability] = useState(false); // 是否展示概率测试界面

    const [galleryHistory, setGalleryHistory] = useState([]);  // 图鉴历史

    const [showCardPoolFilter, setShowCardPoolFilter] = useState(false); // 展示筛选页面

    // const [showGalleryFullImage, setShowGalleryFullImage] = useState(false); // 展示图鉴页面

    const [detailedImage, setDetailedImage] = useState(null); // 轮播图的内容设置
    const [showDetailedImage, setShowDetailedImage] = useState(false); // 是否展示轮播图
    const [showGalleryFullImage, setShowGalleryFullImage] = useState(false); // 图鉴图片的内容设置
    const [galleryCard, setGalleryCard] = useState(null);

    const fontsize = adaptableFontsize();



    // ========================================================  用于抽卡动画相关
    const [showAnimationDrawCards, setShowAnimationDrawCards] = useState(false);

    // ------------------------------- 每次抽卡开始时触发动画组件加载
    const handleStartDraw = () => {
        setShowAnimationDrawCards(true);
    };


    // ------------------------------- 抽卡动画播放完成后的处理逻辑
    const handleDrawCardsAnimationEnd = () => {
        const finalResults = drawResultsRef.current;
        const finalPity = currentPityRef.current;

        setPityCount(finalPity);
        setCards(finalResults.map(r => r.card));

        setHistory(prev => {
            const updated = [
                ...prev,
                ...finalResults.map(r => ({
                    ...r.card,
                    timestamp: new Date().toISOString(),
                })),
            ];
            return updated.slice(-10000);
        });
        setShowAnimationDrawCards(false);
        setisAnimatingDrawCards(false);
    };



    // ======================================================== 图鉴相关
    // ------------------------------- 去重逻辑
    const removeDuplicates = (arr) => {
        const seen = new Set();
        return arr.filter((item) => {
            const duplicate = seen.has(item.卡名);  // 假设每个卡片都有一个唯一的 id
            seen.add(item.卡名);
            return !duplicate;
        });
    };

    // ------------------------------- 初始化 galleryHistory
    useEffect(() => {
        if (galleryHistory.length === 0 && history.length > 0) {
            const uniqueHistory = removeDuplicates(history);
            setGalleryHistory(uniqueHistory);
        }
    }, [history, galleryHistory.length]);

    // ------------------------------- 合并新的抽卡记录
    useEffect(() => {
        if (drawResultsRef.current && drawResultsRef.current.length > 0) {
            const newCards = drawResultsRef.current.map(item => item.card).filter(Boolean); // 提取所有有效 card

            if (newCards.length > 0) {
                setGalleryHistory(prevGalleryHistory => {
                const combined = [...prevGalleryHistory, ...newCards];
                return removeDuplicates(combined);
                });
            }
        }
    }, [history.length]);



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
        if (card?.star === '5星') {
          setIsFiveStar(true); // 是五星卡片
        } else {
          setIsFiveStar(false); // 不是五星卡片，直接展示卡片
        }
    }, [currentCardIndex]);



    // ======================================================== 抽卡动画结束后开始展示卡片
    // ------------------------------- 控制卡片展示或结算页展示
    useEffect(() => {
        const allResults = drawResultsRef.current || [];
        const onlyFiveStars = allResults.filter(item => item.card?.稀有度 === '世界');

        if (
            allResults.length > 0 &&
            !hasShownSummary &&
            !isDrawing &&
            !isAnimatingDrawCards &&
            !showAnimationDrawCards
        ) {
            if (isSkipped) {
                if (onlyFiveStars.length === 0) {
                    // 跳过且没有五星卡，直接展示结算
                    setShowCardOverlay(false);
                    setShowSummary(true);
                    setHasShownSummary(true);
                } else {
                    // 跳过但有五星卡，只展示五星卡片
                    displayResultsRef.current = onlyFiveStars;
                    setShowCardOverlay(true);
                    setShowSummary(false);
                }
            } else {
                // 正常播放流程，展示全部卡片
                displayResultsRef.current = allResults;
                setCurrentCardIndex(0);
                setShowCardOverlay(true);
                setShowSummary(false);
            }
        }
    }, [isSkipped, showAnimationDrawCards, isDrawing, isAnimatingDrawCards, hasShownSummary,]);

    // ------------------------------- 每次点下一张卡时都先重置视频播放状态
    const handleNextCard = () => {
        setVideoPlayed(false);
        if (showSummary) return;
        if (currentCardIndex < displayResultsRef.current.length - 1) {
            const nextIndex = currentCardIndex + 1;
            setCurrentCardIndex(nextIndex);
        } else {
            setShowCardOverlay(false);
            setSummaryCards(drawnCards);
            if (!hasShownSummary) {
                setShowSummary(true);
                setHasShownSummary(true);
            }
        }
    };

    useEffect(()=>{
        drawResultsRef.current.forEach((item, index) => {
            console.log(`第 ${index + 1} 张卡:\t`, item.rarity, "\t", item.card.卡名);
        });
    },[history.length])



// console.log("selectedPools", selectedPools)
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

    if (onlySelectedRoleCard && selectedRole.length === 1 && selectedRole[0] !== '随机') {
      // 只抽当前角色卡，关闭大小保底
      do {
        result = getRandomCard(
          currentPity,
          currentFourStarCounter,
          false,
          selectedRole,
          onlySelectedRoleCard,
          includeThreeStar,
          includeThreeStarM,
          selectedPools,
          cardData
        );
      } while (!includeThreeStar && result.rarity === '星');

      if (result.rarity === '世界') {
        currentPity = 0;
        currentFourStarCounter = 0;
      } else {
        currentPity++;
        currentFourStarCounter = result.rarity === '月' ? 0 : currentFourStarCounter + 1;
      }
    } else {
      // 启用或关闭大小保底逻辑
      const mustBeTarget = useSoftGuarantee && selectedRole.length === 1 && selectedRole[0] !== '随机' && localSoftPityFailed;

      do {
        result = getRandomCard(
          currentPity,
          currentFourStarCounter,
          mustBeTarget,
          selectedRole,
          onlySelectedRoleCard,
          includeThreeStar,
          includeThreeStarM,
          selectedPools,
          cardData
        );
      } while (!includeThreeStar && result.rarity === '星');

      if (result.rarity === '世界') {
        currentPity = 0;
        currentFourStarCounter = 0;

        if (useSoftGuarantee && selectedRole.length === 1 && selectedRole[0] !== '随机') {
          if (result.card?.character === selectedRole) {
            localSoftPityFailed = false; // 命中选定角色
          } else {
            localSoftPityFailed = true;  // 小保底失败，开启大保底
          }
        }
      } else {
        currentPity++;
        currentFourStarCounter = result.rarity === '月' ? 0 : currentFourStarCounter + 1;
      }
    }

    drawResults.push(result);
    setTotalDrawCount(prev => prev + 1);
    if (result.rarity === '世界') setTotalFiveStarCount(prev => prev + 1);
  }

  // 更新状态
  setIsDrawing(false);
  drawResultsRef.current = drawResults;
  currentPityRef.current = currentPity;
  currentFourStarRef.current = currentFourStarCounter;
  setSoftPityFailed(localSoftPityFailed);
  setHasFiveStarAnimation(drawResults.some(r => r.rarity === '世界'));
  setShowAnimationDrawCards(true);
  setDrawnCards(drawResults.map(r => r.card).filter(Boolean));
};







  // ========================================================
  // 随机生成一张卡片，并根据保底计数器 (pity) 计算是否触发保底效果
// const getRandomCard = (
//   pity,
//   fourStarCounter,
//   mustBeTargetFiveStar = false,
//   selectedRole = ['随机'],
//   onlySelectedRoleCard = false,
//   includeThreeStar = true
// ) => {
//   let rarity;
//   let pool = [];
//
//   const roll = Math.random() * 100;
//
//   // ⭐⭐⭐⭐ 五星概率计算 ⭐⭐⭐⭐
//   let dynamicFiveStarRate = 1;
//   if (pity >= 60) {
//     dynamicFiveStarRate = 1 + (pity - 59) * 10;
//   }
//
//
//   // ⭐⭐⭐⭐ 四星概率固定 ⭐⭐⭐⭐
//   const fourStarRate = 7;
//
//   // ⭐⭐⭐⭐ 保底判断 ⭐⭐⭐⭐
//   if (fourStarCounter >= 9) {
//     rarity = roll < dynamicFiveStarRate ? '5' : '4';
//   } else if (roll < dynamicFiveStarRate) {
//     rarity = '5';
//   } else if (roll < dynamicFiveStarRate + fourStarRate) {
//     rarity = '4';
//   } else {
//     rarity = '3';
//   }
//
//   let targetStar = '0';
//   if(rarity === '5'){
//       targetStar = '世界';
//   } else if(rarity === '4'){
//       targetStar = '月';
//   } else {
//       targetStar = '星';
//   }
//
//   // ⭐⭐⭐⭐ 筛选卡池 ⭐⭐⭐⭐
//   if (targetStar === '世界') {
//     if (onlySelectedRoleCard && selectedRole.length === 1 && selectedRole[0] !== '随机') {
//       pool = cardData.filter(card => card.主角 === selectedRole && card.稀有度 === '世界');
//     } else if (mustBeTargetFiveStar && selectedRole.length === 1 && selectedRole[0] !== '随机') {
//       pool = cardData.filter(card => card.主角 === selectedRole && card.稀有度 === '世界');
//     } else {
//       pool = cardData.filter(card => card.稀有度 === '世界');
//     }
//   } else {
//     if (onlySelectedRoleCard && selectedRole.length === 1 && selectedRole[0] !== '随机') {
//       pool = cardData.filter(card =>
//         card.主角 === selectedRole &&
//         card.稀有度 === targetStar &&
//         (includeThreeStar || targetStar !== '星')
//       );
//     } else {
//       pool = cardData.filter(card =>
//         card.稀有度 === targetStar &&
//         (includeThreeStar || targetStar !== '星')
//       );
//     }
//   }
//
//   if (pool.length === 0) return { card: null, rarity };
//   const chosen = pool[Math.floor(Math.random() * pool.length)];
//   return { card: chosen, rarity };
// };
const getRandomCard = (
  pity,
  fourStarCounter,
  mustBeTargetFiveStar = false,
  selectedRole = ['随机'],
  onlySelectedRoleCard = false,
  includeThreeStar = true,
  includeThreeStarM = true,
  selectedPools = ['全部'],
  cardData = []
) => {

  let rarity;
  let pool = cardData;

  const roll = Math.random() * 100;

  const isAllPools = selectedPools.includes('全部');
  const isAllRoles = selectedRole.includes('随机');

  // 五星动态概率
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
    rarity = '星'; // 星和辰星都归为三星卡处理
  }

  // 根据稀有度筛卡池
  if (rarity === '世界') {
    const isTargeted = mustBeTargetFiveStar && !isAllRoles;
    const isSingleTarget = onlySelectedRoleCard && !isAllRoles;

    if (isTargeted) {
      const role = selectedRole[Math.floor(Math.random() * selectedRole.length)];
      pool = pool.filter(card =>
        card.稀有度 === '世界' &&
        card.主角 === role &&
        (isAllPools || selectedPools.some(p => card.获取途径.includes(p)))
      );
    } else if (isSingleTarget) {
      pool = pool.filter(card =>
        card.稀有度 === '世界' &&
        selectedRole.includes(card.主角) &&
        (isAllPools || selectedPools.some(p => card.获取途径.includes(p)))
      );
    } else {
      pool = pool.filter(card =>
        card.稀有度 === '世界' &&
        (isAllPools || selectedPools.some(p => card.获取途径.includes(p)))
      );
    }
  } else if (rarity === '月') {
    pool = pool.filter(card =>
      card.稀有度 === '月' &&
      (isAllRoles || selectedRole.includes(card.主角)) &&
      (isAllPools || selectedPools.some(p => card.获取途径.includes(p)))
    );
    if (onlySelectedRoleCard && !isAllRoles) {
      pool = pool.filter(card => selectedRole.includes(card.主角));
    }
  } else {
    // 三星处理，包含 星 / 辰星
    pool = pool.filter(card => {
      const isStar = card.稀有度 === '星';
      const isMorningStar = card.稀有度 === '辰星';

      if (!isStar && !isMorningStar) return false;
      if ((!includeThreeStar && isStar) || (!includeThreeStarM && isMorningStar)) return false;
      if (!isAllPools && !selectedPools.some(p => card.获取途径.includes(p))) return false;
      if (onlySelectedRoleCard && !isAllRoles) return selectedRole.includes(card.主角);

      return true;
    });
  }

  // 从结果池中随机抽卡
  if (pool.length === 0) return { card: null, rarity };
  const chosen = pool[Math.floor(Math.random() * pool.length)];
  return { card: chosen, rarity };
};





    // ========================================================
    // 返回数据时显示的页面
    return (
        <div className="w-full h-full relative overflow-hidden">
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
                className="absolute w-full h-full object-cover">
                {/*<source src="https://cdn.chenczn3528.dpdns.org/beyondworld/videos/background.mp4" type="video/mp4"/>*/}
                <source src="videos/background.mp4" type="video/mp4"/>

            </video>


            {/*/!* 抽卡动画层 *!/*/}
            {/*{showAnimationDrawCards && (*/}
            {/*  <DrawAnimationCards*/}
            {/*    isFiveStar={hasFiveStarAnimation}*/}
            {/*    onAnimationEnd={handleDrawCardsAnimationEnd}*/}
            {/*  />*/}
            {/*)}*/}

            {/*/!*十抽后结算层*!/*/}
            {/*{showSummary && drawResultsRef.current.length > 1 && (*/}
            {/*    <CardSummary*/}
            {/*        drawResults={drawResultsRef.current}  // 传递卡片数据*/}
            {/*        onClose={() => setShowSummary(false)}  // 关闭总结页面的回调*/}
            {/*        setHasShownSummary={setHasShownSummary}*/}
            {/*        setShowSummary={setShowSummary}*/}
            {/*        handleDraw={handleDraw}*/}
            {/*        handleStartDraw={handleStartDraw}*/}
            {/*    />*/}
            {/*)}*/}

            {/*/!*抽卡展示卡片*!/*/}
            {/*<CardOverlay*/}
            {/*    showCardOverlay={showCardOverlay}*/}
            {/*    setShowCardOverlay={setShowCardOverlay}*/}
            {/*    currentCardIndex={currentCardIndex}*/}
            {/*    drawResultsRef={drawResultsRef}*/}
            {/*    handleNextCard={handleNextCard}*/}
            {/*    isSkipped={isSkipped}*/}
            {/*    setIsSkipped={setIsSkipped}*/}
            {/*    currentIndex={currentCardIndex}*/}
            {/*    setCurrentIndex={setCurrentCardIndex}*/}
            {/*/>*/}

            {/*/!*展示历史记录*!/*/}
            {/*<HistoryModal*/}
            {/*    showHistory={showHistory}*/}
            {/*    setShowHistory={setShowHistory}*/}
            {/*    history={history}*/}
            {/*/>*/}

            {/*/!*展示图鉴中的图片*!/*/}
            {/*<GalleryPage*/}
            {/*    cards={galleryHistory}*/}
            {/*    showGallery={showGallery}*/}
            {/*    setShowGallery={setShowGallery}*/}
            {/*    showGalleryFullImage={showGalleryFullImage}*/}
            {/*    setShowGalleryFullImage={setShowGalleryFullImage}*/}
            {/*    galleryCard={galleryCard}*/}
            {/*    setGalleryCard={setGalleryCard}*/}
            {/*/>*/}

            {/*<GalleryFullImage*/}
            {/*  card={galleryCard}*/}
            {/*  showGalleryFullImage={showGalleryFullImage}*/}
            {/*  setShowGalleryFullImage={setShowGalleryFullImage}*/}
            {/*/>*/}


            {showDetailedImage && (
              <DetailedImage
                card={detailedImage}  // 确保传递 fullImage，而不是其他东西
                onClose={() => setShowDetailedImage(false)}
                fontsize={fontsize}
              />
            )}


            {/*/!*展示筛选卡片页*!/*/}
            {/*<CardPoolFilter*/}
            {/*    selectedRole={selectedRole}*/}
            {/*    setSelectedRole={setSelectedRole}*/}
            {/*    useSoftGuarantee={useSoftGuarantee}*/}
            {/*    setUseSoftGuarantee={setUseSoftGuarantee}*/}
            {/*    includeThreeStar={includeThreeStar}*/}
            {/*    setIncludeThreeStar={setIncludeThreeStar}*/}
            {/*    includeThreeStarM={includeThreeStarM}*/}
            {/*    setIncludeThreeStarM={setIncludeThreeStarM}*/}
            {/*    onlySelectedRoleCard={onlySelectedRoleCard}*/}
            {/*    setOnlySelectedRoleCard={setOnlySelectedRoleCard}*/}
            {/*    showCardPoolFilter={showCardPoolFilter}*/}
            {/*    setShowCardPoolFilter={setShowCardPoolFilter}*/}
            {/*    valuesList={valuesList}*/}
            {/*    selectedPools={selectedPools}*/}
            {/*    setSelectedPools={setSelectedPools}*/}
            {/*/>*/}






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
            />

        </div>
    );
};

export default Home;
