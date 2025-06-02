import React, {useEffect, useState} from 'react';
import Carousel from "./Carousel";
import cardData from "../assets/cards.json";
import {playClickSound} from "../utils/playClickSound.js";

const SettingsLayer = ({
    totalDrawCount,
    totalFiveStarCount,
    selectedRole,
    setSelectedRole,
    onlySelectedRoleCard,
    setonlySelectedRoleCard,
    roles,
    includeThreeStar,
    setIncludeThreeStar,
    useSoftGuarantee,
    setUseSoftGuarantee,
    pityCount,
    softPityFailed,
    isDrawing,
    isAnimatingDrawCards,
    handleDraw,
    showHistory,
    setShowHistory,
    setHasShownSummary,
    setShowSummary,
    clearLocalData,
    toggleMusic,
    isMusicPlaying,
    showProbability,
    setShowProbability,
    handleStartDraw,
    setShowCardPoolFilter,
    showDetailedImage,
    setShowDetailedImage,
    detailedImage,
    setDetailedImage,
    showGallery,
    setShowGallery,
    fontsize,
    galleryHistory,
}) => {






    const filtered_cardData = cardData.filter(card => card.稀有度 === '世界');



    const [copyState, setCopyState] = useState(0);

    useEffect(()=>{
        if (copyState === 1) {
            const timer = setTimeout(() => {
                  setCopyState(0);
                }, 2000);
                return () => clearTimeout(timer);
        }
    }, [copyState])






    return (
        <div
            className="absolute w-full h-full"
            style={{filter: showDetailedImage ? 'blur(10px)' : 'none', transition: 'filter 0.3s ease'}}
        >


            {/*主页显示卡片轮播图*/}
            <div
                className="absolute flex justify-center"
                style={{
                    top: `${fontsize * 6}px`,
                    bottom: `${fontsize * 6}px`,
                    left: `${fontsize * 6}px`,
                    right: `${fontsize * 6}px`,
            }}
            >
                <Carousel
                    cardData={filtered_cardData}
                    // showDetailedImage={showDetailedImage}
                    setShowDetailedImage={setShowDetailedImage}
                    // detailedImage={detailedImage}
                    setDetailedImage={setDetailedImage}
                    fontsize={fontsize}
                />
            </div>


            {/*抽卡按钮*/}
            <div
                className="absolute flex justify-center gap-[4vmin]"
                style={{zIndex: showDetailedImage ? 2 : 4, bottom: `${fontsize * 3}px`, left: `${fontsize * 2}px`, right: `${fontsize * 2}px`}}>
                <button
                    style={{
                        fontSize: `${fontsize}px`,
                        backgroundColor: 'rgba(122,138,166,0.8)',
                        boxShadow: '0 0 10px #111214, 0 0 20px #111214',
                        color: 'white',
                        textShadow: '0 0 5px gray'
                    }}
                    onClick={() => {
                        setHasShownSummary(false);
                        setShowSummary(false);
                        handleDraw(1);
                        handleStartDraw();
                    }}
                >
                    感召一次
                </button>

                <button
                    style={{
                        fontSize: `${fontsize}px`,
                        backgroundColor: 'rgba(239,218,160,0.8)', // 或者用 Tailwind 的 bg-yellow-400
                        boxShadow: '0 0 10px gold, 0 0 20px gold',
                        color: 'white',
                        textShadow: '0 0 5px lightgray'
                    }}
                    onClick={(e) => {
                        setHasShownSummary(false);
                        setShowSummary(false);
                        handleDraw(10);
                        handleStartDraw();
                        e.stopPropagation(); // 阻止冒泡
                    }}
                >
                    感召十次
                </button>
            </div>


            {/*最上层按钮和文字*/}
            <div
                className="absolute flex flex-row justify-between"
                style={{top: `${fontsize * 2}px`, left: `${fontsize * 2}px`, right: `${fontsize * 2}px`}}
            >
                {/*左侧按钮*/}
                <div className="flex items-start justify-start gap-[1vmin]">
                    <button
                        style={{
                            fontSize: `${fontsize}px`,
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            color: 'white',
                            zIndex: showDetailedImage ? 2 : 4
                        }}
                        onClick={() => {
                            if(galleryHistory.length === 0) alert("没有抽卡历史");
                            else setShowGallery(true);
                            playClickSound();
                        }}
                    >
                        图鉴
                    </button>

                    <button
                        style={{
                            fontSize: `${fontsize}px`,
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            color: 'white',
                            zIndex: showDetailedImage ? 2 : 4
                        }}
                        onClick={() => {
                            playClickSound();
                            setShowHistory(true);
                        }}
                    >
                        历史
                    </button>

                    {/*筛选卡池*/}
                    <button
                        style={{
                            // visibility: 'hidden',
                            marginLeft: '3vmin',
                            fontSize: `${fontsize}px`,
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            color: 'white',
                            zIndex: showDetailedImage ? 2 : 4
                        }}
                        onClick={()=>{
                            playClickSound();
                            setShowCardPoolFilter(true);
                            // 放哪些世界卡进池子（活动，主角）；放不放星卡、辰星卡
                            // 世界卡组成：常驻+活动/ 是否单独几个主角
                        }}
                    >
                        筛选卡池
                    </button>

                    <button
                        style={{
                            marginLeft: '6vmin',
                            fontSize: `${fontsize}px`,
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            color: 'white',
                            zIndex: showDetailedImage ? 2 : 4
                        }}
                        onClick={clearLocalData}
                    >
                        清除所有记录
                    </button>
                </div>

                {/* 保底显示 */}
                <div className="flex flex-col">
                    <div
                        className="flex items-center justify-end text-white font-extrabold"
                        style={{
                            fontSize: `${fontsize}px`,
                            color: 'white',
                            textShadow: `
                                0 0 10px gold,
                                0 0 20px gold,
                                0 0 30px gold,
                                0 0 40px gold,
                                0 0 50px gold
                            `
                        }}
                    >
                        <label className="text-shadow"
                               style={{fontSize: `${fontsize * 1.5}px`,}}> {70 - pityCount} </label>
                        <label className="text-shadow"> 次感召必出 </label>
                        <img src="images/world.png" style={{width: `${fontsize * 3}px`}}/>
                        <label className="text-shadow">侧影</label>
                    </div>

                    {/*总抽卡数、总出金数、平均出金数*/}
                    <div
                        className="flex items-center justify-end gap-[1.5vmin]"
                        style={{
                            fontSize: `${fontsize * 0.8}px`,
                            color: 'white',
                            textShadow: '0 0 10px gold'
                        }}
                    >
                        <label className="text-shadow"> 总抽卡数：{totalDrawCount}</label>
                        <label className="text-shadow">总出金数：{totalFiveStarCount}</label>
                        <label className="text-shadow">平均出金数: {totalFiveStarCount === 0 ?
                            '0' : (totalDrawCount / totalFiveStarCount).toFixed(2)}
                        </label>
                    </div>

                    {/*保底显示*/}
                    <div
                        className="flex items-center justify-end"
                        style={{
                            fontSize: `${fontsize * 0.8}px`,
                            color: 'white',
                            textShadow: '0 0 10px gold'
                        }}
                    >
                        {(selectedRole.length === 1 && selectedRole[0] === "随机") || !useSoftGuarantee ? (
                            <>
                                还剩 {70 - pityCount} 抽 必得世界卡
                            </>
                        ) : softPityFailed ? (
                            <>
                                还剩 {70 - pityCount} 抽 大保底
                            </>
                        ) : (
                            <>
                                还剩 {70 - pityCount} 抽 小保底
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/*左下反馈*/}
            <div className="absolute flex flex-col" style={{left: `${fontsize * 2}px`, bottom: `${fontsize * 2}px`}}>
                <label
                    className="mb-[2vmin]"
                    style={{
                        fontSize: `${fontsize}px`,
                        color: 'white',
                        textShadow: '0 0 10px gold'
                    }}
                >
                    {copyState !== 2 ? "反馈bug或功能需求" : "小红书号840305422"}
                </label>
                <button
                    style={{
                        fontSize: `${fontsize}px`,
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        boxShadow: '0 0 10px #111214, 0 0 20px #111214',
                        color: 'white',
                        textShadow: '0 0 5px gray'
                    }}
                    onClick={async () => {
                        if (copyState === 2) setCopyState(0);
                        try {
                            await navigator.clipboard.writeText("840305422");
                            setCopyState(1);
                            alert("复制成功!");
                        } catch (err) {
                            console.error("复制失败:", err);
                            setCopyState(2);
                            alert("复制失败！小红书号：840305422");
                        }
                    }}
                >
                    {copyState === 0 ? "复制小红书号" : copyState === 1 ? "复制成功" : "复制失败" }
                </button>
            </div>


            <div className="absolute flex flex-col items-end" style={{right: `${fontsize * 2}px`, bottom: `${fontsize * 2}px`, fontSize: fontsize}}>
                <label style={{color: 'red', fontWeight: 800}}>重要提示：</label>
                <label>手机请竖屏，平板请横屏</label>
                <label>频繁旋转手机或平板可能会卡住</label>
                <label>关掉重开或刷新可解决</label>
            </div>
        </div>
    );
};

export default SettingsLayer;
