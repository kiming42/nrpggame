// src/data/worldNodes.js
// 🌟 完整收錄 rpg_maps_and_nodes.json 世界地圖、15 把採集工具與 25 個資源採集點 (T1 ~ T5)

export const GatheringFormulas = {
    getEffectiveGatherTime(gatherTimeSec, speedBonus = 0) {
        return +(gatherTimeSec / (1 + speedBonus)).toFixed(2);
    },
    rollGatherQuantity(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    checkDoubleDrop(quantity, doubleDropChance = 0) {
        return Math.random() < doubleDropChance ? quantity * 2 : quantity;
    }
};

export const GatheringTools = [
    // 伐木斧 (axe) T1 ~ T5
    { toolId: "TOOL_AXE_T1", name: "青銅伐木斧", toolType: "axe", tier: 1, speedBonus: 0.0, doubleDropChance: 0.05 },
    { toolId: "TOOL_AXE_T2", name: "寒鐵伐木斧", toolType: "axe", tier: 2, speedBonus: 0.15, doubleDropChance: 0.1 },
    { toolId: "TOOL_AXE_T3", name: "秘銀伐木斧", toolType: "axe", tier: 3, speedBonus: 0.3, doubleDropChance: 0.18 },
    { toolId: "TOOL_AXE_T4", name: "龍紋伐木斧", toolType: "axe", tier: 4, speedBonus: 0.5, doubleDropChance: 0.25 },
    { toolId: "TOOL_AXE_T5", name: "虛空創世神斧", toolType: "axe", tier: 5, speedBonus: 0.8, doubleDropChance: 0.4 },
    // 十字鎬 (pickaxe) T1 ~ T5
    { toolId: "TOOL_PICK_T1", name: "青銅十字鎬", toolType: "pickaxe", tier: 1, speedBonus: 0.0, doubleDropChance: 0.05 },
    { toolId: "TOOL_PICK_T2", name: "寒鐵十字鎬", toolType: "pickaxe", tier: 2, speedBonus: 0.15, doubleDropChance: 0.1 },
    { toolId: "TOOL_PICK_T3", name: "秘銀十字鎬", toolType: "pickaxe", tier: 3, speedBonus: 0.3, doubleDropChance: 0.18 },
    { toolId: "TOOL_PICK_T4", name: "龍紋十字鎬", toolType: "pickaxe", tier: 4, speedBonus: 0.5, doubleDropChance: 0.25 },
    { toolId: "TOOL_PICK_T5", name: "虛空碎星神鎬", toolType: "pickaxe", tier: 5, speedBonus: 0.8, doubleDropChance: 0.4 },
    // 採藥鐮 (sickle) T1 ~ T5
    { toolId: "TOOL_SICKLE_T1", name: "青銅採藥鐮", toolType: "sickle", tier: 1, speedBonus: 0.0, doubleDropChance: 0.05 },
    { toolId: "TOOL_SICKLE_T2", name: "寒鐵採藥鐮", toolType: "sickle", tier: 2, speedBonus: 0.15, doubleDropChance: 0.1 },
    { toolId: "TOOL_SICKLE_T3", name: "秘銀採藥鐮", toolType: "sickle", tier: 3, speedBonus: 0.3, doubleDropChance: 0.18 },
    { toolId: "TOOL_SICKLE_T4", name: "龍紋採藥鐮", toolType: "sickle", tier: 4, speedBonus: 0.5, doubleDropChance: 0.25 },
    { toolId: "TOOL_SICKLE_T5", name: "世界樹靈能鐮", toolType: "sickle", tier: 5, speedBonus: 0.8, doubleDropChance: 0.4 }
];

// 自動建立 T1~T5 共 25 個採集點結構 (100% 對應 rpg_maps_and_nodes.json)
const NODE_META_BY_TIER = {
    1: {
        regionId: "MAP_T1_PLAINS", regionName: "新手平原與幽暗森林", recommendedLevel: [1, 20], unlockQuestId: null, hazard: null,
        npcs: ["新手村長·巴爾", "鐵匠鋪老闆·托爾", "冒險者公會長·艾琳", "神射手·萊戈", "商會後勤官·瑪莎"],
        nodes: {
            logging: { nodeId: "NODE_T1_WOOD", name: "微風橡木林與灌木叢", staminaCost: 5, gatherTimeSec: 2.0, respawnTimeSec: 15, expReward: 15, startMat: 1, rates: [0.8,0.75,0.7,0.65,0.6,0.55,0.5,0.45,0.4,0.35], min: 1, max: 3 },
            mining: { nodeId: "NODE_T1_ORE", name: "淺層銅錫礦坑", staminaCost: 6, gatherTimeSec: 2.5, respawnTimeSec: 20, expReward: 20, startMat: 51, rates: [0.75,0.7,0.65,0.6,0.55,0.5,0.45,0.4,0.35,0.3], min: 1, max: 3, bonusGems: [{ id: "MAT_101", rate: 0.12 }, { id: "MAT_102", rate: 0.12 }] },
            crystal_vein: { nodeId: "NODE_T1_GEM", name: "微光元素碎晶簇", staminaCost: 8, gatherTimeSec: 3.0, respawnTimeSec: 45, expReward: 30, startMat: 101, rates: [0.65,0.6,0.55,0.5,0.45,0.4,0.35,0.3,0.25,0.2], min: 1, max: 2 },
            harvesting: { nodeId: "NODE_T1_HERB", name: "清泉藥草園", staminaCost: 4, gatherTimeSec: 1.8, respawnTimeSec: 15, expReward: 15, startMat: 201, rates: [0.8,0.75,0.7,0.65,0.6,0.55,0.5,0.45,0.4,0.35], min: 1, max: 3 },
            scavenging: { nodeId: "NODE_T1_RELIC", name: "森林荒廢旅人營地", staminaCost: 10, gatherTimeSec: 3.5, respawnTimeSec: 90, expReward: 45, startMat: 251, rates: [0.55,0.5,0.45,0.4,0.35,0.3,0.25,0.2,0.2,0.2], min: 1, max: 1 }
        }
    },
    2: {
        regionId: "MAP_T2_CANYON", regionName: "荒蕪峽谷與石像遺跡", recommendedLevel: [21, 40], unlockQuestId: "Q_MAIN_T1_03",
        hazard: { name: "峽谷沙塵暴", effect: "未穿戴護目鏡或 T2 防具時，遠程命中率降低 5%" },
        npcs: ["峽谷哨兵隊長·雷恩", "矮人重甲師·銅鬚", "大賢者·梅林"],
        nodes: {
            logging: { nodeId: "NODE_T2_WOOD", name: "峽谷鐵樺與陰沉木林", staminaCost: 8, gatherTimeSec: 2.5, respawnTimeSec: 25, expReward: 55, startMat: 11, rates: [0.75,0.7,0.65,0.6,0.55,0.5,0.45,0.4,0.35,0.3], min: 1, max: 3 },
            mining: { nodeId: "NODE_T2_ORE", name: "黑曜石與寒鐵礦脈", staminaCost: 10, gatherTimeSec: 3.0, respawnTimeSec: 30, expReward: 70, startMat: 61, rates: [0.7,0.65,0.6,0.55,0.5,0.45,0.4,0.35,0.3,0.25], min: 1, max: 3, bonusGems: [{ id: "MAT_116", rate: 0.1 }, { id: "MAT_118", rate: 0.12 }] },
            crystal_vein: { nodeId: "NODE_T2_GEM", name: "元素共鳴晶洞", staminaCost: 12, gatherTimeSec: 3.5, respawnTimeSec: 60, expReward: 95, startMat: 111, rates: [0.6,0.55,0.5,0.45,0.4,0.35,0.3,0.25,0.2,0.2], min: 1, max: 2 },
            harvesting: { nodeId: "NODE_T2_HERB", name: "遺跡月光綠洲", staminaCost: 7, gatherTimeSec: 2.2, respawnTimeSec: 25, expReward: 55, startMat: 211, rates: [0.75,0.7,0.65,0.6,0.55,0.5,0.45,0.4,0.35,0.3], min: 1, max: 3 },
            scavenging: { nodeId: "NODE_T2_RELIC", name: "古代機關傀儡殘骸堆", staminaCost: 15, gatherTimeSec: 4.0, respawnTimeSec: 120, expReward: 130, startMat: 261, rates: [0.5,0.45,0.4,0.35,0.3,0.25,0.2,0.2,0.2,0.2], min: 1, max: 1 }
        }
    },
    3: {
        regionId: "MAP_T3_CORE", regionName: "熔岩地心與深淵地牢", recommendedLevel: [41, 60], unlockQuestId: "Q_MAIN_T2_02",
        hazard: { name: "地心灼熱高溫", effect: "每秒損失 0.5% 最大生命，裝備防具或飲用藥劑可免疫" },
        npcs: ["炎之守護者·伊格尼", "空間旅者·奇諾"],
        nodes: {
            logging: { nodeId: "NODE_T3_WOOD", name: "烈焰紅木與暗影黑檀林", staminaCost: 12, gatherTimeSec: 3.0, respawnTimeSec: 40, expReward: 180, startMat: 21, rates: [0.7,0.65,0.6,0.55,0.5,0.45,0.4,0.35,0.3,0.25], min: 1, max: 3 },
            mining: { nodeId: "NODE_T3_ORE", name: "地心秘銀與精金礦脈", staminaCost: 15, gatherTimeSec: 3.5, respawnTimeSec: 45, expReward: 220, startMat: 71, rates: [0.68,0.63,0.58,0.53,0.48,0.43,0.38,0.33,0.28,0.23], min: 1, max: 2, bonusGems: [{ id: "MAT_121", rate: 0.12 }, { id: "MAT_127", rate: 0.12 }] },
            crystal_vein: { nodeId: "NODE_T3_GEM", name: "深淵魔力結晶床", staminaCost: 18, gatherTimeSec: 4.0, respawnTimeSec: 90, expReward: 300, startMat: 121, rates: [0.58,0.53,0.48,0.43,0.38,0.33,0.28,0.23,0.2,0.2], min: 1, max: 2 },
            harvesting: { nodeId: "NODE_T3_HERB", name: "地脈龍血與聖泉溫室", staminaCost: 11, gatherTimeSec: 2.8, respawnTimeSec: 40, expReward: 180, startMat: 221, rates: [0.72,0.67,0.62,0.57,0.52,0.47,0.42,0.37,0.32,0.27], min: 1, max: 3 },
            scavenging: { nodeId: "NODE_T3_RELIC", name: "深淵伯爵秘寶庫", staminaCost: 22, gatherTimeSec: 4.5, respawnTimeSec: 180, expReward: 400, startMat: 271, rates: [0.45,0.4,0.35,0.3,0.25,0.2,0.2,0.2,0.2,0.2], min: 1, max: 1 }
        }
    },
    4: {
        regionId: "MAP_T4_SKY", regionName: "天空之城與龍之神殿", recommendedLevel: [61, 80], unlockQuestId: "Q_MAIN_T3_02",
        hazard: { name: "高空稀薄氣流", effect: "未裝備 T4 防具時，技能魔力消耗增加 10%" },
        npcs: ["天空翼人族長·索拉", "大賢者·梅林"],
        nodes: {
            logging: { nodeId: "NODE_T4_WOOD", name: "星辰銀木與龍血神木林", staminaCost: 18, gatherTimeSec: 3.5, respawnTimeSec: 60, expReward: 550, startMat: 31, rates: [0.65,0.6,0.55,0.5,0.45,0.4,0.35,0.3,0.25,0.2], min: 1, max: 2 },
            mining: { nodeId: "NODE_T4_ORE", name: "浮空星隕與山銅礦脈", staminaCost: 22, gatherTimeSec: 4.0, respawnTimeSec: 75, expReward: 680, startMat: 81, rates: [0.62,0.57,0.52,0.47,0.42,0.37,0.32,0.27,0.22,0.2], min: 1, max: 2, bonusGems: [{ id: "MAT_131", rate: 0.1 }, { id: "MAT_134", rate: 0.1 }] },
            crystal_vein: { nodeId: "NODE_T4_GEM", name: "天界星界棱鏡祭壇", staminaCost: 26, gatherTimeSec: 4.5, respawnTimeSec: 120, expReward: 900, startMat: 131, rates: [0.52,0.47,0.42,0.37,0.32,0.27,0.22,0.2,0.2,0.2], min: 1, max: 2 },
            harvesting: { nodeId: "NODE_T4_HERB", name: "瑤池雪蓮與月亮井空中花園", staminaCost: 16, gatherTimeSec: 3.2, respawnTimeSec: 60, expReward: 550, startMat: 231, rates: [0.65,0.6,0.55,0.5,0.45,0.4,0.35,0.3,0.25,0.2], min: 1, max: 2 },
            scavenging: { nodeId: "NODE_T4_RELIC", name: "古龍聖殿王權聖物匣", staminaCost: 30, gatherTimeSec: 5.0, respawnTimeSec: 240, expReward: 1200, startMat: 281, rates: [0.4,0.35,0.3,0.25,0.2,0.2,0.2,0.2,0.2,0.2], min: 1, max: 1 }
        }
    },
    5: {
        regionId: "MAP_T5_VOID", regionName: "時空虛空與創世神域", recommendedLevel: [81, 100], unlockQuestId: "Q_MAIN_T4_02",
        hazard: { name: "維度時空亂流", effect: "全屬性抗性降低 15%，穿戴創世系列裝備可完全抵消" },
        npcs: ["時空守望者·克羅諾斯", "星界懸賞終端（T5）"],
        nodes: {
            logging: { nodeId: "NODE_T5_WOOD", name: "世界樹根系與虛空結晶林", staminaCost: 25, gatherTimeSec: 4.0, respawnTimeSec: 90, expReward: 1600, startMat: 41, rates: [0.6,0.55,0.5,0.45,0.4,0.35,0.3,0.25,0.2,0.2], min: 1, max: 2 },
            mining: { nodeId: "NODE_T5_ORE", name: "創世星核與虛空神鐵礦脈", staminaCost: 30, gatherTimeSec: 4.5, respawnTimeSec: 110, expReward: 2000, startMat: 91, rates: [0.58,0.53,0.48,0.43,0.38,0.33,0.28,0.23,0.2,0.2], min: 1, max: 2, bonusGems: [{ id: "MAT_142", rate: 0.08 }, { id: "MAT_149", rate: 0.08 }] },
            crystal_vein: { nodeId: "NODE_T5_GEM", name: "宇宙法則星塵裂隙", staminaCost: 35, gatherTimeSec: 5.0, respawnTimeSec: 180, expReward: 2800, startMat: 141, rates: [0.48,0.43,0.38,0.33,0.28,0.23,0.2,0.2,0.2,0.2], min: 1, max: 1 },
            harvesting: { nodeId: "NODE_T5_HERB", name: "星河諸神甘露神園", staminaCost: 24, gatherTimeSec: 3.8, respawnTimeSec: 90, expReward: 1600, startMat: 241, rates: [0.6,0.55,0.5,0.45,0.4,0.35,0.3,0.25,0.2,0.2], min: 1, max: 2 },
            scavenging: { nodeId: "NODE_T5_RELIC", name: "阿卡西時空神殿聖櫃", staminaCost: 45, gatherTimeSec: 6.0, respawnTimeSec: 360, expReward: 3500, startMat: 291, rates: [0.35,0.3,0.25,0.2,0.2,0.2,0.2,0.2,0.2,0.2], min: 1, max: 1 }
        }
    }
};

const TOOL_TYPE_MAP = {
    logging: "axe",
    mining: "pickaxe",
    crystal_vein: "pickaxe",
    harvesting: "sickle",
    scavenging: "none"
};

export function getRegionNodeConfig(tier = 1, nodeType = "logging") {
    const t = Math.max(1, Math.min(5, tier));
    const reg = NODE_META_BY_TIER[t];
    const nd = reg.nodes[nodeType];
    if (!nd) return null;

    const yields = [];
    for (let i = 0; i < 10; i++) {
        const matNum = nd.startMat + i;
        const matId = `MAT_${String(matNum).padStart(3, '0')}`;
        yields.push({
            materialId: matId,
            dropRate: nd.rates[i],
            min: nd.min,
            max: nd.max
        });
    }
    if (Array.isArray(nd.bonusGems)) {
        nd.bonusGems.forEach(bg => {
            yields.push({ materialId: bg.id, dropRate: bg.rate, min: 1, max: 1 });
        });
    }

    return {
        regionId: reg.regionId,
        regionName: reg.regionName,
        tier: t,
        nodeId: nd.nodeId,
        name: nd.name,
        nodeType,
        requiredToolType: TOOL_TYPE_MAP[nodeType],
        requiredToolTier: t,
        staminaCost: nd.staminaCost,
        gatherTimeSec: nd.gatherTimeSec,
        respawnTimeSec: nd.respawnTimeSec,
        expReward: nd.expReward,
        yields
    };
}

export function getAllRegionsSummary() {
    return [1, 2, 3, 4, 5].map(t => {
        const reg = NODE_META_BY_TIER[t];
        return {
            tier: t,
            regionId: reg.regionId,
            regionName: reg.regionName,
            recommendedLevel: reg.recommendedLevel,
            unlockQuestId: reg.unlockQuestId,
            hazard: reg.hazard,
            npcs: reg.npcs,
            nodes: ['logging', 'mining', 'crystal_vein', 'harvesting', 'scavenging'].map(nt => getRegionNodeConfig(t, nt))
        };
    });
}