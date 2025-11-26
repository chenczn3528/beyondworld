import React, { useEffect, useState } from 'react';
import StarIcon from "../icons/StarIcon.jsx";
import LeftIcon from "../icons/LeftIcon.jsx";
import CardMeet from "./CardMeet.jsx";
import useCardImageIndex from "../hooks/useCardImageIndex.js";
import FadeImage from "./FadeImage.jsx";
import { Asset } from './Asset.jsx';
import VideoPage from "./VideoPage.jsx";

const GalleryFullImage = (
{
    baseSize,
    card,
    showGalleryFullImage,
    setShowGalleryFullImage,
    fontsize,
    showVideoButtons = false,
    isPortrait,
}) => {

    const { getImageIndex, setImageIndex } = useCardImageIndex();
    const currentCardName = card?.卡名 || '';
    const showPictureNumber = getImageIndex(currentCardName);

    const isMomentCard = card?.稀有度 === '瞬';
    const pictures = Array.isArray(card?.图片信息) ? card.图片信息 : [];
    const pictureCount = pictures.length;
    const currentImage = pictures[showPictureNumber] ?? pictures[0] ?? {};
    const cardSrc = currentImage?.src || '';
    const cardSrcset = currentImage?.srcset2 || currentImage?.srcset || currentImage?.src || '';
    const isMomentRotated = isMomentCard && showPictureNumber > 0;

    // 按钮点击时调用 setImageIndex 更新索引
    const onChangePictureNumber = (index) => {
        if (currentCardName) {
            setImageIndex(currentCardName, index);
            // GalleryFullImage 中点击时：
            window.dispatchEvent(
                new CustomEvent('custom:imageIndexChanged', {
                    detail: { cardName: card.卡名, newIndex: index }
                })
            );
        }
    };

    const [showInformation, setShowInformation] = useState(true);
    const [showMeet, setShowMeet] = useState(false);
    const [activeVideoUrl, setActiveVideoUrl] = useState(null);
    const [videoList, setVideoList] = useState([]);
    const [defaultVideoIndex, setDefaultVideoIndex] = useState(0);
    const [videoPageZIndex, setVideoPageZIndex] = useState(-1);

    const attributes = ['思维', '魅力', '体魄', '感知', '灵巧'];
    const button_style = {
        marginRight: '1vmin',
        color: 'white',
        textShadow: '0 0 2px gray, 0 0 4px gray',
        fontSize: `${fontsize}px`,
        background: '#ffffff20',
    }

    const videoOptions = [
        { field: '重逢视频', label: '重逢视频', authorField: '重逢视频作者' },
        { field: '满花视频', label: '满花视频', authorField: '满花视频作者' },
        { field: '抽卡视频', label: '抽卡视频', authorField: '抽卡视频作者' },
    ];
    const availableVideos = videoOptions
        .map((option) => ({
            ...option,
            url: card?.[option.field],
            author: card?.[option.authorField],
        }))
        .filter(({ url }) => url);
    const openVideoPage = (index = 0) => {
        if (!availableVideos.length) return;
        const clamped = Math.max(0, Math.min(index, availableVideos.length - 1));
        setVideoList(availableVideos);
        setDefaultVideoIndex(clamped);
        setActiveVideoUrl(availableVideos[clamped].url);
        setVideoPageZIndex(700);
    };

    useEffect(() => {
        if (!showGalleryFullImage) {
            setActiveVideoUrl(null);
            setVideoList([]);
            setDefaultVideoIndex(0);
            setVideoPageZIndex(-1);
        }
    }, [showGalleryFullImage]);

    const handleVideoPageState = (nextZ) => {
        if (nextZ === -1) {
            setActiveVideoUrl(null);
            setVideoList([]);
            setDefaultVideoIndex(0);
            setVideoPageZIndex(-1);
        } else {
            setVideoPageZIndex(nextZ);
        }
    };

    const getButtonStyle = (index) => ({
      ...button_style,
      color: showPictureNumber === index ? 'white' : 'gray',
      textShadow: showPictureNumber === index ? button_style.textShadow : null,
    });

    const renderImageButtons = () => {
        if (pictureCount === 0) return null;

        const buttonConfigs = [];

        if (isMomentCard) {
            const momentButtons = [
                { index: 0, label: '初始' },
                { index: 1, label: '初始(竖)' },
                { index: 2, label: '重逢(竖)' },
                { index: 3, label: '初始(签名)' },
                { index: 4, label: '重逢(签名)' },
            ];
            momentButtons.forEach(({ index, label }) => {
                if (index < pictureCount) {
                    buttonConfigs.push({ index, label });
                }
            });
        } else {
            buttonConfigs.push({ index: 0, label: '初始' });
            if (pictureCount > 1) {
                buttonConfigs.push({ index: 1, label: '重逢' });
            }
            if (pictureCount > 2) {
                if (pictureCount === 3) {
                    buttonConfigs.push({ index: 2, label: '无色' });
                } else {
                    buttonConfigs.push({
                        index: 2,
                        label: pictures[2]?.name || pictures[2]?.type || '卡面3',
                    });
                }
            }
            if (pictureCount > 3) {
                for (let i = 3; i < pictureCount; i += 1) {
                    const label = pictures[i]?.name || pictures[i]?.type || `卡面${i + 1}`;
                    buttonConfigs.push({ index: i, label });
                }
            }
        }

        return buttonConfigs.map(({ index, label }) => (
            <button
                key={`card-image-btn-${index}`}
                style={getButtonStyle(index)}
                onClick={(e) => {
                    e.stopPropagation();
                    onChangePictureNumber(index);
                }}
            >
                {label}
            </button>
        ));
    };

    const rarityMap = {
        刹那: 'instant.png',
        世界: 'world.png',
        瞬: 'moment.png',
        月: 'moon.png',
        辰星: 'star1.png',
        星: 'star2.png',
    };

    return (
        showGalleryFullImage && (
            <>
                <div
                    style={{backgroundColor: 'black'}}
                    className="absolute w-full h-full z-[500]"
                >
                    <CardMeet
                        showMeet={showMeet}
                        setShowMeet={setShowMeet}
                        card={card}
                        fontsize={fontsize}
                    />

                    <div
                        style={{
                            filter: showMeet ? 'blur(10px)' : 'none',
                            transition: 'filter 0.3s ease',
                        }}
                        className="relative w-full h-full flex"
                        onClick={() => setShowInformation(!showInformation)}
                    >
                        <div >
                            <FadeImage
                                cardSrc={cardSrc}
                                cardSrcset={cardSrcset}
                                isRotated={isMomentRotated}
                                baseSize={baseSize}
                            />
                        </div>

                        {showInformation && (
                            <div className="absolute w-full h-full">
                                {/*角色名 世界*/}
                                <div className="absolute flex items-center"
                                     style={{
                                         color: 'white',
                                         textShadow: '0 0 1px gray, 0 0 2px gray',
                                         marginLeft: `${fontsize * 1.2}px`,
                                         bottom: `${fontsize * 11.3}px`,
                                         left: `${fontsize * 2}px`,
                                     }}>
                                    <label
                                        style={{
                                            fontSize: `${fontsize * 1.5}px`,
                                            fontWeight: 600,
                                            marginRight: `${fontsize}px`,}}
                                    >
                                        {card.主角}
                                    </label>
                                    <StarIcon color="lightgray" size={fontsize}/>
                                    <label style={{fontSize: `${fontsize}px`, fontStyle: "italic"}}>{card.世界}</label>
                                </div>

                                {/*稀有度 卡名*/}
                                <div className="absolute flex items-center" style={{bottom: `${fontsize * 6.5}px`,left: `${fontsize * 2}px`}}>
                                    <Asset
                                        src={rarityMap[card.稀有度]}
                                        type="image"
                                        style={{height: `${fontsize * 5}px`, width: 'auto', marginRight: `${fontsize / 2}px`,}}
                                    />
                                    <label
                                        style={{
                                            color: 'white',
                                            fontStyle: "italic",
                                            fontSize: `${fontsize * 2.3}px`,
                                            fontWeight: 800,
                                            textShadow: '0 0 2px gray, 0 0 4px gray',
                                        }}
                                    >
                                        {card.卡名}
                                    </label>
                                </div>

                                {/*各属性的值*/}
                                <div className="absolute flex flex-row" style={{bottom: `${fontsize * 2.5}px`,left: `${fontsize * 3}px`}}>
                                    {attributes.map(attr => (
                                        <div key={attr} className="flex flex-col items-center" style={{marginRight: `${fontsize}px`,}}>
                                            <Asset
                                                src={`60px-${attr}.png`}
                                                type="image"
                                                style={{width: `${fontsize * 2}px`}}
                                            />
                                            <label
                                                style={{
                                                    color: card.属性 === attr ? 'gold' : 'white',
                                                    fontWeight: 500,
                                                    fontSize: `${fontsize}px`,
                                                    textShadow: '0 0 2px gray, 0 0 4px gray',
                                                }}
                                            >
                                                {card[attr]}
                                            </label>
                                        </div>
                                    ))}
                                </div>

                                {/*返回按钮*/}
                                <button className="absolute w-auto flex items-center justify-center"
                                    onClick={(e) => {e.stopPropagation();setShowGalleryFullImage(false)}}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        padding: 0,
                                        top: `${fontsize}px`,
                                        left: `${fontsize}px`,
                                    }}
                                >
                                    <LeftIcon size={baseSize * 24} color="white"/>
                                </button>

                                {/*相会*/}
                                <button className="absolute w-auto flex items-center justify-center"
                                    style={{...button_style, top: `${fontsize * 2}px`, right: `${fontsize * 3}px`,}}
                                    onClick={(e) => {e.stopPropagation();setShowMeet(true)}}
                                >相会</button>

                                {showVideoButtons && availableVideos.length > 0 && (
                                    <button
                                        className="absolute"
                                        style={{
                                            ...button_style,
                                            position: 'absolute',
                                            top: `${fontsize * 2}px`,
                                            right: `${fontsize * 8}px`,
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openVideoPage(0);
                                        }}
                                    >
                                        视频
                                    </button>
                                )}

                                {/*右下角按钮*/}
                                <div
                                    className="absolute flex flex-col items-end justify-center"
                                    style={{right: `${fontsize * 3}px`, bottom: `${fontsize * 2}px`,}}
                                >
                                    {/*初始、重逢、无色卡面（瞬：初始、初始（竖）、重逢等）*/}
                                    <div
                                        className="flex flex-row mt-[1vmin]"
                                        style={{flexWrap: 'wrap', gap: '0.5vmin'}}
                                    >
                                        {renderImageButtons()}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                </div>

                {activeVideoUrl && (
                    <VideoPage
                        baseSize={baseSize}
                        isPortrait={isPortrait}
                        showPageZIndex={videoPageZIndex}
                        setShowPageZIndex={handleVideoPageState}
                        video_url={activeVideoUrl}
                        videos={videoList}
                        defaultIndex={defaultVideoIndex}
                    />
                )}
            </>
        )
    );
};

export default GalleryFullImage;
