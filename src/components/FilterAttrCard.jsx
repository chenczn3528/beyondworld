import React, {useEffect, useState} from "react";
import { getHighlightIndices, getTextMatch } from "../utils/pinyinMatch.js";

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
    poolMap = ["全部"],
    poolSections = [],
    poolCardMap = new Map(),
    poolSearch,
    setPoolSearch,
    poolChoice,
    setPoolChoice,
    ownChoice,
    setOwnChoice,
}) => {

    const [rarityExpanded, setRarityExpanded] = useState(true);
    const [ownExpanded, setOwnExpanded] = useState(true);
    const [poolExpanded, setPoolExpanded] = useState(true);
    const [worldExpanded, setWorldExpanded] = useState(false);
    const [attrExpanded, setAttrExpanded] = useState(false);
    const [localPoolSearch, setLocalPoolSearch] = useState("");
    const effectivePoolSearch = poolSearch ?? localPoolSearch;
    const updatePoolSearch = setPoolSearch ?? setLocalPoolSearch;
    const trimmedPoolSearch = effectivePoolSearch.trim();
    const filteredPoolSections = poolSections
        .map(section => {
            const filteredPools = section.pools.filter((item) => {
                if (trimmedPoolSearch === "") return true;
                if (item === "全部") return false;
                if (getTextMatch(item, trimmedPoolSearch)) return true;
                const cardNames = poolCardMap.get(item);
                if (!cardNames) return false;
                for (const name of cardNames) {
                    if (name && getTextMatch(name, trimmedPoolSearch)) return true;
                }
                return false;
            });
            return { ...section, pools: filteredPools };
        })
        .filter(section => section.pools.length > 0);

    const renderHighlightedText = (text, query) => {
        const indices = getHighlightIndices(text, query);
        if (!indices) return text;
        const chars = Array.from(text);
        return (
            <>
                {chars.map((ch, idx) => (
                    <span
                        key={`${ch}-${idx}`}
                        style={indices.has(idx) ? { color: "#ffe8a3", textShadow: `0 0 ${baseSize * 2}px rgba(255,232,163,0.8)` } : undefined}
                    >
                        {ch}
                    </span>
                ))}
            </>
        );
    };


    const rarityMap = ["全部", "刹那", "世界", "瞬", "月", "辰星", "星"];
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
                fontSize: `${baseSize * 7}px`,
                overflowX: "hidden",
                overflowY: "auto",
            }}
        >

            {/*稀有度*/}
            <div className="flex flex-col">
                <div className="flex items-center justify-between">
                    <label
                        style={{
                            fontSize: `${baseSize * 9}px`,
                            fontWeight: 800,
                            color: "#f6e6b5",
                            textShadow: `0 0 ${baseSize * 1}px black, 0 0 ${baseSize * 2}px white`,
                        }}
                    >
                        稀有度
                    </label>
                    <button
                        onClick={() => setRarityExpanded(prev => !prev)}
                        style={{
                            fontSize: `${baseSize * 5}px`,
                            backgroundColor: "transparent",
                            padding: 0,
                            color: rarityExpanded ? "white" : "#cfe3ff",
                            textShadow: rarityExpanded
                                ? `0 0 ${baseSize * 2}px white, 0 0 ${baseSize * 2.2}px rgba(0,0,0,0.95)`
                                : `0 0 ${baseSize * 2.2}px rgba(0,0,0,0.95), 0 0 ${baseSize * 1.8}px rgba(207,227,255,0.6)`,
                        }}
                    >
                        {rarityExpanded ? "收起" : "展开"}
                    </button>
                </div>
                <div className="w-full" style={{border: "0.5px solid #4C4D55", marginTop: `${baseSize * 2}px`}}/>
                {rarityExpanded && (
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
                                        color: rarityChoice.includes(char) ? "white" : "#b5b5b5",
                                        textShadow: rarityChoice.includes(char)
                                            ? `0 0 ${baseSize * 4}px white, 0 0 ${baseSize * 8}px white`
                                            : `0 0 ${baseSize * 2.2}px rgba(0,0,0,0.95)`
                                    }}
                                >
                                    {char}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/*拥有情况*/}
            {showOwn && (
                <div className="flex flex-col" style={{marginTop: `${baseSize * 10}px`}}>
                    <div className="flex items-center justify-between">
                        <label
                            style={{
                                fontSize: `${baseSize * 9}px`,
                                fontWeight: 800,
                                color: "#d7f0d2",
                                textShadow: `0 0 ${baseSize * 1}px black, 0 0 ${baseSize * 2}px white`,
                            }}
                        >
                            拥有情况
                        </label>
                        <button
                            onClick={() => setOwnExpanded(prev => !prev)}
                            style={{
                                fontSize: `${baseSize * 5}px`,
                                backgroundColor: "transparent",
                                padding: 0,
                                color: ownExpanded ? "white" : "#cfe3ff",
                                textShadow: ownExpanded
                                    ? `0 0 ${baseSize * 2}px white, 0 0 ${baseSize * 2.2}px rgba(0,0,0,0.95)`
                                    : `0 0 ${baseSize * 2.2}px rgba(0,0,0,0.95), 0 0 ${baseSize * 1.8}px rgba(207,227,255,0.6)`,
                            }}
                        >
                            {ownExpanded ? "收起" : "展开"}
                        </button>
                    </div>
                    <div className="w-full" style={{border: "0.5px solid #A9A8B9", marginTop: `${baseSize * 2}px`}}/>
                    {ownExpanded && (
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
                                            color: ownChoice === char ? "white" : "#b5b5b5",
                                            textShadow: ownChoice === char
                                                ? `0 0 ${baseSize * 4}px white, 0 0 ${baseSize * 8}px white`
                                                : `0 0 ${baseSize * 2.2}px rgba(0,0,0,0.95)`
                                        }}
                                    >
                                        {char}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}


            {/*卡池*/}
            <div className="flex flex-col" style={{marginTop: `${baseSize * 10}px`}}>
                <div className="flex items-center justify-between">
                    <label
                        style={{
                            fontSize: `${baseSize * 9}px`,
                            fontWeight: 800,
                            color: "#d6e2ff",
                            textShadow: `0 0 ${baseSize * 1}px black, 0 0 ${baseSize * 2}px white`,
                        }}
                    >
                        卡池
                    </label>
                    <button
                        onClick={() => setPoolExpanded(prev => !prev)}
                        style={{
                            fontSize: `${baseSize * 5}px`,
                            backgroundColor: "transparent",
                            padding: 0,
                            color: poolExpanded ? "white" : "#cfe3ff",
                            textShadow: poolExpanded
                                ? `0 0 ${baseSize * 2}px white, 0 0 ${baseSize * 2.2}px rgba(0,0,0,0.95)`
                                : `0 0 ${baseSize * 2.2}px rgba(0,0,0,0.95), 0 0 ${baseSize * 1.8}px rgba(207,227,255,0.6)`,
                        }}
                    >
                        {poolExpanded ? "收起" : "展开"}
                    </button>
                </div>
                <div className="w-full" style={{border: "0.5px solid #4C4D55", marginTop: `${baseSize * 2}px`}}/>
                {poolExpanded && (
                    <>
                        <input
                            value={effectivePoolSearch}
                            onChange={(e) => updatePoolSearch(e.target.value)}
                            placeholder="搜索卡池或卡名"
                            style={{
                                marginTop: `${baseSize * 4}px`,
                                marginLeft: `${baseSize * 2}px`,
                                marginRight: `${baseSize * 2}px`,
                                padding: `${baseSize * 2}px ${baseSize * 3}px`,
                                backgroundColor: 'rgba(255,255,255,0.08)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: `${baseSize * 2}px`,
                                color: 'white',
                                fontSize: `${baseSize * 5}px`,
                                outline: 'none',
                            }}
                        />
                        <div className="flex flex-col gap-[1vmin]"
                             style={{marginTop: `${baseSize * 4}px`, marginLeft: `${baseSize * 2}px`, marginRight: `${baseSize * 2}px`}}>
                            {filteredPoolSections.map((section) => (
                                <div key={section.key} style={{marginBottom: `${baseSize * 4}px`}}>
                            {section.label && (
                                <div
                                    style={{
                                        fontSize: `${baseSize * 5.5}px`,
                                        color: section.key === 'limited'
                                            ? "#ffd166"
                                            : section.key === 'birthday'
                                                ? "#a8d7ff"
                                                : section.key === 'collapsed'
                                                    ? "#ff9fb5"
                                                    : section.key === 'activity'
                                                        ? "#9fe3b6"
                                                    : "#c7c9d6",
                                        textShadow: section.key === 'limited'
                                            ? `0 0 ${baseSize * 2}px rgba(255,209,102,0.7)`
                                            : section.key === 'birthday'
                                                ? `0 0 ${baseSize * 2}px rgba(168,215,255,0.7)`
                                                : section.key === 'collapsed'
                                                    ? `0 0 ${baseSize * 2}px rgba(255,159,181,0.7)`
                                                    : section.key === 'activity'
                                                        ? `0 0 ${baseSize * 2}px rgba(159,227,182,0.7)`
                                                    : "none",
                                        marginBottom: `${baseSize * 2}px`,
                                    }}
                                >
                                    {section.label}
                                </div>
                            )}
                                    <div className="flex flex-col gap-[1vmin]">
                                        {section.pools.map((char) => (
                                            <button
                                                key={char}
                                                onClick={() => {toggleRarity(char, poolMap, poolChoice, setPoolChoice)}}
                                                style={{
                                                    fontSize: `${baseSize * 6}px`,
                                                    backgroundColor: "transparent",
                                                    padding: 0,
                                                    textAlign: 'left',
                                                    color: poolChoice.includes(char) ? "white" : "#b5b5b5",
                                                    textShadow: poolChoice.includes(char)
                                                        ? `0 0 ${baseSize * 4}px white, 0 0 ${baseSize * 8}px white`
                                                        : `0 0 ${baseSize * 2.2}px rgba(0,0,0,0.95)`
                                                }}
                                            >
                                                {renderHighlightedText(char, trimmedPoolSearch)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>


            {/*世界*/}
            <div className="flex flex-col" style={{marginTop: `${baseSize * 10}px`}}>
                <div className="flex items-center justify-between">
                    <label
                        style={{
                            fontSize: `${baseSize * 9}px`,
                            fontWeight: 800,
                            color: "#c6d3ff",
                            textShadow: `0 0 ${baseSize * 1}px black, 0 0 ${baseSize * 2}px white`,
                        }}
                    >
                        世界
                    </label>
                    <button
                        onClick={() => setWorldExpanded(prev => !prev)}
                        style={{
                            fontSize: `${baseSize * 5}px`,
                            backgroundColor: "transparent",
                            padding: 0,
                            color: worldExpanded ? "white" : "#cfe3ff",
                            textShadow: worldExpanded
                                ? `0 0 ${baseSize * 2}px white, 0 0 ${baseSize * 2.2}px rgba(0,0,0,0.95)`
                                : `0 0 ${baseSize * 2.2}px rgba(0,0,0,0.95), 0 0 ${baseSize * 1.8}px rgba(207,227,255,0.6)`,
                        }}
                    >
                        {worldExpanded ? "收起" : "展开"}
                    </button>
                </div>
                <div className="w-full" style={{border: "0.5px solid #4C4D55", marginTop: `${baseSize * 2}px`}}/>
                {worldExpanded && (
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
                                        color: worldChoice.includes(char) ? "white" : "#b5b5b5",
                                        textShadow: worldChoice.includes(char)
                                            ? `0 0 ${baseSize * 4}px white, 0 0 ${baseSize * 8}px white`
                                            : `0 0 ${baseSize * 2.2}px rgba(0,0,0,0.95)`
                                    }}
                                >
                                    {char}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/*属性*/}
            <div className="flex flex-col" style={{marginTop: `${baseSize * 10}px`, marginBottom: `${baseSize * 10}px`}}>
                <div className="flex items-center justify-between">
                    <label
                        style={{
                            fontSize: `${baseSize * 9}px`,
                            fontWeight: 800,
                            color: "#f2c8ff",
                            textShadow: `0 0 ${baseSize * 1}px black, 0 0 ${baseSize * 2}px white`,
                        }}
                    >
                        属性
                    </label>
                    <button
                        onClick={() => setAttrExpanded(prev => !prev)}
                        style={{
                            fontSize: `${baseSize * 5}px`,
                            backgroundColor: "transparent",
                            padding: 0,
                            color: attrExpanded ? "white" : "#cfe3ff",
                            textShadow: attrExpanded
                                ? `0 0 ${baseSize * 2}px white, 0 0 ${baseSize * 2.2}px rgba(0,0,0,0.95)`
                                : `0 0 ${baseSize * 2.2}px rgba(0,0,0,0.95), 0 0 ${baseSize * 1.8}px rgba(207,227,255,0.6)`,
                        }}
                    >
                        {attrExpanded ? "收起" : "展开"}
                    </button>
                </div>
                <div className="w-full" style={{border: "0.5px solid #4C4D55", marginTop: `${baseSize * 2}px`}}/>
                {attrExpanded && (
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
                                        color: typeChoice.includes(char) ? "white" : "#b5b5b5",
                                        textShadow: typeChoice.includes(char)
                                            ? `0 0 ${baseSize * 4}px white, 0 0 ${baseSize * 8}px white`
                                            : `0 0 ${baseSize * 2.2}px rgba(0,0,0,0.95)`
                                    }}
                                >
                                    {char}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>


        </div>
    );
};

export default FilterAttrCard;
