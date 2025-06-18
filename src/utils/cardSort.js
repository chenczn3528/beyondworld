const rarityOrderMap = ['稀有度', '主属性数值', '全部', '思维', '魅力', '体魄', '感知', '灵巧'];

const rarityOrder = {'世界': 4, '月': 3, '辰星': 2, '星': 1};
const roleOrder = {'顾时夜':4, '易遇':3, '柏源':2, '夏萧因':1};
const sourceOrder = {'累充' :4, '商店': 3, '活动': 2, '感召':1}
const sumFields = rarityOrderMap.slice(2);


export function sortCards (cards, orderChoice) {
    return [...cards].sort((a, b) => {
        // 稀有度
        if (orderChoice === 0){
            // 1. 稀有度（降序）
            const rarityDiff = (rarityOrder[b.稀有度] || 0) - (rarityOrder[a.稀有度] || 0);
            if (rarityDiff !== 0) return rarityDiff;
            // 2. 角色名（升序）
            const roleDiff = (roleOrder[b.主角] || 0) - (roleOrder[a.主角] || 0);
            if (roleDiff !== 0) return roleDiff;
            // 3.主属性得分
            let primary = 0;
            primary = Number(b[b.属性] || 0) - Number(a[a.属性] || 0);
            if (primary !== 0) return primary;
            // 4. 总分得分
            let primaryAll = 0;
            const sumA = sumFields.reduce((sum, field) => sum + Number(a[field] || 0), 0);
            const sumB = sumFields.reduce((sum, field) => sum + Number(b[field] || 0), 0);
            primaryAll = sumB - sumA;
            if (primaryAll !== 0) return primaryAll;
            // 5. 来源（商店、感召、累充、活动）
            const sourceDiff = (sourceOrder[b.来源] || 0) - (sourceOrder[b.来源] || 0);
            if (sourceDiff !== 0) return sourceDiff;
            // 6. 限定池优先（限定 < 常驻）
            const poolDiff = (a.板块 === '限定' ? -1 : 1) - (b.板块 === '限定' ? -1 : 1);
            if (poolDiff !== 0) return poolDiff;
        }
        // 主属性
        else if (orderChoice === 1){
            // 1.主属性
            let primary = 0;
            primary = Number(b[b.属性] || 0) - Number(a[a.属性] || 0);
            if (primary !== 0) return primary;
            // 2. 总分
            let primaryAll = 0;
            const sumA = sumFields.reduce((sum, field) => sum + Number(a[field] || 0), 0);
            const sumB = sumFields.reduce((sum, field) => sum + Number(b[field] || 0), 0);
            primaryAll = sumB - sumA;
            if (primaryAll !== 0) return primaryAll;
            // 3. 稀有度（降序）
            const rarityDiff = (rarityOrder[b.稀有度] || 0) - (rarityOrder[a.稀有度] || 0);
            if (rarityDiff !== 0) return rarityDiff;
            // 4. 来源（商店、感召、累充、活动）
            const sourceDiff = (sourceOrder[b.来源] || 0) - (sourceOrder[b.来源] || 0);
            if (sourceDiff !== 0) return sourceDiff;
            // 5. 限定池优先（限定 < 常驻）
            const poolDiff = (a.板块 === '限定' ? -1 : 1) - (b.板块 === '限定' ? -1 : 1);
            if (poolDiff !== 0) return poolDiff;
            // 6. 角色名（升序）
            const roleDiff = (roleOrder[b.主角] || 0) - (roleOrder[a.主角] || 0);
            if (roleDiff !== 0) return roleDiff;
        }
        // 单属性
        else {
            if(orderChoice !== 2){
                // 1. 单个属性
                let primary = 0;
                primary = Number(b[rarityOrderMap[orderChoice]] || 0) - Number(a[rarityOrderMap[orderChoice]] || 0);
                if (primary !== 0) return primary;
            }
            // 2. 总分
            let primaryAll = 0;
            const sumA = sumFields.reduce((sum, field) => sum + Number(a[field] || 0), 0);
            const sumB = sumFields.reduce((sum, field) => sum + Number(b[field] || 0), 0);
            primaryAll = sumB - sumA;
            if (primaryAll !== 0) return primaryAll;
            // 3. 稀有度（降序）
            const rarityDiff = (rarityOrder[b.稀有度] || 0) - (rarityOrder[a.稀有度] || 0);
            if (rarityDiff !== 0) return rarityDiff;
            // 4. 来源（商店、感召、累充、活动）
            const sourceDiff = (sourceOrder[b.来源] || 0) - (sourceOrder[b.来源] || 0);
            if (sourceDiff !== 0) return sourceDiff;
            // 5. 限定池优先（限定 < 常驻）
            const poolDiff = (a.板块 === '限定' ? -1 : 1) - (b.板块 === '限定' ? -1 : 1);
            if (poolDiff !== 0) return poolDiff;
            // 6. 角色名（升序）
            const roleDiff = (roleOrder[b.主角] || 0) - (roleOrder[a.主角] || 0);
            if (roleDiff !== 0) return roleDiff;
        }
    });
};