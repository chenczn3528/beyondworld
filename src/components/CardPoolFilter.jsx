import React, { useEffect, useMemo, useState } from "react";
import { playClickSound } from "../utils/playClickSound.js";
import {getAvailablePools, getDynamicAttributeCounts} from "../utils/cardDataUtils.js";
import cardData from "../assets/cards.json";
import poolCategories from "../assets/poolCategories.json";

const CardPoolFilter = ({
    baseSize,
    selectedRole,
    setSelectedRole,
    useSoftGuarantee,
    setUseSoftGuarantee,
    includeThreeStar,
    setIncludeThreeStar,
    includeThreeStarM,
    setIncludeThreeStarM,
    includeMoneyCard,
    setIncludeMoneyCard,
    onlySelectedRoleCard,
    setOnlySelectedRoleCard,
    showCardPoolFilter,
    setShowCardPoolFilter,
    valuesList,
    selectedPools,
    setSelectedPools,
    poolsLoaded,
}) => {



    const characters = valuesList["主角"] || [];

    const { availablePools, permanentPools } = useMemo(() => getAvailablePools(cardData), [cardData]);

    const [currentAvailablePools, setCurrentAvailablePools] = useState(availablePools);

    // ✅ 初始化时根据 selectedPools 过滤出 limited 池
    const [selectedLimitedPools, setSelectedLimitedPools] = useState(() => {
      return selectedPools.filter(p => availablePools.includes(p));
    });

    // ✅ 等 poolsLoaded 后再同步一次（只第一次）
    useEffect(() => {
      if (!poolsLoaded) return;
      setSelectedLimitedPools(
        selectedPools.filter(p => currentAvailablePools.includes(p))
      );
    }, [poolsLoaded]);

    // ✅ 选择角色后池子变化
    useEffect(() => {
      if (!poolsLoaded) return;

      if (selectedRole.length === 1 && selectedRole[0] === '随机') {
        setCurrentAvailablePools(availablePools);
        setSelectedLimitedPools(prev =>
          availablePools.filter(pool => prev.includes(pool))
        );
      } else {
        let temp_pools = Object.keys(
          getDynamicAttributeCounts(
            cardData.filter(
              card => selectedRole.includes(card.主角) && (card.稀有度 === '世界' || card.稀有度 === '刹那')
            )
          ).countByAttributes.获取途径
        );
        temp_pools = temp_pools.filter(
          (item) => item !== "世界之间" && !item.includes("累充")
        );
        setCurrentAvailablePools(temp_pools);
        setSelectedLimitedPools(prev =>
          temp_pools.filter(pool => prev.includes(pool))
        );
      }
    }, [selectedRole, poolsLoaded]);

    const formatPoolName = (pool) => {
      if (typeof pool !== "string") return pool;
      const bracketMatch = pool.match(/【([^】]+)】/);
      if (bracketMatch) return bracketMatch[1];
      const withoutBrackets = pool.replace(/【|】/g, "");
      return withoutBrackets.replace(/世界之间$/, "").trim();
    };

    const { categories: categorizedWorldBetween, uncategorizedPools } = useMemo(() => {
      const subcategories = poolCategories?.worldBetween?.subcategories ?? {};
      const categories = Object.entries(subcategories)
        .filter(([key]) => key !== "basic")
        .map(([key, value]) => {
          const candidatePools = (value?.pools ?? []).filter((pool) =>
            currentAvailablePools.includes(pool)
          );
          return {
            key,
            name: value?.name ?? key,
            pools: candidatePools,
          };
        })
        .filter((category) => category.pools.length > 0);

      const categorizedPoolSet = new Set(
        categories.flatMap((category) => category.pools)
      );
      const uncategorized = currentAvailablePools.filter(
        (pool) => !categorizedPoolSet.has(pool)
      );

      return { categories, uncategorizedPools: uncategorized };
    }, [currentAvailablePools]);

    // ✅ 是否全选
    const isAllLimitedSelected = currentAvailablePools.every((pool) =>
      selectedLimitedPools.includes(pool)
    );

    // ✅ 切换选中池
    const toggleLimitedPool = (pool) => {
      setSelectedLimitedPools(prev => {
        const newSelected = prev.includes(pool)
          ? prev.filter(p => p !== pool)
          : [...prev, pool];
        return Array.from(new Set(newSelected));
      });
    };

    // ✅ 将 selectedLimitedPools + permanentPools 合并写入父级 selectedPools
    useEffect(() => {
      if (!poolsLoaded) return;

      const validPermanentPools =
        selectedRole[0] === '随机'
          ? permanentPools
          : permanentPools.filter(pool =>
              cardData.some(card =>
                selectedRole.includes(card.主角)
                && (card.稀有度 === '世界' || card.稀有度 === '刹那')
                && card.获取途径 === pool
              )
            );

      setSelectedPools([...selectedLimitedPools, ...validPermanentPools]);
    }, [selectedLimitedPools, selectedRole, permanentPools, cardData, poolsLoaded]);



  // 角色和星级筛选部分未改，保持不动
    const toggleCharacter = (char) => {
    if (selectedRole.includes("随机")) {
      const newSelected = characters.filter((c) => c !== char);
      setSelectedRole(newSelected);
    } else {
      const alreadySelected = selectedRole.includes(char);
      let newSelected;

      if (alreadySelected) {
        newSelected = selectedRole.filter((c) => c !== char);
        if (newSelected.length === 0) {
          setSelectedRole(["随机"]);
        } else {
          setSelectedRole(newSelected);
        }
      } else {
        newSelected = [...selectedRole, char];
        if (newSelected.length === characters.length) {
          setSelectedRole(["随机"]);
        } else {
          setSelectedRole(newSelected);
        }
      }
    }
  };

    return (
        showCardPoolFilter && (
            <div
                className="absolute w-full h-full z-50 flex items-center justify-center"
                onClick={() => {
                    playClickSound();
                    setShowCardPoolFilter(false);
                }}
            >
                <div
                    className="absolute flex flex-col w-[50%] h-[80%]"
                    onClick={(e) => {
                        playClickSound();
                        e.stopPropagation();
                    }}
                    style={{
                        backgroundColor: "#2a2d39",
                        fontSize: `${baseSize * 7}px`,
                        color: "white",
                    }}
                >
                    <div className="relative flex flex-col h-full mt-[2vh] mb-[2vh]">
                        <label
                            className="flex justify-center items-center mt-[1vmin] mb-[3vmin]"
                            style={{ fontSize: `${baseSize * 10}px`, fontWeight: "800" }}>筛选卡池</label>

                        <div className={`mb-[8vmin] overflow-y-auto`}>

                            <label className="flex items-center mt-[1vmin] ml-[3vw] mr-[3vw] mb-[1vmin]"
                                   style={{fontSize: `${baseSize * 5.5}px`, color: "#aaa"}}>
                                大强没写具体的感召规则，因此这里沿用深空的规则，前60抽每次出世界侧影的概率为2%，60抽之后每一抽的概率在前一抽的基础上增加10%。</label>


                            {/* 主角多选 */}
                            <div className="ml-[3vw] mr-[3vw]">
                                <label>选择主角：</label>
                                <div className="flex flex-row mt-[1vmin] gap-[2vmin] justify-center items-center">
                                    {characters.map((char) => {
                                        const isSelected = selectedRole.includes(char) || selectedRole.includes("随机");

                                        return (
                                            <button
                                                key={char}
                                                onClick={() => toggleCharacter(char)}
                                                style={{
                                                    fontSize: `${baseSize * 7}px`,
                                                    backgroundColor: isSelected ? "rgba(239,218,160,0.8)" : "transparent",
                                                    color: isSelected ? "#111" : "#aaa",
                                                    boxShadow: isSelected
                                                        ? "0 0 10px gold, 0 0 20px gold"
                                                        : "0 0 10px #111214, 0 0 20px #111214",
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
                                <label className="flex items-center mr-[1vmin]">包含辰星卡</label>
                                <input
                                    type="checkbox"
                                    checked={includeThreeStarM}
                                    onChange={(e) => setIncludeThreeStarM(e.target.checked)}
                                />

                                <label className="flex items-center mr-[1vmin] ml-[3vmin]">包含星卡</label>
                                <input
                                    type="checkbox"
                                    checked={includeThreeStar}
                                    onChange={(e) => setIncludeThreeStar(e.target.checked)}
                                />

                                <label className="flex items-center mr-[1vmin] ml-[3vmin]">包含崩坍累充</label>
                                <input
                                    type="checkbox"
                                    checked={includeMoneyCard}
                                    onChange={(e) => setIncludeMoneyCard(e.target.checked)}
                                />
                            </div>

                            {/* 保底选项 */}
                            <div className="flex items-center mt-[1vmin] ml-[3vw] mr-[3vw]">
                                <label className="flex items-center mr-[1vmin]">启用大小保底</label>
                                <input
                                    type="checkbox"
                                    checked={useSoftGuarantee}
                                    onChange={(e) => {
                                        setUseSoftGuarantee(e.target.checked);
                                        if (e.target.checked) setOnlySelectedRoleCard(false);
                                    }}
                                />
                            </div>

                            <label
                                className="flex items-center mt-[0vmin] ml-[3vw] mr-[3vw]"
                                style={{fontSize: `${baseSize * 5.5}px`, color: "#aaa"}}
                            >
                                保底规则说明：启用大小保底，若选择了限定池，小保底歪常驻池的随机角色或限定池的未定向角色，大保底必出限定池、定向角色的卡；关闭大小保底，则出限定池的定向角色。
                            </label>

                            {/* 是否仅抽指定角色卡 */}
                            {!(selectedRole.length === 1 && selectedRole[0] === "随机") && (
                                <div className="flex items-center mt-[1vmin] ml-[3vw] mr-[3vw]">
                                    <label className="flex items-center mr-[1vmin]">仅抽</label>
                                    <label style={{fontWeight: 800, color: "gold"}}>{selectedRole.join("、")}</label>
                                    <label className="flex items-center ml-[1vmin] mr-[1vmin]"> 的卡</label>
                                    <input
                                        type="checkbox"
                                        checked={onlySelectedRoleCard}
                                        onChange={(e) => {
                                            setOnlySelectedRoleCard(e.target.checked);
                                            if (e.target.checked) setUseSoftGuarantee(false);
                                        }}
                                    />
                                </div>
                            )}

                            {/* 选择活动 文字 */}
                            <div className="flex flex-col ml-[3vw] mr-[3vw] mt-[2vmin] mb-[2vmin]">
                                <div className="flex flex-row gap-[1vmin]">
                                    <label className="">选择全部限定卡池</label>
                                    <input
                                        type="checkbox"
                                        checked={isAllLimitedSelected}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedLimitedPools(currentAvailablePools);
                                            } else {
                                                setSelectedLimitedPools([]);
                                            }
                                        }}
                                    />
                                </div>

                                <label style={{fontSize: `${baseSize * 5.5}px`, color: "#aaa"}}>（不勾选则仅有常驻{includeMoneyCard ? "+累充" : "" }世界卡）</label>
                                <label style={{fontSize: `${baseSize * 5.5}px`}}>
                                    {/* <span style={{color: "white", fontWeight: 800}}>已选卡池：</span>
                                    <span style={{color: "#efd6a0"}}>
                                        {selectedPools.length === permanentPools.length + currentAvailablePools.length
                                            ? '全部'
                                            : selectedLimitedPools.length === 0
                                                ? includeMoneyCard ? '常驻+累充' : '常驻'
                                                : includeMoneyCard
                                                    ? '常驻+累充，' + selectedLimitedPools.map(formatPoolName).join('，')
                                                    : '常驻，' + selectedLimitedPools.map(formatPoolName).join('，')}
                                    </span> */}
                                </label>
                            </div>

                            {/* 选择活动 按钮 */}
                            <div className="flex flex-col mt-[2vmin] ml-[3vw] mr-[3vw] mb-[4vmin] gap-[3vmin]">
                                {categorizedWorldBetween.map((category) => (
                                    <div key={category.key} className="flex flex-col gap-[1.5vmin]">
                                        <label
                                            style={{
                                                fontSize: `${baseSize * 7}px`,
                                                color: category.key === "collapsed" || category.key === "birthday" || category.key === "limited" ? "#4ea2ff" : "#efd6a0",
                                                fontWeight: 700,
                                            }}
                                        >
                                            {category.name}
                                        </label>
                                        <div className="flex flex-wrap gap-[1.5vmin]">
                                            {category.pools.map((pool) => {
                                                const isSelected = selectedLimitedPools.includes(pool);
                                                return (
                                                    <button
                                                        key={pool}
                                                        onClick={() => toggleLimitedPool(pool)}
                                                        style={{
                                                            backgroundColor: isSelected ? "rgba(239,218,160,0.8)" : "transparent",
                                                            color: isSelected ? "#111" : "#aaa",
                                                            boxShadow: isSelected ? "0 0 5px gold, 0 0 10px gold" : "0 0 5px #111214, 0 0 10px #111214",
                                                            fontSize: `${baseSize * 6.5}px`,
                                                            padding: `${baseSize * 2}px ${baseSize * 4}px`,
                                                        }}
                                                    >
                                                        {formatPoolName(pool)}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}

                                {uncategorizedPools.length > 0 && (
                                    <div className="flex flex-col gap-[1.5vmin]">
                                        <label
                                            style={{
                                                fontSize: `${baseSize * 7}px`,
                                                color: "#efd6a0",
                                                fontWeight: 700,
                                            }}
                                        >
                                            其他
                                        </label>
                                        <div className="flex flex-wrap gap-[1.5vmin]">
                                            {uncategorizedPools.map((pool) => {
                                                const isSelected = selectedLimitedPools.includes(pool);
                                                return (
                                                    <button
                                                        key={pool}
                                                        onClick={() => toggleLimitedPool(pool)}
                                                        style={{
                                                            backgroundColor: isSelected ? "rgba(239,218,160,0.8)" : "transparent",
                                                            color: isSelected ? "#111" : "#aaa",
                                                            boxShadow: isSelected ? "0 0 5px gold, 0 0 10px gold" : "0 0 5px #111214, 0 0 10px #111214",
                                                            fontSize: `${baseSize * 5.5}px`,
                                                            padding: `${baseSize * 2}px ${baseSize * 4}px`,
                                                        }}
                                                    >
                                                        {formatPoolName(pool)}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    );
};

export default CardPoolFilter;
