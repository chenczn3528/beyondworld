import {playClickSound} from "../utils/playClickSound.js";
import cardData from '../assets/cards1.json';
import React, {useEffect, useRef, useState} from "react";
import LeftIcon from "../icons/LeftIcon.jsx";
import HomeIcon from "../icons/HomeIcon.jsx";

const FilterPage = ({ baseSize, onClose, onCloseHome, selectedRole, setSelectedRole }) => {

    const [state, setState] = useState(true);



    return (
        <div
            className={`absolute w-full h-full z-200 flex items-center ${state ? "fade-in" : "fade-out"}`}
            style={{backgroundColor: "black"}}
            onClick={() => {
                playClickSound();
                onClose();
            }}
        >
            {/*返回按钮*/}
            <button className="absolute z-[500] w-auto flex items-center justify-center"
                    onClick={(e) => {
                        e.stopPropagation();
                        playClickSound();
                        onClose();
                    }}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        padding: 10,
                        top: `${baseSize * 6}px`,
                        left: `${baseSize * 6}px`,
                    }}
            >
                <LeftIcon size={baseSize * 24} color="white"/>
            </button>

            {/*返回主界面按钮*/}
            <button className="absolute z-[500] w-auto flex items-center justify-center"
                    onClick={(e) => {
                        e.stopPropagation();
                        playClickSound();
                        onCloseHome();
                    }}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        padding: 10,
                        top: `${baseSize * 12}px`,
                        left: `${baseSize * 32}px`,
                    }}
            >
                <HomeIcon size={baseSize * 12} color="white"/>
            </button>

        </div>
    );
};

export default FilterPage;