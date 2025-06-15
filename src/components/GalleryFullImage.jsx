import React, { useState} from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import StarIcon from "../icons/StarIcon.jsx";
import LeftIcon from "../icons/LeftIcon.jsx";
import CardMeet from "./CardMeet.jsx";
import useCardImageIndex from "../hooks/useCardImageIndex.js";
import FadeImage from "./FadeImage.jsx";

const GalleryFullImage = (
{
    baseSize,
    card,
    showGalleryFullImage,
    setShowGalleryFullImage,
    fontsize,
}) => {

    const { getImageIndex, setImageIndex } = useCardImageIndex();
    const currentCardName = card?.卡名 || '';
    const showPictureNumber = getImageIndex(currentCardName);

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


    const attributes = ['思维', '魅力', '体魄', '感知', '灵巧'];
    const button_style = {
        marginRight: '1vmin',
        color: 'white',
        textShadow: '0 0 2px gray, 0 0 4px gray',
        fontSize: `${fontsize}px`,
        background: '#ffffff20',
    }

    const getButtonStyle = (index) => ({
      ...button_style,
      color: showPictureNumber === index ? 'white' : 'gray',
      textShadow: showPictureNumber === index ? button_style.textShadow : null,
    });

    const rarityMap = {
        世界: 'images/world.png',
        月: 'images/moon.png',
        辰星: 'images/star1.png',
        星: 'images/star2.png',
    };


    return (
        showGalleryFullImage && (
            <div
                style={{backgroundColor: 'black'}}
                className="absolute w-full h-full z-[100]"
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
                            cardSrc={showPictureNumber === 0 ? card?.图片信息?.[0]?.src :
                                showPictureNumber === 1 ? card?.图片信息?.[1]?.src : card?.图片信息?.[2]?.src}
                            cardSrcset={showPictureNumber === 0 ? card?.图片信息?.[0]?.srcset2 :
                                showPictureNumber === 1 ? card?.图片信息?.[1]?.srcset2 : card?.图片信息?.[2]?.srcset2}
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
                                <img
                                    src={rarityMap[card.稀有度]}
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
                                        <img
                                            src={`images/60px-${attr}.png`} style={{width: `${fontsize * 2}px`}}/>
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
                                    padding: 10,
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


                            {/*右下角按钮*/}
                            <div
                                className="absolute flex flex-col items-end justify-center"
                                style={{right: `${fontsize * 3}px`, bottom: `${fontsize * 2}px`,}}
                            >
                                {/*初始、重逢、无色卡面*/}
                                <div className="flex flex-row mt-[1vmin]">
                                    <button style={getButtonStyle(0)}
                                            onClick={(e) => {e.stopPropagation();onChangePictureNumber(0)}}>初始</button>

                                    {card.图片信息.length > 1 && (
                                        <button style={getButtonStyle(1)}
                                                onClick={(e) => {e.stopPropagation();onChangePictureNumber(1)}}>重逢</button>
                                    )}

                                    {card.图片信息.length === 3 && (
                                        <button style={getButtonStyle(2)}
                                                onClick={(e) => {e.stopPropagation();onChangePictureNumber(2)}}>无色</button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        )
    );
};

export default GalleryFullImage;
