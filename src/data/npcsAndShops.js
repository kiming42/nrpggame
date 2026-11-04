// src/data/npcsAndShops.js
// 🌟 完整收錄 rpg_npcs_and_shops.json (通貨、12 位 NPC、6 大區域商店與古幣秘寶兌換所)

export const Currencies = {
    GOLD: { id: "GOLD", name: "金幣", icon: "💰", desc: "大陸通用貨幣，透過完成任務、討伐怪物與出售素材取得。" },
    MAT_252: { id: "MAT_252", name: "古代銅幣", tier: 1, icon: "🥉", desc: "T1 森林遺跡與每日懸賞產出的古幣，可向遺跡商人兌換初階圖紙與寶箱。" },
    MAT_262: { id: "MAT_262", name: "古代銀幣", tier: 2, icon: "🥈", desc: "T2 荒蕪峽谷與石像遺跡產出的古幣，用於兌換中階鍛造素材與秘寶。" },
    MAT_272: { id: "MAT_272", name: "古代金幣", tier: 3, icon: "🥇", desc: "T3 熔岩地心與深淵地牢產出的古幣，用於兌換高階魔力核心與空間擴充材料。" },
    MAT_282: { id: "MAT_282", name: "遠古神幣", tier: 4, icon: "👑", desc: "T4 天空之城與神殿產出的神聖貨幣，可兌換傳奇龍族素材與終極神域遺物。" }
};

export const ShopFormulas = {
    getSellToShopPrice(sellPrice, barterBonus = 0) {
        return Math.floor((sellPrice || 10) * (1 + barterBonus));
    },
    dailyRotatingDiscount: 0.80
};

