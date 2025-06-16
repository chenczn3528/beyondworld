import React, {useEffect, useState} from "react";

const FilterAttrCard = ({
    baseSize,
    settings,
    showOwn = false,
    worldChoice,
    setWorldChoice,
    rarityChoice,
    setRarityChoice,
    typeChoice,
    setTypeChoice,
    ownChoice,
    setOwnChoice,
}) => {



    const rarityMap = ["全部", "世界", "月", "辰星", "星"];
    const worldMap = ["全部", "现实世界", "时代旧影", "仙途缥缈", "星际纵横", "特殊副本"];
    const attrMap = ['全部', '思维', '魅力', '体魄', '感知', '灵巧'];
    const ownMap = ["全部", "已拥有", "未拥有"];


    const toggleRarity = (char, map, choice, setChoice) => {
        const allOptions = map;
        const otherOptions = allOptions.filter(c => c !== "全部");

        if (char === "全部") {
            // ✅ 点击“全部” → 只选“全部”
            setChoice(["全部"]);
            return;
        }

        // 当前点击的是普通项
        let newSelected = choice.includes("全部")
            ? [char] // 如果原来是“全部”，点了其他项 → 替换为只选当前
            : choice.includes(char)
                ? choice.filter(c => c !== char) // 取消选中
                : [...choice, char];             // 增加选中

        // ✅ 如果已经把其他项全选上了 → 自动切换为“全部”
        const allSelected = otherOptions.every(opt => newSelected.includes(opt));
        if (allSelected) {
            setChoice(["全部"]);
        } else {
            setChoice(newSelected);
        }
    };


    return (
        <div
            className="absolute w-full h-full overflow-x-auto z-500"
            style={{
                ...settings,
                color: 'white',
                fontSize: `${baseSize * 7}px`
            }}
        >

            {/*稀有度*/}
            <div className="flex flex-col">
                <label
                    style={{
                        fontSize: `${baseSize * 9}px`,
                        fontWeight: 800,
                        textShadow: `0 0 ${baseSize * 1}px black, 0 0 ${baseSize * 2}px white`,
                    }}
                >
                    稀有度
                </label>
                <div className="w-full" style={{border: "0.5px solid #4C4D55", marginTop: `${baseSize * 2}px`}}/>
                <div className="flex grid grid-cols-3 gap-[1.5vmin]"
                     style={{marginTop: `${baseSize * 5}px`, marginLeft: `${baseSize * 2}px`, marginRight: `${baseSize * 2}px`}}>
                    {rarityMap.map((char) => {
                        return (
                            <button
                                key={char}
                                onClick={() => {toggleRarity(char, rarityMap, rarityChoice, setRarityChoice)}}
                                style={{
                                    fontSize: `${baseSize * 7}px`,
                                    backgroundColor: "transparent",
                                    padding: 0,
                                    color: rarityChoice.includes(char) ? "white" : "#919299",
                                    textShadow: rarityChoice.includes(char) ? `0 0 ${baseSize * 4}px white, 0 0 ${baseSize * 8}px white` : "none"
                                }}
                            >
                                {char}
                            </button>
                        );
                    })}
                </div>
            </div>



            {/*世界*/}
            <div className="flex flex-col" style={{marginTop: `${baseSize * 10}px`}}>
                <label
                    style={{
                        fontSize: `${baseSize * 9}px`,
                        fontWeight: 800,
                        textShadow: `0 0 ${baseSize * 1}px black, 0 0 ${baseSize * 2}px white`,
                    }}
                >
                    世界
                </label>
                <div className="w-full" style={{border: "0.5px solid #4C4D55", marginTop: `${baseSize * 2}px`}}/>
                <div className="flex grid grid-cols-2 gap-[1.5vmin]"
                     style={{marginTop: `${baseSize * 5}px`, marginLeft: `${baseSize * 2}px`, marginRight: `${baseSize * 2}px`}}>
                    {worldMap.map((char) => {
                        return (
                            <button
                                key={char}
                                onClick={() => {toggleRarity(char, worldMap, worldChoice, setWorldChoice)}}
                                style={{
                                    fontSize: `${baseSize * 7}px`,
                                    backgroundColor: "transparent",
                                    padding: 0,
                                    color: worldChoice.includes(char) ? "white" : "#919299",
                                    textShadow: worldChoice.includes(char) ? `0 0 ${baseSize * 4}px white, 0 0 ${baseSize * 8}px white` : "none"
                                }}
                            >
                                {char}
                            </button>
                        );
                    })}
                </div>
            </div>


            {/*属性*/}
            <div className="flex flex-col" style={{marginTop: `${baseSize * 10}px`, marginBottom: `${baseSize * 10}px`}}>
                <label
                    style={{
                        fontSize: `${baseSize * 9}px`,
                        fontWeight: 800,
                        textShadow: `0 0 ${baseSize * 1}px black, 0 0 ${baseSize * 2}px white`,
                    }}
                >
                    属性
                </label>
                <div className="w-full" style={{border: "0.5px solid #4C4D55", marginTop: `${baseSize * 2}px`}}/>
                <div className="flex grid grid-cols-3 gap-[1.5vmin]"
                     style={{marginTop: `${baseSize * 5}px`, marginLeft: `${baseSize * 2}px`, marginRight: `${baseSize * 2}px`}}>
                    {attrMap.map((char) => {
                        return (
                            <button
                                key={char}
                                onClick={() => {toggleRarity(char, attrMap, typeChoice, setTypeChoice)}}
                                style={{
                                    fontSize: `${baseSize * 7}px`,
                                    backgroundColor: "transparent",
                                    padding: 0,
                                    color: typeChoice.includes(char) ? "white" : "#919299",
                                    textShadow: typeChoice.includes(char) ? `0 0 ${baseSize * 4}px white, 0 0 ${baseSize * 8}px white` : "none"
                                }}
                            >
                                {char}
                            </button>
                        );
                    })}
                </div>
            </div>


            {/*拥有情况*/}
            {showOwn && (
                <div className="flex flex-col" style={{marginTop: `${baseSize * 10}px`, marginBottom: `${baseSize * 10}px`}}>
                    <label
                        style={{
                            fontSize: `${baseSize * 9}px`,
                            fontWeight: 800,
                            textShadow: `0 0 ${baseSize * 1}px black, 0 0 ${baseSize * 2}px white`,
                        }}
                    >
                        拥有情况
                    </label>
                    <div className="w-full" style={{border: "0.5px solid #A9A8B9", marginTop: `${baseSize * 2}px`}}/>
                    <div className="flex grid grid-cols-3 gap-[1.5vmin]"
                         style={{marginTop: `${baseSize * 5}px`, marginLeft: `${baseSize * 2}px`, marginRight: `${baseSize * 2}px`}}>
                        {ownMap.map((char) => {
                            return (
                                <button
                                    key={char}
                                    onClick={() => {setOwnChoice(char)}}
                                    style={{
                                        fontSize: `${baseSize * 7}px`,
                                        backgroundColor: "transparent",
                                        padding: 0,
                                        color: ownChoice === char ? "white" : "#323442",
                                        textShadow: ownChoice === char ? `0 0 ${baseSize * 4}px white, 0 0 ${baseSize * 8}px white` : "none"
                                    }}
                                >
                                    {char}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}


        </div>
    );
};

export default FilterAttrCard;