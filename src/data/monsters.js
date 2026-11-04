// src/data/monsters.js
// 🌟 完整收錄 rpg_monster_database.json 50 隻怪物、技能與掉寶表 (Tier 1 ~ Tier 5)

export const MonsterDatabase = [
    // ==================== Tier 1 (Lv.1 ~ 20) ====================
    { id: "MON_T1_001", name: "綠色史萊姆", type: "elemental_slime", tier: 1, levelRange: [1, 5], sprite: "witch", element: "WATER", drops: [{ materialId: "MAT_151", name: "史萊姆凝膠", dropRate: 0.8, min: 1, max: 2 }, { materialId: "MAT_101", name: "碎裂紅寶石", dropRate: 0.25, min: 1, max: 1 }], skill: { name: "分裂", desc: "生命值低於 20% 時分裂。" } },
    { id: "MON_T1_002", name: "森林野狼", type: "beast", tier: 1, levelRange: [3, 8], sprite: "skeleton", element: "NATURE", drops: [{ materialId: "MAT_152", name: "狼皮", dropRate: 0.75, min: 1, max: 2 }, { materialId: "MAT_201", name: "止血草", dropRate: 0.4, min: 1, max: 1 }], skill: { name: "群體獵殺", desc: "同伴在場時攻擊提升 15%。" } },
    { id: "MON_T1_003", name: "狂暴野豬", type: "beast", tier: 1, levelRange: [5, 10], sprite: "fire_monster", element: "NATURE", drops: [{ materialId: "MAT_153", name: "野豬獠牙", dropRate: 0.65, min: 1, max: 1 }, { materialId: "MAT_204", name: "野莓", dropRate: 0.45, min: 1, max: 3 }], skill: { name: "野蠻衝鋒", desc: "直線衝撞造成擊退效果。" } },
    { id: "MON_T1_004", name: "暗夜蝙蝠", type: "insect_flying", tier: 1, levelRange: [6, 12], sprite: "witch", element: "NATURE", drops: [{ materialId: "MAT_154", name: "蝙蝠翅膀", dropRate: 0.7, min: 1, max: 2 }, { materialId: "MAT_203", name: "螢光蘑菇", dropRate: 0.35, min: 1, max: 1 }], skill: { name: "吸血獠牙", desc: "攻擊時恢復自身 20% 傷害量。" } },
    { id: "MON_T1_005", name: "洞穴毒蜘蛛", type: "insect", tier: 1, levelRange: [8, 14], sprite: "witch", element: "NATURE", drops: [{ materialId: "MAT_155", name: "蜘蛛絲", dropRate: 0.8, min: 1, max: 3 }, { materialId: "MAT_156", name: "毒蜘蛛腺體", dropRate: 0.45, min: 1, max: 1 }], skill: { name: "劇毒撕咬", desc: "附加每秒中毒傷害。" } },
    { id: "MON_T1_006", name: "骷髏兵", type: "undead", tier: 1, levelRange: [10, 16], sprite: "skeleton", element: "NEUTRAL", drops: [{ materialId: "MAT_157", name: "骷髏碎骨", dropRate: 0.75, min: 1, max: 2 }, { materialId: "MAT_158", name: "腐爛繃帶", dropRate: 0.5, min: 1, max: 1 }], skill: { name: "骨骼重組", desc: "未受火傷有機會半血重組。" } },
    { id: "MON_T1_007", name: "哥布林小偷", type: "humanoid_goblin", tier: 1, levelRange: [12, 18], sprite: "skeleton", element: "FIRE", drops: [{ materialId: "MAT_159", name: "哥布林破布", dropRate: 0.8, min: 1, max: 2 }, { materialId: "MAT_252", name: "古代銅幣", dropRate: 0.4, min: 1, max: 1 }], skill: { name: "偷襲", desc: "開戰時觸發暴擊。" } },
    { id: "MON_T1_008", name: "腐臭烏鴉", type: "beast_flying", tier: 1, levelRange: [14, 20], sprite: "witch", element: "NATURE", drops: [{ materialId: "MAT_160", name: "烏鴉羽毛", dropRate: 0.7, min: 1, max: 2 }, { materialId: "MAT_202", name: "藍魔草", dropRate: 0.35, min: 1, max: 1 }], skill: { name: "厄運悲鳴", desc: "降低玩家 10% 命中率。" } },
    { id: "MON_T1_BOSS_01", name: "史萊姆王", type: "slime_boss", tier: 1, levelRange: [15, 20], isBoss: true, sprite: "ice_monster", element: "WATER", drops: [{ materialId: "MAT_255", name: "史萊姆王核心", dropRate: 1.0, min: 1, max: 1 }, { materialId: "MAT_151", name: "史萊姆凝膠", dropRate: 1.0, min: 5, max: 10 }], skill: { name: "泰山壓頂", desc: "壓碎地面造成範圍震盪。" } },
    { id: "MON_T1_BOSS_02", name: "哥布林酋長", type: "goblin_boss", tier: 1, levelRange: [18, 20], isBoss: true, sprite: "boss", element: "FIRE", drops: [{ materialId: "MAT_254", name: "哥布林王冠", dropRate: 1.0, min: 1, max: 1 }, { materialId: "MAT_258", name: "盜賊首領徽章", dropRate: 0.6, min: 1, max: 1 }], skill: { name: "召喚小弟", desc: "吹響號角召喚哥布林戰士。" } },

    // ==================== Tier 2 (Lv.21 ~ 40) ====================
    { id: "MON_T2_001", name: "大地巨熊", type: "beast", tier: 2, levelRange: [21, 25], sprite: "fire_monster", element: "NATURE", drops: [{ materialId: "MAT_161", name: "巨熊厚皮", dropRate: 0.65, min: 1, max: 1 }, { materialId: "MAT_211", name: "太陽草", dropRate: 0.45, min: 1, max: 2 }], skill: { name: "重擊拍擊", desc: "降低玩家移動速度。" } },
    { id: "MON_T2_002", name: "劍齒虎", type: "beast", tier: 2, levelRange: [23, 28], sprite: "fire_monster", element: "FIRE", drops: [{ materialId: "MAT_162", name: "劍齒虎利爪", dropRate: 0.7, min: 1, max: 2 }, { materialId: "MAT_214", name: "烈焰辣椒", dropRate: 0.35, min: 1, max: 1 }], skill: { name: "撕裂", desc: "攻擊帶有流血效果。" } },
    { id: "MON_T2_003", name: "雙足飛龍", type: "dragon_flying", tier: 2, levelRange: [25, 30], sprite: "fire_monster", element: "FIRE", drops: [{ materialId: "MAT_163", name: "雙足飛龍鱗片", dropRate: 0.55, min: 1, max: 2 }, { materialId: "MAT_215", name: "冰霜蓮花", dropRate: 0.4, min: 1, max: 1 }], skill: { name: "毒尾刺", desc: "甩尾施加麻痺毒素。" } },
    { id: "MON_T2_004", name: "石像鬼", type: "construct_stone", tier: 2, levelRange: [28, 34], sprite: "skeleton", element: "FIRE", drops: [{ materialId: "MAT_164", name: "石像鬼石膚", dropRate: 0.65, min: 1, max: 2 }, { materialId: "MAT_061", name: "黑曜石", dropRate: 0.45, min: 1, max: 1 }], skill: { name: "石化防禦", desc: "獲得 50% 物理減傷盾。" } },
    { id: "MON_T2_005", name: "鐵甲巨蛛", type: "insect", tier: 2, levelRange: [30, 36], sprite: "witch", element: "NATURE", drops: [{ materialId: "MAT_165", name: "鋼鐵蛛絲", dropRate: 0.7, min: 1, max: 3 }, { materialId: "MAT_218", name: "麻痺花瓣", dropRate: 0.35, min: 1, max: 1 }], skill: { name: "蛛網束縛", desc: "噴射網絲將玩家定身。" } },
    { id: "MON_T2_006", name: "美杜莎蛇女", type: "monster_humanoid", tier: 2, levelRange: [32, 38], sprite: "witch", element: "NATURE", drops: [{ materialId: "MAT_166", name: "美杜莎蛇蛻", dropRate: 0.55, min: 1, max: 1 }, { materialId: "MAT_217", name: "夜光藻", dropRate: 0.45, min: 1, max: 2 }], skill: { name: "石化視線", desc: "凝視造成石化效果。" } },
    { id: "MON_T2_007", name: "死靈法師學徒", type: "undead", tier: 2, levelRange: [34, 40], sprite: "witch", element: "WATER", drops: [{ materialId: "MAT_167", name: "死靈完整頭骨", dropRate: 0.45, min: 1, max: 1 }, { materialId: "MAT_263", name: "魔導書殘頁", dropRate: 0.5, min: 1, max: 2 }], skill: { name: "暗影箭", desc: "發射追蹤暗影球。" } },
    { id: "MON_T2_008", name: "怨靈幽魂", type: "elemental_undead", tier: 2, levelRange: [35, 40], sprite: "ice_monster", element: "WATER", drops: [{ materialId: "MAT_168", name: "怨靈布料", dropRate: 0.65, min: 1, max: 2 }, { materialId: "MAT_264", name: "骷髏王魂火", dropRate: 0.15, min: 1, max: 1 }], skill: { name: "虛體化", desc: "物理攻擊有靈巧閃避。" } },
    { id: "MON_T2_009", name: "食人魔戰士", type: "humanoid_giant", tier: 2, levelRange: [36, 40], sprite: "fire_monster", element: "FIRE", drops: [{ materialId: "MAT_169", name: "食人魔筋腱", dropRate: 0.55, min: 1, max: 1 }, { materialId: "MAT_268", name: "騎士團長勳章", dropRate: 0.25, min: 1, max: 1 }], skill: { name: "狂暴揮擊", desc: "揮舞巨棒強力重擊。" } },
    { id: "MON_T2_BOSS_01", name: "骷髏王", type: "undead_boss", tier: 2, levelRange: [38, 40], isBoss: true, sprite: "boss", element: "FIRE", drops: [{ materialId: "MAT_264", name: "骷髏王魂火", dropRate: 1.0, min: 1, max: 1 }, { materialId: "MAT_167", name: "死靈完整頭骨", dropRate: 0.85, min: 1, max: 3 }], skill: { name: "召喚亡者大軍", desc: "召喚骷髏大軍助戰。" } },

    // ==================== Tier 3 (Lv.41 ~ 60) ====================
    { id: "MON_T3_001", name: "地獄犬", type: "monster", tier: 3, levelRange: [41, 45], sprite: "fire_monster", element: "FIRE", drops: [{ materialId: "MAT_171", name: "地獄犬魔皮", dropRate: 0.65, min: 1, max: 1 }, { materialId: "MAT_221", name: "龍血草", dropRate: 0.45, min: 1, max: 2 }], skill: { name: "地獄烈焰", desc: "吐出扇形火焰灼燒地面。" } },
    { id: "MON_T3_002", name: "奇美拉", type: "monster", tier: 3, levelRange: [44, 48], sprite: "fire_monster", element: "FIRE", drops: [{ materialId: "MAT_172", name: "奇美拉毒尾", dropRate: 0.55, min: 1, max: 1 }, { materialId: "MAT_275", name: "炎魔領主之角", dropRate: 0.15, min: 1, max: 1 }], skill: { name: "三相吐息", desc: "噴出冰、火、雷三屬性吐息。" } },
    { id: "MON_T3_003", name: "烈焰亞龍", type: "dragon", tier: 3, levelRange: [46, 52], sprite: "fire_monster", element: "FIRE", drops: [{ materialId: "MAT_173", name: "亞龍堅鱗", dropRate: 0.7, min: 1, max: 3 }, { materialId: "MAT_075", name: "熔岩核心石", dropRate: 0.35, min: 1, max: 1 }], skill: { name: "龍之怒吼", desc: "震懾玩家並提升自身攻擊力。" } },
    { id: "MON_T3_004", name: "吸血鬼伯爵侍衛", type: "undead_vampire", tier: 3, levelRange: [48, 54], sprite: "witch", element: "WATER", drops: [{ materialId: "MAT_174", name: "吸血鬼獠牙", dropRate: 0.65, min: 1, max: 2 }, { materialId: "MAT_274", name: "吸血鬼伯爵血戒", dropRate: 0.25, min: 1, max: 1 }], skill: { name: "血影瞬移", desc: "閃現至背後突刺攻擊。" } },
    { id: "MON_T3_005", name: "暗影豹", type: "monster", tier: 3, levelRange: [50, 56], sprite: "witch", element: "NATURE", drops: [{ materialId: "MAT_175", name: "暗影豹皮", dropRate: 0.7, min: 1, max: 2 }, { materialId: "MAT_225", name: "暗影玫瑰", dropRate: 0.45, min: 1, max: 2 }], skill: { name: "潛行偷襲", desc: "現身首擊造成雙倍傷害。" } },
    { id: "MON_T3_006", name: "九頭蛇（Hydra）", type: "monster", tier: 3, levelRange: [52, 58], sprite: "ice_monster", element: "WATER", drops: [{ materialId: "MAT_176", name: "九頭蛇毒液", dropRate: 0.8, min: 1, max: 3 }, { materialId: "MAT_224", name: "雷鳴果", dropRate: 0.35, min: 1, max: 1 }], skill: { name: "多頭連擊", desc: "進行三次連續毒咬。" } },
    { id: "MON_T3_007", name: "巫妖學徒", type: "undead", tier: 3, levelRange: [54, 60], sprite: "ice_monster", element: "WATER", drops: [{ materialId: "MAT_177", name: "巫妖骨粉", dropRate: 0.65, min: 1, max: 2 }, { materialId: "MAT_273", name: "禁忌魔導書", dropRate: 0.4, min: 1, max: 1 }], skill: { name: "冰霜禁錮", desc: "召喚冰陣造成冰凍。" } },
    { id: "MON_T3_008", name: "深淵幽靈", type: "elemental_spirit", tier: 3, levelRange: [55, 60], sprite: "ice_monster", element: "WATER", drops: [{ materialId: "MAT_178", name: "幽靈精華", dropRate: 0.55, min: 1, max: 2 }, { materialId: "MAT_276", name: "冰霜女王王冠", dropRate: 0.15, min: 1, max: 1 }], skill: { name: "靈魂抽取", desc: "抽取魔力轉化為護盾。" } },
    { id: "MON_T3_009", name: "巨魔再生者", type: "giant", tier: 3, levelRange: [56, 60], sprite: "skeleton", element: "NATURE", drops: [{ materialId: "MAT_179", name: "巨魔再生血", dropRate: 0.65, min: 1, max: 2 }, { materialId: "MAT_226", name: "生命之葉", dropRate: 0.5, min: 1, max: 2 }], skill: { name: "極速再生", desc: "每回合自動恢復生命值。" } },
    { id: "MON_T3_BOSS_01", name: "炎魔領主", type: "elemental_boss", tier: 3, levelRange: [58, 60], isBoss: true, sprite: "boss", element: "FIRE", drops: [{ materialId: "MAT_275", name: "炎魔領主之角", dropRate: 1.0, min: 1, max: 1 }, { materialId: "MAT_121", name: "熾熱紅寶石", dropRate: 0.85, min: 1, max: 3 }], skill: { name: "隕石降臨", desc: "落下 3 顆隕石造成毀滅性傷害。" } },

    // ==================== Tier 4 (Lv.61 ~ 80) ====================
    { id: "MON_T4_001", name: "遠古巨龍衛士", type: "dragon", tier: 4, levelRange: [61, 66], sprite: "fire_monster", element: "FIRE", drops: [{ materialId: "MAT_181", name: "遠古巨龍逆鱗", dropRate: 0.55, min: 1, max: 2 }, { materialId: "MAT_284", name: "巨龍君王龍珠", dropRate: 0.15, min: 1, max: 1 }], skill: { name: "龍鱗護體", desc: "減免低額傷害並反彈攻擊。" } },
    { id: "MON_T4_002", name: "比蒙巨獸", type: "ancient_beast", tier: 4, levelRange: [64, 70], sprite: "fire_monster", element: "FIRE", drops: [{ materialId: "MAT_182", name: "比蒙巨獸金毛", dropRate: 0.65, min: 1, max: 2 }, { materialId: "MAT_287", name: "泰坦動力爐", dropRate: 0.25, min: 1, max: 1 }], skill: { name: "泰坦之握", desc: "造成破甲與巨額物理傷害。" } },
    { id: "MON_T4_003", name: "利維坦海獸化身", type: "mythic_beast", tier: 4, levelRange: [66, 72], sprite: "ice_monster", element: "WATER", drops: [{ materialId: "MAT_183", name: "利維坦海獸皮", dropRate: 0.55, min: 1, max: 1 }, { materialId: "MAT_132", name: "海神之淚", dropRate: 0.35, min: 1, max: 1 }], skill: { name: "深海漩渦", desc: "製造強大深海漩渦。" } },
    { id: "MON_T4_004", name: "芬里爾狂狼", type: "mythic_beast", tier: 4, levelRange: [68, 74], sprite: "ice_monster", element: "WATER", drops: [{ materialId: "MAT_184", name: "芬里爾狼牙", dropRate: 0.65, min: 1, max: 2 }, { materialId: "MAT_231", name: "千年人參", dropRate: 0.45, min: 1, max: 1 }], skill: { name: "狂化撕裂", desc: "半血時攻速提升 50%。" } },
    { id: "MON_T4_005", name: "巴哈姆特爪牙", type: "dragon", tier: 4, levelRange: [70, 76], sprite: "fire_monster", element: "FIRE", drops: [{ materialId: "MAT_185", name: "巴哈姆特龍爪", dropRate: 0.55, min: 1, max: 2 }, { materialId: "MAT_283", name: "死海古卷", dropRate: 0.35, min: 1, max: 1 }], skill: { name: "聖光審判", desc: "召喚垂直光柱造成神聖傷害。" } },
    { id: "MON_T4_006", name: "不死鳳凰", type: "mythic_bird", tier: 4, levelRange: [72, 78], sprite: "fire_monster", element: "FIRE", drops: [{ materialId: "MAT_186", name: "鳳凰尾羽", dropRate: 0.45, min: 1, max: 2 }, { materialId: "MAT_131", name: "鳳凰血玉", dropRate: 0.25, min: 1, max: 1 }], skill: { name: "浴火重生", desc: "化為火蛋浴火重生。" } },
    { id: "MON_T4_007", name: "骨龍殘骸", type: "undead_dragon", tier: 4, levelRange: [74, 80], sprite: "skeleton", element: "NATURE", drops: [{ materialId: "MAT_187", name: "骨龍脊椎", dropRate: 0.55, min: 1, max: 1 }, { materialId: "MAT_286", name: "大天使聖光環", dropRate: 0.15, min: 1, max: 1 }], skill: { name: "死亡凋零", desc: "散發死氣持續扣血。" } },
    { id: "MON_T4_008", name: "深淵惡魔領隊", type: "demon", tier: 4, levelRange: [75, 80], sprite: "witch", element: "FIRE", drops: [{ materialId: "MAT_188", name: "深淵惡魔之角", dropRate: 0.65, min: 1, max: 2 }, { materialId: "MAT_285", name: "深淵魔王之眼", dropRate: 0.25, min: 1, max: 1 }], skill: { name: "地獄之門", desc: "召喚惡魔施加恐懼。" } },
    { id: "MON_T4_009", name: "泰坦巨人", type: "giant", tier: 4, levelRange: [76, 80], sprite: "skeleton", element: "FIRE", drops: [{ materialId: "MAT_189", name: "泰坦巨人之血", dropRate: 0.55, min: 1, max: 2 }, { materialId: "MAT_287", name: "泰坦動力爐", dropRate: 0.35, min: 1, max: 1 }], skill: { name: "大地震撼", desc: "搥擊地面造成大範圍衝擊波。" } },
    { id: "MON_T4_BOSS_01", name: "巨龍君王", type: "dragon_boss", tier: 4, levelRange: [78, 80], isBoss: true, sprite: "boss", element: "FIRE", drops: [{ materialId: "MAT_284", name: "巨龍君王龍珠", dropRate: 1.0, min: 1, max: 1 }, { materialId: "MAT_181", name: "遠古巨龍逆鱗", dropRate: 0.85, min: 2, max: 5 }], skill: { name: "終焉吐息", desc: "橫掃全場毀滅龍息。" } },

    // ==================== Tier 5 (Lv.81 ~ 100) ====================
    { id: "MON_T5_001", name: "噬星龍皇", type: "cosmic_beast", tier: 5, levelRange: [81, 86], sprite: "fire_monster", element: "FIRE", drops: [{ materialId: "MAT_191", name: "噬星龍皇鱗", dropRate: 0.45, min: 1, max: 1 }, { materialId: "MAT_141", name: "毀滅神晶", dropRate: 0.15, min: 1, max: 1 }], skill: { name: "星體崩塌", desc: "召喚小型黑洞拉扯玩家。" } },
    { id: "MON_T5_002", name: "混沌古獸", type: "chaos_creature", tier: 5, levelRange: [84, 90], sprite: "witch", element: "NATURE", drops: [{ materialId: "MAT_192", name: "混沌古獸皮", dropRate: 0.55, min: 1, max: 2 }, { materialId: "MAT_148", name: "混沌魔方", dropRate: 0.25, min: 1, max: 1 }], skill: { name: "屬性亂流", desc: "隨機改變自身弱點屬性。" } },
    { id: "MON_T5_003", name: "虛空掠奪者", type: "void_creature", tier: 5, levelRange: [86, 92], sprite: "skeleton", element: "WATER", drops: [{ materialId: "MAT_193", name: "虛空掠奪者鐮爪", dropRate: 0.65, min: 1, max: 2 }, { materialId: "MAT_149", name: "虛空之眼", dropRate: 0.25, min: 1, max: 1 }], skill: { name: "時空穿梭", desc: "攻擊有 30% 機率穿透防禦。" } },
    { id: "MON_T5_004", name: "世界之蛇·耶夢加得", type: "mythic_beast", tier: 5, levelRange: [88, 94], sprite: "ice_monster", element: "WATER", drops: [{ materialId: "MAT_194", name: "耶夢加得毒牙", dropRate: 0.45, min: 1, max: 1 }, { materialId: "MAT_146", name: "力量寶石", dropRate: 0.15, min: 1, max: 1 }], skill: { name: "世界毒池", desc: "吐出劇毒之海封鎖場地。" } },
    { id: "MON_T5_005", name: "絕望黑羽·尼德霍格", type: "mythic_monster", tier: 5, levelRange: [90, 96], sprite: "witch", element: "NATURE", drops: [{ materialId: "MAT_195", name: "尼德霍格黑羽", dropRate: 0.55, min: 1, max: 2 }, { materialId: "MAT_145", name: "現實寶石", dropRate: 0.15, min: 1, max: 1 }], skill: { name: "末日之翼", desc: "壓制玩家的主動技能。" } },
    { id: "MON_T5_006", name: "舊日支配者觸手", type: "cthulhu", tier: 5, levelRange: [92, 98], sprite: "witch", element: "WATER", drops: [{ materialId: "MAT_196", name: "舊日支配者觸手", dropRate: 0.65, min: 1, max: 2 }, { materialId: "MAT_147", name: "心靈寶石", dropRate: 0.15, min: 1, max: 1 }], skill: { name: "精神瘋狂", desc: "干擾理智與魔力值。" } },
    { id: "MON_T5_007", name: "永恆不死鳥", type: "mythic_beast", tier: 5, levelRange: [94, 100], sprite: "fire_monster", element: "FIRE", drops: [{ materialId: "MAT_197", name: "不死鳥之心", dropRate: 0.35, min: 1, max: 1 }, { materialId: "MAT_142", name: "創造神晶", dropRate: 0.15, min: 1, max: 1 }], skill: { name: "神聖涅槃", desc: "引爆全場神聖火焰。" } },
    { id: "MON_T5_008", name: "深淵魔神化身", type: "demon_god", tier: 5, levelRange: [95, 100], sprite: "boss", element: "FIRE", drops: [{ materialId: "MAT_198", name: "魔神之血", dropRate: 0.45, min: 1, max: 2 }, { materialId: "MAT_298", name: "虛空君王王座殘片", dropRate: 0.25, min: 1, max: 1 }], skill: { name: "血之祭獻", desc: "吸收生命化為自身治療。" } },
    { id: "MON_T5_009", name: "天界創世天使", type: "angel_divine", tier: 5, levelRange: [96, 100], sprite: "ice_monster", element: "WATER", drops: [{ materialId: "MAT_199", name: "天神之翼", dropRate: 0.55, min: 1, max: 2 }, { materialId: "MAT_144", name: "空間寶石", dropRate: 0.15, min: 1, max: 1 }], skill: { name: "神聖領域", desc: "展開神聖結界。" } },
    { id: "MON_T5_BOSS_01", name: "創世獸神", type: "cosmic_god_boss", tier: 5, levelRange: [99, 100], isBoss: true, sprite: "boss", element: "FIRE", drops: [{ materialId: "MAT_300", name: "開發者彩蛋代碼", dropRate: 1.0, min: 1, max: 1 }, { materialId: "MAT_142", name: "創造神晶", dropRate: 1.0, min: 1, max: 2 }, { materialId: "MAT_297", name: "創世神格碎片", dropRate: 1.0, min: 1, max: 2 }], skill: { name: "宇宙重置", desc: "釋放創世神威考驗玩家畢業度。" } }
];

