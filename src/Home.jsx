import React, {useEffect, useState, useRef} from 'react';
import cardData from './assets/cards.json';
import 'react-lazy-load-image-component/src/effects/blur.css';
import useLocalStorageState from "./hooks/useLocalStorageState.js";
import SettingsLayer from "./components/SettingsLayer.jsx";
import DrawAnimationCards from "./components/DrawAnimationCards.jsx";
import CardOverlay from "./components/CardOverlay.jsx";

const Home = () => {


    // ======================================================== 数据存储与恢复
    // 总抽卡数
    const [totalDrawCount, setTotalDrawCount] = useLocalStorageState('totalDrawCount', 0);
    // 选择的角色
    const [selectedRole, setSelectedRole] = useLocalStorageState('selectedRole', '随机');
    // 总出金数
    const [totalFiveStarCount, setTotalFiveStarCount] = useLocalStorageState('totalFiveStarCount', 0);
    // 下次出金还需要多少
    const [pityCount, setPityCount] = useLocalStorageState('pityCount', 0);
    // 是否开启大小保底机制
    const [useSoftGuarantee, setUseSoftGuarantee] = useLocalStorageState('useSoftGuarantee', true);
    // 目前是小保底还是大保底
    const [softPityFailed, setSoftPityFailed] = useLocalStorageState('softPityFailed', false);
    // 是否包括三星
    const [includeThreeStar, setIncludeThreeStar] = useLocalStorageState('includeThreeStar', true);
    // 是否只抽当前角色的卡
    const [onlySelectedRoleCard, setOnlySelectedRoleCard] = useLocalStorageState('onlySelectedRoleCard', false);
    // 历史记录
    const [history, setHistory] = useLocalStorageState('history', []);


    // 清除缓存数据
    const keysToClear = [
        'totalDrawCount',
        'totalFiveStarCount',
        'pityCount',
        'useSoftGuarantee',
        'softPityFailed',
        'selectedRole',
        'includeThreeStar',
        'onlySelectedRoleCard',
        'history'
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




    // ========================================================  用于抽卡动画相关
    const [showAnimationDrawCards, setShowAnimationDrawCards] = useState(false);

    // 每次抽卡开始时触发动画组件加载
    const handleStartDraw = () => {
        setShowAnimationDrawCards(true);
    };

    // 抽卡动画播放完成后的处理逻辑
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







    // ========================================================
    // 图鉴相关

    // 去重逻辑
    const removeDuplicates = (arr) => {
        const seen = new Set();
        return arr.filter((item) => {
            const duplicate = seen.has(item.卡名);  // 假设每个卡片都有一个唯一的 id
            seen.add(item.卡名);
            return !duplicate;
        });
    };

    // 初始化 galleryHistory
    useEffect(() => {
        if (galleryHistory.length === 0 && history.length > 0) {
            const uniqueHistory = removeDuplicates(history);
            setGalleryHistory(uniqueHistory);
        }
    }, [history, galleryHistory.length]);

    console.log("galleryHistory:", galleryHistory)

    // 合并新的抽卡记录
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





// ========================================================
  // 输出当前卡片信息
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



  // ========================================================
  // 判断当前卡片是不是五星
  useEffect(() => {
    const card = drawResultsRef.current[currentCardIndex]?.card;
    if (card?.star === '5星') {
      setIsFiveStar(true); // 是五星卡片
    } else {
      setIsFiveStar(false); // 不是五星卡片，直接展示卡片
    }
  }, [currentCardIndex]);







    // ========================================================
  //抽卡动画结束后开始展示卡片
  // 处理跳过视频的逻辑
// ==============================
// ✅ useEffect：控制卡片展示或结算页展示
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
  }, [
    isSkipped,
    showAnimationDrawCards,
    isDrawing,
    isAnimatingDrawCards,
    hasShownSummary,
  ]);

  const handleNextCard = () => {
    // 每次点下一张卡时都先重置视频播放状态
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

    if (onlySelectedRoleCard && selectedRole !== '随机') {
      // 只抽当前角色卡，关闭大小保底
      do {
        result = getRandomCard(
          currentPity,
          currentFourStarCounter,
          false,
          selectedRole,
          onlySelectedRoleCard,
          includeThreeStar
        );
      } while (!includeThreeStar && result.rarity === '3');

      if (result.rarity === '5') {
        currentPity = 0;
        currentFourStarCounter = 0;
      } else {
        currentPity++;
        currentFourStarCounter = result.rarity === '4' ? 0 : currentFourStarCounter + 1;
      }
    } else {
      // 启用或关闭大小保底逻辑
      const mustBeTarget = useSoftGuarantee && selectedRole !== '随机' && localSoftPityFailed;

      do {
        result = getRandomCard(
          currentPity,
          currentFourStarCounter,
          mustBeTarget,
          selectedRole,
          onlySelectedRoleCard,
          includeThreeStar
        );
      } while (!includeThreeStar && result.rarity === '3');

      if (result.rarity === '5') {
        currentPity = 0;
        currentFourStarCounter = 0;

        if (useSoftGuarantee && selectedRole !== '随机') {
          if (result.card?.character === selectedRole) {
            localSoftPityFailed = false; // 命中选定角色
          } else {
            localSoftPityFailed = true;  // 小保底失败，开启大保底
          }
        }
      } else {
        currentPity++;
        currentFourStarCounter = result.rarity === '4' ? 0 : currentFourStarCounter + 1;
      }
    }

    drawResults.push(result);
    setTotalDrawCount(prev => prev + 1);
    if (result.rarity === '5') setTotalFiveStarCount(prev => prev + 1);
  }

  // 更新状态
  setIsDrawing(false);
  drawResultsRef.current = drawResults;
  currentPityRef.current = currentPity;
  currentFourStarRef.current = currentFourStarCounter;
  setSoftPityFailed(localSoftPityFailed);
  setHasFiveStarAnimation(drawResults.some(r => r.rarity === '5'));
  setShowAnimationDrawCards(true);
  setDrawnCards(drawResults.map(r => r.card).filter(Boolean));
};







  // ========================================================
  // 随机生成一张卡片，并根据保底计数器 (pity) 计算是否触发保底效果
