// cardDataUtils.js

const excludedAttributes = ['图片信息', '相会事件', '体魄','思维','魅力','灵巧','感知','详情页', '卡名'];

export function getDynamicAttributeCounts(cardData) {
  const countByAttributes = {};
  const uniqueValues = {};

  cardData.forEach((item) => {
    Object.keys(item).forEach((key) => {
      if (excludedAttributes.includes(key)) return;
      if (!item[key]) return;

      // 初始化
      countByAttributes[key] = countByAttributes[key] || {};
      uniqueValues[key] = uniqueValues[key] || new Set();

      // 计数
      countByAttributes[key][item[key]] = (countByAttributes[key][item[key]] || 0) + 1;
      uniqueValues[key].add(item[key]);
    });
  });

  // 把 Set 转换为数组
  const valuesList = {};
  Object.keys(uniqueValues).forEach((key) => {
    valuesList[key] = Array.from(uniqueValues[key]);
  });

  return {
    countByAttributes, // 每个属性各值的数量
    valuesList         // 每个属性有哪些值（唯一列表）
  };
}



export function getAvailablePools(cardData) {
  const poolCountMap = {};

  cardData.forEach((card) => {
    if (card.稀有度 === "世界") {
      const pool = card["获取途径"];
      if (!poolCountMap[pool]) {
        poolCountMap[pool] = 0;
      }
      poolCountMap[pool]++;
    }
  });

  const allWorldPools = Object.keys(poolCountMap).filter((pool) => poolCountMap[pool] > 0);

  const permanentPools = allWorldPools.filter(
    (pool) => pool === "世界之间" || pool.includes("累充")
  );

  const availablePools = allWorldPools.filter(
    (pool) => !permanentPools.includes(pool)
  );

  return { availablePools, permanentPools };
}











export function filterCards({
  selectedRole = [],
  effectiveSelectedPools = [],
  onlySelectedRoleCard = false,
  includeThreeStar = true,
  includeThreeStarM = true,
  cardData = [],
}) {

  console.log("selectedPools--",effectiveSelectedPools)
  // console.log(selectedRole, selectedPools, onlySelectedRoleCard, includeThreeStar, includeThreeStarM);

  let filteredCards = cardData;

  // 筛选星卡、辰星卡
  if (!includeThreeStar) {
    filteredCards = filteredCards.filter(card => card.稀有度 !== '星');
  }
  if (!includeThreeStarM) {
    filteredCards = filteredCards.filter(card => card.稀有度 !== '辰星');
  }

  // 筛选定向角色的卡
  if (!selectedRole.includes("随机") && onlySelectedRoleCard) {
    filteredCards = filteredCards.filter(card => selectedRole.includes(card.主角));
  }

  // 筛选卡池
  if (!effectiveSelectedPools.includes("全部")) {
    filteredCards = filteredCards.filter(card => effectiveSelectedPools.includes(card.获取途径));
  }

  return filteredCards;
}

