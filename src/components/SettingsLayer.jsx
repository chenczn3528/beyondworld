import React, {useEffect, useState} from 'react';
import Carousel from "./Carousel";
import cardData from "../assets/cards.json";
import {playClickSound} from "../utils/playClickSound.js";
import MusicIcon from "../icons/MusicIcon.jsx";
import { Asset } from './Asset.jsx';
import { useAssetLoader } from '../hooks/useAssetLoader';
import MusicVolumeIcon from '../icons/MusicVolumeIcon.jsx';

const SettingsLayer = ({
    baseSize,
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
    showMusicPageZIndex,
    setShowMusicPageZIndex,
    selectedPools,
    cardData,
    openAssetTest,
}) => {

    const filtered_cardData = cardData.filter(card => card.稀有度 === '世界' || card.稀有度 === '刹那');

    const [copyState, setCopyState] = useState(0);
    const { loadAsset } = useAssetLoader();

    // 音效增益设置开关与数值
    const [showGainCtrl, setShowGainCtrl] = useState(false);
    const [sfxGain, setSfxGain] = useState(() => {
        try {
            const saved = localStorage.getItem('sfxGain');
            const v = saved ? parseFloat(saved) : 1;
            return Number.isNaN(v) ? 1 : v;
        } catch { return 1; }
    });

    useEffect(() => {
        try { localStorage.setItem('sfxGain', String(sfxGain)); } catch {}
    }, [sfxGain]);

    // 点击外部区域关闭音效设置面板
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showGainCtrl) {
                // 检查点击是否在音效设置面板外部
                const gainPanel = document.querySelector('[data-gain-panel]');
                const gainButton = document.querySelector('[data-gain-button]');
                
                if (gainPanel && gainButton && 
                    !gainPanel.contains(event.target) && 
                    !gainButton.contains(event.target)) {
                    setShowGainCtrl(false);
                    playClickSound();
                }
            }
        };

        if (showGainCtrl) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [showGainCtrl]);

    const playTestSfx = async () => {
        try {
            const url = await loadAsset('audio', '切换音效.mp3');
            if (!url) return;
            const audio = new Audio(url);
            audio.volume = 1;
            try {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                const ctx = new AudioCtx();
                if (ctx.state === 'suspended') {
                    try { await ctx.resume(); } catch {}
                }
                const source = ctx.createMediaElementSource(audio);
                const gainNode = ctx.createGain();
                gainNode.gain.value = sfxGain > 0 ? sfxGain : 1;
                source.connect(gainNode);
                gainNode.connect(ctx.destination);
            } catch {}
            audio.currentTime = 0;
            await audio.play();
        } catch {}
    };

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

                {/*素材测试*/}
                <button className='absolute'
                        style={{fontSize: `${fontsize * 1.2}px`, top: `${fontsize * 4}px`, backgroundColor: 'rgba(255,255,255,0.4)', color: 'white', zIndex: showDetailedImage ? 2 : 4}} 
                        onClick={() => openAssetTest && openAssetTest()}>
                        动画缓存
                </button>

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
                            `,
                            whiteSpace: 'nowrap'
                        }}
                    >
                        <label className="text-shadow"
                               style={{fontSize: `${baseSize * 10}px`, whiteSpace: 'nowrap'}}> {70 - pityCount} </label>
                        <label className="text-shadow" style={{whiteSpace: 'nowrap'}}> 次感召必出 </label>
                        <Asset src="world.png" type="image" style={{height: `${baseSize * 20}px`}}/>
                        {(() => {
                          // 检查是否选择了包含刹那卡的卡池
                          const hasInstantCards = cardData.some(card => 
                            card.稀有度 === '刹那' && 
                            selectedPools.includes(card.获取途径)
                          );
                          return hasInstantCards ? (
                            <>
                              <label className="text-shadow" style={{whiteSpace: 'nowrap'}}> 或 </label>
                              <Asset src="instant.png" type="image" style={{height: `${baseSize * 20}px`}}/>
                            </>
                          ) : null;
                        })()}
                        <label className="text-shadow" style={{whiteSpace: 'nowrap'}}>侧影</label>
                    </div>

                    {/*总抽卡数、总出金数、平均出金数*/}
                    <div
                        className="flex items-center justify-end gap-[1.5vmin]"
                        style={{
                            fontSize: `${baseSize * 6}px`,
                            color: 'white',
                            textShadow: '0 0 10px gold',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        <label className="text-shadow" style={{whiteSpace: 'nowrap'}}> 总抽卡数：{totalDrawCount}</label>
                        <label className="text-shadow" style={{whiteSpace: 'nowrap'}}>总出金数：{totalFiveStarCount}</label>
                        <label className="text-shadow" style={{whiteSpace: 'nowrap'}}>平均出金数: {totalFiveStarCount === 0 ?
                            '0' : (totalDrawCount / totalFiveStarCount).toFixed(2)}
                        </label>
                    </div>

                    {/*保底显示*/}
                    <div
                        className="flex items-center justify-end"
                        style={{
                            fontSize: `${baseSize * 6}px`,
                            color: 'white',
                            textShadow: '0 0 10px gold',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {(selectedRole.length === 1 && selectedRole[0] === "随机") || !useSoftGuarantee ? (
                            <>
                                还剩 {70 - pityCount} 抽 必得金卡
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
                <label
                    className="mb-[2vmin]"
                    style={{
                        fontSize: `${baseSize * 7}px`,
                        color: 'white',
                        textShadow: '0 0 10px gold',
                        whiteSpace: 'nowrap'
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
                        textShadow: '0 0 5px gray',
                        whiteSpace: 'nowrap',
                        zIndex: showDetailedImage ? 2 : 4
                    }}
                    onClick={async () => {
                        playClickSound();
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

            {/*音乐按钮*/}
            <button className="absolute z-20"
                onClick={(e) => {
                    playClickSound();
                    e.stopPropagation();
                    setShowMusicPageZIndex(200);
                }}
                style={{
                    background: '#ffffff05',
                    border: 'none',
                    padding: 0,
                    bottom: `${baseSize * 13}px`,
                    left: `${baseSize * 76}px`,
                }}
            >
                <MusicIcon size={baseSize * 16} color="white"/>
            </button>

            {/* 音效增益按钮与隐藏面板 */}
            <button className="absolute z-20"
                data-gain-button
                onClick={() => {playClickSound(); setShowGainCtrl(v => !v)}}
                style={{
                    background: '#ffffff05',
                    border: 'none',
                    padding: 0,
                    bottom: `${baseSize * 13}px`,
                    left: `${baseSize * 96}px`,
                }}
            >
                <MusicVolumeIcon size={baseSize * 16} color="white"/>
            </button>


            
            {showGainCtrl && (
                <div className="absolute items-center gap-[1vmin]"
                        data-gain-panel
                        style={{
                        bottom: `${baseSize * 33}px`,
                        left: `${baseSize * 96}px`,
                        padding: `${baseSize * 4}px`,
                        borderRadius: `${baseSize * 1}px`,
                        backgroundColor: 'rgba(43, 45, 57)',
                        }}
                >
                    <label style={{color: 'white', textShadow: '0 0 6px black', fontSize: `${baseSize * 6}px`, whiteSpace: 'nowrap', marginRight: `${baseSize * 5}px`}}>音效音量大小</label>
                    <input
                        type="range"
                        min="0.5"
                        max="10"
                        step="0.1"
                        value={sfxGain}
                        onChange={(e) => setSfxGain(parseFloat(e.target.value))}
                        onMouseUp={playTestSfx}
                        onTouchEnd={playTestSfx}
                        style={{width: `${baseSize * 40}px`}}
                    />
                    <span style={{color: 'white', textShadow: '0 0 6px black', fontSize: `${baseSize * 6}px`, minWidth: `${baseSize * 8}px`, textAlign: 'right'}}>
                        {`${(sfxGain || 1).toFixed(1)}`}
                    </span>
                </div>
            )}

            <div className="absolute flex flex-col items-end"
                 style={{right: `${baseSize * 12}px`, bottom: `${baseSize * 12}px`, fontSize: baseSize * 7}}>
                <label style={{color: 'red', fontWeight: 800, whiteSpace: 'nowrap'}}>重要提示：</label>
                <label style={{whiteSpace: 'nowrap'}}>手机请竖屏，平板请横屏</label>
                <label style={{whiteSpace: 'nowrap'}}>频繁旋转手机或平板可能会卡住</label>
                <label style={{whiteSpace: 'nowrap'}}>关掉重开或刷新可解决</label>
                <label style={{color: "yellow", whiteSpace: 'nowrap'}}>旋转屏幕后最好刷新一下</label>
                <label style={{whiteSpace: 'nowrap'}}>数据来源：世界之外WIKI</label>
            </div>
        </div>
    );
};

export default SettingsLayer;
