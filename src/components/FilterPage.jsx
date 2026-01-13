import {playClickSound} from "../utils/playClickSound.js";
import React, {useEffect, useMemo, useRef, useState} from "react";
import { useData } from "../contexts/DataContext.jsx";
import LeftIcon from "../icons/LeftIcon.jsx";
import HomeIcon from "../icons/HomeIcon.jsx";
import FilterRoleCard from "./FilterRoleCard.jsx";
import FilterAttrCard from "./FilterAttrCard.jsx";
import GalleryTypeSelectPage from "./GalleryTypeSelectPage.jsx";
import {sortCards} from "../utils/cardSort.js";
import LockIcon from "../icons/LockIcon.jsx";
import { Asset } from './Asset.jsx';
import { useAssetLoader } from '../hooks/useAssetLoader.js';
import BlurIcon from "../icons/BlurIcon.jsx";

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
    // 使用动态加载的数据
    const { cardData, poolCategories } = useData();

    // 页面渐入渐出特效
    const [state, setState] = useState(true);

    const roleSelectPosition = [
        {top:`${baseSize * 30}px`, right: `${baseSize * 12}px`},
        {top:`${baseSize * 50}px`, right: `${baseSize * 54}px`}
    ]

    const rarityPictureMap = {
        刹那: 'instant.png',
        世界: 'world.png',
        瞬: 'moment.png',
        月: 'moon.png',
        辰星: 'star1.png',
        星: 'star2.png',
    };

    // 是否显示点击选择顺序的界面（稀有度，属性数值）
    const [showOrderChoiceView, setShowOrderChoiceView] = useState(false);

    // 是否展示所有卡片，选项：全部，已拥有，未拥有
    const [ownChoice, setOwnChoice] = useState("已拥有");
    const [lockInfoCard, setLockInfoCard] = useState(null);
    const [allowLockedPreview, setAllowLockedPreview] = useState(false);
    const [poolChoice, setPoolChoice] = useState(["全部"]);
    const [poolSearch, setPoolSearch] = useState("");

    const roleMap = {0: '顾时夜', 1: '易遇', 3: '夏萧因', 2: '柏源', 4: '全部'};
    const rarityOrderMap = ['稀有度', '主属性数值', '全部', '思维', '魅力', '体魄', '感知', '灵巧'];
    const rechargePoolSet = useMemo(() => {
        const entries = poolCategories?.recharge?.cards || [];
        const pools = new Set();
        entries.forEach(entry => {
            const card = cardData.find(item => item.卡名 === entry.name);
            const pool = card?.获取途径 || entry.pool;
            if (pool) pools.add(pool);
        });
        return pools;
    }, [cardData, poolCategories]);

    const poolSections = useMemo(() => {
        const poolSetAll = new Set(
            (cardData || [])
                .map(card => card.获取途径)
                .filter(Boolean)
        );
        const fiveStarPools = new Set(
            (cardData || [])
                .filter(card => card.稀有度 === '世界' || card.稀有度 === '刹那')
                .map(card => card.获取途径)
                .filter(Boolean)
        );

        const commonPools = ["全部"];
        if (rechargePoolSet.size > 0) commonPools.push("累充");
        const storePool = "崩坍之界商店";
        if (poolSetAll.has(storePool)) commonPools.push(storePool);
        if (poolSetAll.has("世界之间")) commonPools.push("世界之间");

        const collapsedRaw = poolCategories?.worldBetween?.subcategories?.collapsed?.pools ?? [];
        const limitedRaw = poolCategories?.worldBetween?.subcategories?.limited?.pools ?? [];
        const birthdayRaw = poolCategories?.worldBetween?.subcategories?.birthday?.pools ?? [];

        const activityPoolBase = Array.from(poolSetAll)
            .filter(pool => !rechargePoolSet.has(pool));
        const activityPools = [
            ...activityPoolBase
                .filter(pool => pool.includes("活动") && !pool.includes("奇遇"))
                .sort((a, b) => a.localeCompare(b, 'zh-Hans-CN')),
            ...activityPoolBase
                .filter(pool => pool.includes("奇遇"))
                .sort((a, b) => a.localeCompare(b, 'zh-Hans-CN')),
        ];
        const collapsedPools = collapsedRaw
            .filter(pool => poolSetAll.has(pool))
            .filter(pool => !rechargePoolSet.has(pool));
        const limitedPools = limitedRaw
            .filter(pool => pool !== "世界之间")
            .filter(pool => pool !== storePool)
            .filter(pool => poolSetAll.has(pool))
            .filter(pool => !rechargePoolSet.has(pool));
        const birthdayPools = birthdayRaw
            .filter(pool => poolSetAll.has(pool))
            .filter(pool => !rechargePoolSet.has(pool));
        const nonActivityBirthdayPools = birthdayPools.filter(pool => !pool.includes("活动"));

        const latestLimited = "【栖云志异】世界之间";
        const orderedLimited = [
            ...(limitedPools.includes(latestLimited) ? [latestLimited] : []),
            ...limitedPools.filter(pool => pool !== latestLimited),
        ];

        const excluded = new Set([
            ...commonPools,
            ...orderedLimited,
            ...nonActivityBirthdayPools,
            ...collapsedPools,
            ...activityPools,
        ]);

        const otherPools = Array.from(fiveStarPools)
            .filter(pool => !excluded.has(pool))
            .filter(pool => !rechargePoolSet.has(pool))
            .sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'));

        return [
            { key: 'common', label: null, pools: commonPools },
            { key: 'limited', label: '限定卡池', pools: orderedLimited },
            { key: 'birthday', label: '生日卡池', pools: nonActivityBirthdayPools },
            { key: 'collapsed', label: '崩坍卡池', pools: collapsedPools },
            { key: 'activity', label: '活动', pools: activityPools },
            { key: 'other', label: '其他', pools: otherPools },
        ];
    }, [cardData, rechargePoolSet, poolCategories]);

    const poolOptions = useMemo(() => {
        const pools = poolSections.flatMap(section => section.pools);
        return Array.from(new Set(pools));
    }, [poolSections]);

    const poolCardMap = useMemo(() => {
        const map = new Map();
        (cardData || []).forEach(card => {
            const pool = card.获取途径;
            if (!pool) return;
            if (!map.has(pool)) map.set(pool, new Set());
            map.get(pool).add(card.卡名);
        });
        if (poolOptions.includes("累充")) {
            const rechargeNames = (poolCategories?.recharge?.cards || []).map(entry => entry.name).filter(Boolean);
            map.set("累充", new Set(rechargeNames));
        }
        return map;
    }, [cardData, poolCategories, poolOptions]);

    const { loadAsset } = useAssetLoader();
    const [backgroundImage, setBackgroundImage] = useState('images/bg_main1.jpg');
    const backgroundBlobUrlRef = useRef(null);

    useEffect(() => {
        let cancelled = false;

        const loadBackgroundFromCache = async () => {
            try {
                const cachedUrl = await loadAsset('image', 'bg_main1.jpg', { onlyCached: true });
                if (cancelled || !cachedUrl) return;

                if (backgroundBlobUrlRef.current && backgroundBlobUrlRef.current !== cachedUrl) {
                    try { URL.revokeObjectURL(backgroundBlobUrlRef.current); } catch {}
                }

                if (cachedUrl.startsWith('blob:')) {
                    backgroundBlobUrlRef.current = cachedUrl;
                } else {
                    backgroundBlobUrlRef.current = null;
                }
                setBackgroundImage(cachedUrl);
            } catch (error) {
                console.warn('Failed to load bg_main1.jpg from cache, fallback to network path.', error);
            }
        };

        loadBackgroundFromCache();

        return () => {
            cancelled = true;
            if (backgroundBlobUrlRef.current) {
                try { URL.revokeObjectURL(backgroundBlobUrlRef.current); } catch {}
            }
        };
    }, [loadAsset]);

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

        // 其他筛选（稀有度、世界、属性、卡池）
        tmpCards = tmpCards.filter(card =>
            (rarityChoice[0] === "全部" || rarityChoice.includes(card.稀有度)) &&
            (worldChoice[0] === "全部" || worldChoice.includes(card.世界)) &&
            (typeChoice[0] === "全部" || typeChoice.includes(card.属性)) &&
            (
                poolChoice[0] === "全部"
                || poolChoice.includes(card.获取途径)
                || (poolChoice.includes("累充") && rechargePoolSet.has(card.获取途径))
            )
        );

        const sorted = sortCards(tmpCards || [], orderChoice);
        setSortedCards(sorted);
    }, [cards, selectedRole, orderChoice, ownChoice, rarityChoice, worldChoice, typeChoice, poolChoice, cardData, rechargePoolSet]);

    const finalSortedCards = [
        ...sortedCards.filter(card => roleMap[selectedRole] === "全部" || card.主角 === roleMap[selectedRole]),
        ...Array(9).fill({})
    ];

    return (
        <div
            className={`absolute w-full h-full z-200 flex items-center ${state ? "fade-in" : "fade-out"}`}
            style={{backgroundImage: `url(${backgroundImage})`, backgroundSize: 'contain'}}
        >

            {/*左上 返回、Home*/}
            <div className="absolute z-[500] w-auto flex items-center justify-center"
                 style={{top: `${baseSize * 6}px`, left: `${baseSize * 6}px`, gap: `${baseSize * 2}px`}}>
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

                <button
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: `${baseSize * 1}px`,
                        fontSize: `${baseSize * 4.5}px`,
                        padding: `${baseSize * 1.5}px ${baseSize * 2.5}px`,
                        backgroundColor: allowLockedPreview ? 'rgba(34,197,94,0.35)' : 'rgba(255,255,255,0.2)',
                        color: 'white',
                        borderRadius: `${baseSize * 2}px`,
                        border: `1px solid ${allowLockedPreview ? '#22c55e' : 'rgba(255,255,255,0.4)'}`,
                        marginLeft: `${baseSize * 12}px`,
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                        playClickSound();
                        setAllowLockedPreview(prev => !prev);
                    }}
                >
                    <BlurIcon size={baseSize * 7} color={allowLockedPreview ? '#bbf7d0' : '#ffffff'} />
                    切换为{allowLockedPreview ? '不可预览' : '可预览'}未解锁图鉴
                </button>
            </div>

            {/*中间卡片*/}
            <div
                className="absolute w-[50%] h-[75%] z-500 flex grid grid-cols-3 overflow-x-auto items-center"
                style={{left: "27%", top: "15%", gap: `${baseSize * 2}px`}}
            >
                {finalSortedCards.map((card, index) => {
                    const hasCard = Object.keys(card).length > 0;
                    return (
                        <div
                            key={index}
                            className="relative edge-blur-mask"
                            style={{
                                height: `${baseSize * 32}px`,
                            }}
                        >
                            {hasCard ? (
                                <>
                                    <img
                                        src={card.图片信息[0].src}
                                        onClick={()=>{
                                            if (!card) {
                                                return;
                                            }
                                            if (card.owned === false && !allowLockedPreview) {
                                                playClickSound();
                                                return;
                                            }
                                            playClickSound();
                                            setShowGalleryFullImage(true);
                                            setGalleryCard(card);
                                        }}
                                        height={`${baseSize * 30}px`}
                                    />
                                    <Asset
                                        src={`60px-${card.属性}.png`}
                                        type="image"
                                        className="absolute left-[0]"
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
                                    <Asset
                                        src={rarityPictureMap[card.稀有度]}
                                        type="image"
                                        className="absolute"
                                        height={`${baseSize * 12}px`}
                                        style={{right: `${baseSize * 7}px`, pointerEvents: "none"}}
                                    />
                                    {card.owned === false && !allowLockedPreview && (
                                        <div
                                            className="absolute top-[0] left-[0] flex justify-center items-center"
                                            style={{backgroundColor: '#00000060', height: `${baseSize * 30}px`,  width: `${baseSize * 30 * 16 / 9}px`}}
                                        >
                                            <div className="relative flex items-center justify-center w-full h-full px-4">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        playClickSound();
                                                        setLockInfoCard(prev => prev === card.卡名 ? null : card.卡名);
                                                    }}
                                                    style={{background: 'transparent', border: 'none', cursor: 'pointer'}}
                                                >
                                                    <LockIcon color="white" size={baseSize * 8}/>
                                                </button>
                                                {lockInfoCard === card.卡名 && (
                                                    <div className="absolute text-white text-center w-full px-4"
                                                         style={{
                                                             bottom: `${baseSize * 2}px`,
                                                             fontSize: `${baseSize * 4}px`,
                                                             lineHeight: 1,
                                                             backgroundColor: '#00000090',
                                                             padding: `${baseSize * 1.5}px`,
                                                             borderRadius: `${baseSize * 1}px`,
                                                             whiteSpace: 'nowrap',
                                                             overflow: 'hidden',
                                                             textOverflow: 'ellipsis'
                                                         }}>
                                                        {card.获取途径 || '暂无获取信息'}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    {card.owned === false && allowLockedPreview && (
                                        <div
                                            className="absolute top-[1px] left-[1px] text-white px-2 py-1 rounded bg-[rgba(0,0,0,0.5)]"
                                            style={{fontSize: `${baseSize * 3}px`}}
                                        >
                                            已解锁预览
                                        </div>
                                    )}

                                </>
                            ) : null}

                        </div>
                    );
                })}

            </div>

            {/*右上角操作区*/}
            <div
                className="absolute z-[500]"
                style={{
                    top: `${baseSize * 10}px`,
                    right: `${baseSize * 12}px`,
                }}
            >
                <button
                    style={{
                        fontSize: `${baseSize * 6}px`,
                        width: `${baseSize * 60}px`,
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
            </div>

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
                poolMap={poolOptions}
                poolSections={poolSections}
                poolCardMap={poolCardMap}
                poolSearch={poolSearch}
                setPoolSearch={setPoolSearch}
                poolChoice={poolChoice}
                setPoolChoice={setPoolChoice}
                ownChoice={ownChoice}
                setOwnChoice={setOwnChoice}
            />

        </div>
    );
};

export default FilterPage;