// 🌟 根據 rpg_monster_database.json 公式生成實戰怪物實體
export function spawnMonsterInstance(template, targetLevel = null) {
    const tier = template.tier || 1;
    const lvl = targetLevel || (template.levelRange[0] + Math.floor(Math.random() * (template.levelRange[1] - template.levelRange[0] + 1)));

    const baseHp = template.isBoss ? 140 : 65;
    const baseAtk = template.isBoss ? 20 : 12;
    const baseDef = template.isBoss ? 15 : 8;

    // 嚴格套用 JSON monsterGrowth 公式
    const hp = Math.floor(baseHp * Math.pow(1.5, tier - 1) * (1 + 0.1 * (lvl - 1)));
    const atk = Math.floor(baseAtk * Math.pow(1.4, tier - 1) * (1 + 0.08 * (lvl - 1)));
    const def = Math.floor(baseDef * Math.pow(1.35, tier - 1));

    return {
        id: template.id,
        name: `${template.name} Lv.${lvl}`,
        rawName: template.name,
        tier,
        level: lvl,
        hp,
        maxHp: hp,
        atk,
        def,
        isBoss: !!template.isBoss,
        sprite: template.sprite || 'witch',
        element: template.element || 'NEUTRAL',
        weaknessText: template.skill ? `技:${template.skill.name}` : `T${tier}魔物`,
        skill: template.skill,
        drops: template.drops || []
    };
}

// 根據地圖 Tier 抽選遭遇戰怪物編隊 (2~4 隻)
export function getEncounterFormationByTier(tier = 1, isBossFight = false) {
    if (isBossFight) {
        const bosses = MonsterDatabase.filter(m => m.tier === tier && m.isBoss);
        const bossTpl = bosses[Math.floor(Math.random() * bosses.length)] || MonsterDatabase.find(m => m.isBoss);
        const minions = MonsterDatabase.filter(m => m.tier === tier && !m.isBoss);
        const m1 = minions[Math.floor(Math.random() * minions.length)] || MonsterDatabase[0];
        const m2 = minions[Math.floor(Math.random() * minions.length)] || MonsterDatabase[1];
        return [
            spawnMonsterInstance(m1),
            spawnMonsterInstance(bossTpl),
            spawnMonsterInstance(m2)
        ];
    }

    const pool = MonsterDatabase.filter(m => m.tier === tier && !m.isBoss);
    const count = 2 + Math.floor(Math.random() * 2); // 2~3 隻
    const formation = [];
    for (let i = 0; i < count; i++) {
        const tpl = pool[Math.floor(Math.random() * pool.length)] || MonsterDatabase[0];
        formation.push(spawnMonsterInstance(tpl));
    }
    return formation;
}