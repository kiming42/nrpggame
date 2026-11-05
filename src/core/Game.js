// src/core/Game.js
import { eventBus } from './EventBus.js';
import { testMap, level2Map, bossMap, campMap, poisonMap, iceMap, deepSeaMap, clockworkMap, floatingMap } from '../data/maps.js'; 
import { Items } from '../data/items.js';
import { SkillTrees, RPGFormulas } from '../data/recipes.js';
import { MonsterDatabase, spawnMonsterInstance, getEncounterFormationByTier } from '../data/monsters.js';
import { QuestDatabase, QuestFormulas } from '../data/quests.js';
import { NPCDatabase, ShopDatabase, ShopFormulas } from '../data/npcsAndShops.js';
import { applyStatusToUnit, cleanseUnitDebuffs } from '../data/statusEffects.js';
import { Player } from '../entities/Player.js';
import { CanvasRenderer } from '../view/CanvasRenderer.js';
import { MovementSystem } from '../systems/MovementSystem.js';
import { QuestionSystem } from '../systems/QuestionSystem.js';
import { CombatUI } from '../view/CombatUI.js';
import { UIManager } from '../view/UIManager.js';
import { AudioSystem } from '../systems/AudioSystem.js';
import { getPixelIconHtml } from '../data/assets.js';

function stripTierLabel(str) {
    if (!str) return '';
    return String(str)
        .replace(/\[T[1-5]\s*([^\]]*)\]/g, '$1')
        .replace(/\(T[1-5][^)]*\)/g, '')
        .replace(/（T[1-5][^）]*）/g, '')
        .replace(/T[1-5]\s*[：:]?\s*/g, '')
        .trim();
}

