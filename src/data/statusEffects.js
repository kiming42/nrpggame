// src/data/statusEffects.js
// 🌟 完整收錄 rpg_status_effects_buffs.json (22 種 Buff / DoT / Debuff / CC 狀態效果與計算公式)

export const StatusCategories = {
    buff: "正向增益效果（護盾、加速、隱身、屬性提升、霸體）",
    dot: "持續傷害效果（中毒、灼燒、流血、凋零）",
    debuff: "屬性削弱與環境減益（破甲、緩速、失明、禁魔）",
    cc: "硬性控制與特殊異常（暈眩、冰凍、石化、定身、恐懼、混亂）"
};

export const StatusFormulas = {
    calcDotTick(baseValue, scalingStat, scalingFactor, currentStacks = 1) {
        return Math.floor((baseValue + scalingStat * scalingFactor) * currentStacks);
    },
    calcStatModifier(baseStat, sumOfBuffMultipliers = 0, sumOfDebuffMultipliers = 0) {
        return Math.floor(baseStat * Math.max(0.2, 1 + sumOfBuffMultipliers - sumOfDebuffMultipliers));
    },
    isCleansable(effect) {
        return effect && effect.isCleansable === true;
    }
};

export const StatusEffectDatabase = [
    // ==================== 正向增益 Buff (7 種) ====================
    {
        statusId: "BUFF_TITAN_SHIELD", name: "泰坦護盾", category: "buff", icon: "🛡️", maxStacks: 1, defaultDurationSec: 8.0, isCleansable: false,
        sourceExamples: ["SK_EB_05 (泰坦隕落)", "MON_T2_BOSS_01 (骷髏王)", "MON_T3_008 (深淵幽靈)"],
        mechanics: { shieldMaxHpPct: 0.25, absorbDamage: true },
        desc: "獲得相當於最大生命值 25% 的臨時護盾，優先吸收所有類型的傷害。"
    },
    {
        statusId: "BUFF_CONTROL_IMMUNE", name: "鋼鐵霸體", category: "buff", icon: "⚔️", maxStacks: 1, defaultDurationSec: 3.0, isCleansable: false,
        sourceExamples: ["SK_EB_03 (鋼鐵旋風)"],
        mechanics: { immuneToCategories: ["cc"], moveSpeedMultiplier: 1.0 },
        desc: "持續旋轉或蓄力期間，免疫所有硬性控制效果（暈眩、冰凍、擊飛、定身）。"
    },
    {
        statusId: "BUFF_SHADOW_STEALTH", name: "暗影潛行", category: "buff", icon: "👤", maxStacks: 1, defaultDurationSec: 3.0, isCleansable: false,
        sourceExamples: ["SK_GR_03 (暗影瞬步)", "ARM_CLOAK_T3 (暗影刺客斗篷)", "MON_T3_005 (暗影豹)"],
        mechanics: { untargetableByNormal: true, guaranteedCritNextHit: true, dodgeRateBonus: 0.25, moveSpeedBonusWithCloak: 0.3 },
        desc: "進入半透明潛行狀態，閃避率提升 25%，且下一次攻擊必定暴擊。"
    },
    {
        statusId: "BUFF_ARCANE_SURGE", name: "奧術迴流", category: "buff", icon: "✨", maxStacks: 4, defaultDurationSec: 10.0, isCleansable: false,
        sourceExamples: ["SK_SA_02 (奧術迴流)"],
        mechanics: { instantMpRestoreMaxPct: 0.03, skillDamageBonusPerStack: 0.05 },
        desc: "施放技能後觸發，每層使下一個技能傷害提高 5%，最高疊加 4 層（+20%）。"
    },
    {
        statusId: "BUFF_STONE_GUARD", name: "石化防禦", category: "buff", icon: "🗿", maxStacks: 1, defaultDurationSec: 5.0, isCleansable: true,
        sourceExamples: ["MON_T2_004 (石像鬼-石化防禦)"],
        mechanics: { physDamageReduction: 0.5, removeOnHit: true },
        desc: "靜止時化為堅硬岩石，受到的物理傷害減少 50%，受到攻擊後解除。"
    },
    {
        statusId: "BUFF_BERSERK", name: "狂化覺醒", category: "buff", icon: "🔥", maxStacks: 1, defaultDurationSec: 12.0, isCleansable: false,
        sourceExamples: ["MON_T1_002 (森林野狼)", "MON_T3_003 (烈焰亞龍)", "MON_T4_004 (芬里爾狂狼)"],
        mechanics: { atkBonus: 0.25, aspdBonus: 0.5, moveSpeedBonus: 0.5 },
        desc: "激發野性潛能，攻擊力提升 25%，攻擊速度與移動速度大幅提升。"
    },
    {
        statusId: "BUFF_TROLL_REGEN", name: "極速再生", category: "buff", icon: "💚", maxStacks: 1, defaultDurationSec: 10.0, isCleansable: true,
        sourceExamples: ["MON_T3_009 (巨魔再生者)", "ARM_DIVINE_T5 (創世神光聖鎧)"],
        mechanics: { hpRegenMaxPctPerSec: 0.03, dispelledByElement: "fire" },
        desc: "每回合自動恢復 3% 最大生命值（巨魔的再生若受到火屬性傷害則會暫時中斷）。"
    },

    // ==================== 持續傷害 DoT (4 種) ====================
    {
        statusId: "DOT_POISON_VENOM", name: "劇毒與神經毒素", category: "dot", icon: "☠️", maxStacks: 3, defaultDurationSec: 4.0, tickIntervalSec: 1.0, isCleansable: true,
        sourceExamples: ["WPN_BOW_T1 (劇毒獵弓)", "SK_GR_02 (致命塗毒)", "MON_T1_005 (洞穴毒蜘蛛)", "MON_T3_006 (九頭蛇)", "MON_T5_004 (耶夢加得)"],
        mechanics: { damageType: "true_damage", baseDamagePerTick: 3, agiScalingFactor: 0.2, detonateBySkill: "SK_GR_05" },
        desc: "每回合造成基於敏捷 20% 的真實傷害，最高可疊加 3 層；可被「幻影殺陣」引爆造成雙倍傷害。"
    },
    {
        statusId: "DOT_BURN_IGNITE", name: "烈焰灼燒", category: "dot", icon: "🔥", maxStacks: 3, defaultDurationSec: 4.0, tickIntervalSec: 1.0, isCleansable: true,
        sourceExamples: ["SK_SA_01 (爆裂火球)", "MON_T3_001 (地獄犬)"],
        mechanics: { damageType: "magic_fire", matkScalingFactor: 0.25, preventsUndeadRevive: true, stopsTrollRegen: true },
        desc: "每回合造成 25% 魔法攻擊力的火屬性傷害，並可阻止「骷髏兵」復活及打斷「巨魔」再生。"
    },
    {
        statusId: "DOT_BLEED_LACERATE", name: "撕裂流血", category: "dot", icon: "🩸", maxStacks: 5, defaultDurationSec: 5.0, tickIntervalSec: 1.0, isCleansable: true,
        sourceExamples: ["MON_T2_002 (劍齒虎-撕裂)"],
        mechanics: { damageType: "physical", patkScalingFactor: 0.18, extraDamageWhenMoving: 1.5 },
        desc: "傷口持續流血，每回合造成物理持續傷害。"
    },
    {
        statusId: "DOT_DEATH_DECAY", name: "死亡凋零", category: "dot", icon: "💀", maxStacks: 1, defaultDurationSec: 6.0, tickIntervalSec: 1.0, isCleansable: true,
        sourceExamples: ["MON_T4_007 (骨龍殘骸-死亡凋零)"],
        mechanics: { damageType: "dark_true", maxHpPctPerSec: 0.025, healingReceivedReduction: 0.3 },
        desc: "受黑暗死氣侵蝕，每回合損失 2.5% 最大生命值，且受到的治療效果降低 30%。"
    },

    // ==================== 削弱減益 Debuff (5 種) ====================
    {
        statusId: "DEBUFF_ARMOR_BREAK", name: "破甲碎裂", category: "debuff", icon: "💔", maxStacks: 2, defaultDurationSec: 5.0, isCleansable: true,
        sourceExamples: ["SK_EB_01 (破甲順劈)", "MON_T4_002 (比蒙巨獸-泰坦之握)"],
        mechanics: { defReductionPerStack: 0.15 },
        desc: "護甲結構受損，每層降低目標 15% 物理防禦力（最高疊加 2 層即 -30% 防禦）。"
    },
    {
        statusId: "DEBUFF_CHILL_SLOW", name: "冰霜緩速", category: "debuff", icon: "❄️", maxStacks: 1, defaultDurationSec: 3.0, isCleansable: true,
        sourceExamples: ["WPN_GREATSWORD_T2 (寒鐵重劍)", "SK_GR_04 (漫天箭雨)", "MON_T2_001 (大地巨熊)", "MON_T4_003 (利維坦海獸)"],
        mechanics: { moveSpeedReduction: 0.3, aspdReduction: 0.15 },
        desc: "移動速度降低 20%~40%，攻擊速度降低 15%。"
    },
    {
        statusId: "DEBUFF_BLIND_CURSE", name: "厄運致盲", category: "debuff", icon: "👁️", maxStacks: 1, defaultDurationSec: 5.0, isCleansable: true,
        sourceExamples: ["MON_T1_008 (腐臭烏鴉)", "MAP_T2_CANYON (峽谷沙塵暴)"],
        mechanics: { accuracyReduction: 0.15 },
        desc: "視線受阻或受厄運影響，物理與遠程攻擊命中率降低 10%~15%。"
    },
    {
        statusId: "DEBUFF_SILENCE_SEAL", name: "末日禁魔", category: "debuff", icon: "🔇", maxStacks: 1, defaultDurationSec: 4.0, isCleansable: true,
        sourceExamples: ["MON_T5_005 (絕望黑羽·尼德霍格-末日之翼)"],
        mechanics: { disableActiveSkills: true, allowBasicAttack: true },
        desc: "封印體內魔力流動，期間無法施放主動與奧義技能，僅能進行普通斬擊。"
    },
    {
        statusId: "DEBUFF_HOLY_DOMAIN", name: "神聖領域威壓", category: "debuff", icon: "⏳", maxStacks: 1, defaultDurationSec: 6.0, isCleansable: true,
        sourceExamples: ["MON_T5_009 (天界創世天使-神聖領域)"],
        mechanics: { cooldownPenaltyMultiplier: 1.5 },
        desc: "受神聖法則壓制，技能冷卻與魔力負荷增加 50%。"
    },

    // ==================== 硬性控制 CC (6 種) ====================
    {
        statusId: "CC_STUN_KNOCKUP", name: "震盪暈眩", category: "cc", icon: "💫", maxStacks: 1, defaultDurationSec: 2.0, isCleansable: true,
        sourceExamples: ["SK_EB_05 (泰坦隕落)", "MON_T1_BOSS_01 (史萊姆王)", "MON_T3_003 (烈焰亞龍)", "MON_T4_009 (泰坦巨人)"],
        mechanics: { canMove: false, canAttack: false, canCast: false },
        desc: "遭受重擊或擊飛，無法行動 1 回合。"
    },
    {
        statusId: "CC_FREEZE_NOVA", name: "極寒冰凍", category: "cc", icon: "🧊", maxStacks: 1, defaultDurationSec: 2.5, isCleansable: true,
        sourceExamples: ["SK_SA_03 (極寒冰環)", "MON_T3_007 (巫妖學徒-冰霜禁錮)"],
        mechanics: { canMove: false, canAttack: false, canCast: false, critDamageTakenBonus: 0.3 },
        desc: "被寒冰封鎖無法反擊；處於冰凍狀態下受到攻擊時，承受的暴擊傷害額外提升 30%。"
    },
    {
        statusId: "CC_PETRIFY_GAZE", name: "凝視石化", category: "cc", icon: "🪨", maxStacks: 1, defaultDurationSec: 1.5, isCleansable: true,
        sourceExamples: ["MON_T2_006 (美杜莎蛇女-石化視線)"],
        mechanics: { canMove: false, canAttack: false, canCast: false, physDamageTakenMultiplier: 1.25 },
        desc: "身體化為石頭無法行動，石化期間承受物理傷害增加 25%。"
    },
    {
        statusId: "CC_ROOT_PARALYZE", name: "束縛與麻痺", category: "cc", icon: "🕸️", maxStacks: 1, defaultDurationSec: 2.0, isCleansable: true,
        sourceExamples: ["MON_T2_005 (鐵甲巨蛛-蛛網束縛)", "MON_T2_003 (雙足飛龍-毒尾刺)"],
        mechanics: { canMove: false, canAttack: true, canCast: true, dodgeDisabled: true },
        desc: "雙足被蛛網或麻痺毒素定在原地無法閃避。"
    },
    {
        statusId: "CC_FEAR_PANIC", name: "深淵恐懼", category: "cc", icon: "😱", maxStacks: 1, defaultDurationSec: 2.0, isCleansable: true,
        sourceExamples: ["MON_T4_008 (深淵惡魔領隊-地獄之門)"],
        mechanics: { forcedRandomMovement: true, canAttack: false, canCast: false },
        desc: "陷入極度恐慌，降低防禦與命中。"
    },
    {
        statusId: "CC_MADNESS_INVERT", name: "精神瘋狂（方向反轉）", category: "cc", icon: "🌀", maxStacks: 1, defaultDurationSec: 3.0, isCleansable: true,
        sourceExamples: ["MON_T5_006 (舊日支配者觸手-精神瘋狂)"],
        mechanics: { invertControls: true, mpDrainMaxPctPerSec: 0.05 },
        desc: "受克蘇魯低語侵蝕，每回合流失 5% 魔力值。"
    }
];

