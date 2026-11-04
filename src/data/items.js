// src/data/items.js
import { Base64Strings, getPixelIconHtml, generateDistinctMaterialSvg } from './assets.js';

// 🌟 300 款素材完整名稱清單 (嚴格對應 rpg_database_300_materials.json MAT_001 ~ MAT_300)
const MAT_NAMES = [
    // 001-050: 木材與植物纖維 (wood_plant)
    "橡木原木","樺木原木","松木原木","乾枯樹枝","柔韌藤蔓","亞麻纖維","野棉花","翠綠竹竿","橡樹樹脂","乾燥樹皮",
    "紅杉木","鐵樺木","沼澤陰沉木","螢光菌絲木","荊棘藤","劍麻纖維","冰霜松果","硬質竹心","琥珀松脂","硬化樹皮",
    "暗影黑檀","烈焰紅木","雷擊焦木","精靈白楊","吸血鬼藤","幻影蛛絲草","翡翠竹","生命樹枝枒","月光樹液","石化古木",
    "星辰銀木","龍血神木","深淵扭曲木","太陽金絲木","黃金藤蔓","天界雲棉","鳳凰梧桐木","萬年靈木心","仙露瓊漿","不朽木化石",
    "世界樹枝幹","虛空結晶木","混沌原木","時空扭曲枝","創世神藤","星雲纖維","涅槃神木","維度樹心","神聖琥珀","永恆樹皮",
    // 051-100: 礦石與大地結晶 (ore_mineral)
    "圓石","花崗岩","燧石","煤塊","銅礦石","錫礦石","鐵礦石","黏土塊","石英砂","石灰岩",
    "黑曜石","大理石","銀礦石","金礦石","鉛礦石","藍銅礦","硫磺晶體","硝石","寒鐵礦","赤鐵礦",
    "秘銀礦","精金礦","大馬士革鋼胚","鈦晶礦","熔岩核心石","永凍冰晶石","雷鳴磁鐵礦","劇毒綠泥石","狂風浮空石","秘法紫水晶",
    "奧利哈剛","星隕鐵","龍紋鋼","賢者之石碎片","太陽精金","月華秘銀","深海淵鐵","靈魂結晶礦","血玉髓","聖光白金",
    "虛空神鐵","混沌原石","創世星核","時之砂結晶","維度金屬","不滅神鋼","暗物質結晶","反重力神石","諸神黃昏殘鐵","永恆鑽石",
    // 101-150: 寶石與元素核心 (gem_element)
    "碎裂紅寶石","碎裂藍寶石","碎裂綠寶石","碎裂黃玉","碎裂紫晶","碎裂白水晶","微弱火之塵","微弱水之塵","微弱風之塵","微弱土之塵",
    "無瑕紅寶石","無瑕藍寶石","無瑕綠寶石","無瑕黃玉","無瑕紫晶","無瑕鑽石","火焰之核","潮汐之核","疾風之核","大地之核",
    "熾熱紅寶石","深淵藍寶石","生命綠寶石","閃電黃玉","暗影紫晶","聖光鑽石","爆炎結晶","極寒結晶","雷暴結晶","重力結晶",
    "鳳凰血玉","海神之淚","自然之心","雷神之眼","夢魘黑鑽","天使之瞳","太陽神石","月神寶珠","星界棱鏡","靈魂寶石",
    "毀滅神晶","創造神晶","時間寶石","空間寶石","現實寶石","力量寶石","心靈寶石","混沌魔方","虛空之眼","宇宙星塵核",
    // 151-200: 野獸與魔物掉落 (monster_drop)
    "史萊姆凝膠","狼皮","野豬獠牙","蝙蝠翅膀","蜘蛛絲","毒蜘蛛腺體","骷髏碎骨","腐爛繃帶","哥布林破布","烏鴉羽毛",
    "巨熊厚皮","劍齒虎利爪","雙足飛龍鱗片","石像鬼石膚","鋼鐵蛛絲","美杜莎蛇蛻","死靈完整頭骨","怨靈布料","食人魔筋腱","獅鷲獸羽毛",
    "地獄犬魔皮","奇美拉毒尾","亞龍堅鱗","吸血鬼獠牙","暗影豹皮","九頭蛇毒液","巫妖骨粉","幽靈精華","巨魔再生血","雷鳥電羽",
    "遠古巨龍逆鱗","比蒙巨獸金毛","利維坦海獸皮","芬里爾狼牙","巴哈姆特龍爪","鳳凰尾羽","骨龍脊椎","深淵惡魔之角","泰坦巨人之血","獨角獸聖角",
    "噬星龍皇鱗","混沌古獸皮","虛空掠奪者鐮爪","耶夢加得毒牙","尼德霍格黑羽","舊日支配者觸手","不死鳥之心","魔神之血","天神之翼","創世獸神骨",
    // 201-250: 草藥與煉金農產 (herb_alchemy)
    "止血草","藍魔草","螢光蘑菇","野莓","小麥","甘蔗","毒蠅傘","薄荷葉","向日葵種子","清澈泉水",
    "太陽草","月光花","曼德拉草","烈焰辣椒","冰霜蓮花","黃金麥穗","夜光藻","麻痺花瓣","荊棘果","妖精露水",
    "龍血草","鳳凰花","幽靈蘑菇","雷鳴果","暗影玫瑰","生命之葉","智慧果實","狂暴紅菇","化石草","聖泉水",
    "千年人參","天山雪蓮","彼岸花","黃金蘋果","星光草","龍涎香草","夢境花","涅槃草","惡魔果實","月亮井水",
    "世界樹之葉","不老仙桃","混沌蓮花","虛空魔菇","時間之花","靈魂草","創世果實","諸神甘露","星河水","輪迴果",
    // 251-300: 古代遺物與首領戰利品 (relic_boss)
    "生鏽齒輪","古代銅幣","破損羊皮紙","哥布林王冠","史萊姆王核心","破舊指南針","石製符文板","盜賊首領徽章","斷裂的劍柄","神秘鑰匙碎片",
    "精密發條","古代銀幣","魔導書殘頁","骷髏王魂火","樹精長老之心","魔力電池","青銅羅盤","騎士團長勳章","封印卷軸","古代傀儡核心",
    "秘銀齒輪","古代金幣","禁忌魔導書","吸血鬼伯爵血戒","炎魔領主之角","冰霜女王王冠","亞特蘭提斯三叉戟尖","龍語石碑","空間袋內膽","賢者筆記",
    "星界星盤","遠古神幣","死海古卷","巨龍君王龍珠","深淵魔王之眼","大天使聖光環","泰坦動力爐","命運紡車碎片","聖杯碎片","永動機核心",
    "阿卡西記錄殘頁","命運之矛尖","諸神黃昏號角","潘朵拉魔盒碎片","宇宙魔方外殼","時間沙漏核心","創世神格碎片","虛空君王王座殘片","輪迴天盤","開發者彩蛋代碼"
];