export class Game {
    constructor() {
        const p = new Player(2, 2);
        p.name = localStorage.getItem('pendingHeroName') || 'Justin';
        p.level = 1;
        p.exp = 0;
        p.gold = 500;
        p.skillPoints = 2;
        p.freeStatPoints = 5;
        p.stats = { str: 10, agi: 10, int: 10, vit: 10 };
        p.activeBranch = 'earth_blademaster';
        p.jobTitle = '大地劍聖';
        // 預設只解鎖三大流派的第 1 招基本技能，其餘進階技能需於技能研發頁解鎖
        p.treeLevels = { SK_EB_01: 1, SK_GR_01: 1, SK_SA_01: 1 };
        p.affixes = {};
        p.statuses = [];
        p.shieldHp = 0;

        // 開局預設贈送基礎生存物資，方便立即體驗製作工坊與右下角快捷食物
        p.inventory = {
            MAT_001: 6,
            MAT_004: 3,
            MAT_005: 4,
            MAT_006: 3,
            MAT_051: 6,
            MAT_052: 3,
            MAT_054: 3,
            MAT_055: 4,
            MAT_201: 4,
            MAT_210: 3,
            CON_POTION_T1: 3,
            cooked_fish: 2,
            truth_fragment: 5
        };

        p.recalcStats = () => {
            const st = p.stats || { str: 10, agi: 10, int: 10, vit: 10 };
            const oldMaxHp = p.maxHp || 160;
            let equipHpBonus = 0;
            p.equipment.forEach(eqId => {
                const it = Items[eqId];
                if (it && it.stats && it.stats.hp) equipHpBonus += it.stats.hp;
            });
            p.maxHp = RPGFormulas.getMaxHp(p.level || 1, st.vit) + equipHpBonus;
            if (p.hp > p.maxHp || oldMaxHp !== p.maxHp) {
                p.hp = Math.min(p.maxHp, p.hp + Math.max(0, p.maxHp - oldMaxHp));
            }
            p.maxMp = RPGFormulas.getMaxMp(p.level || 1, st.int);
            if (p.mp === undefined) p.mp = p.maxMp;
        };

        p.calcAtk = () => {
            const st = p.stats || { str: 10, agi: 10, int: 10, vit: 10 };
            let wpnPatk = 0;
            p.equipment.forEach(eqId => {
                const it = Items[eqId];
                if (it && it.stats && it.stats.patk) wpnPatk += it.stats.patk;
                if (eqId === 'wooden_sword') wpnPatk += 12;
                if (eqId === 'iron_sword') wpnPatk += 25;
                if (['fire_sword', 'water_sword', 'nature_sword'].includes(eqId)) wpnPatk += 35;
            });
            let base = RPGFormulas.getPatk(p.level || 1, st.str, st.agi, wpnPatk);
            if (Array.isArray(p.statuses) && p.statuses.some(s => s.statusId === 'BUFF_BERSERK')) {
                base = Math.floor(base * 1.25);
            }
            return base;
        };

        p.calcMatk = () => {
            const st = p.stats || { str: 10, agi: 10, int: 10, vit: 10 };
            let wpnMatk = 0;
            p.equipment.forEach(eqId => {
                const it = Items[eqId];
                if (it && it.stats && it.stats.matk) wpnMatk += it.stats.matk;
            });
            return RPGFormulas.getMatk(p.level || 1, st.int, wpnMatk);
        };

        p.calcDef = () => {
            let def = 25 + ((p.level || 1) - 1) * 6;
            p.equipment.forEach(eqId => {
                const it = Items[eqId];
                if (it && it.stats && it.stats.def) def += it.stats.def;
                if (eqId === 'truth_shield') def += 25;
                if (eqId === 'knight_armor') def += 45;
            });
            const passLv = (p.treeLevels && p.treeLevels.SK_EB_02) || 0;
            if (p.activeBranch === 'earth_blademaster' && passLv > 0) {
                def = Math.floor(def * (1 + 0.1 * passLv));
            }
            if (Array.isArray(p.statuses)) {
                const brk = p.statuses.find(s => s.statusId === 'DEBUFF_ARMOR_BREAK');
                if (brk) def = Math.floor(def * Math.max(0.4, 1 - 0.15 * brk.stacks));
            }
            return def;
        };

        p.recalcStats();
        p.hp = p.maxHp;
        p.mp = p.maxMp;

        this.gameState = {
            currentState: 'TITLE_SCREEN',
            currentMap: testMap,
            player: p,
            crops: [],
            respawnQueue: [],
            weather: 'CLEAR',
            encyclopedia: [],
            mistakes: [],
            questProgress: {},
            completedQuests: [],
            unlockedRecipes: [],
            unlockedTier: 1,
            activeShopId: 'SHOP_T1_GENERAL',
            buildMode: false,
            buildIndex: 0
        };

        this.lastTime = 0;
        this.gameTime = 0; 
        this.weatherTimer = 0;
        this.respawnTimer = 0;
        this.envHazardTimer = 0; 
        this.fishingCursor = 0;
        this.fishingDirection = 1;
        this.fishingJustStarted = false; 
        this.dialogCallback = null;

        this.combatState = {
            turn: 1,
            chapterName: '第一章：翠綠新手荒島',
            enemies: [],
            selectedTargetIndex: 0,
            selectedSkill: 'slash',
            isBoss: false,
            isGoblin: false,
            isRevenge: false,
            goblinTurnsLeft: 3
        };

        this.renderer = new CanvasRenderer('gameCanvas');
        this.movementSystem = new MovementSystem(this.gameState);
        this.questionSystem = new QuestionSystem();
        this.combatUI = new CombatUI();
        this.uiManager = new UIManager(this.gameState, this.questionSystem);
        this.movementSystem.uiManager = this.uiManager;
        
        try { this.audioSystem = new AudioSystem(); } catch (e) { this.audioSystem = null; }

        eventBus.getItemsData = () => Items; 
        this.loadGame();
        if (localStorage.getItem('pendingHeroName')) {
            this.gameState.player.name = localStorage.getItem('pendingHeroName');
            localStorage.removeItem('pendingHeroName');
        }
        this.bindUIEvents();
        this.bindMerchantEvents(); 

        window.addEventListener('keydown', (e) => {
            if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;

            const dialogLayer = document.getElementById('pixel-dialog-layer');
            if (dialogLayer && dialogLayer.style.display === 'flex') {
                if (e.key === ' ' || e.key === 'Enter' || e.key === 'Escape') {
                    e.preventDefault();
                    this.closePixelDialog();
                    return;
                }
            }

            if (this.gameState.currentState === 'TITLE_SCREEN' || this.gameState.currentState === 'ENDING_SCREEN' || this.gameState.currentState === 'MERCHANT') return;
            if (this.audioSystem && typeof this.audioSystem.resume === 'function') this.audioSystem.resume(); 
            
            if (this.gameState.currentState === 'COMBAT') {
                if (e.key === '1') this.handleItemMagnifier(e);
                else if (e.key === '2') this.handleItemSmoke(e);
                else if (e.key === '3') this.handleItemBomb(e);
                return;
            }

            if (this.gameState.currentState === 'FISHING' && e.key === ' ') {
                if (this.fishingJustStarted) { this.fishingJustStarted = false; return; }
                this.catchFish();
                return;
            }

            if ((e.key === 'f' || e.key === 'F') && this.gameState.currentState === 'EXPLORATION') {
                this.useHealItem();
            }
            if ((e.key === 'i' || e.key === 'I') && this.gameState.currentState !== 'FISHING') {
                this.uiManager.toggle();
            }
        });

        eventBus.on('SHOW_TOAST', (msg) => this.showToast(stripTierLabel(msg)));
        eventBus.on('SHOW_DIALOG', ({ title, text, callback }) => this.showPixelDialog(stripTierLabel(title), stripTierLabel(text), callback));
        eventBus.on('SPAWN_PARTICLES', ({ col, row, color, count }) => this.renderer.spawnParticles(col, row, color, count || 12));

        eventBus.on('PLAY_SOUND', (type) => { 
            if (!this.audioSystem) return;
            if (type === 'collect') this.audioSystem.playCollect();
            else if (type === 'bump') this.audioSystem.playBump(); 
        });
        
        eventBus.on('OPEN_MERCHANT', () => this.openMerchantLayer());
// 🌟 請替換 src/core/Game.js 內的 START_FISHING 與 CATCH_FISH_NOW 監聽器：
        eventBus.on('CATCH_FISH_NOW', () => {
            if (this.gameState.currentState === 'FISHING') this.catchFish();
        });

        eventBus.on('START_FISHING', () => {
            this.gameState.currentState = 'FISHING';
            this.fishingJustStarted = true;
            setTimeout(() => { this.fishingJustStarted = false; }, 180);

            const el = document.getElementById('fishing-layer');
            if (el) {
                el.style.display = 'flex';
                // 自動在垂釣視窗內注入手機專用「🎣 立即拉竿！」綠色大按鈕，並支援直接點擊視窗停針！
                if (!document.getElementById('btn-mobile-pull-rod')) {
                    const cancelBtn = document.getElementById('btn-cancel-fishing');
                    if (cancelBtn && cancelBtn.parentElement) {
                        const pullBtn = document.createElement('button');
                        pullBtn.id = 'btn-mobile-pull-rod';
                        pullBtn.className = 'px-btn success';
                        pullBtn.style.cssText = 'width:100%; padding:14px; font-size:18px; font-weight:900; margin-bottom:10px; background:#16a34a; color:#fff; border:3px solid #052e16; border-radius:6px; cursor:pointer; box-shadow:0 4px 0 #052e16;';
                        pullBtn.innerText = '🎣 立即拉竿！(點擊此處停針)';
                        const pullHandler = (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            this.catchFish();
                        };
                        pullBtn.addEventListener('touchstart', pullHandler, { passive: false });
                        pullBtn.addEventListener('mousedown', pullHandler);
                        cancelBtn.parentElement.insertBefore(pullBtn, cancelBtn);
                    }

                    // 點擊垂釣彈窗背景任何位置（除「收竿離開」外）也能直接停針！
                    el.addEventListener('touchstart', (e) => {
                        if (e.target.id === 'btn-cancel-fishing') return;
                        if (this.gameState.currentState === 'FISHING' && !this.fishingJustStarted) {
                            e.preventDefault();
                            this.catchFish();
                        }
                    }, { passive: false });
                }
            }
            this.fishingCursor = 0;
            this.fishingDirection = 1;
            this.fishingLoop();
        });
        eventBus.on('PLANT_SEED', (pos) => {
            this.gameState.crops.push({ mapId: this.gameState.currentMap.id, row: pos.row, col: pos.col, plantTime: this.gameTime });
            this.saveGame();
        });
        eventBus.on('SAVE_GAME', () => { this.saveGame(); });

        // 採集或完成事件時即時檢查升等
        eventBus.on('CHECK_LEVEL_UP', () => {
            this.checkAndApplyLevelUp(true);
        });

        eventBus.on('RECORD_CRAFT', ({ recipeId, itemId }) => {
            this.recordQuestCraft(recipeId, itemId);
        });
        eventBus.on('COMPLETE_QUEST', (questId) => {
            this.completeQuest(questId);
        });
        eventBus.on('QUEST_TARGET_ENCOUNTER', ({ targetMonsterId, questTitle }) => {
            const tpl = MonsterDatabase.find(m => m.id === targetMonsterId) || MonsterDatabase[0];
            const enemies = [];
            const count = tpl.isBoss ? 1 : 3;
            for (let i = 0; i < count; i++) {
                enemies.push(spawnMonsterInstance(tpl));
            }
            if (tpl.isBoss) {
                const minionTpl = MonsterDatabase.find(m => m.tier === tpl.tier && !m.isBoss) || MonsterDatabase[0];
                enemies.unshift(spawnMonsterInstance(minionTpl));
                enemies.push(spawnMonsterInstance(minionTpl));
            }
            this.initCombat({
                enemies,
                isBoss: !!tpl.isBoss,
                isGoblin: false,
                isRevenge: false,
                chapterOverride: `委託討伐：${stripTierLabel(questTitle)}`
            });
        });

        eventBus.on('DIG_TREASURE', () => {
            const p = this.gameState.player;
            if ((p.inventory['treasure_map'] || 0) > 0) {
                p.removeItem('treasure_map', 1);
                if (this.audioSystem) this.audioSystem.playWin();
                const rareItem = Math.random() < 0.5 ? 'fossil_rex' : 'golden_compass';
                p.addItem(rareItem, 1);
                this.showToast(`🎉 挖掘出傳說秘寶：【${Items[rareItem].name}】！`);
            } else {
                if (this.audioSystem) this.audioSystem.playCollect();
                if (Math.random() < 0.45) {
                    p.addItem('MAT_059', 1);
                    this.showToast('挖掘地面：獲得【石英砂 x1】');
                } else {
                    this.showToast('挖掘地面：獲得【圓石 x1】');
                    p.addItem('MAT_051', 1);
                }
            }
            this.updateHUD();
        });

        eventBus.on('CHANGE_MAP', (targetMapId) => {
            if (this.audioSystem) this.audioSystem.playPortal(); 
            if (targetMapId === 'level2Map') { this.gameState.currentMap = level2Map; this.gameState.player.col = 2; this.gameState.player.row = 1; } 
            else if (targetMapId === 'level2Map_from_poison') { this.gameState.currentMap = level2Map; this.gameState.player.col = 9; this.gameState.player.row = 9; } 
            else if (targetMapId === 'campMap' || targetMapId === 'campMap_from_death') { this.gameState.currentMap = campMap; this.gameState.player.col = 3; this.gameState.player.row = 5; } 
            else if (targetMapId === 'starter_island_from_camp') { this.gameState.currentMap = testMap; this.gameState.player.col = 8; this.gameState.player.row = 2; } 
            else if (targetMapId === 'starter_island') { this.gameState.currentMap = testMap; this.gameState.player.col = 8; this.gameState.player.row = 7; }
            else if (targetMapId === 'poisonMap') { this.gameState.currentMap = poisonMap; this.gameState.player.col = 2; this.gameState.player.row = 1; } 
            else if (targetMapId === 'poisonMap_from_ice') { this.gameState.currentMap = poisonMap; this.gameState.player.col = 9; this.gameState.player.row = 9; } 
            else if (targetMapId === 'iceMap') { this.gameState.currentMap = iceMap; this.gameState.player.col = 2; this.gameState.player.row = 1; } 
            else if (targetMapId === 'ice_ruins_from_sea') { this.gameState.currentMap = iceMap; this.gameState.player.col = 9; this.gameState.player.row = 9; }
            else if (targetMapId === 'deepSeaMap') { this.gameState.currentMap = deepSeaMap; this.gameState.player.col = 2; this.gameState.player.row = 1; }
            else if (targetMapId === 'deep_sea_from_clock') { this.gameState.currentMap = deepSeaMap; this.gameState.player.col = 9; this.gameState.player.row = 9; }
            else if (targetMapId === 'clockworkMap') { this.gameState.currentMap = clockworkMap; this.gameState.player.col = 2; this.gameState.player.row = 1; }
            else if (targetMapId === 'clockwork_from_float') { this.gameState.currentMap = clockworkMap; this.gameState.player.col = 9; this.gameState.player.row = 9; }
            else if (targetMapId === 'floatingMap') { this.gameState.currentMap = floatingMap; this.gameState.player.col = 2; this.gameState.player.row = 1; }
            else if (targetMapId === 'floating_from_boss') { this.gameState.currentMap = floatingMap; this.gameState.player.col = 9; this.gameState.player.row = 9; }
            else if (targetMapId === 'bossMap') { this.gameState.currentMap = bossMap; this.gameState.player.col = 7; this.gameState.player.row = 12; } 
            
            this.gameState.player.isSailing = false;
            this.forceUnlockExplorationControl();
            this.showToast(`抵達：${stripTierLabel(this.gameState.currentMap.chapterName || this.gameState.currentMap.id)}`);
            this.saveGame(); 
        });

        eventBus.on('UPDATE_SUBJECTS', (subjects) => { this.questionSystem.setActiveSubjects(subjects); });

        eventBus.on('SELECT_COMBAT_TARGET', (idx) => {
            if (this.combatState.enemies[idx] && this.combatState.enemies[idx].hp > 0) {
                this.combatState.selectedTargetIndex = idx;
                this.combatUI.updateStatus({ ...this.combatState, player: this.gameState.player });
            }
        });

        eventBus.on('SELECT_COMBAT_SKILL', (skillId) => {
            this.combatState.selectedSkill = skillId;
            this.combatUI.updateStatus({ ...this.combatState, player: this.gameState.player });
        });
        
        eventBus.on('ENCOUNTER_ENEMY', (mode) => { 
            const mapTier = this.gameState.currentMap.tier || 1;
            const isTrial = (mode === 'obelisk_trial');
            const enemies = getEncounterFormationByTier(mapTier, isTrial);

            this.initCombat({
                enemies,
                isBoss: isTrial,
                isGoblin: false,
                isRevenge: isTrial
            });
        });
        
        eventBus.on('BOSS_ENCOUNTER', () => { 
            const enemies = getEncounterFormationByTier(5, true);
            this.initCombat({
                enemies,
                isBoss: true, isGoblin: false, isRevenge: false
            });
        });
        
        eventBus.on('GOBLIN_ENCOUNTER', () => { 
            const gobTpl = MonsterDatabase.find(m => m.id === 'MON_T1_007') || MonsterDatabase[0];
            const gobInst = spawnMonsterInstance(gobTpl, (this.gameState.player.level || 1) + 2);
            gobInst.isGoblin = true;
            gobInst.weaknessText = '限時3回合';
            this.initCombat({
                enemies: [gobInst],
                isBoss: false, isGoblin: true, isRevenge: false
            });
        });

        eventBus.on('REVENGE_ENCOUNTER', () => {
            if (!this.gameState.mistakes || this.gameState.mistakes.length === 0) return;
            const mapTier = this.gameState.currentMap.tier || 1;
            const enemies = getEncounterFormationByTier(mapTier, false);
            this.initCombat({
                enemies,
                isBoss: false, isGoblin: false, isRevenge: true
            });
        });

        eventBus.on('COMBAT_ESCAPE', () => {
            this.combatUI.hide();
            this.forceUnlockExplorationControl();
            if (this.audioSystem) this.audioSystem.startBgm('EXPLORATION');
            this.showToast('成功撤離戰鬥！');
        });

        eventBus.on('COMBAT_TURN_RESOLVE', ({ isCorrect, correctAnswer, questionObj }) => {
            const player = this.gameState.player;
            const cs = this.combatState;

            if (!cs.enemies[cs.selectedTargetIndex] || cs.enemies[cs.selectedTargetIndex].hp <= 0) {
                cs.selectedTargetIndex = cs.enemies.findIndex(e => e.hp > 0);
            }

            if (isCorrect) {
                if (this.audioSystem) this.audioSystem.playWin();
                player.combo = (player.combo || 0) + 1;

                if (cs.isRevenge && questionObj) {
                    this.gameState.mistakes = (this.gameState.mistakes || []).filter(m => m.prompt !== questionObj.prompt);
                }

                const branch = SkillTrees[player.activeBranch || 'earth_blademaster'] || SkillTrees.earth_blademaster;
                const activeSkills = branch.skills.filter(s => s.type !== 'passive');
                const slotMap = {
                    slash: activeSkills[0] || branch.skills[0],
                    thunder: activeSkills[1] || branch.skills[0],
                    firestorm: activeSkills[2] || activeSkills[activeSkills.length - 1],
                    heal: activeSkills[activeSkills.length - 1]
                };

                const isSilenced = Array.isArray(player.statuses) && player.statuses.some(s => s.statusId === 'DEBUFF_SILENCE_SEAL');
                const effSkillSlot = isSilenced ? 'slash' : cs.selectedSkill;
                const chosenSkillDef = slotMap[effSkillSlot] || activeSkills[0];
                const skLv = Math.max(1, (player.treeLevels && player.treeLevels[chosenSkillDef.id]) || 1);
                let mpCost = effSkillSlot === 'slash' ? 0 : RPGFormulas.getSkillMpCost(chosenSkillDef.baseMp || 15, skLv);

                if (player.equipment.includes('ACC_AMULET_T5')) mpCost = Math.floor(mpCost * 0.7);
                if (Array.isArray(player.statuses) && player.statuses.some(s => s.statusId === 'DEBUFF_HOLY_DOMAIN')) {
                    mpCost = Math.floor(mpCost * 1.5);
                }

                if ((player.mp || 0) < mpCost) mpCost = 0;
                player.mp = Math.max(0, (player.mp || 0) - mpCost);
                if (effSkillSlot === 'slash') player.mp = Math.min(player.maxMp || 60, player.mp + 12);

                const isMagicBranch = (player.activeBranch === 'star_arcanist');
                let rawPower = isMagicBranch ? player.calcMatk() : player.calcAtk();
                const skillMult = RPGFormulas.getSkillMultiplier(chosenSkillDef.baseMultiplier || 1.4, skLv);
                let baseDmg = Math.floor(rawPower * skillMult);

                const surgeSt = Array.isArray(player.statuses) && player.statuses.find(s => s.statusId === 'BUFF_ARCANE_SURGE');
                if (surgeSt) {
                    baseDmg = Math.floor(baseDmg * (1 + 0.05 * surgeSt.stacks));
                }

                if (chosenSkillDef.id === 'SK_EB_03') {
                    applyStatusToUnit(player, 'BUFF_CONTROL_IMMUNE', 1, 2);
                } else if (chosenSkillDef.id === 'SK_EB_05') {
                    applyStatusToUnit(player, 'BUFF_TITAN_SHIELD', 1, 3);
                    player.shieldHp = Math.floor(player.maxHp * 0.25);
                } else if (chosenSkillDef.id === 'SK_GR_03') {
                    applyStatusToUnit(player, 'BUFF_SHADOW_STEALTH', 1, 2);
                }
                if (isMagicBranch) {
                    player.mp = Math.min(player.maxMp || 60, player.mp + 10);
                    applyStatusToUnit(player, 'BUFF_ARCANE_SURGE', 1, 3);
                }

                let hasCritAffix = player.equipment.includes('ARM_CLOAK_T3') || (player.activeBranch === 'gale_ranger');
                const hasStealth = Array.isArray(player.statuses) && player.statuses.some(s => s.statusId === 'BUFF_SHADOW_STEALTH');
                let hasVampAffix = false;
                let armorPen = player.equipment.includes('WPN_SPEAR_T4') ? 0.3 : 0;
                let maxHpTrueDmgPct = player.equipment.includes('WPN_BLADE_T5') ? 0.03 : 0;

                player.equipment.forEach(itemId => {
                    const af = player.affixes && player.affixes[itemId];
                    if (!af) return;
                    if (af.id === 'power') baseDmg += 25;
                    if (af.id === 'crit') hasCritAffix = true;
                    if (af.id === 'vamp') hasVampAffix = true;
                });

                const hits = [];
                let healAmount = 0;
                let fxSprite = isMagicBranch ? 'fire_sword' : 'sword';
                const isAoeAttack = chosenSkillDef.isAoe || effSkillSlot === 'firestorm';

                const applySkillEffectsToEnemy = (en) => {
                    if (chosenSkillDef.id === 'SK_EB_01') applyStatusToUnit(en, 'DEBUFF_ARMOR_BREAK', 1, 3);
                    if (chosenSkillDef.id === 'SK_EB_05') applyStatusToUnit(en, 'CC_STUN_KNOCKUP', 1, 1);
                    if (player.activeBranch === 'gale_ranger' || player.equipment.includes('WPN_BOW_T1')) {
                        applyStatusToUnit(en, 'DOT_POISON_VENOM', 1, 3);
                    }
                    if (chosenSkillDef.id === 'SK_GR_04' || player.equipment.includes('WPN_GREATSWORD_T2')) {
                        applyStatusToUnit(en, 'DEBUFF_CHILL_SLOW', 1, 2);
                    }
                    if (chosenSkillDef.id === 'SK_SA_01') applyStatusToUnit(en, 'DOT_BURN_IGNITE', 1, 3);
                    if (chosenSkillDef.id === 'SK_SA_03') applyStatusToUnit(en, 'CC_FREEZE_NOVA', 1, 1);
                };

                const computeEnemyHit = (en, idx) => {
                    let enemyDef = en.def || 10;
                    const brk = Array.isArray(en.statuses) && en.statuses.find(s => s.statusId === 'DEBUFF_ARMOR_BREAK');
                    if (brk) enemyDef = Math.floor(enemyDef * Math.max(0.4, 1 - 0.15 * brk.stacks));

                    const effDef = Math.floor(enemyDef * (1 - armorPen));
                    const reduc = RPGFormulas.getDamageReduction(effDef, player.level || 1);
                    let d = Math.max(15, Math.floor(baseDmg * (1 - reduc * 0.5)));

                    if (Array.isArray(en.statuses)) {
                        const sgIdx = en.statuses.findIndex(s => s.statusId === 'BUFF_STONE_GUARD');
                        if (sgIdx !== -1) {
                            d = Math.floor(d * 0.5);
                            en.statuses.splice(sgIdx, 1);
                        }
                    }

                    if (maxHpTrueDmgPct > 0) d += Math.floor(en.maxHp * maxHpTrueDmgPct);

                    let isCrit = hasStealth || (effSkillSlot === 'thunder') || (hasCritAffix && Math.random() < 0.3);
                    if (isCrit) {
                        let critMult = 1.5;
                        if (Array.isArray(en.statuses) && en.statuses.some(s => s.statusId === 'CC_FREEZE_NOVA')) {
                            critMult += 0.3;
                        }
                        d = Math.floor(d * critMult);
                    }

                    if (chosenSkillDef.id === 'SK_GR_05' && Array.isArray(en.statuses)) {
                        const poisonSt = en.statuses.find(s => s.statusId === 'DOT_POISON_VENOM');
                        if (poisonSt) {
                            d = Math.floor(d * (poisonSt.stacks >= 3 ? 2.0 : 1.4));
                            en.statuses = en.statuses.filter(s => s.statusId !== 'DOT_POISON_VENOM');
                            this.showToast('☠️ 引爆目標神經毒素，造成雙倍傷害！');
                        }
                    }

                    applySkillEffectsToEnemy(en);
                    en.hp = Math.max(0, en.hp - d);
                    hits.push({ index: idx, dmg: d, isCrit });
                };

                if (isAoeAttack) {
                    cs.enemies.forEach((en, idx) => {
                        if (en.hp > 0) computeEnemyHit(en, idx);
                    });
                } else {
                    const targetIdx = cs.selectedTargetIndex;
                    const targetEnemy = cs.enemies[targetIdx];
                    if (targetEnemy) computeEnemyHit(targetEnemy, targetIdx);
                }

                if (effSkillSlot === 'heal') {
                    healAmount = Math.floor(player.maxHp * 0.22) + skLv * 15;
                }
                if (hasVampAffix) healAmount += 15;
                if (player.equipment.includes('ARM_DIVINE_T5')) healAmount += Math.floor(player.maxHp * 0.05);

                if (healAmount > 0) player.hp = Math.min(player.maxHp, player.hp + healAmount);

                if (cs.enemies[cs.selectedTargetIndex] && cs.enemies[cs.selectedTargetIndex].hp <= 0) {
                    const nextAlive = cs.enemies.findIndex(e => e.hp > 0);
                    if (nextAlive !== -1) cs.selectedTargetIndex = nextAlive;
                }

                this.combatUI.updateStatus({ ...cs, player });
                this.updateHUD();

                this.combatUI.playPlayerAttack({ fxSprite, hits, healAmount }, () => {
                    this.processTurnStatusTicks();
                    this.checkTurnEnd();
                });

            } else {
                if (this.audioSystem) this.audioSystem.playHit();
                player.combo = 0;

                if (questionObj) {
                    if (!this.gameState.mistakes) this.gameState.mistakes = [];
                    const exists = this.gameState.mistakes.some(m => m.prompt === questionObj.prompt);
                    if (!exists) {
                        this.gameState.mistakes.push({
                            subject: questionObj.subject,
                            unit: questionObj.unit,
                            qType: questionObj.qType || '選擇題',
                            prompt: questionObj.prompt,
                            answer: correctAnswer,
                            options: questionObj.options,
                            svgHtml: questionObj.svgHtml
                        });
                    }
                }

                const attackers = [];
                let rawEnemyDmg = 0;
                let maxEnemyLv = 1;

                cs.enemies.forEach((en, idx) => {
                    if (en.hp <= 0) return;
                    const isStunnedOrFrozen = Array.isArray(en.statuses) && en.statuses.some(s => ['CC_STUN_KNOCKUP', 'CC_FREEZE_NOVA', 'CC_PETRIFY_GAZE'].includes(s.statusId));
                    if (isStunnedOrFrozen) {
                        this.combatUI.spawnFloatingText(`enemy-float-${idx}`, '無法行動!', '');
                        return;
                    }

                    attackers.push(idx);
                    rawEnemyDmg += (en.atk || 15);
                    if ((en.level || 1) > maxEnemyLv) maxEnemyLv = en.level;

                    if (en.id === 'MON_T1_005' || en.id === 'MON_T3_006' || en.id === 'MON_T5_004') {
                        applyStatusToUnit(player, 'DOT_POISON_VENOM', 1, 3);
                    } else if (en.id === 'MON_T2_002') {
                        applyStatusToUnit(player, 'DOT_BLEED_LACERATE', 1, 3);
                    } else if (en.id === 'MON_T3_001') {
                        applyStatusToUnit(player, 'DOT_BURN_IGNITE', 1, 3);
                    } else if (en.id === 'MON_T4_002') {
                        applyStatusToUnit(player, 'DEBUFF_ARMOR_BREAK', 1, 3);
                    } else if (en.id === 'MON_T5_005') {
                        applyStatusToUnit(player, 'DEBUFF_SILENCE_SEAL', 1, 2);
                    } else if (en.id === 'MON_T5_006') {
                        applyStatusToUnit(player, 'CC_MADNESS_INVERT', 1, 2);
                    }
                });

                const def = player.calcDef ? player.calcDef() : 30;
                const dmgReduc = RPGFormulas.getDamageReduction(def, maxEnemyLv);
                let totalDmg = attackers.length > 0 ? Math.max(8, Math.floor(rawEnemyDmg * (1 - dmgReduc))) : 0;

                if ((player.shieldHp || 0) > 0 && totalDmg > 0) {
                    const absorbed = Math.min(player.shieldHp, totalDmg);
                    player.shieldHp -= absorbed;
                    totalDmg -= absorbed;
                    if (player.shieldHp <= 0 && Array.isArray(player.statuses)) {
                        player.statuses = player.statuses.filter(s => s.statusId !== 'BUFF_TITAN_SHIELD');
                    }
                }

                let thornsDmg = 0;
                const thornsLv = (player.treeLevels && player.treeLevels.SK_EB_04) || 0;
                if (player.activeBranch === 'earth_blademaster' && thornsLv > 0 && attackers.length > 0) {
                    thornsDmg += Math.floor(totalDmg * (0.15 + 0.05 * thornsLv));
                }
                player.equipment.forEach(itemId => {
                    const af = player.affixes && player.affixes[itemId];
                    if (af && af.id === 'thorns') thornsDmg += 15;
                });
                if (thornsDmg > 0 && attackers.length > 0) {
                    const firstEnemy = cs.enemies[attackers[0]];
                    firstEnemy.hp = Math.max(1, firstEnemy.hp - thornsDmg);
                }

                player.hp = Math.max(0, player.hp - totalDmg);

                if (player.hp <= 0 && player.equipment.includes('ARM_ROBE_T4') && !cs._phoenixUsed) {
                    cs._phoenixUsed = true;
                    player.hp = Math.floor(player.maxHp * 0.5);
                    this.showToast('🔥 觸發【鳳凰涅槃法袍】特效：浴火重生恢復 50% 生命！');
                }

                this.combatUI.updateStatus({ ...cs, player });
                this.updateHUD();

                this.combatUI.playEnemiesCounter({ attackers, totalDmg, thornsDmg, ans: correctAnswer }, () => {
                    this.processTurnStatusTicks();
                    this.checkTurnEnd();
                });
            }
        });

        this.questionSystem.setActiveSubjects(this.uiManager.activeUnits);
        eventBus.on('HUD_UPDATE', () => { this.updateHUD(); this.saveGame(); });
        this.updateHUD();
    }

