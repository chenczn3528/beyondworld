import React, {useEffect, useMemo } from "react";
import {playClickSound} from "../utils/playClickSound.js";
import { getAvailablePools } from "../utils/cardDataUtils.js";
import cardData from "../assets/cards.json";

const CardPoolFilter = ({
    selectedRole,
    setSelectedRole,
    useSoftGuarantee,
    setUseSoftGuarantee,
    includeThreeStar,
    setIncludeThreeStar,
    includeThreeStarM,
    setIncludeThreeStarM,
    onlySelectedRoleCard,
    setOnlySelectedRoleCard,
    showCardPoolFilter,
    setShowCardPoolFilter,
    valuesList,
    selectedPools,
    setSelectedPools,
}) => {
    console.log(selectedPools)


    const characters = valuesList["主角"] || [];

    const { availablePools, permanentPools } = useMemo(
        () =>
            getAvailablePools(cardData), [cardData]
    );

    const allWorldPools = [...availablePools, ...permanentPools]; // 所有“世界”卡的池子
    const allLimitedPools = availablePools; // 只包括限定池

    const effectiveSelectedPools = selectedPools.includes('全部') ? allWorldPools : selectedPools;


    const isAllLimitedSelected = allLimitedPools.every((pool) =>
        effectiveSelectedPools.includes(pool)
    );


    const togglePool = (pool) => {
        setSelectedPools((prev) => {
            // 展开全部变成所有池子
            let current = prev.includes("全部") ? [...allWorldPools] : [...prev];

            if (current.includes(pool)) {
                current = current.filter(p => p !== pool);
            } else {
                current.push(pool);
            }

            // 去重
            current = Array.from(new Set(current));

            // 如果选择了所有池子，转成“全部”
            if (allWorldPools.every(p => current.includes(p))) {
                return ["全部"];
            } else {
                return current;
            }
        });
    };



    useEffect(() => {
        setSelectedPools((prev) => {
            // 如果当前是“全部”，什么都不改
            if (prev.includes("全部")) return prev;

            const filtered = prev.filter(p => !permanentPools.includes(p));
            return useSoftGuarantee
              ? [...filtered, ...permanentPools]
              : filtered;
        });
    }, [useSoftGuarantee]);



    const toggleCharacter = (char) => {

        if (selectedRole.includes('随机')) {
          // 当前是“全选”，点击某一个角色后将其排除，其余全部选中
            const newSelected = characters.filter(c => c !== char);
            setSelectedRole(newSelected);
        } else {
            const alreadySelected = selectedRole.includes(char);
            let newSelected;

            if (alreadySelected) {
              // 准备取消选中的角色
                newSelected = selectedRole.filter(c => c !== char);

                if (newSelected.length === 0) {
                    // 如果这是最后一个选中的，改为全选（即 "随机"）
                    setSelectedRole(['随机']);
                } else {
                    setSelectedRole(newSelected);
                }
            } else {
                // 添加一个新选中的角色
                newSelected = [...selectedRole, char];

                if (newSelected.length === characters.length) {
                  setSelectedRole(['随机']);
                } else {
                  setSelectedRole(newSelected);
                }
            }
        }
    };


    return (
        showCardPoolFilter && (
            <div
                className="fixed inset-0 z-50 flex items-center justify-center w-full h-full"
                onClick={() => {playClickSound(); setShowCardPoolFilter(false)}}
            >

                <div
                    className="relative flex flex-col w-[80vmin] h-[70vmin]"
                    onClick={(e) => {
                        playClickSound();
                        e.stopPropagation()
                    }}
                    style={{
                        backgroundColor: '#2a2d39',
                        fontSize:'3vmin',
                        color: 'white'
                    }}
                >
                    <div className="relative flex flex-col h-full mt-[2vh] mb-[2vh]">
                        <label
                            className="flex justify-center items-center mt-[3vmin] mb-[3vmin]"
                            style={{fontSize: '4vmin', fontWeight: '800'}}
                        >
                            筛选卡池
                        </label>

                        <div className="mb-[8vmin] overflow-y-auto">
                            {/* 主角多选 */}
                            <div className="ml-[3vw] mr-[3vw]">
                                <label>选择主角：</label>
                                <div className="flex flex-row mt-[1vmin] gap-[2vmin] justify-center items-center">
                                    {characters.map((char) => {
                                        const isSelected = selectedRole.includes(char) || selectedRole.includes('随机');

                                        return (
                                            <button
                                                key={char}
                                                onClick={() => toggleCharacter(char)}
                                                style={{
                                                    fontSize: '2.5vmin',
                                                    backgroundColor: isSelected ? 'rgba(239,218,160,0.8)' : 'transparent',
                                                    color: isSelected ? '#111' : '#aaa',
                                                    boxShadow: isSelected
                                                        ? '0 0 10px gold, 0 0 20px gold'
                                                        : '0 0 10px #111214, 0 0 20px #111214',
                                                }}
                                            >
                                                {char}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* 稀有度勾选 */}
                            <div className="flex items-center mt-[3vmin] ml-[3vw] mr-[3vw]">
                                <label className="flex items-center mr-[1vmin]">
                                    包含辰星卡
                                </label>
                                <input
                                    // style={{width: '5vmin'}}
                                    type="checkbox"
                                    checked={includeThreeStarM}
                                    onChange={(e) => setIncludeThreeStarM(e.target.checked)}
                                />

                                <label className="flex items-center mr-[1vmin] ml-[5vmin]">
                                    包含星卡
                                </label>
                                <input
                                    // style={{width: '5vmin'}}
                                    type="checkbox"
                                    checked={includeThreeStar}
                                    onChange={(e) => setIncludeThreeStar(e.target.checked)}
                                />
                            </div>
                            {/* 保底选项 */}
                            <div className="flex items-center mt-[1vmin] ml-[3vw] mr-[3vw]">
                                <label className="flex items-center mr-[1vmin]">
                                    启用大小保底
                                </label>
                                <input
                                    // style={{width: '5vmin'}}
                                    type="checkbox"
                                    checked={useSoftGuarantee}
                                    onChange={(e) =>{
                                        setUseSoftGuarantee(e.target.checked);
                                        if (e.target.checked) setOnlySelectedRoleCard(false);
                                    }}
                                />
                            </div>

                            {/* 是否仅抽指定角色卡 */}
                            {!(selectedRole.length === 1 && selectedRole[0] === '随机') && (
                                <div className="flex items-center mt-[1vmin] ml-[3vw] mr-[3vw]">
                                    <label className="flex items-center mr-[1vmin]">仅抽</label>
                                    <label style={{fontWeight: 800, color:'gold'}}>{selectedRole.join('、')}</label>
                                    <label className="flex items-center ml-[1vmin] mr-[1vmin]"> 的卡</label>
                                    <input
                                        // style={{width: '5vmin'}}
                                        type="checkbox"
                                        checked={onlySelectedRoleCard}
                                        onChange={(e) => {
                                            setOnlySelectedRoleCard(e.target.checked);
                                            if(e.target.checked) setUseSoftGuarantee(false);
                                        }}
                                    />
                                </div>
                            )}

                            {/*选择活动*/}
                            <div className="flex flex-col ml-[3vw] mr-[3vw] mt-[2vmin] mb-[2vmin]">
                                <div className="flex flex-row gap-[1vmin]">
                                    <label className="">选择全部限定卡池</label>
                                    <input
                                        // style={{width: '3vmin'}}
                                        type="checkbox"
                                        checked={isAllLimitedSelected}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                // 加入所有限定池，保持其他选择，去重
                                                setSelectedPools((prev) => {
                                                    const base = prev.includes("全部") ? [] : prev.filter(p => !allLimitedPools.includes(p));
                                                    const newSelected = [...base, ...allLimitedPools];
                                                    // 判断是否选中所有池子
                                                    if (allWorldPools.every(p => newSelected.includes(p))) {
                                                        return ["全部"];
                                                    }
                                                    return Array.from(new Set(newSelected));
                                                });
                                            } else {
                                                // 取消限定池，只保留常驻
                                                setSelectedPools(permanentPools.length > 0 ? [...permanentPools] : []);
                                            }
                                        }}
                                    />

                                </div>
                                <label
                                    style={{fontSize: "2vmin", color: '#aaa'}}>（不勾选则仅有常驻+累充世界卡）</label>
                                <label style={{fontSize: "2vmin"}}>
                                    <span style={{color: 'white', fontWeight: 800}}>已选卡池：</span>
                                    <span style={{color: '#efd6a0'}}>
                                        {selectedPools.includes("全部")
                                          ? "全部"
                                          : selectedPools.every(pool => permanentPools.includes(pool))
                                            ? "常驻+累充"
                                            : (() => {
                                                const limited = effectiveSelectedPools
                                                  .filter(pool => availablePools.includes(pool))
                                                  .map(pool => pool.split("世界之间")[0]);
                                                const includePermanent = effectiveSelectedPools.some(pool => permanentPools.includes(pool));
                                                return includePermanent
                                                  ? "常驻+累充，" + limited.join("，")
                                                  : limited.join("，");
                                              })()
                                        }


                                    </span>
                                </label>


                            </div>
                            <div className="flex flex-col mt-[2vmin] ml-[3vw] mr-[3vw] mb-[4vmin] gap-[2vmin]">
                                {availablePools.map((pool) => {
                                    const isSelected = effectiveSelectedPools.includes(pool);
                                    return (
                                        <button
                                            key={pool}
                                            onClick={() => togglePool(pool)}
                                            style={{
                                                backgroundColor: isSelected ? 'rgba(239,218,160,0.8)' : 'transparent',
                                                color: isSelected ? '#111' : '#aaa',
                                                boxShadow: isSelected
                                                    ? '0 0 5px gold, 0 0 10px gold'
                                                    : '0 0 5px #111214, 0 0 10px #111214',
                                                fontSize: '2.5vmin',
                                            }}
                                        >
                                            {pool}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    );
};

export default CardPoolFilter;
