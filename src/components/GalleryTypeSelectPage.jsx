import {useEffect, useRef, useState} from "react";
import {playClickSound} from "../utils/playClickSound.js";
import { Asset } from './Asset.jsx';

const GalleryTypeSelectPage = ({ baseSize, onClose, position, orderChoice, setOrderChoice}) => {

    const rarityOrderMap = ['稀有度', '主属性数值', '全部', '思维', '魅力', '体魄', '感知', '灵巧'];

    const [showType, setShowType] = useState(false);

    useEffect(()=>{
        if(orderChoice !== 0 && orderChoice !== 1){
            setShowType(true);
        }
    },[]);

    useEffect(()=>{
        console.log(orderChoice)
    },[orderChoice])

    return (
        <div
            onClick={(e) => {e.stopPropagation(); onClose();}}
            className="absolute z-500 w-full h-full"
        >
            <div
                className="absolute flex flex-col items-center justify-center"
                style={{
                    ...position[0],
                    backgroundColor: "#545A6Cee",
                    fontSize: `${baseSize * 7}px`,
                    color: 'white',
                    borderRadius: 8,
                }}
            >
                <div
                    className="flex items-center justify-center"
                    style={{
                        width: `${baseSize * 40}px`,
                        height: `${baseSize * 20}px`,
                        textShadow: orderChoice === 0 ? `0 0 ${baseSize * 6}px white, 0 0 ${baseSize * 12}px white` : `0 0 ${baseSize * 1}px black, 0 0 ${baseSize * 2}px black`,
                    }}
                    onClick={() => {
                        playClickSound();
                        setOrderChoice(0);
                    }}
                >
                    稀有度
                </div>

                <div
                    className="flex items-center justify-center"
                    style={{
                        width: `${baseSize * 40}px`,
                        height: `${baseSize * 20}px`,
                        textShadow: orderChoice > 1 ? `0 0 ${baseSize * 6}px white, 0 0 ${baseSize * 12}px white` : `0 0 ${baseSize * 1}px black, 0 0 ${baseSize * 2}px black`,
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                        playClickSound();
                        setShowType(true);
                    }}
                >
                    属性数值
                </div>

                <div
                    className="flex items-center justify-center"
                    style={{
                        width: `${baseSize * 40}px`,
                        height: `${baseSize * 20}px`,
                        textShadow: orderChoice === 1 ? `0 0 ${baseSize * 6}px white, 0 0 ${baseSize * 12}px white` : `0 0 ${baseSize * 1}px black, 0 0 ${baseSize * 2}px black`,
                    }}
                    onClick={() => {
                        playClickSound();
                        setOrderChoice(1);
                    }}
                >
                    主属性数值
                </div>

            </div>

            {showType && (
                <div
                    className="absolute flex flex-col items-center justify-center"
                    style={{
                        ...position[1],
                        backgroundColor: "#545A6Cee",
                        fontSize: `${baseSize * 7}px`,
                        borderRadius: 8,
                    }}
                >
                    {rarityOrderMap.slice(2).map((item, index) => {
                        const key = index + 2;
                        return (
                            <div
                                key={key}
                                className="flex items-center justify-center"
                                onClick={() => {playClickSound(); setOrderChoice(key);}}
                                style={{width: `${baseSize * 40}px`, height: `${baseSize * 20}px`,}}
                            >
                                {item !== "全部" && (
                                    <Asset
                                        src={`60px-${item}.png`}
                                        type="image"
                                        height={baseSize * 12}
                                        style={{marginRight: `${baseSize}px`}}
                                    />
                                )}
                                <label
                                    style={{
                                        fontSize: `${baseSize * 7}px`,
                                        color: "white",
                                        textShadow: orderChoice === key ? `0 0 ${baseSize * 6}px white, 0 0 ${baseSize * 12}px white` : `0 0 ${baseSize * 1}px black, 0 0 ${baseSize * 2}px black`,
                                }}
                                >
                                    {item}
                                </label>

                            </div>
                        );
                    })}
                </div>
            )}

        </div>
    );
};

export default GalleryTypeSelectPage;