    // 🌟 強制清除所有殘留遮罩、恢復探索狀態並釋放焦點，確保 100% 隨時可以移動
    forceUnlockExplorationControl() {
        this.gameState.currentState = 'EXPLORATION';
        if (this.uiManager) {
            this.uiManager.isOpen = false;
            this.uiManager.previousState = null;
        }
        const uiLayer = document.getElementById('ui-layer');
        const quizModal = document.getElementById('quiz-modal-layer');
        const combatLayer = document.getElementById('combat-layer');
        const dialogLayer = document.getElementById('pixel-dialog-layer');
        if (uiLayer) uiLayer.style.display = 'none';
        if (quizModal) quizModal.style.display = 'none';
        if (combatLayer) combatLayer.style.display = 'none';
        if (dialogLayer) dialogLayer.style.display = 'none';

        if (document.activeElement && typeof document.activeElement.blur === 'function') {
            document.activeElement.blur();
        }
        const canvas = document.getElementById('gameCanvas');
        if (canvas) canvas.focus();
        if (this.movementSystem && typeof this.movementSystem.updateContextActionUI === 'function') {
            this.movementSystem.updateContextActionUI();
        }
    }

    // 統一經驗升等檢查
    checkAndApplyLevelUp(showToastNotification = false) {
        const p = this.gameState.player;
        p.level = p.level || 1;
        let leveledUp = false;
        while (p.exp >= RPGFormulas.getExpRequired(p.level) && p.level < 100) {
            p.exp -= RPGFormulas.getExpRequired(p.level);
            p.level++;
            p.skillPoints = (p.skillPoints || 0) + 1;
            p.freeStatPoints = (p.freeStatPoints || 0) + 5;
            if (p.recalcStats) p.recalcStats();
            p.hp = p.maxHp;
            p.mp = p.maxMp;
            leveledUp = true;
        }
        if (leveledUp) {
            if (this.audioSystem) this.audioSystem.playLevelUp();
            this.renderer.spawnParticles(p.col, p.row, '#f7d51d', 25);
            if (showToastNotification) {
                this.showToast(`🎉 升級至 Lv.${p.level}！(+5 自由配點, +1 SP，HP/MP 全滿)`);
            }
        }
        return leveledUp;
    }

