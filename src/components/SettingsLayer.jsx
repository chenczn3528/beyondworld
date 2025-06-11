import React, {useEffect, useRef, useState} from 'react';
import Carousel from "./Carousel";
import cardData from "../assets/cards.json";
import {playClickSound} from "../utils/playClickSound.js";

const SettingsLayer = ({
    totalDrawCount,
    totalFiveStarCount,
    selectedRole,
    useSoftGuarantee,
    pityCount,
    softPityFailed,
    handleDraw,
    setShowHistory,
    setHasShownSummary,
    setShowSummary,
    clearLocalData,
    toggleMusic,
    isMusicPlaying,
    handleStartDraw,
    setShowCardPoolFilter,
    showDetailedImage,
    setShowDetailedImage,
    setDetailedImage,
    setShowGallery,
    fontsize,
    galleryHistory,
}) => {



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
            ref={divRef}
            className="absolute w-full h-full"
            style={{filter: showDetailedImage ? 'blur(10px)' : 'none', transition: 'filter 0.3s ease'}}
        >


            {/*主页显示卡片轮播图*/}
            <div
                className="absolute flex justify-center"
                style={{
                    top: `${baseSize * 12}px`,
                    bottom: `${baseSize * 12}px`,
                    left: `${baseSize * 12}px`,
                    right: `${baseSize * 12}px`,
            }}
            >
                <Carousel
                    cardData={filtered_cardData}
                    // showDetailedImage={showDetailedImage}
                    setShowDetailedImage={setShowDetailedImage}
                    // detailedImage={detailedImage}
                    setDetailedImage={setDetailedImage}
                    fontsize={baseSize * 7}
                />
            </div>


            {/*抽卡按钮*/}
            <div
                className="absolute flex justify-center gap-[4vmin]"
                style={{zIndex: showDetailedImage ? 2 : 4, bottom: `${baseSize * 12}px`, left: `${baseSize * 12}px`, right: `${fontsize * 2}px`}}>
                <button
                    style={{
                        fontSize: `${baseSize * 7}px`,
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
                        fontSize: `${baseSize * 7}px`,
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
                style={{top: `${baseSize * 12}px`, left: `${baseSize * 12}px`, right: `${baseSize * 12}px`}}
            >
                {/*左侧按钮*/}
                <div className="flex items-start justify-start gap-[1vmin]">
                    <button
                        style={{
                            fontSize: `${baseSize * 7}px`,
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
                            fontSize: `${baseSize * 7}px`,
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
                            marginLeft: '2vmin',
                            fontSize: `${baseSize * 7}px`,
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
                            marginLeft: '4vmin',
                            fontSize: `${baseSize * 7}px`,
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
                            fontSize: `${baseSize * 7}px`,
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
                               style={{fontSize: `${baseSize * 10}px`,}}> {70 - pityCount} </label>
                        <label className="text-shadow"> 次感召必出 </label>
                        <img src="images/world.png" style={{width: `${baseSize * 20}px`}}/>
                        <label className="text-shadow">侧影</label>
                    </div>

                    {/*总抽卡数、总出金数、平均出金数*/}
                    <div
                        className="flex items-center justify-end gap-[1.5vmin]"
                        style={{
                            fontSize: `${baseSize * 6}px`,
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
                            fontSize: `${baseSize * 6}px`,
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
            <div className="absolute flex flex-col" style={{left: `${baseSize * 12}px`, bottom: `${baseSize * 12}px`}}>
                <label style={{color: "yellow", fontSize: baseSize * 7}}>可以的话 希望宝宝们去我主页</label>
                <label style={{color: "yellow", fontSize: baseSize * 7}}>投票看看想要哪种背景音乐❤</label>
                <label
                    className="mb-[2vmin]"
                    style={{
                        fontSize: `${baseSize * 7}px`,
                        color: 'white',
                        textShadow: '0 0 10px gold'
                    }}
                >
                    {copyState !== 2 ? "反馈bug或功能需求" : "小红书号840305422"}
                </label>
                <button
                    style={{
                        fontSize: `${baseSize * 7}px`,
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        boxShadow: '0 0 10px #111214, 0 0 20px #111214',
                        color: 'white',
                        width: `${baseSize * 60}px`,
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
                    {copyState === 0 ? "复制小红书号" : copyState === 1 ? "复制成功" : "复制失败"}
                </button>
            </div>


            <div className="absolute flex flex-col items-end" style={{right: `${baseSize * 12}px`, bottom: `${baseSize * 12}px`, fontSize: baseSize * 7}}>
                <label style={{color: 'red', fontWeight: 800}}>重要提示：</label>
                <label>手机请竖屏，平板请横屏</label>
                <label>频繁旋转手机或平板可能会卡住</label>
                <label>关掉重开或刷新可解决</label>
                <label style={{color: "yellow"}}>旋转屏幕后最好刷新一下</label>
            </div>
        </div>
    );
};

export default SettingsLayer;
