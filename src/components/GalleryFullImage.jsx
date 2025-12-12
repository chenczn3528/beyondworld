import React, { useEffect, useMemo, useState } from 'react';
import StarIcon from "../icons/StarIcon.jsx";
import LeftIcon from "../icons/LeftIcon.jsx";
import CardMeet from "./CardMeet.jsx";
import useCardImageIndex from "../hooks/useCardImageIndex.js";
import FadeImage from "./FadeImage.jsx";
import { Asset } from './Asset.jsx';
import VideoPage from "./VideoPage.jsx";
import InfoIcon from "../icons/InfoIcon.jsx";

const interactionFields = ['互动1名称', '互动2名称', '叠卡互动名称', '重逢互动名称'];

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
    const [showCardDetails, setShowCardDetails] = useState(false);

    const attributes = ['思维', '魅力', '体魄', '感知', '灵巧'];
    const sizeUnit = baseSize ? baseSize * 6.5 : (fontsize || 1);
    const button_style = {
        marginRight: '1vmin',
        color: 'white',
        textShadow: '0 0 2px gray, 0 0 4px gray',
        fontSize: `${sizeUnit}px`,
        background: '#ffffff20',
    }

    const availableVideos = useMemo(() => {
        if (!card) return [];
        return Object.entries(card)
            .filter(([key, value]) => {
                if (!value) return false;
                if (typeof value === 'string' && value.trim() === '') return false;
                if (typeof value !== 'string') return false;
                return key.includes('视频') && !key.includes('作者');
            })
            .map(([key, value]) => {
                const authorField = `${key}作者`;
                return {
                    field: key,
                    label: key,
                    authorField,
                    url: value,
                    author: card?.[authorField] || '',
                };
            });
    }, [card]);

    const detailRows = useMemo(() => {
        if (!card) return [];
        const rows = [
            {
                key: 'row-name-main',
                values: [
                    { label: '卡名', value: card.卡名 },
                    { label: '主角', value: card.主角 },
                ],
            },
            {
                key: 'row-rarity',
                values: [
                    { label: '稀有度', value: card.稀有度 },
                    { label: '稀有度数值', value: card.稀有度数值 },
                ],
            },
            {
                key: 'row-world',
                values: [
                    { label: '板块', value: card.板块 },
                    { label: '世界', value: card.世界 },
                ],
            },
            {
                key: 'row-identity',
                values: [
                    { label: '所属世界', value: card.所属世界 },
                    { label: '关联身份', value: card.关联身份 }
                ],
            },
            {
                key: 'row-source-obtain',
                values: [
                    { label: '来源', value: card.来源 },
                    { label: '获取途径', value: card.获取途径 },
                ],
            },
            {
                key: 'row-type-attr',
                values: [
                    { label: '类型', value: card.类型 },
                    { label: '属性', value: card.属性 },
                ],
            },
        ];

        interactionFields.forEach((field) => {
            if (card?.[field]) {
                rows.push({
                    key: `interaction-${field}`,
                    values: [{ label: field, value: card[field] }],
                });
            }
        });

        return rows.filter((row) =>
            row.values.some(
                (item) => item.value !== undefined && item.value !== null && String(item.value).trim() !== ''
            )
        );
    }, [card]);

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
            setShowCardDetails(false);
        }
    }, [showGalleryFullImage]);

    useEffect(() => {
        setShowCardDetails(false);
    }, [card]);

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
                        fontsize={sizeUnit}
                    />

                    {showCardDetails && detailRows.length > 0 && (
                        <div
                            className="absolute w-full h-full z-[650] flex items-center justify-center"
                            style={{
                                backgroundColor: 'rgba(0,0,0,0.5)',
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowCardDetails(false);
                            }}
                        >
                            <div
                                style={{
                                    backgroundColor: 'transparent',
                                    borderRadius: `${sizeUnit * 0.8}px`,
                                    padding: `${sizeUnit * 1.2}px`,
                                    color: 'white',
                                    textShadow: '0 0 2px black, 0 0 4px black',
                                    // minWidth: `${sizeUnit * (isPortrait ? 40 : 28)}px`,
                                    // maxWidth: `${sizeUnit * (isPortrait ? 48 : 34)}px`,
                                    width: `${sizeUnit * 36}px`,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: `${sizeUnit * 0.8}px`,
                                    overflow: 'hidden',
                                    border: '1px solid rgba(255,255,255,0.25)',
                                    boxShadow: '0 0 20px rgba(0,0,0,0.4)',
                                    backdropFilter: 'blur(6px)',
                                    maxHeight: `${sizeUnit * 24}px`,
                                    overflowY: 'auto',
                                }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                {detailRows.map((row) => {
                                    const filteredValues = row.values.filter(
                                        (item) =>
                                            item.value !== undefined &&
                                            item.value !== null &&
                                            String(item.value).trim() !== ''
                                    );
                                    if (!filteredValues.length) return null;

                                    return (
                                        <div
                                            key={row.key}
                                            style={{
                                                display: 'grid',
                                                gridTemplateColumns: `repeat(auto-fit, minmax(${sizeUnit * 8}px, 1fr))`,
                                                gap: `${sizeUnit * 0.8}px`,
                                                fontSize: `${sizeUnit * 1.1}px`,
                                                lineHeight: 1.4,
                                                width: '100%',
                                            }}
                                        >
                                            {filteredValues.map((item) => (
                                                <div
                                                    key={`${row.key}-${item.label}`}
                                                    style={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: `${sizeUnit * 0.1}px`,
                                                        minHeight: `${sizeUnit * 2.2}px`,
                                                    }}
                                                >
                                                    <span style={{color: 'rgba(255,255,255,0.65)', fontSize: `${sizeUnit}px`}}>
                                                        {item.label}
                                                    </span>
                                                    <span
                                                        style={{
                                                            color: 'rgba(255,255,255,0.95)',
                                                            fontWeight: 500,
                                                            fontSize: `${sizeUnit * 1.1}px`,
                                                            wordBreak: 'break-word',
                                                        }}
                                                    >
                                                        {item.value}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

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
                                         marginLeft: `${sizeUnit * 1.2}px`,
                                         bottom: `${sizeUnit * 11.3}px`,
                                         left: `${sizeUnit * 2}px`,
                                     }}>
                                    <label
                                        style={{
                                            fontSize: `${sizeUnit * 1.5}px`,
                                            fontWeight: 600,
                                            marginRight: `${sizeUnit}px`,}}
                                    >
                                        {card.主角}
                                    </label>
                                    <StarIcon color="lightgray" size={sizeUnit}/>
                                    <label style={{fontSize: `${sizeUnit}px`, fontStyle: "italic"}}>{card.世界}</label>
                                </div>

                                {/*稀有度 卡名*/}
                                <div className="absolute flex items-center" style={{bottom: `${sizeUnit * 6.5}px`,left: `${sizeUnit * 2}px`}}>
                                    <Asset
                                        src={rarityMap[card.稀有度]}
                                        type="image"
                                        style={{height: `${sizeUnit * 5}px`, width: 'auto', marginRight: `${sizeUnit / 2}px`,}}
                                    />
                                    <label
                                        style={{
                                            color: 'white',
                                            fontStyle: "italic",
                                            fontSize: `${sizeUnit * 2.3}px`,
                                            fontWeight: 800,
                                            textShadow: '0 0 2px gray, 0 0 4px gray',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {card.卡名}
                                    </label>
                                </div>

                                {/*各属性的值*/}
                                <div className="absolute flex flex-row" style={{bottom: `${sizeUnit * 2.5}px`,left: `${sizeUnit * 3}px`}}>
                                    {attributes.map(attr => (
                                        <div key={attr} className="flex flex-col items-center" style={{marginRight: `${sizeUnit}px`,}}>
                                            <Asset
                                                src={`60px-${attr}.png`}
                                                type="image"
                                                style={{width: `${sizeUnit * 2}px`}}
                                            />
                                            <label
                                                style={{
                                                    color: card.属性 === attr ? 'gold' : 'white',
                                                    fontWeight: 500,
                                                    fontSize: `${sizeUnit}px`,
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
                                        top: `${sizeUnit}px`,
                                        left: `${sizeUnit}px`,
                                    }}
                                >
                                    <LeftIcon size={baseSize * 24} color="white"/>
                                </button>

                                <div
                                    className="absolute flex items-center"
                                    style={{
                                        top: `${sizeUnit * 2}px`,
                                        right: `${sizeUnit * 3}px`,
                                        gap: `${sizeUnit * 0.5}px`,
                                    }}
                                >
                                    <button
                                        style={{
                                            ...button_style,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            padding: `${sizeUnit * 0.3}px`,
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowCardDetails((prev) => !prev);
                                        }}
                                        aria-label="查看卡片详情"
                                    >
                                        <InfoIcon size={sizeUnit * 1.6} color="white"/>
                                    </button>
                                    {showVideoButtons && availableVideos.length > 0 && (
                                        <button
                                            style={{
                                                ...button_style,
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openVideoPage(0);
                                            }}
                                        >
                                            视频
                                        </button>
                                    )}
                                    <button
                                        className="w-auto flex items-center justify-center"
                                        style={{...button_style}}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowMeet(true);
                                        }}
                                    >
                                        相会
                                    </button>
                                </div>

                                {/*右下角按钮*/}
                                <div
                                    className="absolute flex flex-col items-end justify-center"
                                    style={{right: `${sizeUnit * 3}px`, bottom: `${sizeUnit * 2}px`,}}
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