    processTurnStatusTicks() {
        const player = this.gameState.player;
        const cs = this.combatState;

        cs.enemies.forEach((en, idx) => {
            if (en.hp <= 0 || !Array.isArray(en.statuses)) return;
            let dotTotal = 0;
            en.statuses.forEach(st => {
                if (st.statusId === 'DOT_POISON_VENOM') {
                    dotTotal += (5 + Math.floor((player.stats?.agi || 10) * 0.4)) * st.stacks;
                } else if (st.statusId === 'DOT_BURN_IGNITE') {
                    dotTotal += Math.floor(player.calcMatk() * 0.25) * st.stacks;
                } else if (st.statusId === 'DOT_BLEED_LACERATE') {
                    dotTotal += Math.floor(player.calcAtk() * 0.18) * st.stacks;
                }
                st.turnsLeft--;
            });
            if (dotTotal > 0) {
                en.hp = Math.max(0, en.hp - dotTotal);
                this.combatUI.spawnFloatingText(`enemy-float-${idx}`, `-${dotTotal} 異常`, 'crit');
            }
            en.statuses = en.statuses.filter(st => st.turnsLeft > 0);
        });

        if (Array.isArray(player.statuses)) {
            let pDot = 0;
            player.statuses.forEach(st => {
                if (st.category === 'dot') pDot += 6 * st.stacks;
                if (st.statusId === 'CC_MADNESS_INVERT') {
                    player.mp = Math.max(0, (player.mp || 0) - Math.floor((player.maxMp || 60) * 0.05));
                }
                st.turnsLeft--;
            });
            if (pDot > 0) {
                player.hp = Math.max(1, player.hp - pDot);
                this.combatUI.spawnFloatingText('player-float-Bucket', `-${pDot} 異常`, '');
            }
            player.statuses = player.statuses.filter(st => st.turnsLeft > 0);
        }
    }

    recordQuestKill(monsterId) {
        if (!this.gameState.questProgress) this.gameState.questProgress = {};
        QuestDatabase.forEach(q => {
            if (this.gameState.completedQuests?.includes(q.questId) && !q.Repeatable) return;
            const hasObj = q.objectives.some(o => o.type === 'kill' && o.targetId === monsterId);
            if (hasObj) {
                if (!this.gameState.questProgress[q.questId]) {
                    this.gameState.questProgress[q.questId] = { kills: {}, crafts: {} };
                }
                const kills = this.gameState.questProgress[q.questId].kills;
                kills[monsterId] = (kills[monsterId] || 0) + 1;
            }
        });
    }

    recordQuestCraft(recipeId, itemId) {
        if (!this.gameState.questProgress) this.gameState.questProgress = {};
        QuestDatabase.forEach(q => {
            if (this.gameState.completedQuests?.includes(q.questId) && !q.Repeatable) return;
            q.objectives.forEach(o => {
                if (o.type === 'craft' && (o.targetId === recipeId || o.targetId === itemId)) {
                    if (!this.gameState.questProgress[q.questId]) {
                        this.gameState.questProgress[q.questId] = { kills: {}, crafts: {} };
                    }
                    const crafts = this.gameState.questProgress[q.questId].crafts;
                    crafts[o.targetId] = (crafts[o.targetId] || 0) + 1;
                }
            });
        });
    }

