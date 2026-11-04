// src/data/quests.js
// 🌟 完整收錄 rpg_quests_and_bounties.json 任務與委託系統資料庫 (T1 ~ T5)

export const QuestTypes = {
    main: "主線劇情任務（不可重複，解鎖世界階級與核心系統）",
    side: "NPC 支線與鍛造委託（不可重複，解鎖高級合成配方與背包擴充）",
    bounty: "公會每日討伐懸賞（每日重置，穩定獲取經驗值與古幣）",
    gathering: "商會素材收集委託（可重複提交，快速賺取金幣與補給品）"
};

export const QuestFormulas = {
    getDynamicBountyExp(tier, playerLevel) {
        return Math.floor(150 * Math.pow(tier, 2.3) * (1 + 0.05 * playerLevel));
    },
    getDynamicBountyGold(tier) {
        return Math.floor(100 * Math.pow(tier, 2.0));
    }
};

export const QuestDatabase = [
    {
        questId: "Q_MAIN_T1_01",
        title: "冒險者的第一步",
        type: "main",
        tier: 1,
        minLevel: 1,
        prerequisiteQuestId: null,
        Repeatable: false,
        giverNpc: "新手村長·巴爾",
        description: "村莊外圍的綠色史萊姆最近異常活躍，請幫忙清理一些，並帶回止血草交給煉金術士。",
        objectives: [
            { type: "kill", targetId: "MON_T1_001", targetName: "綠色史萊姆", requiredCount: 5 },
            { type: "collect", targetId: "MAT_201", targetName: "止血草", requiredCount: 3 }
        ],
        rewards: {
            exp: 250, gold: 100, sp: 1,
            items: [{ itemId: "CON_POTION_T1", name: "初級治療藥水", count: 5 }],
            unlockRecipes: ["REC_CON_001"]
        }
    },
    {
        questId: "Q_MAIN_T1_02",
        title: "鍛造基礎與防身之劍",
        type: "main",
        tier: 1,
        minLevel: 5,
        prerequisiteQuestId: "Q_MAIN_T1_01",
        Repeatable: false,
        giverNpc: "鐵匠鋪老闆·托爾",
        description: "工欲善其事，必先利其器。去礦坑採集銅礦與錫礦，並獵殺森林野狼取得狼皮，親手鍛造一把青銅長劍吧！",
        objectives: [
            { type: "collect", targetId: "MAT_055", targetName: "銅礦石", requiredCount: 3 },
            { type: "collect", targetId: "MAT_056", targetName: "錫礦石", requiredCount: 1 },
            { type: "kill", targetId: "MON_T1_002", targetName: "森林野狼", requiredCount: 5 },
            { type: "craft", targetId: "REC_WPN_001", targetName: "青銅長劍", requiredCount: 1 }
        ],
        rewards: {
            exp: 800, gold: 350, sp: 1,
            items: [{ itemId: "MAT_101", name: "碎裂紅寶石", count: 2 }],
            unlockRecipes: ["REC_WPN_001", "REC_ARM_001"]
        }
    },
    {
        questId: "Q_MAIN_T1_03",
        title: "森林深處的威脅",
        type: "main",
        tier: 1,
        minLevel: 15,
        prerequisiteQuestId: "Q_MAIN_T1_02",
        Repeatable: false,
        giverNpc: "冒險者公會長·艾琳",
        description: "史萊姆王與哥布林酋長聯手封鎖了前往荒蕪峽谷的道路，擊敗牠們並奪回王冠與核心，證明你具備進入 Tier 2 區域的實力！",
        objectives: [
            { type: "kill", targetId: "MON_T1_BOSS_01", targetName: "史萊姆王", requiredCount: 1 },
            { type: "kill", targetId: "MON_T1_BOSS_02", targetName: "哥布林酋長", requiredCount: 1 },
            { type: "collect", targetId: "MAT_254", targetName: "哥布林王冠", requiredCount: 1 }
        ],
        rewards: {
            exp: 4500, gold: 1500, sp: 2,
            items: [{ itemId: "MAT_252", name: "古代銅幣", count: 10 }],
            unlockRecipes: ["REC_WPN_002"],
            unlockTier: 2
        }
    },
    {
        questId: "Q_SIDE_T1_01",
        title: "獵人的毒箭秘方",
        type: "side",
        tier: 1,
        minLevel: 8,
        prerequisiteQuestId: "Q_MAIN_T1_01",
        Repeatable: false,
        giverNpc: "神射手·萊戈",
        description: "幽暗洞穴裡的毒蜘蛛相當致命，但牠們的腺體與蜘蛛絲正是製作「劇毒獵弓」的絕佳材料。",
        objectives: [
            { type: "kill", targetId: "MON_T1_005", targetName: "洞穴毒蜘蛛", requiredCount: 8 },
            { type: "collect", targetId: "MAT_156", targetName: "毒蜘蛛腺體", requiredCount: 3 },
            { type: "collect", targetId: "MAT_008", targetName: "翠綠竹竿", requiredCount: 2 }
        ],
        rewards: {
            exp: 1200, gold: 500, sp: 1,
            items: [{ itemId: "WPN_BOW_T1", name: "劇毒獵弓", count: 1 }],
            unlockRecipes: ["REC_WPN_002"]
        }
    },
    {
        questId: "Q_BOUNTY_T1_01",
        title: "【每日懸賞】清理墓地亡靈",
        type: "bounty",
        tier: 1,
        minLevel: 10,
        prerequisiteQuestId: null,
        Repeatable: true,
        cooldownHours: 24,
        giverNpc: "懸賞告示板（T1）",
        description: "夜晚的墓地遊蕩著大量骷髏兵與腐臭烏鴉，請定期前往清剿以維護商道安全。",
        objectives: [
            { type: "kill", targetId: "MON_T1_006", targetName: "骷髏兵", requiredCount: 10 },
            { type: "kill", targetId: "MON_T1_008", targetName: "腐臭烏鴉", requiredCount: 8 }
        ],
        rewards: {
            exp: 1500, gold: 600, sp: 0,
            items: [{ itemId: "MAT_252", name: "古代銅幣", count: 3 }],
            unlockRecipes: []
        }
    },
    {
        questId: "Q_GATHER_T1_01",
        title: "【商會委託】基礎建材與煤炭徵收",
        type: "gathering",
        tier: 1,
        minLevel: 3,
        prerequisiteQuestId: null,
        Repeatable: true,
        giverNpc: "商會後勤官·瑪莎",
        description: "村莊擴建需要大量基礎木材與燃料，只要帶回足夠的橡木與煤塊，商會願意支付豐厚報酬。",
        objectives: [
            { type: "collect", targetId: "MAT_001", targetName: "橡木原木", requiredCount: 10 },
            { type: "collect", targetId: "MAT_054", targetName: "煤塊", requiredCount: 5 }
        ],
        rewards: {
            exp: 400, gold: 350, sp: 0,
            items: [{ itemId: "CON_POTION_T1", name: "初級治療藥水", count: 2 }],
            unlockRecipes: []
        }
    },
    {
        questId: "Q_MAIN_T2_01",
        title: "踏入荒蕪峽谷",
        type: "main",
        tier: 2,
        minLevel: 21,
        prerequisiteQuestId: "Q_MAIN_T1_03",
        Repeatable: false,
        giverNpc: "峽谷哨兵隊長·雷恩",
        description: "荒蕪峽谷的猛獸比森林裡的怪物強悍得多。先擊退大地巨熊與劍齒虎，並收集寒鐵礦來強化你的武器！",
        objectives: [
            { type: "kill", targetId: "MON_T2_001", targetName: "大地巨熊", requiredCount: 6 },
            { type: "kill", targetId: "MON_T2_002", targetName: "劍齒虎", requiredCount: 6 },
            { type: "collect", targetId: "MAT_069", targetName: "寒鐵礦", requiredCount: 5 }
        ],
        rewards: {
            exp: 8500, gold: 2800, sp: 1,
            items: [{ itemId: "MAT_118", name: "潮汐之核", count: 1 }],
            unlockRecipes: ["REC_WPN_003"]
        }
    },
    {
        questId: "Q_MAIN_T2_02",
        title: "石像遺跡的亡靈君主",
        type: "main",
        tier: 2,
        minLevel: 35,
        prerequisiteQuestId: "Q_MAIN_T2_01",
        Repeatable: false,
        giverNpc: "大賢者·梅林",
        description: "石像遺跡深處的骷髏王正在集結亡者大軍。突破石像鬼與死靈學徒的防線，徹底淨化骷髏王的魂火！",
        objectives: [
            { type: "kill", targetId: "MON_T2_004", targetName: "石像鬼", requiredCount: 8 },
            { type: "kill", targetId: "MON_T2_BOSS_01", targetName: "骷髏王", requiredCount: 1 },
            { type: "collect", targetId: "MAT_264", targetName: "骷髏王魂火", requiredCount: 1 }
        ],
        rewards: {
            exp: 22000, gold: 6500, sp: 2,
            items: [{ itemId: "MAT_262", name: "古代銀幣", count: 10 }],
            unlockRecipes: ["REC_ARM_002"],
            unlockTier: 3
        }
    },
    {
        questId: "Q_SIDE_T2_01",
        title: "堅不可摧的石膚鎧甲",
        type: "side",
        tier: 2,
        minLevel: 28,
        prerequisiteQuestId: "Q_MAIN_T2_01",
        Repeatable: false,
        giverNpc: "矮人重甲師·銅鬚",
        description: "想在遺跡裡活命，普通的皮甲可不夠看。去收集石像鬼石膚與黑曜石，我教你打造真正的石像鬼板甲。",
        objectives: [
            { type: "collect", targetId: "MAT_164", targetName: "石像鬼石膚", requiredCount: 4 },
            { type: "collect", targetId: "MAT_061", targetName: "黑曜石", requiredCount: 2 },
            { type: "craft", targetId: "REC_ARM_002", targetName: "石像鬼板甲", requiredCount: 1 }
        ],
        rewards: {
            exp: 12000, gold: 3200, sp: 1,
            items: [{ itemId: "MAT_116", name: "無瑕鑽石", count: 2 }],
            unlockRecipes: ["REC_ARM_002"]
        }
    },
    {
        questId: "Q_BOUNTY_T2_01",
        title: "【每日懸賞】獵殺峽谷飛龍與蛇女",
        type: "bounty",
        tier: 2,
        minLevel: 25,
        prerequisiteQuestId: null,
        Repeatable: true,
        cooldownHours: 24,
        giverNpc: "懸賞告示板（T2）",
        description: "雙足飛龍與美杜莎蛇女頻繁襲擊商隊，請消滅牠們以確保峽谷暢通。",
        objectives: [
            { type: "kill", targetId: "MON_T2_003", targetName: "雙足飛龍", requiredCount: 8 },
            { type: "kill", targetId: "MON_T2_006", targetName: "美杜莎蛇女", requiredCount: 8 }
        ],
        rewards: {
            exp: 9500, gold: 2400, sp: 0,
            items: [{ itemId: "MAT_262", name: "古代銀幣", count: 3 }],
            unlockRecipes: []
        }
    },
    {
        questId: "Q_MAIN_T3_01",
        title: "地心烈焰的試煉",
        type: "main",
        tier: 3,
        minLevel: 41,
        prerequisiteQuestId: "Q_MAIN_T2_02",
        Repeatable: false,
        giverNpc: "炎之守護者·伊格尼",
        description: "熔岩地心的高溫連鋼鐵都能融化。獵殺地獄犬與烈焰亞龍，並開採秘銀礦與熔岩核心石，準備迎接深淵的挑戰。",
        objectives: [
            { type: "kill", targetId: "MON_T3_001", targetName: "地獄犬", requiredCount: 10 },
            { type: "kill", targetId: "MON_T3_003", targetName: "烈焰亞龍", requiredCount: 8 },
            { type: "collect", targetId: "MAT_071", targetName: "秘銀礦", requiredCount: 6 }
        ],
        rewards: {
            exp: 48000, gold: 12000, sp: 1,
            items: [{ itemId: "ITEM_INGOT_MITHRIL", name: "秘銀錠", count: 2 }],
            unlockRecipes: ["REC_REF_002", "REC_ARM_003"]
        }
    },
    {
        questId: "Q_MAIN_T3_02",
        title: "討伐炎魔領主",
        type: "main",
        tier: 3,
        minLevel: 55,
        prerequisiteQuestId: "Q_MAIN_T3_01",
        Repeatable: false,
        giverNpc: "大賢者·梅林",
        description: "盤踞在地心最深處的炎魔領主正試圖引爆地脈。斬下炎魔領主之角，並利用它鍛造出傳說中的烈焰魔杖！",
        objectives: [
            { type: "kill", targetId: "MON_T3_BOSS_01", targetName: "炎魔領主", requiredCount: 1 },
            { type: "collect", targetId: "MAT_275", targetName: "炎魔領主之角", requiredCount: 1 }
        ],
        rewards: {
            exp: 110000, gold: 28000, sp: 2,
            items: [
                { itemId: "MAT_272", name: "古代金幣", count: 10 },
                { itemId: "MAT_121", name: "熾熱紅寶石", count: 2 }
            ],
            unlockRecipes: ["REC_WPN_004"],
            unlockTier: 4
        }
    },
    {
        questId: "Q_SIDE_T3_01",
        title: "次元空間的奧秘（背包擴充）",
        type: "side",
        tier: 3,
        minLevel: 45,
        prerequisiteQuestId: "Q_MAIN_T3_01",
        Repeatable: false,
        giverNpc: "空間旅者·奇諾",
        description: "你的背包快裝不下這麼多珍貴素材了吧？只要幫我收集地獄犬魔皮、黃金藤蔓與遺跡裡的空間袋內膽，我就教你縫製「空間擴充背包」！",
        objectives: [
            { type: "collect", targetId: "MAT_171", targetName: "地獄犬魔皮", requiredCount: 4 },
            { type: "collect", targetId: "MAT_279", targetName: "空間袋內膽", requiredCount: 1 }
        ],
        rewards: {
            exp: 60000, gold: 15000, sp: 1,
            items: [{ itemId: "MAT_035", name: "黃金藤蔓", count: 2 }],
            unlockRecipes: ["REC_ACC_001"]
        }
    },
    {
        questId: "Q_BOUNTY_T3_01",
        title: "【每日懸賞】深淵地牢清剿令",
        type: "bounty",
        tier: 3,
        minLevel: 48,
        prerequisiteQuestId: null,
        Repeatable: true,
        cooldownHours: 24,
        giverNpc: "懸賞告示板（T3）",
        description: "吸血鬼伯爵侍衛與九頭蛇在深淵地牢肆虐，完成討伐即可領取豐厚賞金與古代金幣。",
        objectives: [
            { type: "kill", targetId: "MON_T3_004", targetName: "吸血鬼伯爵侍衛", requiredCount: 10 },
            { type: "kill", targetId: "MON_T3_006", targetName: "九頭蛇（Hydra）", requiredCount: 5 }
        ],
        rewards: {
            exp: 42000, gold: 9500, sp: 0,
            items: [{ itemId: "MAT_272", name: "古代金幣", count: 3 }],
            unlockRecipes: []
        }
    },
    {
        questId: "Q_MAIN_T4_01",
        title: "雲端上的龍族聖殿",
        type: "main",
        tier: 4,
        minLevel: 61,
        prerequisiteQuestId: "Q_MAIN_T3_02",
        Repeatable: false,
        giverNpc: "天空翼人族長·索拉",
        description: "歡迎來到天空之城。然而龍之神殿已被墮落的遠古巨龍衛士與不死鳳凰佔據，請收集逆鱗與鳳凰尾羽以打造抗衡神明之力的高階武裝。",
        objectives: [
            { type: "kill", targetId: "MON_T4_001", targetName: "遠古巨龍衛士", requiredCount: 8 },
            { type: "kill", targetId: "MON_T4_006", targetName: "不死鳳凰", requiredCount: 5 },
            { type: "collect", targetId: "MAT_181", targetName: "遠古巨龍逆鱗", requiredCount: 2 }
        ],
        rewards: {
            exp: 185000, gold: 55000, sp: 1,
            items: [{ itemId: "MAT_083", name: "龍紋鋼", count: 2 }],
            unlockRecipes: ["REC_WPN_005", "REC_ARM_004", "REC_ACC_002"]
        }
    },
    {
        questId: "Q_MAIN_T4_02",
        title: "弒龍者與天界之門",
        type: "main",
        tier: 4,
        minLevel: 75,
        prerequisiteQuestId: "Q_MAIN_T4_01",
        Repeatable: false,
        giverNpc: "大賢者·梅林",
        description: "巨龍君王擋住了通往「時空虛空」的裂隙。唯有擊敗巨龍君王、奪取龍珠之人，方有資格踏入最終的神話領域（Tier 5）！",
        objectives: [
            { type: "kill", targetId: "MON_T4_BOSS_01", targetName: "巨龍君王", requiredCount: 1 },
            { type: "collect", targetId: "MAT_284", targetName: "巨龍君王龍珠", requiredCount: 1 }
        ],
        rewards: {
            exp: 420000, gold: 120000, sp: 3,
            items: [
                { itemId: "MAT_282", name: "遠古神幣", count: 10 },
                { itemId: "CON_ELIXIR_T4", name: "九轉還魂丹", count: 2 }
            ],
            unlockRecipes: ["REC_CON_002"],
            unlockTier: 5
        }
    },
    {
        questId: "Q_BOUNTY_T4_01",
        title: "【每日懸賞】神殿巨獸鎮壓作戰",
        type: "bounty",
        tier: 4,
        minLevel: 68,
        prerequisiteQuestId: null,
        Repeatable: true,
        cooldownHours: 24,
        giverNpc: "懸賞告示板（T4）",
        description: "比蒙巨獸、芬里爾狂狼與泰坦巨人正在破壞天空浮島的地基，請前往鎮壓！",
        objectives: [
            { type: "kill", targetId: "MON_T4_002", targetName: "比蒙巨獸", requiredCount: 6 },
            { type: "kill", targetId: "MON_T4_004", targetName: "芬里爾狂狼", requiredCount: 6 },
            { type: "kill", targetId: "MON_T4_009", targetName: "泰坦巨人", requiredCount: 6 }
        ],
        rewards: {
            exp: 150000, gold: 38000, sp: 0,
            items: [{ itemId: "MAT_282", name: "遠古神幣", count: 3 }],
            unlockRecipes: []
        }
    },
    {
        questId: "Q_MAIN_T5_01",
        title: "法則崩壞與神器重鑄",
        type: "main",
        tier: 5,
        minLevel: 81,
        prerequisiteQuestId: "Q_MAIN_T4_02",
        Repeatable: false,
        giverNpc: "時空守望者·克羅諾斯",
        description: "在虛空神域中，唯有神話級武裝能抵禦舊日支配者與噬星龍皇的侵蝕。收集虛空神鐵、不滅神鋼與時間沙漏核心，鍛造出終極神器吧！",
        objectives: [
            { type: "kill", targetId: "MON_T5_001", targetName: "噬星龍皇", requiredCount: 5 },
            { type: "kill", targetId: "MON_T5_003", targetName: "虛空掠奪者", requiredCount: 8 },
            { type: "collect", targetId: "MAT_091", targetName: "虛空神鐵", requiredCount: 5 },
            { type: "collect", targetId: "MAT_096", targetName: "不滅神鋼", requiredCount: 6 }
        ],
        rewards: {
            exp: 850000, gold: 300000, sp: 2,
            items: [
                { itemId: "MAT_149", name: "虛空之眼", count: 1 },
                { itemId: "MAT_143", name: "時間寶石", count: 1 }
            ],
            unlockRecipes: ["REC_WPN_006", "REC_ARM_005", "REC_ACC_003"]
        }
    },
    {
        questId: "Q_MAIN_T5_02",
        title: "【終局之戰】諸神黃昏與創世黎明",
        type: "main",
        tier: 5,
        minLevel: 99,
        prerequisiteQuestId: "Q_MAIN_T5_01",
        Repeatable: false,
        giverNpc: "時空守望者·克羅諾斯",
        description: "穿戴上你最強的創世聖鎧與虛空之刃，迎戰宇宙的終極源頭——創世獸神，奪取「開發者彩蛋代碼」完成傳說！",
        objectives: [
            { type: "kill", targetId: "MON_T5_BOSS_01", targetName: "創世獸神", requiredCount: 1 },
            { type: "collect", targetId: "MAT_300", targetName: "開發者彩蛋代碼", requiredCount: 1 }
        ],
        rewards: {
            exp: 2500000, gold: 1000000, sp: 5,
            items: [
                { itemId: "MAT_142", name: "創造神晶", count: 3 },
                { itemId: "MAT_297", name: "創世神格碎片", count: 3 }
            ],
            unlockRecipes: [],
            unlockTitle: "創世神話超越者"
        }
    },
    {
        questId: "Q_BOUNTY_T5_01",
        title: "【每日懸賞】虛空維度肅清行動",
        type: "bounty",
        tier: 5,
        minLevel: 88,
        prerequisiteQuestId: null,
        Repeatable: true,
        cooldownHours: 24,
        giverNpc: "星界懸賞終端（T5）",
        description: "討伐耶夢加得、尼德霍格與深淵魔神化身，維持維度裂縫的穩定。",
        objectives: [
            { type: "kill", targetId: "MON_T5_004", targetName: "世界之蛇·耶夢加得", requiredCount: 5 },
            { type: "kill", targetId: "MON_T5_005", targetName: "絕望黑羽·尼德霍格", requiredCount: 5 },
            { type: "kill", targetId: "MON_T5_008", targetName: "深淵魔神化身", requiredCount: 5 }
        ],
        rewards: {
            exp: 600000, gold: 150000, sp: 0,
            items: [
                { itemId: "MAT_298", name: "虛空君王王座殘片", count: 1 },
                { itemId: "CON_ELIXIR_T4", name: "九轉還魂丹", count: 1 }
            ],
            unlockRecipes: []
        }
    }
];