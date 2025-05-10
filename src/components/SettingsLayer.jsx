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
                style={{
                    width: '100vw',
                    height: '40vh',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    zIndex: showDetailedImage ? 2 : 4, // 确保按钮在动画下方
                }}
            >
                <button
                    className="mr-[1vw] items-center justify-center" style={{
                    width: '10vw',
                    height: '4vw',
                    fontSize: '1.2vw',
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
                    className="ml-[1vw] items-center justify-center"
                    style={{
                        width: '10vw',
                        height: '4vw',
                        fontSize: '1.2vw',
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

            <button
                className="absolute ml-[8vw] mt-[3vw] items-center justify-center"
                style={{
                    fontSize: '1.2vw',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    zIndex: showDetailedImage ? 2 : 4
                }}
            >
                图鉴
            </button>


            {/* 保底显示 */}
            <div
                className="flex items-center text-white font-extrabold ml-[70vw] mt-[3vw]"
                style={{
                    fontSize: '1.2vw',
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
                <label className="text-shadow" style={{fontSize: '2vw'}}> {70 - pityCount} </label>
                <label className="text-shadow"> 次感召必出 </label>
                <img src="images/world.png" className="w-[3vw] h-auto"/>
                <label className="text-shadow"> 侧影 </label>
            </div>


        </div>
    );
};

export default SettingsLayer;
