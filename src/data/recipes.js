// src/data/recipes.js
// 🌟 完整檢視與平衡版：統一所有合成材料為實際可採集的 MAT_ 編號，修正升級與鍛造公式

import { getPixelIconHtml } from './assets.js';

export const RPGFormulas = {
    // 1. 角色升級所需經驗值：平滑合理 (Lv1: 60, Lv2: 105, Lv5: 270, Lv10: 645)
    getExpRequired(level = 1) {
        return Math.floor(45 + level * 35 + Math.pow(level, 1.65) * 10);
    },
    // 2. 最大生命值：基礎 160 + 每級 +30 + 每點 VIT +18
    getMaxHp(level = 1, vit = 10) {
        return 160 + (level - 1) * 30 + vit * 18;
    },
    // 3. 最大魔力值：基礎 60 + 每級 +12 + 每點 INT +8
    getMaxMp(level = 1, int = 10) {
        return 60 + (level - 1) * 12 + int * 8;
    },
    // 4. 物理攻擊力：基礎 20 + 每級 +6 + STR*3.5 + AGI*1.5 + 武器加成
    getPatk(level = 1, str = 10, agi = 10, weaponPatk = 0) {
        return Math.floor(20 + (level - 1) * 6 + str * 3.5 + agi * 1.5 + weaponPatk);
    },
    // 5. 魔法攻擊力：基礎 20 + 每級 +6 + INT*4.0 + 武器加成
    getMatk(level = 1, int = 10, weaponMatk = 0) {
        return Math.floor(20 + (level - 1) * 6 + int * 4.0 + weaponMatk);
    },
    // 6. 防禦減傷公式：合理減傷上限 75%
    getDamageReduction(def = 30, attackerLevel = 1) {
        const ratio = def / (def + 75 + attackerLevel * 10);
        return Math.min(0.75, Math.max(0.08, ratio));
    },
    // 7. 技能倍率成長：每級穩定 +15%
    getSkillMultiplier(baseMultiplier = 1.4, skillLevel = 1) {
        return +(baseMultiplier * (1 + (Math.max(1, skillLevel) - 1) * 0.15)).toFixed(2);
    },
    // 8. 技能魔力消耗
    getSkillMpCost(baseMp = 15, skillLevel = 1) {
        if (baseMp <= 0) return 0;
        return Math.floor(baseMp + (Math.max(1, skillLevel) - 1) * 2);
    },
    // 9. 技能研發與升級 SP 消耗：研發與前 4 級僅需 1 SP
    getSkillSpCost(currentLevel = 1, tier = 1) {
        return Math.max(1, Math.floor(currentLevel / 5) + (tier >= 4 ? 2 : 1));
    },
    // 10. 技能研發與升級金幣消耗
    getSkillGoldCost(currentLevel = 1, tier = 1) {
        return Math.floor((60 * tier) * Math.pow(1.2, Math.max(0, currentLevel - 1)));
    }
};