    completeQuest(questId) {
        const q = QuestDatabase.find(x => x.questId === questId);
        if (!q) return;

        const p = this.gameState.player;
        if (!this.gameState.completedQuests) this.gameState.completedQuests = [];
        if (!this.gameState.unlockedRecipes) this.gameState.unlockedRecipes = [];

        q.objectives.forEach(obj => {
            if (obj.type === 'collect') {
                p.removeItem(obj.targetId, obj.requiredCount);
            }
        });

        const dynExp = q.type === 'bounty' ? QuestFormulas.getDynamicBountyExp(q.tier, p.level || 1) : 0;
        const dynGold = q.type === 'bounty' ? QuestFormulas.getDynamicBountyGold(q.tier) : 0;
        const totalExp = (q.rewards.exp || 0) + dynExp;
        const totalGold = (q.rewards.gold || 0) + dynGold;

        p.exp = (p.exp || 0) + totalExp;
        p.gold = (p.gold || 0) + totalGold;
        if (q.rewards.sp > 0) p.skillPoints = (p.skillPoints || 0) + q.rewards.sp;

        const rewardLog = [`+${totalExp} EXP`, `+${totalGold} G`];
        if (q.rewards.sp > 0) rewardLog.push(`+${q.rewards.sp} SP`);

        if (Array.isArray(q.rewards.items)) {
            q.rewards.items.forEach(it => {
                p.addItem(it.itemId, it.count);
                rewardLog.push(`${it.name} x${it.count}`);
            });
        }

        if (Array.isArray(q.rewards.unlockRecipes)) {
            q.rewards.unlockRecipes.forEach(recId => {
                if (!this.gameState.unlockedRecipes.includes(recId)) {
                    this.gameState.unlockedRecipes.push(recId);
                }
            });
        }

        if (q.rewards.unlockTier) {
            this.gameState.unlockedTier = Math.max(this.gameState.unlockedTier || 1, q.rewards.unlockTier);
            rewardLog.push('解鎖新海域');
        }

        if (q.rewards.unlockTitle) {
            p.jobTitle = q.rewards.unlockTitle;
            rewardLog.push(`稱號【${q.rewards.unlockTitle}】`);
        }

        if (q.Repeatable) {
            this.gameState.questProgress[q.questId] = { kills: {}, crafts: {} };
        } else if (!this.gameState.completedQuests.includes(q.questId)) {
            this.gameState.completedQuests.push(q.questId);
        }

        const leveledUp = this.checkAndApplyLevelUp(false);
        if (!leveledUp && this.audioSystem) this.audioSystem.playWin();

        this.updateHUD();
        this.saveGame();
        this.uiManager.renderQuestsTab();
        this.uiManager.renderInventory();

        this.showToast(`🎁 委託完成【${q.title}】：${rewardLog.join('、')}${leveledUp ? ` (🎉升至 Lv.${p.level}！)` : ''}`);
    }

    showToast(msg) {
        const container = document.getElementById('toast-container');
        if (!container) return;
        const el = document.createElement('div');
        el.className = 'px-toast';
        el.innerText = msg;
        container.appendChild(el);
        setTimeout(() => el.remove(), 2400);
    }

    showPixelDialog(title, text, callback = null) {
        const layer = document.getElementById('pixel-dialog-layer');
        const titleEl = document.getElementById('pixel-dialog-title');
        const textEl = document.getElementById('pixel-dialog-text');
        if (!layer || !titleEl || !textEl) return;

        titleEl.innerText = title || '系統訊息';
        textEl.innerText = text || '';
        this.dialogCallback = callback;
        layer.style.display = 'flex';
    }

    closePixelDialog() {
        const layer = document.getElementById('pixel-dialog-layer');
        if (layer) layer.style.display = 'none';
        if (document.activeElement && typeof document.activeElement.blur === 'function') {
            document.activeElement.blur();
        }
        if (this.dialogCallback) {
            const cb = this.dialogCallback;
            this.dialogCallback = null;
            cb();
        }
    }

    initCombat(config) {
        this.gameState.currentState = 'COMBAT';
        if (this.audioSystem) this.audioSystem.startBgm('COMBAT');

        const p = this.gameState.player;
        p.statuses = [];
        p.shieldHp = 0;

        this.combatState = {
            turn: 1,
            chapterName: stripTierLabel(config.chapterOverride || this.gameState.currentMap.chapterName || '第一章：翠綠新手荒島'),
            enemies: config.enemies,
            selectedTargetIndex: config.enemies.findIndex(e => e.hp > 0),
            selectedSkill: 'slash',
            isBoss: config.isBoss,
            isGoblin: config.isGoblin,
            isRevenge: config.isRevenge || false,
            goblinTurnsLeft: 3
        };

        this.combatState.enemies.forEach(en => {
            en.statuses = [];
            if (en.id === 'MON_T2_004') applyStatusToUnit(en, 'BUFF_STONE_GUARD', 1, 3);
            if (en.id === 'MON_T3_009') applyStatusToUnit(en, 'BUFF_TROLL_REGEN', 1, 5);
            if (en.id === 'MON_T1_002' && this.combatState.enemies.length > 1) applyStatusToUnit(en, 'BUFF_BERSERK', 1, 4);
        });

        const q = this.getCombatQuestion();
        this.combatUI.startEncounter(q, {
            ...this.combatState,
            player: this.gameState.player
        });
    }

    getCombatQuestion() {
        if (this.combatState.isRevenge && this.gameState.mistakes && this.gameState.mistakes.length > 0) {
            return this.gameState.mistakes[Math.floor(Math.random() * this.gameState.mistakes.length)];
        }
        return this.questionSystem.getRandomQuestion();
    }

    checkTurnEnd() {
        const player = this.gameState.player;
        const cs = this.combatState;

        if (cs.enemies.every(e => e.hp <= 0)) {
            this.combatUI.hide();
            if (this.audioSystem) this.audioSystem.startBgm('EXPLORATION');
            this.handleVictory();
            return;
        }

        if (player.hp <= 0) {
            this.combatUI.hide();
            if (this.audioSystem) this.audioSystem.startBgm('EXPLORATION');
            player.hp = player.maxHp;
            player.mp = player.maxMp || 60;
            player.statuses = [];
            this.forceUnlockExplorationControl();
            eventBus.emit('CHANGE_MAP', 'campMap_from_death');
            this.showToast('⚠️ 體力耗盡，已安全返回基地營並恢復全部生命與魔力！');
            this.updateHUD();
            this.saveGame();
            return;
        }

        if (cs.isGoblin) {
            cs.goblinTurnsLeft--;
            if (cs.goblinTurnsLeft <= 0) {
                this.combatUI.hide();
                this.forceUnlockExplorationControl();
                if (this.audioSystem) this.audioSystem.startBgm('EXPLORATION');
                this.showToast('回合耗盡！哥布林小偷帶著寶物逃跑了...');
                return;
            }
            cs.enemies[0].weaknessText = `餘${cs.goblinTurnsLeft}回合`;
        }

        cs.turn++;
        this.combatUI.updateStatus({ ...cs, player });
        this.combatUI.renderQuestion(this.getCombatQuestion());
    }

    handleVictory() {
        const player = this.gameState.player;
        const cs = this.combatState;
        player.statuses = [];
        player.shieldHp = 0;

        let expGain = 0;
        let goldGain = 0;
        const droppedItemsLog = [];

        cs.enemies.forEach(en => {
            const tier = en.tier || 1;
            expGain += Math.floor(45 * Math.pow(1.5, tier - 1)) + (en.isBoss ? 180 * tier : 0);
            goldGain += Math.floor(35 * Math.pow(1.6, tier - 1));

            if (en.id) {
                this.recordQuestKill(en.id);
            }

            if (Array.isArray(en.drops)) {
                en.drops.forEach(d => {
                    if (Math.random() <= (d.dropRate || 0.5)) {
                        const qty = d.min + Math.floor(Math.random() * (d.max - d.min + 1));
                        player.addItem(d.materialId, qty);
                        droppedItemsLog.push(`${d.name} x${qty}`);
                    }
                });
            }
        });

        player.exp = (player.exp || 0) + expGain;
        player.gold = (player.gold || 0) + goldGain;

        const leveledUp = this.checkAndApplyLevelUp(false);

        let fragDrops = cs.isBoss ? 8 : (cs.isRevenge ? 5 : cs.enemies.length + 1);
        player.addItem('truth_fragment', fragDrops);

        let lootSummary = `+${expGain} EXP, +${goldGain} G, +${fragDrops} 碎片`;
        if (droppedItemsLog.length > 0) {
            lootSummary += `｜掉落：${droppedItemsLog.slice(0, 3).join('、')}`;
        }

        if (cs.isBoss && this.gameState.currentMap.id === 'boss_arena') {
            player.addItem('knowledge_crown', 1);
            for (let r = 0; r < this.gameState.currentMap.rows; r++) {
                for (let c = 0; c < this.gameState.currentMap.cols; c++) {
                    if (this.gameState.currentMap.tiles[r][c] === 5) this.gameState.currentMap.tiles[r][c] = 0;
                }
            }
            this.updateHUD();
            this.saveGame();
            const endingScreen = document.getElementById('ending-screen');
            if (endingScreen) {
                this.gameState.currentState = 'ENDING_SCREEN';
                endingScreen.style.display = 'flex';
                return;
            }
        }

        // 🌟 關鍵修復：強制解鎖探索移動控制，並使用不阻擋移動的飄字提示
        this.forceUnlockExplorationControl();
        this.updateHUD();
        this.saveGame();

        if (leveledUp) {
            this.showToast(`🎉 升級至 Lv.${player.level}！(+5 配點, +1 SP)｜${lootSummary}`);
        } else {
            this.showToast(`戰鬥勝利！(${lootSummary})`);
        }
    }

