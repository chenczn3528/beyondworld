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











/**
 * 返回最终抽卡池（名字数组）
 * @param {string[]} selectedRole - 选中的角色
 * @param {boolean} useSoftGuarantee - 是否开启大小保底
 * @param {string[]} selectedPools - 选中的限定池，可能包含“全部”
 * @param {Array} cardData - 卡片数据
 * @param {string[]} permanentPools - 常驻池名称列表（如“世界之间”、“累充...”）
 * @param {string[]} availablePools - 限定池名称列表
 * @returns {string[]} - 最终抽卡池列表
 */
export function getFinalPools(selectedRole, useSoftGuarantee, selectedPools, cardData, permanentPools, availablePools) {
  // 1. 先确定限定池
  let limitedPools = [];

  if (selectedPools.includes("全部")) {
    // 全部限定池
    limitedPools = [...availablePools];
  } else {
    limitedPools = selectedPools.filter(pool => availablePools.includes(pool));
  }

  // 2. 常驻池默认加进来（如有大小保底，常驻池一定要加）
  let finalPools = [];

  if (useSoftGuarantee) {
    // 开了大小保底，必须包含所有常驻池
    finalPools = [...new Set([...limitedPools, ...permanentPools])];
  } else {
    // 没开大小保底，只保留常驻池如果用户没选限定池
    finalPools = limitedPools.length > 0 ? limitedPools : [...permanentPools];
  }

  // 3. 如果需要根据角色筛选卡池（假设cardData里卡对应池的角色是 card.所属角色）
  // 这里过滤掉池里没有选中角色卡的池子

  // 先收集每个池子里包含的角色
  const poolRoleMap = {}; // {池子名: Set(角色名)}

  cardData.forEach(card => {
    const pool = card["获取途径"];
    if (!poolRoleMap[pool]) poolRoleMap[pool] = new Set();
    if (card["主角"]) poolRoleMap[pool].add(card["主角"]);
  });

  // 只保留包含选中角色的池子（如果选了角色，且不是“随机”）
  if (selectedRole.length > 0 && !selectedRole.includes("随机")) {
    finalPools = finalPools.filter(pool => {
      const roles = poolRoleMap[pool];
      if (!roles) return false; // 这个池没数据直接剔除
      // 只要池中角色集合和选中角色有交集即保留
      return selectedRole.some(role => roles.has(role));
    });
  }

  return finalPools;
}