const CAT_CONFIG = [
    { key: 'wood_plant', name: '木材與植物纖維', sprite: 'wood_log' },
    { key: 'ore_mineral', name: '礦石與大地結晶', sprite: 'iron' },
    { key: 'gem_element', name: '寶石與元素核心', sprite: 'gem' },
    { key: 'monster_drop', name: '野獸與魔物掉落', sprite: 'bag' },
    { key: 'herb_alchemy', name: '草藥與煉金農產', sprite: 'farm_ready' },
    { key: 'relic_boss', name: '古代遺物與首領戰利品', sprite: 'chest' }
];

const TIER_RARITY = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];
const TIER_BASE_PRICE = [10, 45, 180, 800, 3500];
const TIER_PRICE_STEP = [2, 4, 6, 8, 10];

export const Items = {
    // 保留原有核心任務與建造道具相容性
    truth_fragment: { id: 'truth_fragment', name: '真理碎片', sprite: 'gem', icon: getPixelIconHtml('gem', 20), desc: '蘊含知識力量的純粹結晶。', category: 'gem_element', tier: 1, sellPrice: 25 },
    wood: { id: 'wood', name: '橡木原木', sprite: 'wood_log', icon: getPixelIconHtml('wood_log', 20), desc: '基礎建築與加工木材 (同 MAT_001)。', category: 'wood_plant', tier: 1, sellPrice: 10 },
    stone: { id: 'stone', name: '圓石', sprite: 'stone', icon: getPixelIconHtml('stone', 20), desc: '堅硬的岩石礦塊 (同 MAT_051)。', category: 'ore_mineral', tier: 1, sellPrice: 10 },
    coal: { id: 'coal', name: '煤塊', sprite: 'stone', icon: getPixelIconHtml('stone', 20), desc: '高溫冶煉金屬的必備燃料 (同 MAT_054)。', category: 'ore_mineral', tier: 1, sellPrice: 16 },
    copper_ore: { id: 'copper_ore', name: '銅礦石', sprite: 'copper', icon: getPixelIconHtml('copper', 20), desc: '常見的紅銅礦石 (同 MAT_055)。', category: 'ore_mineral', tier: 1, sellPrice: 18 },
    iron_ore: { id: 'iron_ore', name: '鐵礦石', sprite: 'iron', icon: getPixelIconHtml('iron', 20), desc: '未冶煉的含鐵礦石 (同 MAT_057)。', category: 'ore_mineral', tier: 1, sellPrice: 22 },
    gold_ore: { id: 'gold_ore', name: '金礦石', sprite: 'gold', icon: getPixelIconHtml('gold', 20), desc: '高純度的黃金礦脈 (同 MAT_064)。', category: 'ore_mineral', tier: 2, sellPrice: 57 },
    mithril_ore: { id: 'mithril_ore', name: '秘銀礦', sprite: 'gem', icon: getPixelIconHtml('gem', 20), desc: '極堅硬的傳說金屬礦 (同 MAT_071)。', category: 'ore_mineral', tier: 3, sellPrice: 180 },
    seed: { id: 'seed', name: '向日葵種子', sprite: 'farm_grow', icon: getPixelIconHtml('farm_grow', 20), desc: '可在營地耕地種植 (同 MAT_209)。', category: 'herb_alchemy', tier: 1, sellPrice: 26 },
    magic_herb: { id: 'magic_herb', name: '止血草', sprite: 'farm_ready', icon: getPixelIconHtml('farm_ready', 20), desc: '散發微光的醫療草藥 (同 MAT_201)。', category: 'herb_alchemy', tier: 1, sellPrice: 10 },
    rain_mushroom: { id: 'rain_mushroom', name: '螢光蘑菇', sprite: 'mushroom', icon: getPixelIconHtml('mushroom', 20), desc: '雨天森林特有的菌類 (同 MAT_203)。', category: 'herb_alchemy', tier: 1, sellPrice: 14 },
    monster_fur: { id: 'monster_fur', name: '狼皮', sprite: 'bag', icon: getPixelIconHtml('bag', 20), desc: '擊敗野生魔物獲得的毛皮 (同 MAT_152)。', category: 'monster_drop', tier: 1, sellPrice: 12 },
    map_fragment: { id: 'map_fragment', name: '破損羊皮紙', sprite: 'bag', icon: getPixelIconHtml('bag', 20), desc: '集齊4張可拼湊藏寶圖 (同 MAT_253)。', category: 'relic_boss', tier: 1, sellPrice: 14 },

    // 營地建造與探險工具
    wood_plank: { id: 'wood_plank', name: '加工木板', sprite: 'wood_log', icon: getPixelIconHtml('wood_log', 20), desc: '可於營地鋪設木質地板。', category: 'processed', tier: 1 },
    stone_wall: { id: 'stone_wall', name: '石磚牆', sprite: 'ruin_wall', icon: getPixelIconHtml('ruin_wall', 20), desc: '可於營地建造防禦圍牆。', category: 'processed', tier: 1 },
    farm_plot: { id: 'farm_plot', name: '溫室耕地', sprite: 'farm_empty', icon: getPixelIconHtml('farm_empty', 20), desc: '建造於營地，可種植種子。', category: 'processed', tier: 1 },
    recycler: { id: 'recycler', name: '物資轉換箱', sprite: 'chest', icon: getPixelIconHtml('chest', 20), desc: '10個木/石可轉換1個碎片。', category: 'processed', tier: 1 },
    stone_pickaxe: { id: 'stone_pickaxe', name: '石製十字鎬', sprite: 'pickaxe', icon: getPixelIconHtml('pickaxe', 20), desc: '裝備後可開採 T1~T2 礦脈。', category: 'tool', tier: 1 },
    iron_pickaxe: { id: 'iron_pickaxe', name: '精鐵十字鎬', sprite: 'pickaxe', icon: getPixelIconHtml('pickaxe', 20), desc: '裝備後可開採 T3~T5 高階晶礦。', category: 'tool', tier: 2 },
    lumber_axe: { id: 'lumber_axe', name: '伐木鋼斧', sprite: 'pickaxe', icon: getPixelIconHtml('pickaxe', 20), desc: '裝備後砍伐樹木獲得雙倍木材！', category: 'tool', tier: 2 },
    lantern: { id: 'lantern', name: '探險提燈', sprite: 'potion', icon: getPixelIconHtml('potion', 20), desc: '裝備後驅散夜晚黑暗。', category: 'tool', tier: 1 },
    fishing_rod: { id: 'fishing_rod', name: '木製釣竿', sprite: 'pickaxe', icon: getPixelIconHtml('pickaxe', 20), desc: '可在水邊進行垂釣挑戰。', category: 'tool', tier: 1 },
    treasure_map: { id: 'treasure_map', name: '完整藏寶圖', sprite: 'bag', icon: getPixelIconHtml('bag', 20), desc: '配合鐵鍬挖掘古代秘寶。', category: 'tool', tier: 2 },
    shovel: { id: 'shovel', name: '探勘鐵鍬', sprite: 'pickaxe', icon: getPixelIconHtml('pickaxe', 20), desc: '裝備後可於草地挖掘寶藏。', category: 'tool', tier: 2 },
    battery: { id: 'battery', name: '魔力電池', sprite: 'gem', icon: getPixelIconHtml('gem', 20), desc: '啟動發條要塞的電子閘門。', category: 'tool', tier: 2 },
    gas_mask: { id: 'gas_mask', name: '濾毒面具', sprite: 'shield', icon: getPixelIconHtml('shield', 20), desc: '裝備後免疫沼澤毒氣。', category: 'equip', tier: 2 },
    winter_cloak: { id: 'winter_cloak', name: '禦寒毛皮斗篷', sprite: 'shield', icon: getPixelIconHtml('shield', 20), desc: '裝備後免疫暴風雪失溫。', category: 'equip', tier: 2 },
    diving_bubble: { id: 'diving_bubble', name: '避水氣泡罩', sprite: 'shield', icon: getPixelIconHtml('shield', 20), desc: '裝備後可在深海呼吸。', category: 'equip', tier: 3 },
    grappling_hook: { id: 'grappling_hook', name: '鋼索抓鉤', sprite: 'pickaxe', icon: getPixelIconHtml('pickaxe', 20), desc: '裝備後可跨越浮空島裂谷。', category: 'equip', tier: 3 },

    // 消耗品與特殊紀念碑
    bomb: { id: 'bomb', name: '開山炸藥', sprite: 'bomb', icon: getPixelIconHtml('bomb', 20), desc: '炸毀地圖上的裂縫石牆。', category: 'consumable', tier: 1 },
    fish: { id: 'fish', name: '鮮魚', sprite: 'potion', icon: getPixelIconHtml('potion', 20), desc: '食用回復 40 點 HP。', category: 'consumable', tier: 1 },
    health_potion: { id: 'health_potion', name: '初級治療藥水', sprite: 'potion', icon: getPixelIconHtml('potion', 20), desc: '立即恢復 120 點生命值 (同 CON_POTION_T1)。', category: 'consumable', tier: 1 },
    magnifier: { id: 'magnifier', name: '真實放大鏡', sprite: 'magnifier', icon: getPixelIconHtml('magnifier', 20), desc: '答題時排除兩個錯誤選項。', category: 'consumable', tier: 2 },
    smoke_bomb: { id: 'smoke_bomb', name: '遁影煙霧彈', sprite: 'bomb', icon: getPixelIconHtml('bomb', 20), desc: '戰鬥中 100% 安全撤退。', category: 'consumable', tier: 1 },
    fire_bomb: { id: 'fire_bomb', name: '爆裂火藥彈', sprite: 'bomb', icon: getPixelIconHtml('bomb', 20), desc: '戰鬥中對全體敵人轟炸 120 點傷害。', category: 'consumable', tier: 2 },
    treasure: { id: 'treasure', name: '王國秘寶箱', sprite: 'chest', icon: getPixelIconHtml('chest', 20), desc: '遺跡密室中的傳說財富。', category: 'relic_boss', tier: 3 },
    knowledge_crown: { id: 'knowledge_crown', name: '賢者王冠', sprite: 'chest', icon: getPixelIconHtml('chest', 20), desc: '擊敗創世獸神的最高榮耀。', category: 'relic_boss', tier: 5 },
    fossil_rex: { id: 'fossil_rex', name: '遠古龍骨雕像', sprite: 'stone', icon: getPixelIconHtml('stone', 20), desc: '稀有營地紀念碑擺設。', category: 'relic_boss', tier: 4 },
    golden_compass: { id: 'golden_compass', name: '星象羅盤碑', sprite: 'gem', icon: getPixelIconHtml('gem', 20), desc: '稀有營地紀念碑擺設。', category: 'relic_boss', tier: 4 },

    // 🌟 資料庫 18 件合成產出裝備與神兵 (REC_REF / REC_WPN / REC_ARM / REC_ACC / REC_CON)
    ITEM_INGOT_BRONZE: { id: 'ITEM_INGOT_BRONZE', name: '青銅錠', sprite: 'copper', icon: getPixelIconHtml('copper', 20), desc: '基礎鍛造金屬錠，用於合成 T1 武器與防具。', category: 'processed', tier: 1 },
    ITEM_INGOT_MITHRIL: { id: 'ITEM_INGOT_MITHRIL', name: '秘銀錠', sprite: 'gem', icon: getPixelIconHtml('gem', 20), desc: '蘊含魔力的金屬錠，用於合成 T3 高階裝備。', category: 'processed', tier: 3 },
    WPN_SWORD_T1: { id: 'WPN_SWORD_T1', name: '青銅長劍', sprite: 'sword', icon: getPixelIconHtml('sword', 20), desc: '[T1 武器] 物攻 +18, 攻速 1.2 (標準新手冒險長劍)', category: 'equip', tier: 1, stats: { patk: 18, aspd: 1.2 } },
    WPN_BOW_T1: { id: 'WPN_BOW_T1', name: '劇毒獵弓', sprite: 'nature_sword', icon: getPixelIconHtml('nature_sword', 20), desc: '[T1 武器] 物攻 +15, 附帶每秒 3 點中毒傷害', category: 'equip', tier: 1, stats: { patk: 15, poisonDmgPerSec: 3 } },
    WPN_GREATSWORD_T2: { id: 'WPN_GREATSWORD_T2', name: '寒鐵重劍', sprite: 'water_sword', icon: getPixelIconHtml('water_sword', 20), desc: '[T2 武器] 物攻 +55, 20% 機率造成目標緩速', category: 'equip', tier: 2, stats: { patk: 55, slowChance: 0.2 } },
    WPN_STAFF_T3: { id: 'WPN_STAFF_T3', name: '烈焰魔杖', sprite: 'fire_sword', icon: getPixelIconHtml('fire_sword', 20), desc: '[T3 武器] 魔攻 +140, 火屬性技能傷害提升 25%', category: 'equip', tier: 3, stats: { matk: 140, fireDmgBonus: 0.25 } },
    WPN_SPEAR_T4: { id: 'WPN_SPEAR_T4', name: '龍紋破城槍', sprite: 'iron_sword', icon: getPixelIconHtml('iron_sword', 20), desc: '[T4 武器] 物攻 +320, 攻擊無視目標 30% 物理防禦', category: 'equip', tier: 4, stats: { patk: 320, armorPenetration: 0.3 } },
    WPN_BLADE_T5: { id: 'WPN_BLADE_T5', name: '虛空終焉之刃', sprite: 'fire_sword', icon: getPixelIconHtml('fire_sword', 20), desc: '[T5 神兵] 物攻 +850, 附加目標最大生命 3% 真實傷害', category: 'equip', tier: 5, stats: { patk: 850, trueDmgMaxHpPct: 0.03 } },
    ARM_LEATHER_T1: { id: 'ARM_LEATHER_T1', name: '森林遊俠皮甲', sprite: 'shield', icon: getPixelIconHtml('shield', 20), desc: '[T1 防具] 防禦 +12, 閃避率 +5%', category: 'equip', tier: 1, stats: { def: 12, dodgeRate: 0.05 } },
    ARM_PLATE_T2: { id: 'ARM_PLATE_T2', name: '石像鬼板甲', sprite: 'shield', icon: getPixelIconHtml('shield', 20), desc: '[T2 防具] 防禦 +45, 受到的物理傷害減少 8%', category: 'equip', tier: 2, stats: { def: 45, physDmgReduction: 0.08 } },
    ARM_CLOAK_T3: { id: 'ARM_CLOAK_T3', name: '暗影刺客斗篷', sprite: 'shield', icon: getPixelIconHtml('shield', 20), desc: '[T3 防具] 防禦 +60, 暴擊率 +12%', category: 'equip', tier: 3, stats: { def: 60, critRate: 0.12 } },
    ARM_ROBE_T4: { id: 'ARM_ROBE_T4', name: '鳳凰涅槃法袍', sprite: 'shield', icon: getPixelIconHtml('shield', 20), desc: '[T4 防具] 防禦 +130, 魔防 +200, 致命傷原地復活', category: 'equip', tier: 4, stats: { def: 130, mdef: 200 } },
    ARM_DIVINE_T5: { id: 'ARM_DIVINE_T5', name: '創世神光聖鎧', sprite: 'shield', icon: getPixelIconHtml('shield', 20), desc: '[T5 神鎧] 防禦 +450, 全抗性 +35%, 每回合回血', category: 'equip', tier: 5, stats: { def: 450, allElementRes: 0.35 } },
    ACC_BAG_T3: { id: 'ACC_BAG_T3', name: '空間擴充背包', sprite: 'bag', icon: getPixelIconHtml('bag', 20), desc: '[T3 飾品] 背包格子上限 +30 格', category: 'equip', tier: 3, stats: { inventorySlots: 30 } },
    ACC_RING_T4: { id: 'ACC_RING_T4', name: '雷神之戒', sprite: 'gem', icon: getPixelIconHtml('gem', 20), desc: '[T4 飾品] 攻速 +20%, 普攻 15% 觸發連鎖閃電', category: 'equip', tier: 4, stats: { aspdBonus: 0.2, chainLightningChance: 0.15 } },
    ACC_AMULET_T5: { id: 'ACC_AMULET_T5', name: '時間沙漏墜飾', sprite: 'gold', icon: getPixelIconHtml('gold', 20), desc: '[T5 飾品] 所有技能 MP 消耗與冷卻縮短 30%', category: 'equip', tier: 5, stats: { cdr: 0.3 } },
    CON_POTION_T1: { id: 'CON_POTION_T1', name: '初級治療藥水', sprite: 'potion', icon: getPixelIconHtml('potion', 20), desc: '[T1 藥劑] 立即恢復 120 點生命值', category: 'consumable', tier: 1, stats: { healHp: 120 } },
    CON_ELIXIR_T4: { id: 'CON_ELIXIR_T4', name: '九轉還魂丹', sprite: 'potion', icon: getPixelIconHtml('potion', 20), desc: '[T4 聖藥] 瞬間恢復 100% HP/MP 並清除負面狀態', category: 'consumable', tier: 4, stats: { healHpPct: 1.0, healMpPct: 1.0 } }
};