    useHealItem() {
        const p = this.gameState.player;
        const foodOrder = ['CON_ELIXIR_T4', 'roast_meat', 'mushroom_soup', 'CON_POTION_T1', 'health_potion', 'energy_juice', 'cooked_fish', 'bread', 'berry_jam', 'fish'];
        const foundKey = foodOrder.find(k => (p.inventory[k] || 0) > 0);

        if (!foundKey) {
            this.showToast('沒有治療藥水或食物！可於【⚒️ 製作】調配藥水或烘烤食物。');
            return;
        }

        const itemObj = Items[foundKey];
        p.removeItem(foundKey, 1);

        if (foundKey === 'CON_ELIXIR_T4') {
            p.hp = p.maxHp;
            p.mp = p.maxMp;
            const cleansed = cleanseUnitDebuffs(p);
            if (this.audioSystem) this.audioSystem.playWin();
            if (this.gameState.currentState === 'COMBAT') {
                this.combatUI.spawnFloatingText('player-float-Bucket', '100% 恢復+淨化', 'heal');
                this.combatUI.updateStatus({ ...this.combatState, player: p });
            } else {
                this.showToast(`服用九轉還魂丹：HP/MP 全滿${cleansed > 0 ? `，淨化 ${cleansed} 個負面狀態` : ''}！`);
            }
        } else {
            const healHp = itemObj?.healHp || 120;
            const healMp = itemObj?.healMp || 30;
            p.hp = Math.min(p.maxHp, p.hp + healHp);
            p.mp = Math.min(p.maxMp || 60, (p.mp || 0) + healMp);
            if (this.audioSystem) this.audioSystem.playCollect();
            if (this.gameState.currentState === 'COMBAT') {
                this.combatUI.spawnFloatingText('player-float-Bucket', `+${healHp} HP`, 'heal');
                this.combatUI.updateStatus({ ...this.combatState, player: p });
            } else {
                this.showToast(`食用【${itemObj?.name || '藥水'}】：+${healHp} HP, +${healMp} MP`);
            }
        }
        this.updateHUD();
    }

    handleItemMagnifier(e) {
        if (e) e.preventDefault();
        if (this.gameState.currentState === 'COMBAT' && (this.gameState.player.inventory['magnifier'] || 0) > 0) {
            if (this.combatUI.useMagnifier()) {
                this.gameState.player.removeItem('magnifier', 1);
                if (this.audioSystem) this.audioSystem.playCollect();
                this.updateHUD();
                this.combatUI.updateItemCounts(this.gameState.player.inventory);
            }
        }
    }
    handleItemSmoke(e) {
        if (e) e.preventDefault();
        if (this.gameState.currentState === 'COMBAT') {
            eventBus.emit('COMBAT_ESCAPE');
        }
    }
    handleItemBomb(e) {
        if (e) e.preventDefault();
        if (this.gameState.currentState === 'COMBAT' && (this.gameState.player.inventory['fire_bomb'] || 0) > 0) {
            this.gameState.player.removeItem('fire_bomb', 1);
            if (this.audioSystem) this.audioSystem.playWin();
            this.combatState.enemies.forEach((en, idx) => {
                if (en.hp > 0) {
                    en.hp = Math.max(0, en.hp - 120);
                    this.combatUI.spawnFloatingText(`enemy-float-${idx}`, '-120 BOOM!', 'crit');
                }
            });
            this.combatUI.updateStatus({ ...this.combatState, player: this.gameState.player });
            this.updateHUD();
            if (this.combatState.enemies.every(en => en.hp <= 0)) {
                setTimeout(() => {
                    this.combatUI.hide();
                    if (this.audioSystem) this.audioSystem.startBgm('EXPLORATION');
                    this.handleVictory();
                }, 600);
            }
        }
    }

    fishingLoop() {
        if (this.gameState.currentState !== 'FISHING') return;
        this.fishingCursor += this.fishingDirection * 2.4; 
        if (this.fishingCursor >= 100 || this.fishingCursor <= 0) this.fishingDirection *= -1; 
        const cursor = document.getElementById('fishing-cursor');
        if (cursor) cursor.style.left = this.fishingCursor + '%';
        requestAnimationFrame(() => this.fishingLoop());
    }
    catchFish() {
        if (this.fishingCursor >= 39 && this.fishingCursor <= 61) {
            if (this.audioSystem) this.audioSystem.playWin();
            this.gameState.player.addItem('fish', 1);
            this.showToast('🎣 垂釣成功：獲得【鮮魚 x1】！');
        } else {
            if (this.audioSystem) this.audioSystem.playHit();
            this.showToast('魚兒掙脫逃走了...');
        }
        const layer = document.getElementById('fishing-layer');
        if (layer) layer.style.display = 'none'; 
        this.forceUnlockExplorationControl();
        this.updateHUD();
    }

    openMerchantLayer() {
        this.gameState.currentState = 'MERCHANT';
        const el = document.getElementById('merchant-layer');
        if (el) el.style.display = 'flex';
        this.renderMerchantShopUI();
    }

    renderMerchantShopUI() {
        const p = this.gameState.player;
        const curBar = document.getElementById('merchant-currencies-bar');
        const npcBox = document.getElementById('merchant-npc-dialogue');
        const tabsBox = document.getElementById('merchant-shop-tabs');
        const listBox = document.getElementById('merchant-items-container');
        if (!tabsBox || !listBox) return;

        const c252 = p.inventory['MAT_252'] || 0;
        const c262 = p.inventory['MAT_262'] || 0;
        const c272 = p.inventory['MAT_272'] || 0;
        const c282 = p.inventory['MAT_282'] || 0;
        if (curBar) {
            curBar.innerHTML = `💰${p.gold || 0}G ｜ 🥉${c252} ｜ 🥈${c262} ｜ 🥇${c272} ｜ 👑${c282}`;
        }

        tabsBox.innerHTML = '';
        ShopDatabase.forEach(sh => {
            const b = document.createElement('button');
            b.className = `px-btn ${this.gameState.activeShopId === sh.shopId ? 'success' : ''}`;
            b.style.cssText = 'padding:3px 8px; font-size:11px;';
            b.innerText = sh.shopId === 'SHOP_RELIC_EXCHANGE' ? '🏺古幣兌換' : sh.shopName.slice(0, 6);
            b.onclick = () => {
                this.gameState.activeShopId = sh.shopId;
                this.renderMerchantShopUI();
            };
            tabsBox.appendChild(b);
        });

        const sellTabBtn = document.createElement('button');
        sellTabBtn.className = `px-btn ${this.gameState.activeShopId === 'SELL_MATERIALS' ? 'primary' : ''}`;
        sellTabBtn.style.cssText = 'padding:3px 8px; font-size:11px;';
        sellTabBtn.innerText = '💰出售素材';
        sellTabBtn.onclick = () => {
            this.gameState.activeShopId = 'SELL_MATERIALS';
            this.renderMerchantShopUI();
        };
        tabsBox.appendChild(sellTabBtn);

        listBox.innerHTML = '';

        if (this.gameState.activeShopId === 'SELL_MATERIALS') {
            if (npcBox) npcBox.innerHTML = `<b>👤 商會後勤官·瑪莎</b>：「點擊下方素材格即可整組出售換取金幣！」`;
            let hasSellable = false;
            for (const [itemId, count] of Object.entries(p.inventory)) {
                if (count <= 0 || !itemId.startsWith('MAT_')) continue;
                const item = Items[itemId];
                if (!item) continue;
                hasSellable = true;
                const unitPrice = ShopFormulas.getSellToShopPrice(item.sellPrice || 10, 0);

                const card = document.createElement('div');
                card.className = 'srpg-item-box';
                card.title = `點擊出售 ${item.name} x${count} (+${unitPrice * count} G)`;
                card.innerHTML = `
                    ${getPixelIconHtml(item.sprite || 'gem', 28)}
                    <span class="qty-num">${count}</span>
                `;
                card.onclick = () => {
                    p.removeItem(itemId, count);
                    p.gold = (p.gold || 0) + unitPrice * count;
                    if (this.audioSystem) this.audioSystem.playWin();
                    this.showToast(`出售 ${item.name} x${count}，獲得 +${unitPrice * count} G！`);
                    this.updateHUD();
                    this.renderMerchantShopUI();
                };
                listBox.appendChild(card);
            }
            if (!hasSellable) {
                listBox.innerHTML = `<div style="grid-column:1/-1; text-align:center; color:#5c3a21; padding:20px; font-weight:bold;">背包內目前沒有可出售的素材。</div>`;
            }
            return;
        }

        const currentShop = ShopDatabase.find(s => s.shopId === this.gameState.activeShopId) || ShopDatabase[0];
        const ownerNpc = NPCDatabase.find(n => n.npcId === currentShop.ownerNpcId) || NPCDatabase[0];
        if (npcBox && ownerNpc) {
            npcBox.innerHTML = `<b>👤 ${ownerNpc.name}</b>：「${stripTierLabel(ownerNpc.dialogues.greeting)}」`;
        }

        if (currentShop.shopId === 'SHOP_RELIC_EXCHANGE') {
            currentShop.exchangeRates.forEach(ex => {
                const hasCoins = p.inventory[ex.costCurrencyId] || 0;
                const canEx = hasCoins >= ex.costCount;
                const rewardItem = Items[ex.rewardItemId];

                const card = document.createElement('div');
                card.className = 'srpg-item-box';
                card.style.opacity = canEx ? '1' : '0.45';
                card.title = `${ex.rewardName}｜需 ${ex.costName} (${hasCoins}/${ex.costCount})`;
                card.innerHTML = `
                    ${getPixelIconHtml(rewardItem?.sprite || 'gem', 28)}
                    <span class="qty-num" style="color:${canEx ? '#15803d' : '#b91c1c'};">${hasCoins}/${ex.costCount}</span>
                `;
                card.onclick = () => {
                    if (!canEx) {
                        this.showToast(`需要 ${ex.costName} x${ex.costCount} 才能兌換【${ex.rewardName}】`);
                        return;
                    }
                    p.removeItem(ex.costCurrencyId, ex.costCount);
                    p.addItem(ex.rewardItemId, ex.rewardCount);
                    if (this.audioSystem) this.audioSystem.playWin();
                    this.showToast(`兌換成功：獲得【${ex.rewardName} x${ex.rewardCount}】！`);
                    this.updateHUD();
                    this.renderMerchantShopUI();
                };
                listBox.appendChild(card);
            });
            return;
        }

        currentShop.inventory.forEach(entry => {
            const canBuy = (p.gold || 0) >= entry.price;
            const itemObj = Items[entry.itemId];

            const card = document.createElement('div');
            card.className = 'srpg-item-box';
            card.style.opacity = canBuy ? '1' : '0.45';
            card.title = `${entry.name} (${stripTierLabel(entry.desc)})｜售價: ${entry.price} G`;
            card.innerHTML = `
                ${getPixelIconHtml(itemObj?.sprite || 'gem', 28)}
                <span class="qty-num">${entry.price}G</span>
            `;
            card.onclick = () => {
                if (!canBuy) {
                    this.showToast(`金幣不足！購買【${entry.name}】需要 ${entry.price} G`);
                    return;
                }
                p.gold -= entry.price;
                p.addItem(entry.itemId, 1);
                if (this.audioSystem) this.audioSystem.playCollect();
                this.showToast(`購買成功：獲得【${entry.name} x1】！`);
                this.updateHUD();
                this.renderMerchantShopUI();
            };
            listBox.appendChild(card);
        });
    }