export const NPCDatabase = [
    {
        npcId: "NPC_T1_ELDER", name: "新手村長·巴爾", title: "翡翠村守護者", regionId: "MAP_T1_PLAINS", tier: 1, role: "quest_giver",
        dialogues: {
            greeting: "年輕的冒險者，歡迎來到翡翠平原。先去外圍清理幾隻史萊姆熱熱身吧！",
            questAvailable: "村子周圍的魔物又變多了，你能幫個忙嗎？",
            idle: "聽說森林深處有一隻巨大的史萊姆王，千萬別大意。"
        },
        quests: ["Q_MAIN_T1_01"], shopId: null
    },
    {
        npcId: "NPC_T1_SMITH", name: "鐵匠鋪老闆·托爾", title: "初階武器與工具匠", regionId: "MAP_T1_PLAINS", tier: 1, role: "blacksmith_shop",
        dialogues: {
            greeting: "想要挖礦砍樹？沒有好工具怎麼行！來看看我剛打好的青銅工具吧。",
            questAvailable: "去礦坑找點銅礦跟錫礦來，我手把手教你鍛造長劍！"
        },
        quests: ["Q_MAIN_T1_02"], shopId: "SHOP_T1_BLACKSMITH"
    },
    {
        npcId: "NPC_T1_MERCHANT", name: "商會後勤官·瑪莎", title: "萬物雜貨與藥水商", regionId: "MAP_T1_PLAINS", tier: 1, role: "general_shop",
        dialogues: {
            greeting: "出門冒險記得多帶幾瓶止血藥水！另外有多的木材跟煤炭都可以賣給我喔。",
            questAvailable: "商會正在徵收大量橡木與煤塊，報酬很豐厚喔！"
        },
        quests: ["Q_GATHER_T1_01"], shopId: "SHOP_T1_GENERAL"
    },
    {
        npcId: "NPC_T1_HUNTER", name: "神射手·萊戈", title: "森林遊俠導師", regionId: "MAP_T1_PLAINS", tier: 1, role: "trainer_quest",
        dialogues: {
            greeting: "保持距離、一擊必殺，這就是遊俠的生存之道。",
            questAvailable: "如果你能幫我弄到毒蜘蛛腺體，我就把劇毒獵弓的秘方傳授給你。"
        },
        quests: ["Q_SIDE_T1_01"], shopId: null
    },
    {
        npcId: "NPC_T1_GUILD", name: "冒險者公會長·艾琳", title: "公會總管", regionId: "MAP_T1_PLAINS", tier: 1, role: "guild_master",
        dialogues: {
            greeting: "每日懸賞告示板已經更新了，完成討伐就能獲得古代銅幣與豐厚賞金！"
        },
        quests: ["Q_MAIN_T1_03", "Q_BOUNTY_T1_01"], shopId: "SHOP_RELIC_EXCHANGE"
    },
    {
        npcId: "NPC_T2_CAPTAIN", name: "峽谷哨兵隊長·雷恩", title: "荒蕪峽谷防衛官", regionId: "MAP_T2_CANYON", tier: 2, role: "quest_giver",
        dialogues: {
            greeting: "小心峽谷裡的沙塵暴與雙足飛龍，這裡可不是新手平原。"
        },
        quests: ["Q_MAIN_T2_01", "Q_BOUNTY_T2_01"], shopId: null
    },
    {
        npcId: "NPC_T2_DWARF", name: "矮人重甲師·銅鬚", title: "寒鐵鍛造大師", regionId: "MAP_T2_CANYON", tier: 2, role: "blacksmith_shop",
        dialogues: {
            greeting: "只有堅硬的寒鐵與黑曜石，才能入得了老夫的眼！來把寒鐵工具吧！"
        },
        quests: ["Q_SIDE_T2_01"], shopId: "SHOP_T2_BLACKSMITH"
    },
    {
        npcId: "NPC_T3_GUARDIAN", name: "炎之守護者·伊格尼", title: "地心鎮守者", regionId: "MAP_T3_CORE", tier: 3, role: "quest_giver",
        dialogues: {
            greeting: "地心的高溫會持續灼傷凡人，準備好秘銀武裝再深入地牢吧。"
        },
        quests: ["Q_MAIN_T3_01", "Q_BOUNTY_T3_01"], shopId: "SHOP_T3_ARMORY"
    },
    {
        npcId: "NPC_T3_TRAVELER", name: "空間旅者·奇諾", title: "次元秘寶商人", regionId: "MAP_T3_CORE", tier: 3, role: "special_merchant",
        dialogues: {
            greeting: "我遊歷過無數次元，只要你有足夠的古幣或空間內膽，我就能幫你擴充背包！"
        },
        quests: ["Q_SIDE_T3_01"], shopId: "SHOP_RELIC_EXCHANGE"
    },
    {
        npcId: "NPC_T4_CHIEF", name: "天空翼人族長·索拉", title: "雲端聖殿守護者", regionId: "MAP_T4_SKY", tier: 4, role: "quest_shop",
        dialogues: {
            greeting: "願星辰與蒼穹指引你的道路，勇敢的弒龍者。"
        },
        quests: ["Q_MAIN_T4_01", "Q_BOUNTY_T4_01"], shopId: "SHOP_T4_SANCTUARY"
    },
    {
        npcId: "NPC_T4_SAGE", name: "大賢者·梅林", title: "星辰奧術導師", regionId: "MAP_T4_SKY", tier: 4, role: "sage_quest",
        dialogues: {
            greeting: "從石像遺跡一路走到龍之神殿，你的實力已經接近凡人的極限了。"
        },
        quests: ["Q_MAIN_T2_02", "Q_MAIN_T3_02", "Q_MAIN_T4_02"], shopId: null
    },
    {
        npcId: "NPC_T5_WATCHER", name: "時空守望者·克羅諾斯", title: "維度裂隙仲裁者", regionId: "MAP_T5_VOID", tier: 5, role: "endgame_master",
        dialogues: {
            greeting: "時間與空間在此交匯。穿戴上創世武裝，去終結諸神黃昏的輪迴吧！"
        },
        quests: ["Q_MAIN_T5_01", "Q_MAIN_T5_02", "Q_BOUNTY_T5_01"], shopId: "SHOP_T5_VOID_EMPORIUM"
    }
];

