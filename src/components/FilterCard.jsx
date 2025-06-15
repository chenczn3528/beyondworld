import {playClickSound} from "../utils/playClickSound.js";
import cardData from '../assets/cards1.json';
import React, { useRef, useState} from "react";

const FilterCard = ({ baseSize, onClose, selectedRole, setSelectedRole }) => {


    const choices = cardData.filter(
        card => card.卡名 === "夜霜侵怀" || card.卡名 === "雨中暂别"
            || card.卡名 === "春衫易醒" || card.卡名 === "夜深时刻");

    const rolePriority = {'顾时夜': 0, '易遇': 1, '夏萧因': 3, '柏源': 2, '全部': 4};
    choices.sort((a, b) => {
        const priorityA = rolePriority[a.主角] ?? Infinity;
        const priorityB = rolePriority[b.主角] ?? Infinity;
        return priorityA - priorityB;
    });
    choices.push({"图片信息":[{"srcset": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAGUlEQVR42mNgGAWjgP///xkYGBgAADEMAQEGAP8GC04EtW8gAAAAAElFTkSuQmCC"}]})


    const timerRef = useRef(null); // 放在组件最外层

    const handleClick = (e, i) => {
        e.stopPropagation();
        playClickSound();
        setSelectedRole(i);

        // 清除已有定时器
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        // 启动新的定时器
        timerRef.current = setTimeout(() => {
            setState(prev => !prev);
            timerRef.current = setTimeout(() => {
                onClose();
                timerRef.current = null; // 清理引用
            }, 1000);
        }, 2000);
    };

    const [state, setState] = useState(true);



    return (
        <div
            className={`absolute w-full h-full z-200 flex items-center ${state ? "fade-in" : "fade-out"}`}
            onClick={() => {
                playClickSound();
                onClose();
            }}
        >
            <div
                className="w-[0vmin] h-full slide-in-container"
                style={{
                    background: "rgba(0,0,0,0.01)", // 有背景才能产生阴影
                    boxShadow: `0 0 ${baseSize * 20}px ${baseSize * 100}px rgba(57, 67, 75, 0.95)`,
                }}
            />

            <div
                className="absolute w-[25%] h-[60%] slide-in-container flex flex-col justify-center gap-[2vmin]"
                onClick={(e) => e.stopPropagation()}
                style={{
                    // background: "rgba(23, 25, 33, 0.6)", // 有背景才能产生阴影
                }}
            >
                {Array.from(choices).map((_, i) => {
                    return (
                        <div
                            key={i}
                            onClick={(e) => handleClick(e, i)}
                            style={{
                                marginLeft: i === selectedRole ? `${baseSize * 20}px` : `${baseSize * 10}px`,
                                width: `${baseSize * 60}px`,
                                height: `${baseSize * 16}px`,
                                overflow: "hidden",
                                boxShadow: i === selectedRole ? `0 -${baseSize * 5}px ${baseSize * 10}px rgba(133,144,172, 0.9), 0 ${baseSize * 5}px ${baseSize * 10}px rgba(133,144,172, 0.9)` : "none",
                            }}
                        >
                            {i < 4 && (
                                <img
                                    src={i === 2 ? choices[i].图片信息[1].srcset : choices[i].图片信息[0].srcset}
                                    style={{
                                        width: `${baseSize * 200}px`,
                                        height: `${baseSize * 100}px`,
                                        objectFit: "cover",
                                        transform: i === 0 ? `rotate(-80deg) translateX(-${baseSize * 119}px) translateY(-${baseSize * 70}px) scale(1.8)`
                                            : i === 1 ? `scaleX(-1) translateX(${baseSize * 20}px) translateY(${baseSize * 33}px) scale(2)`
                                                : i === 2 ? `scaleX(-1) translateX(${baseSize * 78}px) translateY(${baseSize * 44}px) scale(2.6)`
                                                    : `translateX(-${baseSize * 148}px) translateY(${baseSize * 14}px) scale(2.2)`,
                                        transformOrigin: "center",
                                    }}
                                />
                            )}

                            {i === 4 && (
                                <div
                                    className="w-full h-full flex items-center justify-center"
                                    style={{
                                        backgroundColor: "rgba(255,255,255,0.2)",
                                        color: 'white',
                                        fontSize: `${baseSize * 7}px`,
                                        fontWeight: 600
                                }}
                                >
                                    全部
                                </div>
                            )}

                        </div>
                    );
                })}
            </div>


        </div>
    );
}

export default FilterCard;