const getRandomCard = (
  pity,
  fourStarCounter,
  mustBeTargetFiveStar = false,
  selectedRole = '随机',
  onlySelectedRoleCard = false,
  includeThreeStar = true
) => {
  let rarity;
  let pool = [];

  const roll = Math.random() * 100;

  // ⭐⭐⭐⭐ 五星概率计算 ⭐⭐⭐⭐
  let dynamicFiveStarRate = 1;
  if (pity >= 60) {
    dynamicFiveStarRate = 1 + (pity - 59) * 10;
  }


  // ⭐⭐⭐⭐ 四星概率固定 ⭐⭐⭐⭐
  const fourStarRate = 7;

  // ⭐⭐⭐⭐ 保底判断 ⭐⭐⭐⭐
  if (fourStarCounter >= 9) {
    rarity = roll < dynamicFiveStarRate ? '5' : '4';
  } else if (roll < dynamicFiveStarRate) {
    rarity = '5';
  } else if (roll < dynamicFiveStarRate + fourStarRate) {
    rarity = '4';
  } else {
    rarity = '3';
  }

  let targetStar = '0';
  if(rarity === '5'){
      targetStar = '世界';
  } else if(rarity === '4'){
      targetStar = '月';
  } else {
      targetStar = '星';
  }

  // ⭐⭐⭐⭐ 筛选卡池 ⭐⭐⭐⭐
  if (targetStar === '世界') {
    if (onlySelectedRoleCard && selectedRole !== '随机') {
      pool = cardData.filter(card => card.主角 === selectedRole && card.稀有度 === '世界');
    } else if (mustBeTargetFiveStar && selectedRole !== '随机') {
      pool = cardData.filter(card => card.主角 === selectedRole && card.稀有度 === '世界');
    } else {
      pool = cardData.filter(card => card.稀有度 === '世界');
    }
  } else {
    if (onlySelectedRoleCard && selectedRole !== '随机') {
      pool = cardData.filter(card =>
        card.主角 === selectedRole &&
        card.稀有度 === targetStar &&
        (includeThreeStar || targetStar !== '星')
      );
    } else {
      pool = cardData.filter(card =>
        card.稀有度 === targetStar &&
        (includeThreeStar || targetStar !== '星')
      );
    }
  }

  if (pool.length === 0) return { card: null, rarity };
  const chosen = pool[Math.floor(Math.random() * pool.length)];
  return { card: chosen, rarity };
};












    // ========================================================
    // 返回数据时显示的页面
    return (

        <div
            className="relative w-screen h-screen cursor-pointer overflow-hidden outline-none focus:outline-none"
            tabIndex={0}
        >
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
                className="fixed top-0 left-0 w-full h-full object-cover">
                <source src="videos/background.mp4" type="video/mp4"/>
            </video>


            {/* 抽卡动画层 */}
            {showAnimationDrawCards && (
              <DrawAnimationCards
                isFiveStar={hasFiveStarAnimation}
                onAnimationEnd={handleDrawCardsAnimationEnd}
              />
            )}


            <CardOverlay
                showCardOverlay={showCardOverlay}
                currentCardIndex={currentCardIndex}
                drawResultsRef={drawResultsRef}
                videoPlayed={videoPlayed}
                setVideoPlayed={setVideoPlayed}
                handleNextCard={handleNextCard}
                isSkipped={isSkipped}
                setIsSkipped={setIsSkipped}
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
                setShowGallery={setShowGallery}
                showProbability={showProbability}
                setShowProbability={setShowProbability}
                setIsSkipped={setIsSkipped}
                handleStartDraw={handleStartDraw} // 抽卡动画处理
            />

        </div>
    );
};

export default Home;