    bindMerchantEvents() {
        const closeBtn = document.getElementById('btn-close-merchant');
        if (closeBtn) {
            closeBtn.onclick = () => {
                document.getElementById('merchant-layer').style.display = 'none';
                this.forceUnlockExplorationControl();
            };
        }
        const hudShopBtn = document.getElementById('btn-hud-shop');
        if (hudShopBtn) {
            hudShopBtn.onclick = () => this.openMerchantLayer();
        }
    }

    toggleFullscreen() {
        const docEl = document.documentElement;
        const requestFs = docEl.requestFullscreen || docEl.webkitRequestFullscreen || docEl.msRequestFullscreen;
        const exitFs = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;

        if (!document.fullscreenElement && !document.webkitFullscreenElement) {
            if (requestFs) {
                requestFs.call(docEl).then(() => {
                    if (screen.orientation && screen.orientation.lock) {
                        screen.orientation.lock('landscape').catch(() => {});
                    }
                }).catch(() => {
                    this.showPixelDialog('全螢幕提示', '如使用 iPhone/iPad Safari，請點擊瀏覽器「分享」按鈕並選擇「加入主畫面」，即可享受全螢幕體驗！');
                });
            } else {
                this.showPixelDialog('全螢幕提示', '如使用 iPhone Safari，請點擊下方「分享」按鈕並選擇「加入主畫面」以開啟全螢幕！');
            }
        } else {
            if (exitFs) exitFs.call(document);
        }
    }

    bindUIEvents() {
        const dialogOkBtn = document.getElementById('btn-dialog-ok');
        if (dialogOkBtn) dialogOkBtn.onclick = (e) => { e.preventDefault(); this.closePixelDialog(); };

        const nameInput = document.getElementById('input-hero-name');
        if (nameInput && this.gameState.player.name) {
            nameInput.value = this.gameState.player.name;
        }

        const titleFsBtn = document.getElementById('btn-title-fullscreen');
        if (titleFsBtn) {
            titleFsBtn.onclick = (e) => { e.preventDefault(); this.toggleFullscreen(); };
            titleFsBtn.ontouchstart = (e) => { e.preventDefault(); this.toggleFullscreen(); };
        }

        const hudFsBtn = document.getElementById('btn-hud-fullscreen');
        if (hudFsBtn) {
            hudFsBtn.onclick = (e) => { e.preventDefault(); this.toggleFullscreen(); };
            hudFsBtn.ontouchstart = (e) => { e.preventDefault(); this.toggleFullscreen(); };
        }

        const startBtn = document.getElementById('btn-start-game');
        if (startBtn) {
            const startHandler = (e) => { 
                e.preventDefault(); 
                const enteredName = document.getElementById('input-hero-name')?.value.trim();
                if (enteredName) this.gameState.player.name = enteredName;
                if (this.audioSystem) {
                    this.audioSystem.resume();
                    this.audioSystem.startBgm('EXPLORATION');
                }
                const ts = document.getElementById('title-screen');
                if (ts) ts.style.display = 'none'; 
                this.forceUnlockExplorationControl();
                this.updateHUD();
                this.saveGame();
            };
            startBtn.onclick = startHandler;
            startBtn.ontouchstart = startHandler;
        }

        const newGameBtn = document.getElementById('btn-new-game');
        if (newGameBtn) {
            const newHandler = (e) => {
                e.preventDefault();
                const defaultVal = document.getElementById('input-hero-name')?.value.trim() || 'Justin';
                const customName = prompt('請設定你的冒險者角色名字：', defaultVal);
                if (customName === null) return;
                localStorage.removeItem('pixelRpgSave');
                localStorage.setItem('pendingHeroName', customName.trim() || 'Justin');
                location.reload();
            };
            newGameBtn.onclick = newHandler;
            newGameBtn.ontouchstart = newHandler;
        }
        
        const restartBtn = document.getElementById('btn-restart-game');
        if (restartBtn) restartBtn.onclick = () => { localStorage.removeItem('pixelRpgSave'); location.reload(); };

        const postgameBtn = document.getElementById('btn-continue-postgame');
        if (postgameBtn) postgameBtn.onclick = () => {
            document.getElementById('ending-screen').style.display = 'none';
            this.forceUnlockExplorationControl();
        };
        
        const cancelFishBtn = document.getElementById('btn-cancel-fishing');
        if (cancelFishBtn) cancelFishBtn.onclick = () => {
            document.getElementById('fishing-layer').style.display = 'none';
            this.forceUnlockExplorationControl();
        };

        ['up', 'down', 'left', 'right'].forEach(dir => {
            const btn = document.getElementById(`btn-${dir}`);
            if (btn) {
                const moveHandler = (e) => {
                    e.preventDefault();
                    if (this.audioSystem) this.audioSystem.resume();
                    this.movementSystem.handleMove(dir);
                };
                btn.onmousedown = moveHandler;
                btn.ontouchstart = moveHandler;
            }
        });
        
        const actionBtn = document.getElementById('btn-action');
        if (actionBtn) {
            const actionHandler = (e) => { 
                e.preventDefault();
                if (this.audioSystem) this.audioSystem.resume();
                const dialogLayer = document.getElementById('pixel-dialog-layer');
                if (dialogLayer && dialogLayer.style.display === 'flex') { this.closePixelDialog(); return; }
                if (this.gameState.currentState === 'FISHING') {
                    if (this.fishingJustStarted) { this.fishingJustStarted = false; return; }
                    this.catchFish();
                } else {
                    this.movementSystem.interact();
                }
            };
            actionBtn.onmousedown = actionHandler;
            actionBtn.ontouchstart = actionHandler;
        }

        const btn1 = document.getElementById('btn-item-1');
        if (btn1) { btn1.onclick = (e) => this.handleItemMagnifier(e); btn1.ontouchstart = (e) => this.handleItemMagnifier(e); }
        const btn3 = document.getElementById('btn-item-3');
        if (btn3) { btn3.onclick = (e) => this.handleItemBomb(e); btn3.ontouchstart = (e) => this.handleItemBomb(e); }
        const btnHeal = document.getElementById('btn-item-heal');
        if (btnHeal) {
            const healHandler = (e) => { e.preventDefault(); this.useHealItem(); };
            btnHeal.onclick = healHandler;
            btnHeal.ontouchstart = healHandler;
        }
    }

// 🌟 請替換 src/core/Game.js 內的 updateHUD() 方法 (直接刪除紅心列，確保頂部右邊全螢幕鍵完整顯示)：
    updateHUD() {
        const player = this.gameState.player;
        if (!this.gameState.encyclopedia) this.gameState.encyclopedia = [];
        Object.keys(player.inventory).forEach(itemId => {
            if ((player.inventory[itemId] || 0) > 0 && !this.gameState.encyclopedia.includes(itemId)) {
                this.gameState.encyclopedia.push(itemId);
            }
        });

        if (!this._hudIconsInjected) {
            this._hudIconsInjected = true;
            const bagEl = document.getElementById('float-ico-bag');
            const anvilEl = document.getElementById('float-ico-anvil');
            const fragIco = document.getElementById('hud-icon-frag');
            if (bagEl) bagEl.innerHTML = getPixelIconHtml('bag', 28);
            if (anvilEl) anvilEl.innerHTML = getPixelIconHtml('pickaxe', 28);
            if (fragIco) fragIco.innerHTML = getPixelIconHtml('gem', 16);

            eventBus.on('TOGGLE_BGM', () => {
                if (!this.audioSystem) return;
                this.audioSystem.resume();
                const on = this.audioSystem.toggleBgm();
                this.showToast(on ? '🎵 背景音樂：開啟' : '🔇 背景音樂：關閉');
            });
        }

        // 🌟 關鍵修復：強制改造頂部 #hud 為極簡單行排版，徹底刪掉佔位置的 14 顆紅心與重複假數值欄！
        const hudEl = document.getElementById('hud');
        if (hudEl) {
            hudEl.style.cssText = 'display:flex; align-items:center; justify-content:space-between; width:100%; max-width:100vw; box-sizing:border-box; padding:3px 8px; overflow:hidden; gap:4px;';
            // 自動隱藏 HTML 中多餘的假裝飾欄 (例如重複的 0 / 500 區塊)
            Array.from(hudEl.children).forEach(child => {
                if (child.innerText && child.innerText.includes('0') && child.innerText.includes('500') && !child.querySelector('#hud-val-gold')) {
                    child.style.display = 'none';
                }
            });
        }

        // 將原本長長的紅心列改為簡潔的「❤️ HP」數字徽章 (或直接隱藏紅心)
        const heartsRow = document.getElementById('hud-hearts-row');
        if (heartsRow) {
            heartsRow.style.cssText = 'display:inline-flex; align-items:center; background:#3b2614; color:#fde047; padding:1px 6px; border-radius:4px; font-size:11px; font-weight:900; white-space:nowrap;';
            heartsRow.innerHTML = `❤️ ${player.hp}/${player.maxHp}`;
        }

        const hudName = document.getElementById('hud-player-name');
        const hudLvl = document.getElementById('hud-lvl-badge');
        const arenaName = document.getElementById('arena-player-name');
        const heroUnitName = document.querySelector('#arena-hero-unit .arena-unit-name');
        const pName = player.name || 'Justin';

        if (hudName) hudName.innerText = pName;
        if (hudLvl) hudLvl.innerText = `Lv.${player.level || 1}`;
        if (arenaName) arenaName.innerText = pName;
        if (heroUnitName) heroUnitName.innerText = pName;

        const goldVal = document.getElementById('hud-val-gold');
        if (goldVal) goldVal.innerText = player.gold || 0;

        const fragVal = document.getElementById('hud-val-frag');
        if (fragVal) fragVal.innerText = player.inventory['truth_fragment'] || 0;

        const weatherIco = document.getElementById('hud-weather-ico');
        if (weatherIco) {
            weatherIco.innerText = this.gameState.weather === 'RAIN' ? '🌧️' : '☀️';
        }
        const clockTxt = document.getElementById('hud-clock-text');
        if (clockTxt) {
            const totalMinutes = (Math.floor(this.gameTime / 25) + 8 * 60) % (24 * 60);
            const hh = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
            const mm = String((Math.floor(totalMinutes / 5) * 5) % 60).padStart(2, '0');
            clockTxt.innerText = `${hh}:${mm}`;
        }

        const comboBar = document.getElementById('combo-bar');
        if (comboBar) {
            if (player.combo && player.combo >= 2) {
                comboBar.style.display = 'inline-flex';
                comboBar.innerText = `🔥x${player.combo}`;
            } else {
                comboBar.style.display = 'none';
            }
        }
    }

