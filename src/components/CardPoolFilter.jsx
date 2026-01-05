import React, { useEffect, useMemo, useState } from "react";
import { playClickSound } from "../utils/playClickSound.js";
import {getAvailablePools, getDynamicAttributeCounts} from "../utils/cardDataUtils.js";
import { useData } from "../contexts/DataContext.jsx";

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
    // 使用动态加载的数据
    const { cardData, poolCategories } = useData();

    const characters = valuesList["主角"] || [];

    const { availablePools, permanentPools } = useMemo(() => getAvailablePools(cardData), [cardData]);
    const filteredLimitedPools = useMemo(
      () => availablePools.filter(pool => !pool.includes("累充")),
      [availablePools]
    );
    const [currentAvailablePools, setCurrentAvailablePools] = useState(filteredLimitedPools);

    const rechargeConfig = poolCategories?.recharge || {};
    const rechargeEntries = rechargeConfig.cards || [];

    const cardMap = useMemo(() => {
      const map = new Map();
      cardData.forEach(card => {
        map.set(card.卡名, card);
      });
      return map;
    }, []);

    const resolveRechargePool = (entry) => {
      const matched = cardMap.get(entry.name);
      return matched?.获取途径 || entry.pool;
    };

    const filteredRechargePools = useMemo(() => {
      if (!rechargeEntries.length) return [];
      const isRandom = selectedRole.length === 1 && selectedRole[0] === '随机';
      const roleSet = new Set(selectedRole);
      const entries = isRandom
        ? rechargeEntries
        : rechargeEntries.filter(entry => {
            const card = cardMap.get(entry.name);
            return card ? roleSet.has(card.主角) : true;
          });
      return Array.from(
        new Set(
          entries
            .map(resolveRechargePool)
            .filter(Boolean)
        )
      );
    }, [rechargeEntries, selectedRole, cardMap]);

    const [selectedLimitedPools, setSelectedLimitedPools] = useState(() =>
      selectedPools.filter(p => filteredLimitedPools.includes(p))
    );

    const [includeRechargePools, setIncludeRechargePools] = useState(() =>
      selectedPools.some(pool => filteredRechargePools.includes(pool))
    );

    const hasRechargeOption = filteredRechargePools.length > 0;

    useEffect(() => {
      if (!hasRechargeOption && includeRechargePools) {
        setIncludeRechargePools(false);
      }
    }, [hasRechargeOption, includeRechargePools]);

    // ✅ 选择角色后池子变化
    useEffect(() => {
      if (!poolsLoaded) return;

      if (selectedRole.length === 1 && selectedRole[0] === '随机') {
        setCurrentAvailablePools(filteredLimitedPools);
        setSelectedLimitedPools(prev => filteredLimitedPools.filter(pool => prev.includes(pool)));
      } else {
        let tempPools = Object.keys(
          getDynamicAttributeCounts(
            cardData.filter(
              card => selectedRole.includes(card.主角) && (card.稀有度 === '世界' || card.稀有度 === '刹那')
            )
          ).countByAttributes.获取途径
        );
        tempPools = tempPools.filter((item) => item !== "世界之间" && !item.includes("累充"));
        setCurrentAvailablePools(tempPools);
        setSelectedLimitedPools(prev => tempPools.filter(pool => prev.includes(pool)));
      }
    }, [selectedRole, poolsLoaded, filteredLimitedPools, cardData]);


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
    ) && (!hasRechargeOption || includeRechargePools);

    // ✅ 切换选中池
    const toggleLimitedPool = (pool) => {
      setSelectedLimitedPools(prev => {
        const newSelected = prev.includes(pool)
          ? prev.filter(p => p !== pool)
          : [...prev, pool];
        return Array.from(new Set(newSelected));
      });
    };

    useEffect(() => {
      if (!setIncludeMoneyCard) return;
      if (includeMoneyCard !== includeRechargePools) {
        setIncludeMoneyCard(includeRechargePools);
      }
    }, [includeMoneyCard, includeRechargePools, setIncludeMoneyCard]);

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

      const rechargePoolsToInclude = includeRechargePools ? filteredRechargePools : [];
      setSelectedPools([
        ...selectedLimitedPools,
        ...rechargePoolsToInclude,
        ...validPermanentPools,
      ]);
    }, [selectedLimitedPools, includeRechargePools, filteredRechargePools, selectedRole, permanentPools, cardData, poolsLoaded]);



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
                                                if (hasRechargeOption) setIncludeRechargePools(true);
                                            } else {
                                                setSelectedLimitedPools([]);
                                                if (hasRechargeOption) setIncludeRechargePools(false);
                                            }
                                        }}
                                    />
                                </div>

                                <label style={{fontSize: `${baseSize * 5.5}px`, color: "#aaa"}}>（不勾选则仅有常驻世界卡）</label>
                                <label style={{fontSize: `${baseSize * 5.5}px`}}>
                                    {/* 预留“已选卡池”展示区域 */}
                                </label>
                            </div>

                            {/* 选择活动 按钮 */}
                            <div className="flex flex-col mt-[2vmin] ml-[3vw] mr-[3vw] mb-[4vmin] gap-[3vmin]">
                                {hasRechargeOption && (
                                    <div className="flex flex-col gap-[1.5vmin]">
                                        <label
                                            style={{
                                                fontSize: `${baseSize * 7}px`,
                                                color: "#ffd27f",
                                                fontWeight: 700,
                                            }}
                                        >
                                            {rechargeConfig.name || '累充卡池'}
                                        </label>
                                        <div className="flex flex-wrap gap-[1.5vmin]">
                                            <button
                                                onClick={() => setIncludeRechargePools(prev => !prev)}
                                                style={{
                                                    backgroundColor: includeRechargePools ? "rgba(239,218,160,0.8)" : "transparent",
                                                    color: includeRechargePools ? "#111" : "#aaa",
                                                    boxShadow: includeRechargePools ? "0 0 5px gold, 0 0 10px gold" : "0 0 5px #111214, 0 0 10px #111214",
                                                    fontSize: `${baseSize * 6.5}px`,
                                                    padding: `${baseSize * 2}px ${baseSize * 4}px`,
                                                }}
                                            >
                                                {rechargeConfig.name || '累充卡池'}
                                            </button>
                                        </div>
                                        <label style={{fontSize: `${baseSize * 5}px`, color: "#aaa", marginBottom: 0, lineHeight: 1}}>
                                            世界卡：{rechargeEntries.filter(entry => entry.rarity === '世界').map(entry => entry.name).join('、')}
                                        </label>
                                        <label style={{fontSize: `${baseSize * 5}px`, color: "#aaa", marginTop: 0, lineHeight: 1}}>
                                            月卡：{rechargeEntries.filter(entry => entry.rarity === '月').map(entry => entry.name).join('、')}
                                        </label>
                                    </div>
                                )}

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