// 三大職業流派與 15 招技能樹
export const SkillTrees = {
    earth_blademaster: {
        branchId: 'earth_blademaster',
        branchName: '大地劍聖',
        jobTitle: '重裝戰士',
        primaryStat: 'STR / VIT',
        skills: [
            { id: 'SK_EB_01', tier: 1, name: '破甲順劈', type: 'active', maxLevel: 10, baseMp: 0, baseMultiplier: 1.45, isAoe: false, desc: '揮動重刃順劈單體目標，並附加「破甲碎裂」降低目標 15% 防禦。' },
            { id: 'SK_EB_02', tier: 1, name: '磐石之軀', type: 'passive', maxLevel: 10, baseMp: 0, baseMultiplier: 0.10, isAoe: false, desc: '被動：強化體魄，每級額外提升 10% 物理防禦力。' },
            { id: 'SK_EB_03', tier: 2, name: '鋼鐵旋風', type: 'active', maxLevel: 10, baseMp: 20, baseMultiplier: 1.85, isAoe: true, desc: '高速旋轉劍刃橫掃全場敵人，並獲得「鋼鐵霸體」免疫控制。' },
            { id: 'SK_EB_04', tier: 3, name: '荊棘反甲', type: 'passive', maxLevel: 5, baseMp: 0, baseMultiplier: 0.20, isAoe: false, desc: '被動：受到攻擊時自動反彈傷害予攻擊者。' },
            { id: 'SK_EB_05', tier: 4, name: '泰坦隕落', type: 'ultimate', maxLevel: 5, baseMp: 45, baseMultiplier: 2.80, isAoe: true, desc: '躍向高空轟擊地面，暈眩敵人並獲得 25% 最大生命值的「泰坦護盾」。' }
        ]
    },
    gale_ranger: {
        branchId: 'gale_ranger',
        branchName: '疾風遊俠',
        jobTitle: '暗影獵手',
        primaryStat: 'AGI / STR',
        skills: [
            { id: 'SK_GR_01', tier: 1, name: '穿雲二連射', type: 'active', maxLevel: 10, baseMp: 0, baseMultiplier: 1.50, isAoe: false, desc: '極速射出兩支穿雲箭，並為目標疊加「劇毒」持續傷害。' },
            { id: 'SK_GR_02', tier: 1, name: '致命塗毒', type: 'passive', maxLevel: 10, baseMp: 0, baseMultiplier: 0.25, isAoe: false, desc: '被動：強化箭矢與匕首毒素，提升暴擊率與持續毒傷。' },
            { id: 'SK_GR_03', tier: 2, name: '暗影瞬步', type: 'active', maxLevel: 5, baseMp: 20, baseMultiplier: 1.95, isAoe: false, desc: '進入「暗影潛行」狀態，閃避提升且本次攻擊必定暴擊！' },
            { id: 'SK_GR_04', tier: 3, name: '漫天箭雨', type: 'active', maxLevel: 10, baseMp: 30, baseMultiplier: 1.75, isAoe: true, desc: '向天空拋射密集箭雨打擊全體敵人，並附加「冰霜緩速」。' },
            { id: 'SK_GR_05', tier: 4, name: '幻影殺陣', type: 'ultimate', maxLevel: 5, baseMp: 45, baseMultiplier: 2.60, isAoe: false, desc: '化為殘影斬擊目標；若目標帶有「劇毒」則立即引爆造成雙倍傷害！' }
        ]
    },
    star_arcanist: {
        branchId: 'star_arcanist',
        branchName: '星辰秘法',
        jobTitle: '元素魔導',
        primaryStat: 'INT / VIT',
        skills: [
            { id: 'SK_SA_01', tier: 1, name: '爆裂火球', type: 'active', maxLevel: 10, baseMp: 0, baseMultiplier: 1.55, isAoe: false, desc: '凝聚火元素轟擊目標，附加「烈焰灼燒」並回復自身魔力。' },
            { id: 'SK_SA_02', tier: 1, name: '奧術迴流', type: 'passive', maxLevel: 10, baseMp: 0, baseMultiplier: 0.08, isAoe: false, desc: '被動：施放魔法後疊加「奧術迴流」，每層提升 5% 技能傷害。' },
            { id: 'SK_SA_03', tier: 2, name: '極寒冰環', type: 'active', maxLevel: 5, baseMp: 22, baseMultiplier: 1.80, isAoe: false, desc: '釋放絕對零度凍結目標 1 回合，且受冰凍目標承受暴擊傷害 +30%。' },
            { id: 'SK_SA_04', tier: 3, name: '連鎖閃電', type: 'active', maxLevel: 10, baseMp: 32, baseMultiplier: 1.90, isAoe: true, desc: '召喚雷霆在所有敵人之間彈跳，造成全體高額雷屬性傷害。' },
            { id: 'SK_SA_05', tier: 4, name: '星辰隕石', type: 'ultimate', maxLevel: 5, baseMp: 50, baseMultiplier: 3.10, isAoe: true, desc: '撕裂星空召喚巨大隕石轟炸全場，並為自身恢復大量生命。' }
        ]
    }
};