// 🌟 請替換 src/data/items.js 內的 for (let i = 0; i < 300; i++) 迴圈及底部工具註冊：
for (let i = 0; i < 300; i++) {
    const num = i + 1;
    const id = `MAT_${String(num).padStart(3, '0')}`;
    const catIdx = Math.floor(i / 50);
    const withinCat = i % 50;
    const tierIdx = Math.floor(withinCat / 10);
    const withinTier = withinCat % 10;

    const catInfo = CAT_CONFIG[catIdx];
    const tier = tierIdx + 1;
    const rarityNames = ['普通', '精良', '稀有', '史詩', '傳說'];
    const rarity = rarityNames[tierIdx];
    const sellPrice = TIER_BASE_PRICE[tierIdx] + withinTier * TIER_PRICE_STEP[tierIdx];

    // 為每一款素材註冊獨一無二的專屬像素圖示 key！
    const uniqueSpriteKey = `mat_icon_${num}`;
    Base64Strings[uniqueSpriteKey] = generateDistinctMaterialSvg(num, MAT_NAMES[i], catInfo.key, tier);

    Items[id] = {
        id,
        numericId: num,
        name: MAT_NAMES[i],
        category: catInfo.key,
        categoryName: catInfo.name,
        tier,
        rarity,
        sellPrice,
        stackLimit: tier >= 4 ? 99 : 999,
        sprite: uniqueSpriteKey,
        icon: getPixelIconHtml(uniqueSpriteKey, 20),
        desc: `【${rarity}】${catInfo.name}｜售價: ${sellPrice} G`
    };
}

