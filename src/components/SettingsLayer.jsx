import React, {useState} from 'react';
import Carousel from "./Carousel";
import cardData from "../assets/cards.json";

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
    setShowGallery,
    showProbability,
    setShowProbability,
    setIsSkipped,
    handleStartDraw,
}) => {

    const filtered_cardData = cardData.filter(card => card.稀有度 === '世界');

    const [showDetailedImage, setShowDetailedImage] = useState(false);
    const [showFullImage, setShowFullImage] = useState(false);




    return (
        <div
            className="relative w-screen h-screen cursor-pointer overflow-visible outline-none focus:outline-none z-10">

            {/*主页显示卡片轮播图*/}
            <div style={{
                width: '100vw', height: '90vh', display: 'flex', justifyContent: 'center',
                alignItems: 'center', position: 'absolute', top: 0, left: 0, zIndex: 3,
            }}>
                <Carousel
                    cardData={filtered_cardData}
                    showDetailedImage={showDetailedImage}
                    setShowDetailedImage={setShowDetailedImage}
                />
            </div>


            {/*抽卡按钮*/}
            <div
                className="absolute flex  justify-center bottom-[16vmin] w-screen"
                style={{
                    zIndex: showDetailedImage ? 2 : 4, // 确保按钮在动画下方
                }}
            >
                <button
                    className="mr-[1vmin] items-center justify-center" style={{
                    fontSize: '2vmin',
                    backgroundColor: 'rgba(122,138,166,0.8)', // 或者用 Tailwind 的 bg-yellow-400
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
                    className="ml-[1vmin] items-center justify-center"
                    style={{
                        fontSize: '2vmin',
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
            <div className="flex flex-row justify-between ml-[12vmin] mr-[12vmin] mt-[3vmin]">
                <div className="flex items-start justify-start gap-[1vmin]">
                    <button
                        style={{
                            fontSize: '2vmin',
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            color: 'white',
                            zIndex: showDetailedImage ? 2 : 4
                        }}
                    >
                        图鉴
                    </button>

                    <button
                        style={{
                            fontSize: '2vmin',
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            color: 'white',
                            zIndex: showDetailedImage ? 2 : 4
                        }}
                        onClick={() => {
                            setShowHistory(true);
                        }}
                    >
                        历史
                    </button>

                    <button
                        style={{
                            fontSize: '2vmin',
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
                            fontSize: '2.5vmin',
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
                        <label className="text-shadow" style={{fontSize: '4vmin'}}> {70 - pityCount} </label>
                        <label className="text-shadow"> 次感召必出 </label>
                        <img src="images/world.png" className="w-[7vmin] h-auto"/>
                        <label className="text-shadow"> 侧影 </label>
                    </div>

                    {/*总抽卡数、总出金数、平均出金数*/}
                    <div
                        className="flex items-center justify-end font-extrabold gap-[1.5vmin]"
                        style={{
                            fontSize: '2vmin',
                            color: 'white',
                            textShadow: '0 0 10px gold'
                        }}
                    >
                        <label className="text-shadow"> 总抽卡数：{totalDrawCount}</label>
                        <label className="text-shadow">总出金数：{totalFiveStarCount}</label>
                        <label className="text-shadow">平均出金数: {totalFiveStarCount === 0 ?
                            '0' : (totalDrawCount / totalFiveStarCount).toFixed(2)}</label>

                    </div>
                </div>

            </div>


        </div>
    );
};

export default SettingsLayer;
