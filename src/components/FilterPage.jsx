import {playClickSound} from "../utils/playClickSound.js";
import cardData from '../assets/cards1.json';
import React, {useEffect, useRef, useState} from "react";
import LeftIcon from "../icons/LeftIcon.jsx";
import HomeIcon from "../icons/HomeIcon.jsx";
import FilterRoleCard from "./FilterRoleCard.jsx";
import FilterAttrCard from "./FilterAttrCard.jsx";
import GalleryTypeSelectPage from "./GalleryTypeSelectPage.jsx";

const FilterPage = ({
    baseSize,
    onClose,
    onCloseHome,
    selectedRole,
    setSelectedRole,
    orderChoice,
    setOrderChoice,
    rarityChoice,
    setRarityChoice,
    worldChoice,
    setWorldChoice,
    typeChoice,
    setTypeChoice,
    // showOrderChoiceView,
    // setShowOrderChoiceView,
}) => {

    const [ownChoice, setOwnChoice] = useState("已拥有");

    const [state, setState] = useState(true);
    const roleSelectPosition = [
        {top:`${baseSize * 30}px`, right: `${baseSize * 12}px`},
        {top:`${baseSize * 50}px`, right: `${baseSize * 54}px`}
    ]

    const rarityOrderMap = ['稀有度', '全部', '思维', '魅力', '体魄', '感知', '灵巧'];

    const [showOrderChoiceView, setShowOrderChoiceView] = useState(false);

    return (
        <div
            className={`absolute w-full h-full z-200 flex items-center ${state ? "fade-in" : "fade-out"}`}
            style={{background: 'url(images/bg_main1.jpg)', backgroundSize: 'contain',}}
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

            <label
                style={{
                    position: "absolute",
                    top: `${baseSize * 17}px`,
                    left: `${baseSize * 56}px`,
                    textShadow: `0 0 ${baseSize * 6}px black, 0 0 ${baseSize * 12}px white`,
                    fontSize: `${baseSize * 10}px`,
                    fontWeight: 800,
                }}>筛选</label>


            {/*选排序*/}
            <button
                className="absolute z-[500]"
                style={{
                    // visibility: 'hidden',
                    marginLeft: `${baseSize * 6}px`,
                    fontSize: `${baseSize * 6}px`,
                    width: `${baseSize * 60}px`,
                    top: `${baseSize * 12}px`,
                    right: `${baseSize * 12}px`,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                }}
                onClick={(e) => {
                    e.stopPropagation();
                    playClickSound();
                    setShowOrderChoiceView(true);
                }}
            >
                {orderChoice === 1 ? "属性数值" : rarityOrderMap[orderChoice]}
            </button>


            <label
                style={{
                    position: "absolute",
                    top: `${baseSize * 50}px`,
                    right: `${baseSize * 30}px`,
                    textShadow: `0 0 ${baseSize * 6}px white, 0 0 ${baseSize * 12}px white`,
                }}>角色筛选</label>

            <FilterRoleCard
                baseSize={baseSize}
                selectedRole={selectedRole}
                setSelectedRole={setSelectedRole}
                showShadow={false}
                position={{top: `${baseSize * 60}px`, right: 0}}
                oritationLeft={true}
                onClose={() => {
                }}
            />


            {showOrderChoiceView && (
                <GalleryTypeSelectPage
                    baseSize={baseSize}
                    onClose={setShowOrderChoiceView}
                    position={roleSelectPosition}
                    orderChoice={orderChoice}
                    setOrderChoice={setOrderChoice}
                />
            )}


            <FilterAttrCard
                baseSize={baseSize}
                settings={{
                    width: `${baseSize * 80}px`,
                    height: `${baseSize * 160}px`,
                    top: `${baseSize * 40}px`,
                    left: `${baseSize * 10}px`,
                }}
                showOwn={true}
                rarityChoice={rarityChoice}
                setRarityChoice={setRarityChoice}
                worldChoice={worldChoice}
                setWorldChoice={setWorldChoice}
                typeChoice={typeChoice}
                setTypeChoice={setTypeChoice}
                ownChoice={ownChoice}
                setOwnChoice={setOwnChoice}
            />

        </div>
    );
};

export default FilterPage;