export function getStatusEffectDef(statusId) {
    return StatusEffectDatabase.find(s => s.statusId === statusId) || null;
}

// 為目標單位（玩家或怪物）附加或疊加狀態效果
export function applyStatusToUnit(unit, statusId, stacksToAdd = 1, customTurns = 2) {
    if (!unit) return null;
    if (!unit.statuses) unit.statuses = [];
    const def = getStatusEffectDef(statusId);
    if (!def) return null;

    // 若單位擁有「鋼鐵霸體 (BUFF_CONTROL_IMMUNE)」，免疫所有 cc 類別控制效果
    if (def.category === 'cc' && unit.statuses.some(s => s.statusId === 'BUFF_CONTROL_IMMUNE')) {
        return { blockedByImmune: true, def };
    }

    const existing = unit.statuses.find(s => s.statusId === statusId);
    if (existing) {
        existing.stacks = Math.min(def.maxStacks || 1, existing.stacks + stacksToAdd);
        existing.turnsLeft = Math.max(existing.turnsLeft, customTurns);
    } else {
        unit.statuses.push({
            statusId: def.statusId,
            name: def.name,
            icon: def.icon,
            category: def.category,
            isCleansable: def.isCleansable,
            stacks: Math.min(def.maxStacks || 1, stacksToAdd),
            turnsLeft: customTurns
        });
    }
    return { applied: true, def };
}

// 清除所有可淨化的負面狀態 (如服用九轉還魂丹)
export function cleanseUnitDebuffs(unit) {
    if (!unit || !Array.isArray(unit.statuses)) return 0;
    const before = unit.statuses.length;
    unit.statuses = unit.statuses.filter(s => !(s.category !== 'buff' && StatusFormulas.isCleansable(s)));
    return before - unit.statuses.length;
}