// 🌟 全面重組與合理化的合成食譜庫 (100% 對應地圖實際採集與魔物掉落的 MAT_ 編號)
export const Recipes = [
    // ==================== 1. 基礎加工與營地建材 (category: 'refined') ====================
    {
        recipeId: 'REC_REF_01', id: 'ITEM_INGOT_BRONZE', name: '青銅錠',
        icon: getPixelIconHtml('copper', 18), category: 'refined', tier: 1,
        cost: { MAT_055: 2, MAT_054: 1 },
        desc: '將紅銅礦與煤塊熔煉而成的基礎金屬錠'
    },
    {
        recipeId: 'REC_ROPE', id: 'rope', name: '強韌麻繩',
        icon: getPixelIconHtml('mat_icon_5', 18), category: 'refined', tier: 1,
        cost: { MAT_005: 2 },
        desc: '用翡翠平原採集的柔韌藤蔓編織而成的結實麻繩'
    },
    {
        recipeId: 'REC_PLANK', id: 'wood_plank', name: '營地木地板',
        icon: getPixelIconHtml('wood_log', 18), category: 'refined', tier: 1,
        cost: { MAT_001: 2 },
        desc: '加工橡木原木而成的平整木板，可於安全營地鋪設'
    },
    {
        recipeId: 'REC_WALL', id: 'stone_wall', name: '營地石磚牆',
        icon: getPixelIconHtml('ruin_wall', 18), category: 'refined', tier: 1,
        cost: { MAT_051: 3 },
        desc: '以圓石堆砌的堅固防護石牆，可於安全營地建造'
    },
    {
        recipeId: 'REC_FARM', id: 'farm_plot', name: '沃土農耕盆',
        icon: getPixelIconHtml('farm_empty', 18), category: 'refined', tier: 1,
        cost: { MAT_001: 2, MAT_051: 2 },
        desc: '可放置在安全營地內播種培育草藥的耕地'
    },
    {
        recipeId: 'REC_RECYCLER', id: 'recycler', name: '真理物資轉換箱',
        icon: getPixelIconHtml('chest', 18), category: 'refined', tier: 1,
        cost: { MAT_001: 4, MAT_055: 2 },
        desc: '放置於營地後，可將多餘的橡木或圓石提煉為真理碎片'
    },

    // ==================== 2. 採集、生存與航海工具 (category: 'tool') ====================
    {
        recipeId: 'REC_CAMPFIRE', id: 'campfire', name: '露營篝火',
        icon: getPixelIconHtml('campfire_icon', 18), category: 'tool', tier: 1,
        cost: { MAT_001: 2, MAT_051: 2 },
        desc: '生火照明並可用於烹飪鮮魚與肉排的營火'
    },
    {
        recipeId: 'REC_BOTTLE', id: 'empty_bottle', name: '陶土空水瓶',
        icon: getPixelIconHtml('bottle_icon', 18), category: 'tool', tier: 1,
        cost: { MAT_051: 2, MAT_054: 1 },
        desc: '以圓石與煤炭燒製的水瓶，是調配藥水的基礎容器'
    },
    {
        recipeId: 'REC_MORTAR', id: 'mortar', name: '研磨石臼',
        icon: getPixelIconHtml('stone', 18), category: 'tool', tier: 1,
        cost: { MAT_051: 3, MAT_052: 1 },
        desc: '將草藥與穀物研磨成精純粉末的石臼器具'
    },
    {
        recipeId: 'REC_ROD', id: 'fishing_rod', name: '青竹釣魚竿',
        icon: getPixelIconHtml('rod_icon', 18), category: 'tool', tier: 1,
        cost: { MAT_004: 2, MAT_005: 2 },
        desc: '以青竹竿與柔韌藤蔓製成的釣竿，可於岸邊垂釣鮮魚'
    },
    {
        recipeId: 'REC_SHOVEL', id: 'steel_shovel', name: '尋寶鐵鏟',
        icon: getPixelIconHtml('shovel_icon', 18), category: 'tool', tier: 1,
        cost: { MAT_001: 2, MAT_055: 2 },
        desc: '裝備後可在草地或沙灘挖掘石英砂與埋藏秘寶'
    },
    {
        recipeId: 'REC_SAILBOAT', id: 'sailboat', name: '遠洋白帆船',
        icon: getPixelIconHtml('boat', 18), category: 'tool', tier: 1,
        cost: { MAT_001: 3, MAT_005: 2, MAT_006: 2 },
        desc: '用橡木、藤蔓與麻纖維打造的帆船，可在大海上自由航行！'
    },
    {
        recipeId: 'REC_AXE_1', id: 'TOOL_AXE_T1', name: '青銅伐木斧',
        icon: getPixelIconHtml('axe_icon', 18), category: 'tool', tier: 1,
        cost: { MAT_001: 2, MAT_055: 2 },
        desc: '鋒利的青銅斧，可砍伐林木並有 5% 機率獲得雙倍木材'
    },
    {
        recipeId: 'REC_PICK_1', id: 'TOOL_PICK_T1', name: '青銅十字鎬',
        icon: getPixelIconHtml('pickaxe', 18), category: 'tool', tier: 1,
        cost: { MAT_001: 2, MAT_055: 2 },
        desc: '堅固的青銅鎬，可開採礦脈並有 5% 機率獲得雙倍礦石'
    },
    {
        recipeId: 'REC_SICKLE_1', id: 'TOOL_SICKLE_T1', name: '青銅採藥鐮',
        icon: getPixelIconHtml('nature_sword', 18), category: 'tool', tier: 1,
        cost: { MAT_001: 2, MAT_055: 2 },
        desc: '輕巧的採藥鐮刀，可採收草藥並有 5% 機率獲得雙倍藥材'
    },
    {
        recipeId: 'REC_BOMB', id: 'bomb', name: '開山火藥桶',
        icon: getPixelIconHtml('bomb', 18), category: 'tool', tier: 1,
        cost: { MAT_054: 2, MAT_052: 2 },
        desc: '以煤塊與燧石調配的炸藥，可炸開地圖上的裂縫石牆'
    },
    {
        recipeId: 'REC_LANTERN', id: 'lantern', name: '永晝礦工提燈',
        icon: getPixelIconHtml('campfire_icon', 18), category: 'tool', tier: 1,
        cost: { MAT_055: 2, MAT_101: 1 },
        desc: '鑲嵌碎裂紅寶石的提燈，裝備後在黑夜與洞穴中保持明亮視野'
    },
    // 二階至五階進階採集工具 (製作前一階後自動解鎖顯示)
    {
        recipeId: 'REC_AXE_2', id: 'TOOL_AXE_T2', name: '寒鐵伐木斧',
        icon: getPixelIconHtml('axe_icon', 18), category: 'tool', tier: 2,
        cost: { TOOL_AXE_T1: 1, MAT_069: 3, MAT_011: 2 },
        desc: '以寒鐵鍛造的利斧，雙倍掉落率提升至 10%'
    },
    {
        recipeId: 'REC_PICK_2', id: 'TOOL_PICK_T2', name: '寒鐵十字鎬',
        icon: getPixelIconHtml('pickaxe', 18), category: 'tool', tier: 2,
        cost: { TOOL_PICK_T1: 1, MAT_069: 3, MAT_011: 2 },
        desc: '可開採荒蕪峽谷堅硬礦脈，雙倍掉落率提升至 10%'
    },
    {
        recipeId: 'REC_SICKLE_2', id: 'TOOL_SICKLE_T2', name: '寒鐵採藥鐮',
        icon: getPixelIconHtml('nature_sword', 18), category: 'tool', tier: 2,
        cost: { TOOL_SICKLE_T1: 1, MAT_069: 3, MAT_011: 2 },
        desc: '可採收珍稀靈草，雙倍掉落率提升至 10%'
    },
    {
        recipeId: 'REC_HOOK', id: 'grappling_hook', name: '精鋼飛索抓鉤',
        icon: getPixelIconHtml('pickaxe', 18), category: 'tool', tier: 2,
        cost: { rope: 2, MAT_057: 3 },
        desc: '裝備後可跨越地圖上的無底深淵地形'
    },
    {
        recipeId: 'REC_AXE_3', id: 'TOOL_AXE_T3', name: '秘銀伐木斧',
        icon: getPixelIconHtml('axe_icon', 18), category: 'tool', tier: 3,
        cost: { TOOL_AXE_T2: 1, MAT_071: 3, MAT_021: 2 },
        desc: '蘊含魔力的秘銀斧，雙倍掉落率提升至 18%'
    },
    {
        recipeId: 'REC_PICK_3', id: 'TOOL_PICK_T3', name: '秘銀十字鎬',
        icon: getPixelIconHtml('pickaxe', 18), category: 'tool', tier: 3,
        cost: { TOOL_PICK_T2: 1, MAT_071: 3, MAT_021: 2 },
        desc: '可開採熔岩地心稀有晶礦，雙倍掉落率提升至 18%'
    },
    {
        recipeId: 'REC_SICKLE_3', id: 'TOOL_SICKLE_T3', name: '秘銀採藥鐮',
        icon: getPixelIconHtml('nature_sword', 18), category: 'tool', tier: 3,
        cost: { TOOL_SICKLE_T2: 1, MAT_071: 3, MAT_021: 2 },
        desc: '可採收地心火蓮與高階靈草，雙倍掉落率提升至 18%'
    },

    // ==================== 3. 藥水、食物與戰鬥消耗品 (category: 'consumable') ====================
    {
        recipeId: 'REC_CON_01', id: 'CON_POTION_T1', name: '初級治療藥水',
        icon: getPixelIconHtml('potion', 18), category: 'consumable', tier: 1,
        cost: { MAT_201: 2, MAT_210: 1 },
        desc: '以止血草與清澈泉水熬製，立即恢復 120 點生命與 30 點魔力'
    },
    {
        recipeId: 'REC_COOKED_FISH', id: 'cooked_fish', name: '炭烤鮮魚',
        icon: getPixelIconHtml('fish_icon', 18), category: 'consumable', tier: 1,
        cost: { fish: 1, MAT_001: 1 },
        desc: '用橡木炭火慢烤的鮮魚，恢復 95 點生命與 15 點魔力'
    },
    {
        recipeId: 'REC_BREAD', id: 'bread', name: '香烤麥香麵包',
        icon: getPixelIconHtml('bread_icon', 18), category: 'consumable', tier: 1,
        cost: { MAT_201: 2, MAT_210: 1 },
        desc: '鬆軟可口的行軍乾糧，恢復 85 點生命與 25 點魔力'
    },
    {
        recipeId: 'REC_SOUP', id: 'mushroom_soup', name: '森林鮮菇濃湯',
        icon: getPixelIconHtml('potion', 18), category: 'consumable', tier: 1,
        cost: { MAT_202: 2, MAT_210: 1 },
        desc: '以藍魔草與泉水燉煮的濃湯，恢復 130 點生命與 50 點魔力'
    },
    {
        recipeId: 'REC_MAGNIFIER', id: 'magnifier', name: '真實放大鏡',
        icon: getPixelIconHtml('magnifier', 18), category: 'consumable', tier: 1,
        cost: { MAT_059: 2, MAT_055: 1 },
        desc: '戰鬥答題時使用，可自動刪去 2 個錯誤選項！'
    },
    {
        recipeId: 'REC_FIREBOMB', id: 'fire_bomb', name: '爆裂火藥彈',
        icon: getPixelIconHtml('bomb', 18), category: 'consumable', tier: 1,
        cost: { MAT_054: 2, MAT_106: 1 },
        desc: '戰鬥中使用可免答題直接對全場魔物造成 120 點轟炸傷害！'
    },
    {
        recipeId: 'REC_MEAT', id: 'roast_meat', name: '黃金烤肉排',
        icon: getPixelIconHtml('bread_icon', 18), category: 'consumable', tier: 2,
        cost: { MAT_152: 2, MAT_054: 1 },
        desc: '炭烤野狼肉排，大幅恢復 200 點生命與 50 點魔力'
    },
    {
        recipeId: 'REC_CON_02', id: 'CON_ELIXIR_T4', name: '九轉還魂丹',
        icon: getPixelIconHtml('potion', 18), category: 'consumable', tier: 3,
        cost: { MAT_221: 2, MAT_230: 1 },
        desc: '瞬間恢復 100% 生命與魔力，並淨化所有負面異常狀態！'
    },

    // ==================== 4. 武器、防具與飾品 (category: 'weapon' | 'armor' | 'accessory') ====================
    {
        recipeId: 'REC_WPN_01', id: 'WPN_SWORD_T1', name: '青銅長劍',
        icon: getPixelIconHtml('sword', 18), category: 'weapon', tier: 1,
        cost: { MAT_055: 3, MAT_001: 2 },
        desc: '物理攻擊 +18，新手冒險者最可靠的青銅戰劍'
    },
    {
        recipeId: 'REC_WPN_02', id: 'WPN_BOW_T1', name: '劇毒獵弓',
        icon: getPixelIconHtml('nature_sword', 18), category: 'weapon', tier: 1,
        cost: { MAT_004: 3, MAT_005: 2, MAT_157: 1 },
        desc: '物理攻擊 +15，攻擊時自動為目標附加「劇毒」持續傷害'
    },
    {
        recipeId: 'REC_W_SHIELD', id: 'wood_shield', name: '橡木圓盾',
        icon: getPixelIconHtml('shield', 18), category: 'armor', tier: 1,
        cost: { MAT_001: 3, MAT_055: 1 },
        desc: '物理防禦 +18，最大生命 +40'
    },
    {
        recipeId: 'REC_H_ARMOR', id: 'hunter_armor', name: '森林獵人皮甲',
        icon: getPixelIconHtml('shield', 18), category: 'armor', tier: 1,
        cost: { MAT_152: 2, MAT_006: 2 },
        desc: '物理防禦 +22，物理攻擊 +8'
    },
    {
        recipeId: 'REC_L_BOOTS', id: 'leather_boots', name: '旅人行軍皮靴',
        icon: getPixelIconHtml('bag', 18), category: 'armor', tier: 1,
        cost: { MAT_152: 2, MAT_005: 1 },
        desc: '物理防禦 +12，最大生命 +30'
    },
    {
        recipeId: 'REC_B_RING', id: 'bone_ring', name: '獸骨戰戒',
        icon: getPixelIconHtml('gem', 18), category: 'accessory', tier: 1,
        cost: { MAT_155: 2, MAT_101: 1 },
        desc: '物理與魔法攻擊 +12'
    },
    {
        recipeId: 'REC_GAS_MASK', id: 'gas_mask', name: '淨化防毒面具',
        icon: getPixelIconHtml('shield', 18), category: 'armor', tier: 1,
        cost: { MAT_054: 3, MAT_006: 2, MAT_201: 2 },
        desc: '裝備後可完全免疫「劇毒迷瘴島」的毒霧扣血傷害'
    },

    // 二階進階武裝 (製作任意一階武器/防具後自動解鎖顯示)
    {
        recipeId: 'REC_WPN_03', id: 'WPN_GREATSWORD_T2', name: '寒鐵重劍',
        icon: getPixelIconHtml('iron_sword', 18), category: 'weapon', tier: 2,
        cost: { WPN_SWORD_T1: 1, MAT_069: 4, MAT_117: 1 },
        desc: '物理攻擊 +42，攻擊時附加「冰霜緩速」效果'
    },
    {
        recipeId: 'REC_WPN_04', id: 'WPN_STAFF_T2', name: '潮汐法杖',
        icon: getPixelIconHtml('water_sword', 18), category: 'weapon', tier: 2,
        cost: { MAT_011: 4, MAT_118: 1, MAT_112: 2 },
        desc: '魔法攻擊 +48，大幅強化星辰秘法技能威力'
    },
    {
        recipeId: 'REC_ARM_01', id: 'ARM_PLATE_T2', name: '黑曜石重鎧',
        icon: getPixelIconHtml('shield', 18), category: 'armor', tier: 2,
        cost: { hunter_armor: 1, MAT_068: 4, MAT_069: 3 },
        desc: '物理防禦 +45，最大生命 +180'
    },
    {
        recipeId: 'REC_WINTER_CLOAK', id: 'winter_cloak', name: '極地禦寒狼皮襖',
        icon: getPixelIconHtml('shield', 18), category: 'armor', tier: 2,
        cost: { MAT_152: 4, MAT_007: 2, MAT_106: 2 },
        desc: '物理防禦 +30，裝備後可完全免疫「永凍冰晶島」的暴風雪失溫'
    },
    {
        recipeId: 'REC_DIVING_BUBBLE', id: 'diving_bubble', name: '深海避水靈珠',
        icon: getPixelIconHtml('gem', 18), category: 'accessory', tier: 2,
        cost: { MAT_118: 1, MAT_102: 2, MAT_210: 3 },
        desc: '裝備後可在「深海珊瑚礁」自由呼吸，免疫缺氧傷害'
    },

    // 三階至五階傳說神裝
    {
        recipeId: 'REC_WPN_05', id: 'WPN_DAGGER_T3', name: '暗影秘銀雙刃',
        icon: getPixelIconHtml('iron_sword', 18), category: 'weapon', tier: 3,
        cost: { WPN_GREATSWORD_T2: 1, MAT_071: 5, MAT_175: 2 },
        desc: '物理攻擊 +95，暴擊傷害大幅提升'
    },
    {
        recipeId: 'REC_ARM_02', id: 'ARM_CLOAK_T3', name: '暗影刺客斗篷',
        icon: getPixelIconHtml('shield', 18), category: 'armor', tier: 3,
        cost: { ARM_PLATE_T2: 1, MAT_028: 4, MAT_175: 2 },
        desc: '物理防禦 +75，最大生命 +320，暴擊率額外 +20%'
    },
    {
        recipeId: 'REC_WPN_06', id: 'WPN_SPEAR_T4', name: '龍牙破軍長槍',
        icon: getPixelIconHtml('fire_sword', 18), category: 'weapon', tier: 4,
        cost: { WPN_DAGGER_T3: 1, MAT_182: 3, MAT_081: 4 },
        desc: '物理攻擊 +210，攻擊無視目標 30% 物理防禦！'
    },
    {
        recipeId: 'REC_ARM_03', id: 'ARM_ROBE_T4', name: '鳳凰涅槃法袍',
        icon: getPixelIconHtml('shield', 18), category: 'armor', tier: 4,
        cost: { ARM_CLOAK_T3: 1, MAT_183: 3, MAT_038: 4 },
        desc: '防禦 +130，生命 +600，受到致命傷時自動浴火重生恢復 50% HP！'
    },
    {
        recipeId: 'REC_WPN_07', id: 'WPN_BLADE_T5', name: '諸神黃昏創世刃',
        icon: getPixelIconHtml('fire_sword', 18), category: 'weapon', tier: 5,
        cost: { WPN_SPEAR_T4: 1, MAT_091: 5, MAT_297: 1 },
        desc: '物理與魔法攻擊 +450，每次命中附帶目標最大生命 3% 真實傷害！'
    },
    {
        recipeId: 'REC_ARM_04', id: 'ARM_DIVINE_T5', name: '創世神光聖鎧',
        icon: getPixelIconHtml('shield', 18), category: 'armor', tier: 5,
        cost: { ARM_ROBE_T4: 1, MAT_092: 5, MAT_297: 1 },
        desc: '防禦 +280，生命 +1500，每回合自動恢復 5% 最大生命值！'
    },
    {
        recipeId: 'REC_ACC_02', id: 'ACC_AMULET_T5', name: '永恆時空護符',
        icon: getPixelIconHtml('gem', 18), category: 'accessory', tier: 5,
        cost: { MAT_296: 1, MAT_148: 2 },
        desc: '全屬性大幅提升，所有技能魔力消耗減少 30%！'
    }
];