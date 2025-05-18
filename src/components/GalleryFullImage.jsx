import React, { useEffect, useRef, useState } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { forceLandscape, useDynamicRem } from 'single-screen-utils';
import StarIcon from "../icons/StarIcon.jsx";
import LeftIcon from "../icons/LeftIcon.jsx";
import CardMeet from "./CardMeet.jsx";

const GalleryFullImage = (
{
    card,
    showGalleryFullImage,
    setShowGalleryFullImage,
}) => {

    const [showPictureNumber, setShowPictureNumber] = useState(0);
    const [showInformation, setShowInformation] = useState(true);
    const [showMeet, setShowMeet] = useState(false);

    const attributes = ['思维', '魅力', '体魄', '感知', '灵巧'];
    const button_style = {
        marginRight: '1vmin',
        color: 'white',
        textShadow: '0 0 2px gray, 0 0 4px gray',
        fontSize: '3vmin',
        background: '#ffffff20',
    }

    const getButtonStyle = (index) => ({
        ...button_style,
        color: showPictureNumber === index ? 'white' : 'gray',
        textShadow: showPictureNumber === index ? button_style.textShadow : null
    });

    useEffect(()=>{
        forceLandscape();
    },[])

    useDynamicRem({
        pageWidth: 750,
        pageHeight: 1334,
        mode: 'landscape'
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
                id="app"
                style={{backgroundColor: 'black'}}
                className="fixed inset-[0] z-50 w-full h-full flex justify-center items-center"
            >
                <div style={{filter: showMeet ? 'blur(5px)' : 'none', transition: 'filter 0.3s ease'}}>
                    <LazyLoadImage
                    src={showPictureNumber === 0 ? card?.图片信息?.[0]?.srcset2 :
                        showPictureNumber === 1 ? card?.图片信息?.[1]?.srcset2 : card?.图片信息?.[2]?.srcset2}
                    placeholderSrc={showPictureNumber === 0 ? card?.图片信息?.[0].src :
                        showPictureNumber === 1 ? card?.图片信息?.[1]?.src : card?.图片信息?.[2]?.src}
                    effect="blur"
                    alt="Full View"
                    className="h-[100vmin] w-auto object-contain rounded-lg shadow-2xl"
                    onClick={()=>setShowInformation(!showInformation)}
                />


                {showInformation && (
                    <div>
                        {/*角色名 世界*/}
                        <div className="absolute flex items-center bottom-[36vmin] left-[24vmin]"
                             style={{color: 'lightgray', textShadow: '0 0 1px gray, 0 0 2px gray',}}>
                            <label style={{fontSize: '4.5vmin', fontWeight: 800, marginRight: '2vmin'}}>{card.主角}</label>
                            <StarIcon color="lightgray" size={12}/>
                            <label style={{fontSize: '3vmin', fontStyle: "italic"}}>{card.世界}</label>
                        </div>

                        {/*稀有度 卡名*/}
                        <div className="absolute flex items-center" style={{left: '21vmin', bottom: '24vmin',}}>
                            <img className="mr-[1vmin]" src={rarityMap[card.稀有度]} style={{height: '12vmin', width: 'auto',}}/>
                            <label
                                style={{
                                    color: 'white',
                                    fontStyle: "italic",
                                    fontSize: '6vmin',
                                    fontWeight: 800,
                                    marginRight: '1vmin',
                                    textShadow: '0 0 2px gray, 0 0 4px gray',
                                }}
                            >
                                {card.卡名}
                            </label>
                        </div>

                        {/*各属性的值*/}
                        <div className="absolute flex flex-row" style={{left: '24vmin', bottom: '10vmin',}}>
                            {attributes.map(attr => (
                                <div key={attr} className="flex flex-col mr-[2vw] items-center">
                                    <img src={`images/60px-${attr}.png`} className="w-[3vw]"/>
                                    <label
                                        style={{
                                            color: card.属性 === attr ? 'gold' : 'white',
                                            fontWeight: 800,
                                            fontSize: '3vmin',
                                        }}
                                    >
                                        {card[attr]}
                                    </label>
                                </div>
                            ))}
                        </div>

                        {/*返回按钮*/}
                        <button className="absolute top-[3vmin] left-[21vmin] w-[12vmin] flex items-center justify-center"
                            onClick={()=>setShowGalleryFullImage(false)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                padding: 0,
                                margin: 0,
                            }}
                        >
                            <LeftIcon size={30} color="white"/>
                        </button>

                        {/*右下角按钮*/}
                        <div className="absolute bottom-[3vmin] right-[19vmin] flex flex-col items-end justify-center">
                            {/*相会*/}
                            <button style={button_style} onClick={() => setShowMeet(true)}>相会</button>
                            {/*初始、重逢、无色卡面*/}
                            <div className="flex flex-row mt-[1vmin]">
                                <button style={getButtonStyle(0)} onClick={() => setShowPictureNumber(0)}>初始</button>

                                {card.图片信息.length > 1 && (
                                    <button style={getButtonStyle(1)}
                                            onClick={() => setShowPictureNumber(1)}>重逢</button>
                                )}

                                {card.图片信息.length === 3 && (
                                    <button style={getButtonStyle(2)}
                                            onClick={() => setShowPictureNumber(2)}>无色</button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                </div>

                <CardMeet
                    showMeet={showMeet}
                    setShowMeet={setShowMeet}
                    card={card}
                />

            </div>
        )
    );
};

export default GalleryFullImage;