// 自動移除所有現有裝備與工具說明中的 [T1] ~ [T5] 字眼
Object.values(Items).forEach(it => {
    if (it && it.desc) {
        it.desc = it.desc.replace(/\[T[1-5]\s*([^\]]*)\]/g, '【$1】').replace(/T[1-5]\s*/g, '');
    }
});

// 🌟 請加在 src/data/items.js 最底部 (22 款全新合成道具：生存工具、食物料理、防具飾品)：
const NEW_CRAFTABLE_ITEMS = {
    // 基礎生存與工具
    campfire:      { id: 'campfire', name: '露營篝火', category: 'tool', tier: 1, sprite: 'campfire_icon', desc: '照亮四周並可用於烘烤食物與驅散寒氣' },
    mortar:        { id: 'mortar', name: '研磨石臼', category: 'tool', tier: 1, sprite: 'stone', desc: '將小麥與草藥研磨成粉末的必備器具' },
    empty_bottle:  { id: 'empty_bottle', name: '陶土空水瓶', category: 'tool', tier: 1, sprite: 'bottle_icon', desc: '可盛裝清澈泉水或煉製各類藥水' },
    rope:          { id: 'rope', name: '強韌麻繩', category: 'wood_plant', tier: 1, sprite: 'mat_icon_5', desc: '以藤蔓與纖維編織而成的結實繩索' },
    torch_light:   { id: 'torch_light', name: '松脂火把', category: 'tool', tier: 1, sprite: 'campfire_icon', desc: '裝備後可在黑夜或洞穴中提供照明' },
    sailboat:      { id: 'sailboat', name: '遠洋白帆船', category: 'tool', tier: 1, sprite: 'boat', desc: '持有或裝備後可直接走進海洋，化為帆船自由航行！' },
    steel_shovel:  { id: 'steel_shovel', name: '尋寶鐵鏟', category: 'tool', tier: 1, sprite: 'shovel_icon', desc: '裝備後可在沙灘或泥地挖掘埋藏的秘寶' },
    // 食物與料理 (可在右下角食物快捷欄直接食用回血)
    flour:         { id: 'flour', name: '小麥麵粉', category: 'herb_alchemy', tier: 1, sprite: 'mat_icon_59', desc: '研磨後的細緻麵粉，可用於烘焙麵包' },
    bread:         { id: 'bread', name: '香烤麵包', category: 'consumable', tier: 1, healHp: 80, healMp: 20, sprite: 'bread_icon', desc: '恢復 80 點生命值與 20 點魔力' },
    cooked_fish:   { id: 'cooked_fish', name: '炭烤鮮魚', category: 'consumable', tier: 1, healHp: 95, healMp: 15, sprite: 'fish_icon', desc: '恢復 95 點生命值與 15 點魔力' },
    berry_jam:     { id: 'berry_jam', name: '野莓果醬', category: 'consumable', tier: 1, healHp: 70, healMp: 35, sprite: 'potion', desc: '酸甜可口，恢復 70 點生命與 35 點魔力' },
    mushroom_soup: { id: 'mushroom_soup', name: '鮮菇濃湯', category: 'consumable', tier: 1, healHp: 130, healMp: 40, sprite: 'potion', desc: '熱騰騰的濃湯，恢復 130 點生命與 40 點魔力' },
    roast_meat:    { id: 'roast_meat', name: '黃金烤肉排', category: 'consumable', tier: 2, healHp: 200, healMp: 50, sprite: 'bread_icon', desc: '香氣四溢，大幅恢復 200 點生命與 50 點魔力' },
    energy_juice:  { id: 'energy_juice', name: '薄荷活力飲', category: 'consumable', tier: 2, healHp: 110, healMp: 90, sprite: 'potion', desc: '瞬間恢復 110 點生命與 90 點魔力' },
    // 進階裝備與防具
    wood_shield:   { id: 'wood_shield', name: '橡木圓盾', category: 'equip', tier: 1, stats: { def: 18, hp: 40 }, sprite: 'shield', desc: '物理防禦 +18，最大生命 +40' },
    leather_boots: { id: 'leather_boots', name: '旅人皮靴', category: 'equip', tier: 1, stats: { def: 12, hp: 30 }, sprite: 'bag', desc: '物理防禦 +12，最大生命 +30' },
    iron_helm:     { id: 'iron_helm', name: '精鐵騎士盔', category: 'equip', tier: 2, stats: { def: 32, hp: 80 }, sprite: 'shield', desc: '物理防禦 +32，最大生命 +80' },
    hunter_armor:  { id: 'hunter_armor', name: '森林獵人皮甲', category: 'equip', tier: 1, stats: { def: 22, patk: 8 }, sprite: 'shield', desc: '物理防禦 +22，物理攻擊 +8' },
    bone_ring:     { id: 'bone_ring', name: '獸骨戰戒', category: 'equip', tier: 1, stats: { patk: 12, matk: 12 }, sprite: 'gem', desc: '物理與魔法攻擊 +12' },
    explorer_cape: { id: 'explorer_cape', name: '探險家披風', category: 'equip', tier: 2, stats: { def: 28, hp: 100 }, sprite: 'shield', desc: '物理防禦 +28，最大生命 +100' },
    sea_compass:   { id: 'sea_compass', name: '航海家羅盤', category: 'equip', tier: 2, stats: { patk: 20, def: 20 }, sprite: 'coin', desc: '全攻防 +20，指引群島航向的秘寶' }
};

for (const [k, v] of Object.entries(NEW_CRAFTABLE_ITEMS)) {
    v.icon = getPixelIconHtml(v.sprite || 'gem', 20);
    Items[k] = v;
}
if (Items.fish) {
    Items.fish.category = 'consumable';
    Items.fish.healHp = 45;
    Items.fish.sprite = 'fish_icon';
    Items.fish.icon = getPixelIconHtml('fish_icon', 20);
}