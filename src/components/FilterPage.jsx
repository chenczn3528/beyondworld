import {playClickSound} from "../utils/playClickSound.js";
import cardData from '../assets/cards.json';
import React, {useEffect, useRef, useState} from "react";
import LeftIcon from "../icons/LeftIcon.jsx";
import HomeIcon from "../icons/HomeIcon.jsx";
import FilterRoleCard from "./FilterRoleCard.jsx";
import FilterAttrCard from "./FilterAttrCard.jsx";
import GalleryTypeSelectPage from "./GalleryTypeSelectPage.jsx";
import {sortCards} from "../utils/cardSort.js";
import {Lock} from "lucide-react";
import LockIcon from "../icons/LockIcon.jsx";

const FilterPage = ({
    baseSize,
    cards,
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
    sortedCards,
    setSortedCards,
    showGalleryFullImage,
    setShowGalleryFullImage,
    setGalleryCard,
}) => {
    // 页面渐入渐出特效
    const [state, setState] = useState(true);

    const roleSelectPosition = [
        {top:`${baseSize * 30}px`, right: `${baseSize * 12}px`},
        {top:`${baseSize * 50}px`, right: `${baseSize * 54}px`}
    ]

    const rarityPictureMap = {
        世界: 'images/world.png',
        月: 'images/moon.png',
        辰星: 'images/star1.png',
        星: 'images/star2.png',
    };

    // 是否显示点击选择顺序的界面（稀有度，属性数值）
    const [showOrderChoiceView, setShowOrderChoiceView] = useState(false);

    // 是否展示所有卡片，选项：全部，已拥有，未拥有
    const [ownChoice, setOwnChoice] = useState("已拥有");

    const roleMap = {0: '顾时夜', 1: '易遇', 3: '夏萧因', 2: '柏源', 4: '全部'};
    const rarityOrderMap = ['稀有度', '主属性数值', '全部', '思维', '魅力', '体魄', '感知', '灵巧'];


    useEffect(() => {
        let tmpCards = [];

        // 所有卡片池（不做角色筛选）
        let fullList = cardData;

        if (ownChoice === "全部") {
            const ownedSet = new Set(cards.map(c => c.卡名)); // 卡名用于判断是否拥有
            tmpCards = fullList.map(card => ({
                ...card,
                owned: ownedSet.has(card.卡名)
            }));
        } else if (ownChoice === "已拥有") {
            tmpCards = cards.map(card => ({ ...card, owned: true }));
        } else if (ownChoice === "未拥有") {
            const ownedSet = new Set(cards.map(c => c.卡名));
            tmpCards = fullList
                .filter(card => !ownedSet.has(card.卡名))
                .map(card => ({ ...card, owned: false }));
        }

        // 其他筛选（稀有度、世界、属性）
        tmpCards = tmpCards.filter(card =>
            (rarityChoice[0] === "全部" || rarityChoice.includes(card.稀有度)) &&
            (worldChoice[0] === "全部" || worldChoice.includes(card.世界)) &&
            (typeChoice[0] === "全部" || typeChoice.includes(card.属性))
        );

        const sorted = sortCards(tmpCards || [], orderChoice);
        setSortedCards(sorted);
    }, [cards, selectedRole, orderChoice, ownChoice, rarityChoice, worldChoice, typeChoice]);


    const finalSortedCards = [
        ...sortedCards.filter(card => roleMap[selectedRole] === "全部" || card.主角 === roleMap[selectedRole]),
        ...Array(9).fill({})
    ];

    return (
        <div
            className={`absolute w-full h-full z-200 flex items-center ${state ? "fade-in" : "fade-out"}`}
            style={{background: 'url(images/bg_main1.jpg)', backgroundSize: 'contain',}}
        >

            {/*左上 返回、Home*/}
            <div className="absolute z-[500] w-auto flex items-center justify-center"
                 style={{top: `${baseSize * 6}px`, left: `${baseSize * 6}px`,}}>
                {/*返回按钮*/}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        playClickSound();
                        onClose();
                    }}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        padding: 0,
                    }}
                >
                    <LeftIcon size={baseSize * 24} color="white"/>
                </button>

                {/*返回主界面按钮*/}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        playClickSound();
                        onCloseHome();
                    }}
                    style={{background: 'transparent', border: 'none', padding: 0}}
                >
                    <HomeIcon size={baseSize * 12} color="white"/>
                </button>

                <label
                    style={{
                        textShadow: `0 0 ${baseSize * 6}px black, 0 0 ${baseSize * 12}px white`,
                        fontSize: `${baseSize * 10}px`,
                        fontWeight: 800,
                        marginLeft: `${baseSize * 6}px`,
                    }}>筛选</label>

                <label
                    style={{
                        textShadow: `0 0 ${baseSize * 6}px black, 0 0 ${baseSize * 12}px white`,
                        fontSize: `${baseSize * 8}px`,
                        fontWeight: 800,
                        marginLeft: `${baseSize * 6}px`,
                    }}>数量：{finalSortedCards.length - 9}</label>
            </div>


            {/*中间卡片*/}
            <div
                className="absolute w-[50%] h-[75%] z-500 flex grid grid-cols-3 overflow-x-auto items-center"
                style={{left: "27%", top: "15%", gap: `${baseSize * 2}px`}}
            >
                {finalSortedCards.map((card, index) => {
                    return (
                        <div
                            key={index}
                            className="relative edge-blur-mask"
                            style={{height: `${baseSize * 32}px`}}
                        >
                            {Object.keys(card).length > 0 ? (
                                <>
                                    <img
                                        src={card.图片信息[0].src}
                                        onClick={()=>{
                                            playClickSound();
                                            if(card){
                                                setShowGalleryFullImage(true)
                                                setGalleryCard(card);
                                            }
                                        }}
                                        height={`${baseSize * 30}px`}
                                    />
                                    <img
                                        className="absolute left-[0]"
                                        src={`images/60px-${card.属性}.png`}
                                        width={`${baseSize * 10}px`}
                                        style={{pointerEvents: "none"}}
                                    />
                                    <label
                                        className="absolute"
                                        style={{
                                            fontSize: `${baseSize * 5}px`,
                                            top: `${baseSize * 23}px`,
                                            left: `${baseSize * 1.5}px`,
                                            pointerEvents: 'none',
                                            fontWeight: 600,
                                            textShadow: `0 0 ${baseSize * 1}px black, 0 0 ${baseSize * 2}px black`,
                                        }}>
                                        {card.卡名}
                                    </label>
                                    <img
                                        className="absolute"
                                        src={rarityPictureMap[card.稀有度]}
                                        height={`${baseSize * 12}px`}
                                        style={{right: `${baseSize * 7}px`, pointerEvents: "none"}}
                                    />
                                    {card.owned === false && (
                                        <div
                                            className="absolute top-[0] left-[0] flex justify-center items-center"
                                            style={{backgroundColor: '#00000060', height: `${baseSize * 30}px`,  width: `${baseSize * 30 * 16 / 9}px`}}
                                        >
                                            <LockIcon color="white" size={baseSize * 8} />
                                        </div>
                                    )}

                                </>
                            ) : null}

                        </div>
                    );
                })}

            </div>


            {/*选排序 右上角*/}
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
                {orderChoice === 2 ? "属性数值" : rarityOrderMap[orderChoice]}
            </button>

            {/*右边*/}
            <label
                style={{
                    fontSize: `${baseSize * 9}px`,
                    position: "absolute",
                    top: `${baseSize * 50}px`,
                    right: `${baseSize * 30}px`,
                    textShadow: `0 0 ${baseSize * 6}px white, 0 0 ${baseSize * 12}px white`,
                }}>角色筛选</label>

            {/*右边 选角色*/}
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

            {/*右上角 选排序顺序*/}
            {showOrderChoiceView && (
                <GalleryTypeSelectPage
                    baseSize={baseSize}
                    onClose={setShowOrderChoiceView}
                    position={roleSelectPosition}
                    orderChoice={orderChoice}
                    setOrderChoice={setOrderChoice}
                />
            )}

            {/*左边 筛选*/}
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