    saveGame() {
        if (this.gameState.currentState === 'TITLE_SCREEN') return; 
        const p = this.gameState.player;
        const saveData = {
            player: {
                name: p.name || 'Justin',
                col: p.col, row: p.row, direction: p.direction,
                hp: p.hp, maxHp: p.maxHp, mp: p.mp, maxMp: p.maxMp,
                level: p.level, exp: p.exp, gold: p.gold,
                skillPoints: p.skillPoints, freeStatPoints: p.freeStatPoints,
                stats: p.stats, activeBranch: p.activeBranch, treeLevels: p.treeLevels,
                jobTitle: p.jobTitle, affixes: p.affixes,
                inventory: p.inventory, equipment: p.equipment, combo: p.combo || 0
            },
            currentMapId: this.gameState.currentMap.id,
            gameTime: this.gameTime,
            crops: this.gameState.crops,
            weather: this.gameState.weather,
            encyclopedia: this.gameState.encyclopedia,
            mistakes: this.gameState.mistakes || [],
            questProgress: this.gameState.questProgress || {},
            completedQuests: this.gameState.completedQuests || [],
            unlockedRecipes: this.gameState.unlockedRecipes || [],
            unlockedTier: this.gameState.unlockedTier || 1
        };
        localStorage.setItem('pixelRpgSave', JSON.stringify(saveData));
    }

    loadGame() {
        const saved = localStorage.getItem('pixelRpgSave');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                const p = this.gameState.player;
                if (!data.player) return;
                p.name = data.player.name || 'Justin';
                p.col = data.player.col;
                p.row = data.player.row;
                p.direction = data.player.direction || 'down';
                p.level = data.player.level || 1;
                p.exp = data.player.exp || 0;
                p.gold = data.player.gold !== undefined ? data.player.gold : 500;
                p.skillPoints = data.player.skillPoints !== undefined ? data.player.skillPoints : 2;
                p.freeStatPoints = data.player.freeStatPoints !== undefined ? data.player.freeStatPoints : 5;
                p.stats = data.player.stats || { str: 10, agi: 10, int: 10, vit: 10 };
                p.activeBranch = data.player.activeBranch || 'earth_blademaster';
                p.treeLevels = data.player.treeLevels || { SK_EB_01: 1, SK_GR_01: 1, SK_SA_01: 1 };
                p.jobTitle = data.player.jobTitle || '大地劍聖';
                p.affixes = data.player.affixes || {};
                p.inventory = data.player.inventory || p.inventory;
                p.equipment = data.player.equipment || [];
                p.combo = data.player.combo || 0;
                if (p.recalcStats) p.recalcStats();
                p.hp = Math.min(p.maxHp, data.player.hp || p.maxHp);
                p.mp = Math.min(p.maxMp, data.player.mp !== undefined ? data.player.mp : p.maxMp);
                
                this.gameTime = data.gameTime || 0;
                this.gameState.crops = data.crops || [];
                this.gameState.weather = data.weather || 'CLEAR';
                this.gameState.encyclopedia = data.encyclopedia || [];
                this.gameState.mistakes = data.mistakes || [];
                this.gameState.questProgress = data.questProgress || {};
                this.gameState.completedQuests = data.completedQuests || [];
                this.gameState.unlockedRecipes = data.unlockedRecipes || [];
                this.gameState.unlockedTier = data.unlockedTier || 1;

                if (data.currentMapId === 'desert_ruins') this.gameState.currentMap = level2Map;
                else if (data.currentMapId === 'poison_swamp') this.gameState.currentMap = poisonMap;
                else if (data.currentMapId === 'ice_ruins') this.gameState.currentMap = iceMap;
                else if (data.currentMapId === 'deep_sea') this.gameState.currentMap = deepSeaMap;
                else if (data.currentMapId === 'clockwork') this.gameState.currentMap = clockworkMap;
                else if (data.currentMapId === 'floating') this.gameState.currentMap = floatingMap;
                else if (data.currentMapId === 'boss_arena') this.gameState.currentMap = bossMap;
                else if (data.currentMapId === 'safe_camp') this.gameState.currentMap = campMap;
                else this.gameState.currentMap = testMap;
            } catch (e) {
                console.error("Load Game Error:", e);
            }
        }
    }

    start() {
        this.lastTime = performance.now();
        requestAnimationFrame((time) => this.loop(time));
    }

    loop(timestamp) {
        let deltaTime = timestamp - this.lastTime;
        if (deltaTime > 100) deltaTime = 16.66; 
        this.lastTime = timestamp;
        
        if (this.gameState.currentState === 'EXPLORATION') {
            const timeScale = deltaTime / 16.66;
            this.gameTime += 5 * timeScale; 
            
            this.weatherTimer += deltaTime;
            if (this.weatherTimer > 30000) { 
                this.weatherTimer = 0;
                this.gameState.weather = Math.random() < 0.3 ? 'RAIN' : 'CLEAR';
                this.updateHUD();
            }

            this.envHazardTimer += deltaTime;
            if (this.envHazardTimer > 4500) { 
                this.envHazardTimer = 0;
                let hazardMsg = null;
                
                if (this.gameState.currentMap.id === 'poison_swamp' && !this.gameState.player.equipment.includes('gas_mask')) {
                    this.gameState.player.hp = Math.max(1, this.gameState.player.hp - 3);
                    hazardMsg = '⚠️ 毒瘴侵蝕 (-3 HP)，可製作【淨化防毒面具】免疫！';
                } else if (this.gameState.currentMap.id === 'ice_ruins' && !this.gameState.player.equipment.includes('winter_cloak')) {
                    this.gameState.player.hp = Math.max(1, this.gameState.player.hp - 3);
                    hazardMsg = '⚠️ 暴風雪失溫 (-3 HP)，可製作【極地禦寒狼皮襖】免疫！';
                } else if (this.gameState.currentMap.id === 'deep_sea' && !this.gameState.player.equipment.includes('diving_bubble')) {
                    this.gameState.player.hp = Math.max(1, this.gameState.player.hp - 4);
                    hazardMsg = '⚠️ 深海缺氧 (-4 HP)，可製作【深海避水靈珠】免疫！';
                }

                if (hazardMsg) {
                    this.showToast(hazardMsg);
                    this.updateHUD();
                }
            }

            if (Array.isArray(this.gameState.respawnQueue) && this.gameState.respawnQueue.length > 0) {
                const now = performance.now();
                for (let i = this.gameState.respawnQueue.length - 1; i >= 0; i--) {
                    const rq = this.gameState.respawnQueue[i];
                    if (now >= rq.respawnAt) {
                        const targetMap = [testMap, level2Map, poisonMap, iceMap, deepSeaMap, clockworkMap, floatingMap, bossMap, campMap].find(m => m.id === rq.mapId);
                        if (targetMap && !(this.gameState.player.row === rq.row && this.gameState.player.col === rq.col)) {
                            targetMap.tiles[rq.row][rq.col] = rq.tileId;
                        }
                        this.gameState.respawnQueue.splice(i, 1);
                    }
                }
            }

            this.respawnTimer += deltaTime;
            if (this.respawnTimer > 12000) { 
                this.respawnTimer = 0;
                if (['starter_island', 'desert_ruins', 'poison_swamp', 'ice_ruins', 'deep_sea', 'clockwork', 'floating'].includes(this.gameState.currentMap.id)) {
                    const map = this.gameState.currentMap;
                    const r = 3 + Math.floor(Math.random() * (map.rows - 6));
                    const c = 3 + Math.floor(Math.random() * (map.cols - 6));
                    if (map.tiles[r] && map.tiles[r][c] === 0 && !(this.gameState.player.row === r && this.gameState.player.col === c)) {
                        const spawnChance = Math.random();
                        if (this.gameState.weather === 'RAIN' && spawnChance < 0.08) map.tiles[r][c] = 15; 
                        else if (spawnChance < 0.04) map.tiles[r][c] = 1;  
                        else if (spawnChance < 0.06) map.tiles[r][c] = 47;
                        }
                    }
                }

            for (let i = this.gameState.crops.length - 1; i >= 0; i--) {
                let crop = this.gameState.crops[i];
                if (this.gameTime - crop.plantTime > 1500) { 
                    let mapToUpdate = [testMap, level2Map, poisonMap, iceMap, deepSeaMap, clockworkMap, floatingMap, bossMap, campMap].find(m => m.id === crop.mapId);
                    if (mapToUpdate && mapToUpdate.tiles[crop.row][crop.col] === 13) { mapToUpdate.tiles[crop.row][crop.col] = 14; }
                    this.gameState.crops.splice(i, 1); 
                }
            }
        }
        
        if (this.gameState.currentState === 'EXPLORATION' || this.gameState.currentState === 'UI_MENU') { 
            this.renderer.render(this.gameState, this.gameTime, this.gameState.weather); 
        }
        
        requestAnimationFrame((time) => this.loop(time));
    }
}