export const ShopDatabase = [
    {
        shopId: "SHOP_T1_GENERAL", shopName: "翡翠村商會雜貨鋪", ownerNpcId: "NPC_T1_MERCHANT", tier: 1, currency: "GOLD",
        inventory: [
            { itemId: "CON_POTION_T1", name: "初級治療藥水", type: "consumable", price: 50, stock: -1, desc: "立即恢復 120 點生命值" },
            { itemId: "MAT_201", name: "止血草", type: "material", price: 25, stock: 50, desc: "T1 基礎煉金草藥" },
            { itemId: "MAT_202", name: "藍魔草", type: "material", price: 30, stock: 50, desc: "T1 魔力恢復草藥" },
            { itemId: "MAT_210", name: "清澈泉水", type: "material", price: 20, stock: -1, desc: "煉製藥水必備的基底泉水" },
            { itemId: "MAT_054", name: "煤塊", type: "material", price: 35, stock: 99, desc: "熔爐鍛造金屬錠必備燃料" }
        ]
    },
    {
        shopId: "SHOP_T1_BLACKSMITH", shopName: "托爾的青銅鍛造屋", ownerNpcId: "NPC_T1_SMITH", tier: 1, currency: "GOLD",
        inventory: [
            { itemId: "TOOL_AXE_T1", name: "青銅伐木斧", type: "tool", price: 150, stock: 1, desc: "可砍伐 T1 樹木，雙倍掉落率 5%" },
            { itemId: "TOOL_PICK_T1", name: "青銅十字鎬", type: "tool", price: 150, stock: 1, desc: "可開採 T1 礦石與碎晶，雙倍掉落率 5%" },
            { itemId: "TOOL_SICKLE_T1", name: "青銅採藥鐮", type: "tool", price: 150, stock: 1, desc: "可採收 T1 草藥，雙倍掉落率 5%" },
            { itemId: "WPN_SWORD_T1", name: "青銅長劍", type: "weapon", price: 300, stock: 5, desc: "物理攻擊 +18，攻速 1.2" },
            { itemId: "ITEM_INGOT_BRONZE", name: "青銅錠", type: "refined", price: 120, stock: 20, desc: "現成的青銅金屬錠" }
        ]
    },
    {
        shopId: "SHOP_T2_BLACKSMITH", shopName: "銅鬚的寒鐵工坊", ownerNpcId: "NPC_T2_DWARF", tier: 2, currency: "GOLD",
        inventory: [
            { itemId: "TOOL_AXE_T2", name: "寒鐵伐木斧", type: "tool", price: 1200, stock: 1, desc: "可砍伐 T2 靈木，採集加速 15%，雙倍掉落 10%" },
            { itemId: "TOOL_PICK_T2", name: "寒鐵十字鎬", type: "tool", price: 1200, stock: 1, desc: "可開採 T2 礦脈，採集加速 15%，雙倍掉落 10%" },
            { itemId: "TOOL_SICKLE_T2", name: "寒鐵採藥鐮", type: "tool", price: 1200, stock: 1, desc: "可採收 T2 藥材，採集加速 15%，雙倍掉落 10%" },
            { itemId: "MAT_069", name: "寒鐵礦", type: "material", price: 220, stock: 30, desc: "T2 鍛造核心礦石" },
            { itemId: "MAT_220", name: "妖精露水", type: "material", price: 180, stock: 30, desc: "T2 高級煉金基底" }
        ]
    },
    {
        shopId: "SHOP_T3_ARMORY", shopName: "熔岩地心軍需庫", ownerNpcId: "NPC_T3_GUARDIAN", tier: 3, currency: "GOLD",
        inventory: [
            { itemId: "TOOL_AXE_T3", name: "秘銀伐木斧", type: "tool", price: 6500, stock: 1, desc: "可砍伐 T3 魔木，採集加速 30%，雙倍掉落 18%" },
            { itemId: "TOOL_PICK_T3", name: "秘銀十字鎬", type: "tool", price: 6500, stock: 1, desc: "可開採 T3 稀有礦，採集加速 30%，雙倍掉落 18%" },
            { itemId: "TOOL_SICKLE_T3", name: "秘銀採藥鐮", type: "tool", price: 6500, stock: 1, desc: "可採收 T3 靈草，採集加速 30%，雙倍掉落 18%" },
            { itemId: "MAT_075", name: "熔岩核心石", type: "material", price: 600, stock: 25, desc: "提煉秘銀與精金的高溫核心" },
            { itemId: "MAT_230", name: "聖泉水", type: "material", price: 550, stock: 25, desc: "蘊含神聖魔力的泉水" }
        ]
    },
    {
        shopId: "SHOP_T4_SANCTUARY", shopName: "雲端聖殿星界商行", ownerNpcId: "NPC_T4_CHIEF", tier: 4, currency: "GOLD",
        inventory: [
            { itemId: "TOOL_AXE_T4", name: "龍紋伐木斧", type: "tool", price: 28000, stock: 1, desc: "可砍伐 T4 聖木，採集加速 50%，雙倍掉落 25%" },
            { itemId: "TOOL_PICK_T4", name: "龍紋十字鎬", type: "tool", price: 28000, stock: 1, desc: "可開採 T4 傳奇礦，採集加速 50%，雙倍掉落 25%" },
            { itemId: "TOOL_SICKLE_T4", name: "龍紋採藥鐮", type: "tool", price: 28000, stock: 1, desc: "可採收 T4 仙草，採集加速 50%，雙倍掉落 25%" },
            { itemId: "CON_ELIXIR_T4", name: "九轉還魂丹", type: "consumable", price: 8000, stock: 5, desc: "瞬間恢復 100% HP/MP 並清除負面狀態" },
            { itemId: "MAT_240", name: "月亮井水", type: "material", price: 2200, stock: 15, desc: "煉製傳奇丹藥的仙界井水" }
        ]
    },
    {
        shopId: "SHOP_T5_VOID_EMPORIUM", shopName: "克羅諾斯的時空星塵閣", ownerNpcId: "NPC_T5_WATCHER", tier: 5, currency: "GOLD",
        inventory: [
            { itemId: "TOOL_AXE_T5", name: "虛空創世神斧", type: "tool", price: 150000, stock: 1, desc: "可砍伐 T5 神木，採集加速 80%，雙倍掉落 40%" },
            { itemId: "TOOL_PICK_T5", name: "虛空碎星神鎬", type: "tool", price: 150000, stock: 1, desc: "可開採 T5 神話礦，採集加速 80%，雙倍掉落 40%" },
            { itemId: "TOOL_SICKLE_T5", name: "世界樹靈能鐮", type: "tool", price: 150000, stock: 1, desc: "可採收 T5 神草，採集加速 80%，雙倍掉落 40%" },
            { itemId: "MAT_248", name: "諸神甘露", type: "material", price: 9500, stock: 10, desc: "T5 神話煉金靈液" },
            { itemId: "MAT_249", name: "星河水", type: "material", price: 9500, stock: 10, desc: "流淌於宇宙星河的奇蹟之水" }
        ]
    },
    {
        shopId: "SHOP_RELIC_EXCHANGE", shopName: "次元古幣秘寶兌換所", ownerNpcId: "NPC_T3_TRAVELER", tier: 1, currency: "MULTI_RELIC_COINS",
        exchangeRates: [
            { exchangeId: "EX_T1_01", costCurrencyId: "MAT_252", costName: "古代銅幣", costCount: 5, rewardItemId: "MAT_255", rewardName: "史萊姆王核心", rewardCount: 1, stock: 5 },
            { exchangeId: "EX_T1_02", costCurrencyId: "MAT_252", costName: "古代銅幣", costCount: 5, rewardItemId: "MAT_254", rewardName: "哥布林王冠", rewardCount: 1, stock: 5 },
            { exchangeId: "EX_T1_03", costCurrencyId: "MAT_252", costName: "古代銅幣", costCount: 10, rewardItemId: "MAT_262", rewardName: "古代銀幣（升階兌換）", rewardCount: 1, stock: -1 },
            { exchangeId: "EX_T2_01", costCurrencyId: "MAT_262", costName: "古代銀幣", costCount: 5, rewardItemId: "MAT_118", rewardName: "潮汐之核", rewardCount: 1, stock: 5 },
            { exchangeId: "EX_T2_02", costCurrencyId: "MAT_262", costName: "古代銀幣", costCount: 8, rewardItemId: "MAT_264", rewardName: "骷髏王魂火", rewardCount: 1, stock: 3 },
            { exchangeId: "EX_T2_03", costCurrencyId: "MAT_262", costName: "古代銀幣", costCount: 10, rewardItemId: "MAT_272", rewardName: "古代金幣（升階兌換）", rewardCount: 1, stock: -1 },
            { exchangeId: "EX_T3_01", costCurrencyId: "MAT_272", costName: "古代金幣", costCount: 6, rewardItemId: "MAT_279", rewardName: "空間袋內膽", rewardCount: 1, stock: 2 },
            { exchangeId: "EX_T3_02", costCurrencyId: "MAT_272", costName: "古代金幣", costCount: 8, rewardItemId: "MAT_275", rewardName: "炎魔領主之角", rewardCount: 1, stock: 3 },
            { exchangeId: "EX_T3_03", costCurrencyId: "MAT_272", costName: "古代金幣", costCount: 10, rewardItemId: "MAT_282", rewardName: "遠古神幣（升階兌換）", rewardCount: 1, stock: -1 },
            { exchangeId: "EX_T4_01", costCurrencyId: "MAT_282", costName: "遠古神幣", costCount: 5, rewardItemId: "MAT_181", rewardName: "遠古巨龍逆鱗", rewardCount: 1, stock: 5 },
            { exchangeId: "EX_T4_02", costCurrencyId: "MAT_282", costName: "遠古神幣", costCount: 10, rewardItemId: "MAT_284", rewardName: "巨龍君王龍珠", rewardCount: 1, stock: 2 },
            { exchangeId: "EX_T5_01", costCurrencyId: "MAT_282", costName: "遠古神幣", costCount: 25, rewardItemId: "MAT_296", rewardName: "時間沙漏核心", rewardCount: 1, stock: 1 },
            { exchangeId: "EX_T5_02", costCurrencyId: "MAT_282", costName: "遠古神幣", costCount: 30, rewardItemId: "MAT_297", rewardName: "創世神格碎片", rewardCount: 1, stock: 1 }
        ]
    }
];