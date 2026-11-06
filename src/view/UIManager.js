// src/view/UIManager.js
// 🌟 完整終極版 UI 管理器：
// 1. 中文模式選單已移除「成語補字」，只保留「混合 (釋義+填充)」、「只出例句填充」、「只出字詞釋義」
// 2. 支援四科獨立出題模式設定、6大題型多選過濾、300款素材圖鑑與背包紙娃娃裝備

import { eventBus } from '../core/EventBus.js';
import { Items } from '../data/items.js';
import { Recipes, SkillTrees, RPGFormulas } from '../data/recipes.js';
import { MonsterDatabase } from '../data/monsters.js';
import { QuestDatabase } from '../data/quests.js';
import { getAllRegionsSummary } from '../data/worldNodes.js';
import { StatusEffectDatabase } from '../data/statusEffects.js';
import { NPCDatabase } from '../data/npcsAndShops.js';
import { getPixelIconHtml } from '../data/assets.js';

const AFFIX_POOL = [
    { id: 'crit', name: '暴擊之', desc: '暴擊率 +20%' },
    { id: 'vamp', name: '吸血之', desc: '攻擊吸取 15 點 HP' },
    { id: 'power', name: '狂暴之', desc: '基礎傷害 +25' },
    { id: 'thorns', name: '荊棘之', desc: '受擊反彈 20% 傷害' },
    { id: 'wisdom', name: '博學之', desc: '獲得經驗值與金幣 +25%' }
];

export const DEFAULT_UNLOCKED_SKILLS = ['SK_EB_01', 'SK_GR_01', 'SK_SA_01'];

function stripTierText(str) {
    if (!str) return '';
    return String(str)
        .replace(/\[T[1-5]\s*([^\]]*)\]/g, '$1')
        .replace(/\(T[1-5][^)]*\)/g, '')
        .replace(/（T[1-5][^）]*）/g, '')
        .replace(/T[1-5]\s*[：:]?\s*/g, '')
        .trim();
}

export class UIManager {
    constructor(gameState, questionSystem) {
        this.gameState = gameState;
        this.questionSystem = questionSystem;
        this.layer = document.getElementById('ui-layer');
        this.isOpen = false;

        this.invFilter = 'MAT';
        this.selectedInvItemId = null;

        this.selectedRecipe = Recipes[0] || null;
        this.craftBatchCount = 1;

        this.questSubView = 'QUESTS';
        this.questFilter = 'ALL';
        this.encyMode = 'MATERIALS';

        this.activeUnits = [];
        this.activeTypes = ['ALL'];
        this.questionSystem.subjectData.forEach(sub => sub.units.forEach(u => this.activeUnits.push(u.id)));

        this.bindEvents();
        this.renderSubjectSettings();
        this.renderSysConfigTab();
        this.initCampHubAndUpgrades();
    }

    openToTab(tabId, subOption = null) {
        if (this.gameState.currentState !== 'UI_MENU') {
            this.previousState = this.gameState.currentState;
        }
        this.isOpen = true;
        if (this.layer) this.layer.style.display = 'flex';
        this.gameState.currentState = 'UI_MENU';

        if (subOption === 'WORLD_MAP') this.questSubView = 'WORLD_MAP';
        else if (subOption === 'QUESTS') this.questSubView = 'QUESTS';

        document.querySelectorAll('.srpg-top-tabs .tab-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.tab === tabId);
        });
        document.querySelectorAll('.tab-content').forEach(c => {
            c.classList.toggle('active', c.id === tabId);
        });

        if (tabId === 'tab-inventory') this.renderInventory();
        else if (tabId === 'tab-crafting') this.renderCrafting();
        else if (tabId === 'tab-quests') this.renderQuestsTab();
        else if (tabId === 'tab-skills') this.renderSkillsTab();
        else if (tabId === 'tab-mistakes') this.renderMistakesTab();
        else if (tabId === 'tab-encyclopedia') this.renderEncyclopedia();
        else if (tabId === 'tab-settings') this.renderSubjectSettings();
        else if (tabId === 'tab-sys-config') this.renderSysConfigTab();
    }

    toggle() {
        if (this.isOpen) {
            this.isOpen = false;
            if (this.layer) this.layer.style.display = 'none';
            this.gameState.currentState = (this.previousState === 'COMBAT') ? 'COMBAT' : 'EXPLORATION';
            this.previousState = null;
            if (document.activeElement && typeof document.activeElement.blur === 'function') {
                document.activeElement.blur();
            }
            const canvas = document.getElementById('gameCanvas');
            if (canvas) canvas.focus();
        } else {
            this.openToTab('tab-inventory');
        }
    }

    bindEvents() {
        const btnCloseUi = document.getElementById('btn-close-ui');
        if (btnCloseUi) btnCloseUi.addEventListener('click', () => this.toggle());

        const btnFloatQuest = document.getElementById('btn-float-quest-map');
        if (btnFloatQuest) btnFloatQuest.onclick = () => this.openToTab('tab-quests', 'QUESTS');

        const btnCompassMap = document.getElementById('btn-compass-map');
        if (btnCompassMap) btnCompassMap.onclick = () => this.openToTab('tab-quests', 'WORLD_MAP');

        const btnFloatBag = document.getElementById('btn-float-bag');
        if (btnFloatBag) btnFloatBag.onclick = () => this.openToTab('tab-inventory');

        const btnFloatCraft = document.getElementById('btn-float-craft');
        if (btnFloatCraft) btnFloatCraft.onclick = () => this.openToTab('tab-crafting');

        const btnTopSettings = document.getElementById('btn-top-settings');
        if (btnTopSettings) btnTopSettings.onclick = () => this.openToTab('tab-sys-config');

        document.querySelectorAll('.srpg-top-tabs .tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabId = e.currentTarget.dataset.tab;
                this.openToTab(tabId);
            });
        });
    }

    getSkillLevel(player, skillId) {
        if (!player.treeLevels) player.treeLevels = {};
        if (player.treeLevels[skillId] !== undefined) return player.treeLevels[skillId];
        return DEFAULT_UNLOCKED_SKILLS.includes(skillId) ? 1 : 0;
    }

    isRecipeVisibleByProgression(recipe) {
        const tier = recipe.tier || 1;
        if (tier <= 1) return true;

        const p = this.gameState.player;
        const ency = this.gameState.encyclopedia || [];
        const hasItemOrUnlocked = (itemId) => (p.inventory[itemId] || 0) > 0 || p.equipment.includes(itemId) || ency.includes(itemId);

        if (hasItemOrUnlocked(recipe.id)) return true;

        const mTool = String(recipe.id).match(/^(TOOL_(?:AXE|PICK|SICKLE))_T(\d)$/);
        if (mTool) {
            const prevToolId = `${mTool[1]}_T${parseInt(mTool[2], 10) - 1}`;
            return hasItemOrUnlocked(prevToolId);
        }

        if (recipe.category === 'weapon') {
            const prevTierWeapons = Recipes.filter(r => r.category === 'weapon' && (r.tier || 1) === tier - 1);
            if (prevTierWeapons.length === 0) return true;
            return prevTierWeapons.some(r => hasItemOrUnlocked(r.id));
        }

        if (recipe.category === 'armor') {
            const prevTierArmors = Recipes.filter(r => r.category === 'armor' && (r.tier || 1) === tier - 1);
            if (prevTierArmors.length === 0) return true;
            return prevTierArmors.some(r => hasItemOrUnlocked(r.id));
        }

        if (recipe.category === 'accessory') {
            const prevAcc = Recipes.filter(r => (r.category === 'accessory' || r.category === 'armor') && (r.tier || 1) === tier - 1);
            if (prevAcc.length === 0) return true;
            return prevAcc.some(r => hasItemOrUnlocked(r.id));
        }

        const anyPrevCrafted = Recipes.filter(r => (r.tier || 1) === tier - 1).some(r => hasItemOrUnlocked(r.id));
        return anyPrevCrafted;
    }

    renderInventory() {
        const invList = document.getElementById('inventory-list');
        const subtabs = document.getElementById('inventory-subtabs');
        const bottomLabel = document.getElementById('inv-selected-label');
        const dollBox = document.getElementById('player-paperdoll-box');
        const statsBox = document.getElementById('player-stats-summary');
        if (!invList) return;

        const p = this.gameState.player;
        const eq = p.equipment || [];
        const affixes = p.affixes || {};

        const catTabs = [
            { id: 'MAT', icon: getPixelIconHtml('wood_log', 20), title: '素材與戰利品' },
            { id: 'FOOD', icon: getPixelIconHtml('potion', 20), title: '食物與藥水' },
            { id: 'TOOL', icon: getPixelIconHtml('pickaxe', 20), title: '採集與探險工具' },
            { id: 'EQUIP', icon: getPixelIconHtml('shield', 20), title: '武器與防具裝備' }
        ];

        if (subtabs) {
            subtabs.innerHTML = '';
            catTabs.forEach(ct => {
                const btn = document.createElement('button');
                btn.className = `srpg-cat-tab-btn ${this.invFilter === ct.id ? 'active' : ''}`;
                btn.title = ct.title;
                btn.innerHTML = ct.icon;
                btn.onclick = () => {
                    this.invFilter = ct.id;
                    this.renderInventory();
                };
                subtabs.appendChild(btn);
            });
        }

        const matchCategory = (item) => {
            const cat = item.category || 'wood_plant';
            if (this.invFilter === 'FOOD') return cat === 'consumable';
            if (this.invFilter === 'TOOL') return cat === 'tool';
            if (this.invFilter === 'EQUIP') return cat === 'equip';
            return !['consumable', 'tool', 'equip'].includes(cat);
        };

        invList.innerHTML = '';
        const entries = Object.entries(p.inventory).filter(([id, cnt]) => cnt > 0 && Items[id] && matchCategory(Items[id]));

        const totalSlots = Math.max(30, Math.ceil(entries.length / 6) * 6);
        for (let i = 0; i < totalSlots; i++) {
            const box = document.createElement('div');
            box.className = 'srpg-item-box';

            if (i < entries.length) {
                const [itemId, count] = entries[i];
                const item = Items[itemId];
                const isEq = eq.includes(itemId);
                if (this.selectedInvItemId === itemId) box.classList.add('selected');

                box.innerHTML = `
                    ${isEq ? '<span class="eq-dot" title="已裝備"></span>' : ''}
                    ${getPixelIconHtml(item.sprite || 'gem', 28)}
                    <span class="qty-num">${count}</span>
                `;

                box.onclick = () => {
                    this.selectedInvItemId = itemId;
                    const af = affixes[itemId];
                    const fullName = `${af ? af.name : ''}${item.name}`;

                    if (item.category === 'equip' || item.category === 'tool') {
                        if (isEq) {
                            p.equipment = eq.filter(e => e !== itemId);
                        } else {
                            if (itemId.startsWith('WPN_') || itemId.includes('sword')) {
                                p.equipment = eq.filter(e => !e.startsWith('WPN_') && !e.includes('sword'));
                            } else if (itemId.startsWith('ARM_')) {
                                p.equipment = eq.filter(e => !e.startsWith('ARM_'));
                            }
                            p.equipment.push(itemId);
                        }
                        if (p.recalcStats) p.recalcStats();
                        eventBus.emit('PLAY_SOUND', 'collect');
                        eventBus.emit('HUD_UPDATE');
                    }

                    this.renderInventory();
                    if (bottomLabel) {
                        bottomLabel.innerHTML = `【${fullName}】${stripTierText(item.desc)}`;
                    }
                };
            } else {
                box.style.opacity = '0.55';
            }
            invList.appendChild(box);
        }

        if (dollBox) {
            const findEq = (pred) => eq.find(id => pred(id, Items[id]));
            const headItem   = findEq((id) => id === 'gas_mask' || id === 'diving_bubble' || id === 'knowledge_crown' || id === 'iron_helm');
            const chestItem  = findEq((id) => id.startsWith('ARM_') || id === 'winter_cloak' || id === 'knight_armor' || id === 'hunter_armor' || id === 'explorer_cape');
            const weaponItem = findEq((id) => id.startsWith('WPN_') || id.includes('sword'));
            const toolItem   = findEq((id, it) => it?.category === 'tool' && !id.includes('lantern'));
            const torchItem  = findEq((id) => id === 'lantern' || id === 'torch_light' || id.startsWith('ACC_AMULET'));
            const ringItem   = findEq((id) => id.startsWith('ACC_RING') || id === 'truth_shield' || id === 'wood_shield' || id === 'bone_ring' || id === 'sea_compass');
            const bootsItem  = findEq((id) => id.startsWith('ACC_BAG') || id === 'grappling_hook' || id === 'leather_boots');

            const renderSlotHtml = (posClass, itemId, fallbackSprite, label) => {
                const it = itemId ? Items[itemId] : null;
                return `
                    <div class="srpg-equip-slot ${posClass}" data-eqid="${itemId || ''}" title="${it ? it.name + ' (點擊卸下)' : label}">
                        ${it ? getPixelIconHtml(it.sprite || 'shield', 30) : `<span style="opacity:0.22;">${getPixelIconHtml(fallbackSprite, 26)}</span>`}
                    </div>
                `;
            };

            const nextExp = RPGFormulas.getExpRequired(p.level || 1);
            dollBox.innerHTML = `
                <div style="position:absolute; top:0; left:0; width:100%; text-align:center; font-size:13px; font-weight:900; color:#3b2614;">
                    👤 ${p.name || 'Justin'} &nbsp; <span style="background:#3b2614; color:#fde047; padding:1px 6px; border-radius:4px;">Lv.${p.level || 1}</span>
                    <span style="font-size:11px; color:#5c3a21; margin-left:4px;">(EXP: ${p.exp || 0}/${nextExp})</span>
                </div>
                <div class="srpg-doll-silhouette" style="margin-top:16px;">
                    <div class="doll-head"></div>
                    <div class="doll-torso"></div>
                    <div class="doll-legs"><div class="doll-leg"></div><div class="doll-leg"></div></div>
                </div>
                ${renderSlotHtml('slot-tool', toolItem, 'pickaxe', '採集工具槽')}
                ${renderSlotHtml('slot-head', headItem, 'shield', '頭盔/面具槽')}
                ${renderSlotHtml('slot-torch', torchItem, 'potion', '提燈/聖物槽')}
                ${renderSlotHtml('slot-chest', chestItem, 'shield', '胸甲/法袍槽')}
                ${renderSlotHtml('slot-weapon', weaponItem, 'sword', '主手武器槽')}
                ${renderSlotHtml('slot-ring', ringItem, 'gem', '戒指/護盾槽')}
                ${renderSlotHtml('slot-boots', bootsItem, 'bag', '皮靴/抓鉤槽')}
            `;

            dollBox.querySelectorAll('.srpg-equip-slot').forEach(slotEl => {
                slotEl.onclick = () => {
                    const eqId = slotEl.dataset.eqid;
                    if (!eqId) return;
                    p.equipment = p.equipment.filter(e => e !== eqId);
                    if (p.recalcStats) p.recalcStats();
                    eventBus.emit('HUD_UPDATE');
                    this.renderInventory();
                };
            });
        }

        if (statsBox) {
            const patk = p.calcAtk ? p.calcAtk() : 50;
            const def = p.calcDef ? p.calcDef() : 30;
            const critPct = p.equipment.includes('ARM_CLOAK_T3') || p.activeBranch === 'gale_ranger' ? 35 : 15;
            const freePts = p.freeStatPoints || 0;

            statsBox.innerHTML = `
                <span>🗡️ ${patk}</span>
                <span>⚡ ${critPct}%</span>
                <span>🛡️ ${def}</span>
                ${freePts > 0 ? `<button id="btn-quick-stat-add" class="px-btn success" style="padding:2px 6px; font-size:10px;">+配點(${freePts})</button>` : ''}
            `;
            const statBtn = statsBox.querySelector('#btn-quick-stat-add');
            if (statBtn) {
                statBtn.onclick = () => {
                    p.stats.str = (p.stats.str || 10) + 2;
                    p.stats.vit = (p.stats.vit || 10) + 2;
                    p.stats.int = (p.stats.int || 10) + 1;
                    p.freeStatPoints = Math.max(0, p.freeStatPoints - 5);
                    if (p.recalcStats) p.recalcStats();
                    eventBus.emit('SHOW_TOAST', '已強化屬性：STR+2, VIT+2, INT+1！');
                    eventBus.emit('HUD_UPDATE');
                    this.renderInventory();
                };
            }
        }
    }

    renderCrafting() {
        const list = document.getElementById('crafting-list');
        const detailPane = document.getElementById('crafting-detail-pane');
        const leftBottomName = document.getElementById('craft-selected-name-left');
        const fragBadge = document.getElementById('craft-frag-badge');
        if (!list || !detailPane) return;

        const p = this.gameState.player;
        const inv = p.inventory;
        if (fragBadge) fragBadge.innerText = `💎 ${inv['truth_fragment'] || 0}`;

        const visibleRecipes = Recipes.filter(r => this.isRecipeVisibleByProgression(r));
        if (!this.selectedRecipe || !visibleRecipes.includes(this.selectedRecipe)) {
            this.selectedRecipe = visibleRecipes[0] || Recipes[0];
        }
        if (leftBottomName && this.selectedRecipe) {
            leftBottomName.innerText = this.selectedRecipe.name;
        }

        const groups = [
            { title: '基礎與建材', cats: ['refined'] },
            { title: '工具', cats: ['tool'] },
            { title: '武器與防具', cats: ['weapon', 'armor', 'accessory'] },
            { title: '藥水與消耗品', cats: ['consumable'] }
        ];

        list.innerHTML = '';
        groups.forEach(g => {
            const groupRecipes = visibleRecipes.filter(r => g.cats.includes(r.category || 'refined'));
            if (groupRecipes.length === 0) return;

            const secTitle = document.createElement('div');
            secTitle.className = 'srpg-craft-sec-title';
            secTitle.innerText = g.title;
            list.appendChild(secTitle);

            const row = document.createElement('div');
            row.className = 'srpg-craft-sec-row';

            groupRecipes.forEach(rec => {
                const outItem = Items[rec.id];
                const isSel = this.selectedRecipe && this.selectedRecipe.id === rec.id;
                const alreadyMade = (inv[rec.id] || 0) > 0 || p.equipment.includes(rec.id) || (this.gameState.encyclopedia || []).includes(rec.id);

                const box = document.createElement('div');
                box.className = `srpg-item-box ${isSel ? 'selected' : ''}`;
                box.style.cssText = 'width:48px; height:48px;';
                box.title = rec.name;
                box.innerHTML = `
                    ${alreadyMade ? '<span class="eq-dot" title="已製作解鎖"></span>' : ''}
                    ${getPixelIconHtml(outItem?.sprite || 'gem', 28)}
                `;
                box.onclick = () => {
                    this.selectedRecipe = rec;
                    this.craftBatchCount = 1;
                    this.renderCrafting();
                };
                row.appendChild(box);
            });

            list.appendChild(row);
        });

        const sel = this.selectedRecipe;
        if (!sel) return;
        const outItem = Items[sel.id];
        const batch = this.craftBatchCount || 1;

        const costEntries = Object.entries(sel.cost || {});
        let canCraftAll = true;
        let slotsHtml = '';

        for (let i = 0; i < 5; i++) {
            if (i < costEntries.length) {
                const [matId, reqBase] = costEntries[i];
                const reqTotal = reqBase * batch;
                const hasCnt = inv[matId] || 0;
                const enough = hasCnt >= reqTotal;
                if (!enough) canCraftAll = false;
                const matItem = Items[matId];

                slotsHtml += `
                    <div class="srpg-ingred-slot-wrap" title="${matItem?.name || matId}">
                        <div class="srpg-ingred-box">
                            ${getPixelIconHtml(matItem?.sprite || 'stone', 26)}
                        </div>
                        <div class="srpg-ingred-ratio" style="color:${enough ? '#15803d' : '#b91c1c'};">
                            ${hasCnt}/${reqTotal}
                        </div>
                    </div>
                `;
            } else {
                slotsHtml += `
                    <div class="srpg-ingred-slot-wrap">
                        <div class="srpg-ingred-box" style="opacity:0.45;"></div>
                        <div class="srpg-ingred-ratio">&nbsp;</div>
                    </div>
                `;
            }
        }

        detailPane.innerHTML = `
            <div class="srpg-craft-right-box">
                <div style="font-size:16px; font-weight:900; color:#2b1d0e;">${sel.name}</div>
                <div class="srpg-craft-preview-big">
                    ${getPixelIconHtml(outItem?.sprite || 'gem', 46)}
                </div>
                <div style="font-size:11px; color:#5c3a21; text-align:center; padding:0 8px;">${stripTierText(sel.desc)}</div>
                <div class="srpg-ingred-row">${slotsHtml}</div>
                <div class="srpg-qty-Row">
                    <button id="craft-qty-minus" class="srpg-qty-btn">−</button>
                    <span>${batch}</span>
                    <button id="craft-qty-plus" class="srpg-qty-btn">+</button>
                </div>
                <button id="btn-do-craft-srpg" class="srpg-brown-pill-btn" ${canCraftAll ? '' : 'disabled'}>製作</button>
            </div>
        `;

        detailPane.querySelector('#craft-qty-minus').onclick = () => {
            if (this.craftBatchCount > 1) {
                this.craftBatchCount--;
                this.renderCrafting();
            }
        };
        detailPane.querySelector('#craft-qty-plus').onclick = () => {
            if (this.craftBatchCount < 10) {
                this.craftBatchCount++;
                this.renderCrafting();
            }
        };

        const craftBtn = detailPane.querySelector('#btn-do-craft-srpg');
        if (craftBtn && canCraftAll) {
            craftBtn.onclick = () => {
                for (const [reqItem, reqCount] of costEntries) {
                    p.removeItem(reqItem, reqCount * batch);
                }
                p.addItem(sel.id, batch);
                if (!this.gameState.encyclopedia) this.gameState.encyclopedia = [];
                if (!this.gameState.encyclopedia.includes(sel.id)) {
                    this.gameState.encyclopedia.push(sel.id);
                }
                eventBus.emit('RECORD_CRAFT', { recipeId: sel.recipeId || sel.id, itemId: sel.id });

                if (['weapon', 'armor', 'accessory'].includes(sel.category)) {
                    if (!p.affixes) p.affixes = {};
                    const randomAffix = AFFIX_POOL[Math.floor(Math.random() * AFFIX_POOL.length)];
                    p.affixes[sel.id] = randomAffix;
                    eventBus.emit('SHOW_TOAST', `鍛造出：【${randomAffix.name}${sel.name}】（已解鎖下一階配方！）`);
                } else {
                    eventBus.emit('SHOW_TOAST', `成功製作：${sel.name} x${batch}`);
                }
                eventBus.emit('PLAY_SOUND', 'collect');
                eventBus.emit('HUD_UPDATE');
                this.renderCrafting();
            };
        }
    }

    renderQuestsTab() {
        const list = document.getElementById('quests-list');
        if (!list) return;
        list.innerHTML = '';

        const subHeader = document.createElement('div');
        subHeader.className = 'srpg-inner-subtabs';
        subHeader.innerHTML = `
            <button class="srpg-inner-tab ${this.questSubView === 'QUESTS' ? 'active' : ''}" id="subtab-btn-quests">任務</button>
            <button class="srpg-inner-tab ${this.questSubView === 'WORLD_MAP' ? 'active' : ''}" id="subtab-btn-wmap">地圖</button>
        `;
        list.appendChild(subHeader);

        subHeader.querySelector('#subtab-btn-quests').onclick = () => {
            this.questSubView = 'QUESTS';
            this.renderQuestsTab();
        };
        subHeader.querySelector('#subtab-btn-wmap').onclick = () => {
            this.questSubView = 'WORLD_MAP';
            this.renderQuestsTab();
        };

        if (this.questSubView === 'WORLD_MAP') {
            this.renderArchipelagoWorldMap(list);
            return;
        }

        const scrollBody = document.createElement('div');
        scrollBody.style.cssText = 'flex:1; overflow-y:auto; padding:4px 12px;';

        const completed = this.gameState.completedQuests || [];
        const activeQuests = QuestDatabase.filter(q => !completed.includes(q.questId) || q.Repeatable);
        const mainQuests = activeQuests.filter(q => q.type === 'main').slice(0, 2);
        const otherQuests = activeQuests.filter(q => q.type !== 'main').slice(0, 5);

        const buildQuestRowHtml = (q) => {
            const prereqOk = !q.prerequisiteQuestId || completed.includes(q.prerequisiteQuestId);
            let allMet = true;
            const progText = q.objectives.map(o => {
                const cur = this.getObjectiveCurrentCount(q.questId, o);
                if (cur < o.requiredCount) allMet = false;
                return `${o.targetName}(${Math.min(cur, o.requiredCount)}/${o.requiredCount})`;
            }).join('、');

            return `
                <div class="srpg-quest-row" data-qid="${q.questId}" style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px dashed #8c6239; opacity:${prereqOk ? '1' : '0.55'};">
                    <div>
                        <div style="font-size:15px; font-weight:900; color:#2b1d0e;">
                            <span style="color:#2563eb; margin-right:6px;">♦</span>${q.title}
                        </div>
                        <div style="font-size:12px; color:#5c3a21; margin-left:18px; margin-top:2px;">目標：${progText}</div>
                    </div>
                    <div style="display:flex; gap:6px; align-items:center;">
                        ${(allMet && prereqOk) ? `<button class="srpg-brown-pill-btn btn-claim-q" data-qid="${q.questId}" style="padding:5px 14px; font-size:12px; background:#15803d;">領獎</button>` : ''}
                        <button class="btn-hint-q" data-qid="${q.questId}" style="width:46px; height:46px; background:#f3dbb3; border:2px solid #3b2614; border-radius:4px; cursor:pointer; display:flex; flex-direction:column; align-items:center; justify-content:center; font-size:10px; font-weight:bold; color:#3b2614;">
                            <span style="font-size:18px;">💡</span>提示
                        </button>
                    </div>
                </div>
            `;
        };

        scrollBody.innerHTML = `
            <div style="text-align:center; font-size:16px; font-weight:900; color:#2b1d0e; margin-bottom:6px;">主線任務</div>
            ${mainQuests.map(buildQuestRowHtml).join('')}
            <div style="border-top:2.5px solid #3b2614; margin:14px 0 8px 0; padding-top:8px; text-align:center; font-size:15px; font-weight:900; color:#2b1d0e;">
                隨選任務 / 秘密委託
            </div>
            ${otherQuests.map(buildQuestRowHtml).join('')}
        `;

        scrollBody.querySelectorAll('.btn-claim-q').forEach(btn => {
            btn.onclick = () => eventBus.emit('COMPLETE_QUEST', btn.dataset.qid);
        });

        scrollBody.querySelectorAll('.btn-hint-q').forEach(btn => {
            btn.onclick = () => {
                const q = QuestDatabase.find(x => x.questId === btn.dataset.qid);
                if (!q) return;
                const killObj = q.objectives.find(o => o.type === 'kill');
                if (killObj) {
                    this.toggle();
                    eventBus.emit('QUEST_TARGET_ENCOUNTER', { targetMonsterId: killObj.targetId, questTitle: q.title });
                } else {
                    eventBus.emit('SHOW_DIALOG', {
                        title: `任務提示：${q.title}`,
                        text: `委託人：${stripTierText(q.giverNpc)}\n說明：${stripTierText(q.description)}\n完成獎勵：+${q.rewards.exp} EXP, +${q.rewards.gold} G`
                    });
                }
            };
        });

        list.appendChild(scrollBody);
    }

 // 🌟 請替換 src/view/UIManager.js 內 renderArchipelagoWorldMap 的開頭部分 (自動縮小適應視窗高度)：
    renderArchipelagoWorldMap(container) {
        const wrap = document.createElement('div');
        wrap.style.cssText = 'flex:1; min-height:0; display:flex; flex-direction:column; align-items:center; justify-content:center; position:relative; overflow:hidden; padding:2px 6px;';

        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 350;
        // 🌟 關鍵修復：同時限制 max-height: calc(100% - 22px) 與 width: auto，讓海圖在手機橫向視窗內自動縮小，100% 看到底部所有島嶼！
        canvas.style.cssText = 'max-width:100%; max-height:calc(100% - 22px); width:auto; height:auto; object-fit:contain; border:3px solid #2b1d0e; cursor:pointer; box-shadow:0 4px 12px rgba(0,0,0,0.4);';
        wrap.appendChild(canvas);

        const hintBar = document.createElement('div');
        hintBar.style.cssText = 'font-size:11px; font-weight:900; color:#3b2614; margin-top:3px; flex-shrink:0;';
        hintBar.innerText = '⛵ 點擊海圖上的島嶼可直接揚帆傳送（紅旗為當前所在島嶼）';
        wrap.appendChild(hintBar);
        container.appendChild(wrap);

        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;

        ctx.fillStyle = '#0d75f8';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#1ca3ff';
        ctx.beginPath();
        ctx.ellipse(320, 180, 220, 125, 0, 0, Math.PI * 2);
        ctx.fill();

        const islands = [
            { id: 'campMap', mapId: 'safe_camp', name: '安全基地營', x: 75, y: 45, w: 92, h: 54, color: '#3b8c24', huts: 2 },
            { id: 'starter_island', mapId: 'starter_island', name: '翡翠平原島', x: 270, y: 145, w: 110, h: 72, color: '#3b8c24', huts: 2 },
            { id: 'level2Map', mapId: 'desert_ruins', name: '時光沙漏島', x: 255, y: 275, w: 75, h: 52, color: '#e6dc65', huts: 1 },
            { id: 'poisonMap', mapId: 'poison_swamp', name: '劇毒迷瘴島', x: 110, y: 120, w: 85, h: 95, color: '#2e6f1e', huts: 1 },
            { id: 'iceMap', mapId: 'ice_ruins', name: '永凍冰晶島', x: 450, y: 65, w: 95, h: 65, color: '#8be0f7', huts: 1 },
            { id: 'deepSeaMap', mapId: 'deep_sea', name: '深海珊瑚礁', x: 415, y: 175, w: 85, h: 75, color: '#2ea86c', huts: 1 },
            { id: 'clockworkMap', mapId: 'clockwork', name: '泰坦發條島', x: 190, y: 215, w: 125, h: 54, color: '#7c7458', huts: 2 },
            { id: 'floatingMap', mapId: 'floating', name: '星辰浮空島', x: 375, y: 265, w: 105, h: 55, color: '#458b28', huts: 1 },
            { id: 'bossMap', mapId: 'boss_arena', name: '創世獸神殿', x: 470, y: 280, w: 115, h: 52, color: '#2d251e', huts: 1 }
        ];

        const curMapId = this.gameState.currentMap?.id || 'starter_island';

        islands.forEach(isl => {
            ctx.fillStyle = '#38bdf8';
            ctx.fillRect(isl.x - 8, isl.y - 8, isl.w + 16, isl.h + 16);
            ctx.fillStyle = '#fde047';
            ctx.fillRect(isl.x - 4, isl.y - 4, isl.w + 8, isl.h + 8);
            ctx.fillStyle = isl.color;
            ctx.fillRect(isl.x, isl.y, isl.w, isl.h);

            for (let h = 0; h < isl.huts; h++) {
                const hx = isl.x + 12 + h * 36;
                const hy = isl.y + 14;
                ctx.fillStyle = '#78350f';
                ctx.fillRect(hx, hy, 20, 14);
                ctx.fillStyle = '#a16207';
                ctx.fillRect(hx - 2, hy - 5, 24, 6);
                ctx.fillStyle = '#1c1917';
                ctx.fillRect(hx + 7, hy + 6, 6, 8);
            }

            ctx.fillStyle = '#14532d';
            for (let t = 0; t < 5; t++) {
                const tx = isl.x + ((t * 23 + 19) % (isl.w - 14));
                const ty = isl.y + isl.h - 18 - (t % 2) * 10;
                ctx.fillRect(tx, ty, 8, 8);
            }

            ctx.fillStyle = 'rgba(20, 16, 19, 0.78)';
            ctx.fillRect(isl.x, isl.y + isl.h - 14, isl.w, 14);
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 10px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(isl.name, isl.x + isl.w / 2, isl.y + isl.h - 3);

            if (isl.mapId === curMapId) {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(isl.x + isl.w / 2 - 2, isl.y - 16, 3, 22);
                ctx.fillStyle = '#ef4444';
                ctx.fillRect(isl.x + isl.w / 2 + 1, isl.y - 16, 16, 10);
            }
        });

        canvas.onclick = (e) => {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const mx = (e.clientX - rect.left) * scaleX;
            const my = (e.clientY - rect.top) * scaleY;

            const clicked = islands.find(isl => mx >= isl.x - 6 && mx <= isl.x + isl.w + 6 && my >= isl.y - 6 && my <= isl.y + isl.h + 6);
            if (clicked) {
                this.toggle();
                eventBus.emit('CHANGE_MAP', clicked.id);
            }
        };
    }

    getObjectiveCurrentCount(qId, obj) {
        const p = this.gameState.player;
        const qProg = (this.gameState.questProgress && this.gameState.questProgress[qId]) || { kills: {}, crafts: {} };
        if (obj.type === 'collect') return p.inventory[obj.targetId] || 0;
        if (obj.type === 'kill') return (qProg.kills && qProg.kills[obj.targetId]) || 0;
        if (obj.type === 'craft') {
            const craftedCnt = (qProg.crafts && qProg.crafts[obj.targetId]) || 0;
            const rec = Recipes.find(r => r.recipeId === obj.targetId || r.id === obj.targetId);
            const hasOutput = rec && (p.inventory[rec.id] || 0) > 0 ? 1 : 0;
            return Math.max(craftedCnt, hasOutput);
        }
        return 0;
    }

    renderSkillsTab() {
        const list = document.getElementById('skills-list');
        if (!list) return;
        list.innerHTML = '';

        const p = this.gameState.player;
        if (!p.activeBranch) p.activeBranch = 'earth_blademaster';
        if (!p.treeLevels) p.treeLevels = { SK_EB_01: 1, SK_GR_01: 1, SK_SA_01: 1 };

        const sp = p.skillPoints || 0;
        const gold = p.gold || 0;
        const frags = p.inventory['truth_fragment'] || 0;

        const topBar = document.createElement('div');
        topBar.style.cssText = 'background:#ebd5b3; border:2px solid #5c3a21; padding:6px 10px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;';
        const branchBtns = Object.values(SkillTrees).map(b => 
            `<button class="px-btn ${p.activeBranch === b.branchId ? 'success' : ''}" data-branch="${b.branchId}" style="padding:3px 8px; font-size:11px;">${b.branchName}</button>`
        ).join('');

        topBar.innerHTML = `
            <div style="display:flex; gap:5px; flex-wrap:wrap;">${branchBtns}</div>
            <div style="font-size:12px; color:#3b2614; font-weight:900;">SP:${sp} ｜ 💰${gold}G ｜ 💎${frags}</div>
        `;
        list.appendChild(topBar);

        topBar.querySelectorAll('[data-branch]').forEach(btn => {
            btn.onclick = () => {
                const bId = btn.dataset.branch;
                p.activeBranch = bId;
                p.jobTitle = SkillTrees[bId].jobTitle;
                if (p.recalcStats) p.recalcStats();
                eventBus.emit('SHOW_TOAST', `切換流派：【${SkillTrees[bId].branchName}】`);
                eventBus.emit('HUD_UPDATE');
                this.renderSkillsTab();
            };
        });

        const currentBranch = SkillTrees[p.activeBranch] || SkillTrees.earth_blademaster;

        currentBranch.skills.forEach(sk => {
            const curLv = this.getSkillLevel(p, sk.id);
            const isLocked = curLv <= 0;
            const isMax = curLv >= sk.maxLevel;

            const reqSp = isLocked ? sk.tier : RPGFormulas.getSkillSpCost(curLv, sk.tier);
            const reqGold = isLocked ? (150 * sk.tier) : RPGFormulas.getSkillGoldCost(curLv, sk.tier);
            const canAfford = !isMax && ((sp >= reqSp && gold >= reqGold) || frags >= reqSp * 2);
            const curMult = isLocked ? sk.baseMultiplier : RPGFormulas.getSkillMultiplier(sk.baseMultiplier, curLv);

            const row = document.createElement('div');
            row.style.cssText = `background:#f3dbb3; border:2px solid #4a2e16; padding:6px 10px; display:flex; justify-content:space-between; align-items:center; opacity:${isLocked ? '0.75' : '1'};`;
            row.innerHTML = `
                <div style="flex:1;">
                    <div style="font-weight:900; font-size:13px; color:#2b1d0e;">
                        ${sk.name}
                        <span style="color:${isLocked ? '#b91c1c' : '#15803d'}; margin-left:6px;">
                            ${isLocked ? '🔒未研發' : `Lv.${curLv}/${sk.maxLevel} (${Math.round(curMult * 100)}%)`}
                        </span>
                    </div>
                    <div style="font-size:11px; color:#5c3a21;">${sk.desc}</div>
                    ${!isMax ? `<div style="font-size:10px; color:#b45309; font-weight:bold;">需求：${reqSp} SP + ${reqGold} G (或 ${reqSp * 2} 碎片)</div>` : ''}
                </div>
                <button class="srpg-brown-pill-btn" style="padding:5px 14px; font-size:12px;" ${canAfford ? '' : 'disabled'}>
                    ${isMax ? 'MAX' : (isLocked ? '🔬 研發' : '⬆️ 升級')}
                </button>
            `;

            if (canAfford) {
                row.querySelector('button').onclick = () => {
                    if (p.skillPoints >= reqSp && (p.gold || 0) >= reqGold) {
                        p.skillPoints -= reqSp;
                        p.gold -= reqGold;
                    } else {
                        p.removeItem('truth_fragment', reqSp * 2);
                    }
                    p.treeLevels[sk.id] = curLv + 1;
                    if (p.recalcStats) p.recalcStats();
                    eventBus.emit('PLAY_SOUND', 'collect');
                    eventBus.emit('SHOW_TOAST', isLocked ? `🎉 成功研發：【${sk.name}】！` : `【${sk.name}】升至 Lv.${curLv + 1}！`);
                    eventBus.emit('HUD_UPDATE');
                    this.renderSkillsTab();
                };
            }
            list.appendChild(row);
        });
    }

    renderEncyclopedia() {
        const encyList = document.getElementById('encyclopedia-list');
        const infoBar = document.getElementById('ency-inspector-bar');
        const progressLabel = document.getElementById('encyclopedia-progress');
        if (!encyList) return;
        encyList.innerHTML = '';

        const modes = [
            { id: 'MATERIALS', label: '📦300素材' },
            { id: 'MONSTERS', label: '👾50魔物' },
            { id: 'NODES', label: '🗺️25採集點' },
            { id: 'STATUS', label: '✨22狀態' },
            { id: 'NPCS', label: '👥12 NPC' }
        ];
        if (progressLabel) {
            progressLabel.innerHTML = modes.map(m => 
                `<button class="px-btn ${this.encyMode === m.id ? 'success' : ''}" data-emode="${m.id}" style="padding:2px 7px; font-size:11px; margin-right:4px;">${m.label}</button>`
            ).join('');
            progressLabel.querySelectorAll('[data-emode]').forEach(b => {
                b.onclick = () => { this.encyMode = b.dataset.emode; this.renderEncyclopedia(); };
            });
        }

        const showInfo = (txt) => { if (infoBar) infoBar.innerHTML = stripTierText(txt); };

        if (this.encyMode === 'MONSTERS') {
            MonsterDatabase.forEach(mon => {
                const box = document.createElement('div');
                box.className = 'srpg-item-box';
                box.innerHTML = `${getPixelIconHtml(mon.sprite || 'witch', 28)}`;
                box.onclick = () => {
                    const dropStr = mon.drops.map(d => `${d.name}(${Math.round(d.dropRate * 100)}%)`).join('、');
                    showInfo(`【${mon.name}】Lv.${mon.levelRange[0]}~${mon.levelRange[1]}｜技能:${mon.skill.name}｜掉落:${dropStr}`);
                };
                encyList.appendChild(box);
            });
            return;
        }

        if (this.encyMode === 'NODES') {
            getAllRegionsSummary().forEach(reg => {
                reg.nodes.forEach(nd => {
                    const spMap = { logging: 'tree', mining: 'iron', crystal_vein: 'ruby_vein', harvesting: 'herb_bush', scavenging: 'chest' };
                    const box = document.createElement('div');
                    box.className = 'srpg-item-box';
                    box.innerHTML = `${getPixelIconHtml(spMap[nd.nodeType] || 'tree', 28)}`;
                    box.onclick = () => {
                        const yTxt = nd.yields.slice(0, 4).map(y => Items[y.materialId]?.name || y.materialId).join('、');
                        showInfo(`【${nd.name}】重生:${nd.respawnTimeSec}s｜經驗:+${nd.expReward}｜產出:${yTxt} 等`);
                    };
                    encyList.appendChild(box);
                });
            });
            return;
        }

        if (this.encyMode === 'STATUS') {
            StatusEffectDatabase.forEach(st => {
                const box = document.createElement('div');
                box.className = 'srpg-item-box';
                box.innerHTML = `<span style="font-size:22px;">${st.icon}</span>`;
                box.onclick = () => showInfo(`【${st.name}】${st.desc}`);
                encyList.appendChild(box);
            });
            return;
        }

        if (this.encyMode === 'NPCS') {
            NPCDatabase.forEach(npc => {
                const box = document.createElement('div');
                box.className = 'srpg-item-box';
                box.innerHTML = `${getPixelIconHtml('merchant', 28)}`;
                box.onclick = () => showInfo(`【${npc.name}（${npc.title}）】「${npc.dialogues.greeting}」`);
                encyList.appendChild(box);
            });
            return;
        }

        const allKeys = Object.keys(Items).filter(k => k.startsWith('MAT_') || k.startsWith('TOOL_') || k.startsWith('WPN_') || k.startsWith('ARM_') || k.startsWith('ACC_'));
        allKeys.forEach(itemId => {
            const item = Items[itemId];
            const isUnlocked = (this.gameState.encyclopedia || []).includes(itemId) || (this.gameState.player.inventory[itemId] || 0) > 0;
            const box = document.createElement('div');
            box.className = 'srpg-item-box';
            box.style.opacity = isUnlocked ? '1' : '0.45';
            box.title = item.name;
            box.innerHTML = `${getPixelIconHtml(item.sprite || 'gem', 28)}`;
            box.onclick = () => {
                encyList.querySelectorAll('.srpg-item-box').forEach(b => b.classList.remove('selected'));
                box.classList.add('selected');
                showInfo(`【${item.name}】${item.desc}`);
            };
            encyList.appendChild(box);
        });
    }

    renderMistakesTab() {
        const list = document.getElementById('mistakes-list');
        if (!list) return;
        list.innerHTML = '';
        const mistakes = this.gameState.mistakes || [];
        const header = document.createElement('div');
        header.style.cssText = 'background:#ebd5b3; border:2px solid #5c3a21; padding:6px 10px; display:flex; justify-content:space-between; align-items:center;';
        header.innerHTML = `
            <b style="color:#2b1d0e;">錯題懸賞錄 (${mistakes.length} 題)</b>
            <div style="display:flex; gap:6px;">
                ${mistakes.length > 0 ? `<button id="btn-clear-mistakes" class="px-btn danger" style="padding:4px 8px; font-size:11px;">清空錯題</button>` : ''}
                <button id="btn-start-revenge" class="srpg-brown-pill-btn" style="padding:4px 12px; font-size:12px;" ${mistakes.length > 0 ? '' : 'disabled'}>⚔️ 討伐錯題魔物</button>
            </div>
        `;
        list.appendChild(header);

        const clearBtn = header.querySelector('#btn-clear-mistakes');
        if (clearBtn) {
            clearBtn.onclick = () => {
                this.gameState.mistakes = [];
                eventBus.emit('SAVE_GAME');
                this.renderMistakesTab();
            };
        }

        const revBtn = header.querySelector('#btn-start-revenge');
        if (revBtn && mistakes.length > 0) {
            revBtn.onclick = () => { this.toggle(); eventBus.emit('REVENGE_ENCOUNTER'); };
        }
        mistakes.forEach((m, idx) => {
            const item = document.createElement('div');
            item.style.cssText = 'background:#f3dbb3; border:1.5px solid #5c3a21; padding:6px 10px; font-size:12px; color:#2b1d0e;';
            item.innerHTML = `<b>#${idx + 1} [${m.subject}]</b> ${m.prompt} ➔ <b style="color:#15803d;">${m.answer}</b>`;
            list.appendChild(item);
        });
    }

    renderSysConfigTab() {
        const container = document.getElementById('sys-config-list');
        if (!container) return;
        const curLang = localStorage.getItem('rpg_tts_lang') || 'zh-HK';
        const curRate = parseFloat(localStorage.getItem('rpg_tts_rate') || '0.95');
        const p = this.gameState.player;

        container.innerHTML = `
            <div style="display:flex; flex-direction:column; gap:8px;">
                <div class="subject-group">
                    <div class="subject-title">👤 角色名稱設定</div>
                    <div style="display:flex; gap:8px; align-items:center;">
                        <input id="cfg-hero-name" type="text" maxlength="12" value="${p.name || 'Justin'}" style="padding:4px 8px; font-weight:bold; border:2px solid #5c3a21;" />
                        <button id="cfg-save-name" class="px-btn success">修改名字</button>
                    </div>
                </div>
                <div class="subject-group">
                    <div class="subject-title">🔊 語音與音樂設定</div>
                    <div style="display:flex; gap:6px; flex-wrap:wrap;">
                        <button id="cfg-toggle-bgm" class="px-btn primary">切換 BGM 開/關</button>
                        <button class="px-btn ${curLang === 'zh-HK' ? 'success' : ''}" data-lang="zh-HK">廣東話</button>
                        <button class="px-btn ${curLang === 'zh-TW' ? 'success' : ''}" data-lang="zh-TW">普通話</button>
                        <button class="px-btn ${curRate === 0.75 ? 'primary' : ''}" data-rate="0.75">慢速 0.75x</button>
                        <button class="px-btn ${curRate === 0.95 ? 'primary' : ''}" data-rate="0.95">標準 0.95x</button>
                        <button class="px-btn ${curRate === 1.2 ? 'primary' : ''}" data-rate="1.2">快速 1.2x</button>
                    </div>
                </div>
                <div class="subject-group">
                    <div class="subject-title">💾 存檔管理</div>
                    <div style="display:flex; gap:6px; flex-wrap:wrap;">
                        <button id="cfg-save-now" class="px-btn success">手動存檔</button>
                        <button id="cfg-export-save" class="px-btn primary">匯出存檔</button>
                        <button id="cfg-import-save" class="px-btn">匯入存檔</button>
                        <button id="cfg-reset-save" class="px-btn danger">重置遊戲</button>
                    </div>
                </div>
            </div>
        `;
        container.querySelector('#cfg-save-name').onclick = () => {
            const val = container.querySelector('#cfg-hero-name').value.trim();
            if (val) {
                p.name = val;
                eventBus.emit('HUD_UPDATE');
                eventBus.emit('SHOW_TOAST', `角色名字已更新為：【${val}】！`);
            }
        };
        container.querySelector('#cfg-toggle-bgm').onclick = () => eventBus.emit('TOGGLE_BGM');
        container.querySelectorAll('[data-lang]').forEach(btn => {
            btn.onclick = () => { localStorage.setItem('rpg_tts_lang', btn.dataset.lang); this.renderSysConfigTab(); };
        });
        container.querySelectorAll('[data-rate]').forEach(btn => {
            btn.onclick = () => { localStorage.setItem('rpg_tts_rate', btn.dataset.rate); this.renderSysConfigTab(); };
        });
        container.querySelector('#cfg-save-now').onclick = () => { eventBus.emit('SAVE_GAME'); eventBus.emit('SHOW_TOAST', '已保存！'); };
        container.querySelector('#cfg-export-save').onclick = () => {
            eventBus.emit('SAVE_GAME');
            prompt('複製存檔碼：', btoa(encodeURIComponent(localStorage.getItem('pixelRpgSave') || '')));
        };
        container.querySelector('#cfg-import-save').onclick = () => {
            const code = prompt('貼上存檔碼：');
            if (!code) return;
            try { localStorage.setItem('pixelRpgSave', decodeURIComponent(atob(code.trim()))); location.reload(); } catch (e) {}
        };
        container.querySelector('#cfg-reset-save').onclick = () => {
            if (confirm('確定重置遊戲？')) { localStorage.removeItem('pixelRpgSave'); location.reload(); }
        };
    }

    renderSubjectSettings() {
        const container = document.getElementById('subject-list');
        if (!container) return;
        container.innerHTML = '';

        const sm = this.questionSystem.subjectModes || { chi: 'ALL', eng: 'ALL', sci: 'ALL', hum: 'ALL' };
        const poolCount = this.questionSystem.getPoolCount ? this.questionSystem.getPoolCount() : 0;

        const fourModesBox = document.createElement('div');
        fourModesBox.className = 'subject-group';
        fourModesBox.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <span class="subject-title" style="margin:0;">⚙️ 四科出題模式與題型篩選 (目前題池共 ${poolCount} 題)</span>
                <button id="btn-test-mode-now" class="px-btn primary" style="padding:3px 10px; font-size:11px;">⚡ 立即抽題實測</button>
            </div>
            <div style="display:grid; grid-template-columns:repeat(4, minmax(0, 1fr)); gap:8px; margin-bottom:10px;">
                <div style="background:#fffdf7; border:2px solid #8c6239; padding:6px; border-radius:4px;">
                    <div style="font-size:12px; font-weight:900; color:#1e3a8a; margin-bottom:4px;">📘 中文模式：</div>
                    <select id="sel-mode-chi" style="width:100%; padding:4px; font-weight:bold; font-size:11px; border:1.5px solid #5c3a21;">
                        <option value="ALL" ${sm.chi === 'ALL' ? 'selected' : ''}>🎲 混合 (釋義+填充)</option>
                        <option value="FILL" ${sm.chi === 'FILL' ? 'selected' : ''}>📝 只出例句填充</option>
                        <option value="MEANING" ${sm.chi === 'MEANING' ? 'selected' : ''}>🔍 只出字詞釋義</option>
                    </select>
                </div>
                <div style="background:#fffdf7; border:2px solid #8c6239; padding:6px; border-radius:4px;">
                    <div style="font-size:12px; font-weight:900; color:#0284c7; margin-bottom:4px;">🔤 英文模式：</div>
                    <select id="sel-mode-eng" style="width:100%; padding:4px; font-weight:bold; font-size:11px; border:1.5px solid #5c3a21;">
                        <option value="ALL" ${sm.eng === 'ALL' ? 'selected' : ''}>🎲 混合 (串字+填充)</option>
                        <option value="FILL" ${sm.eng === 'FILL' ? 'selected' : ''}>📝 只出英文填充題</option>
                        <option value="SPELL" ${sm.eng === 'SPELL' ? 'selected' : ''}>⌨️ 只出無提示串字</option>
                    </select>
                </div>
                <div style="background:#fffdf7; border:2px solid #8c6239; padding:6px; border-radius:4px;">
                    <div style="font-size:12px; font-weight:900; color:#15803d; margin-bottom:4px;">🔬 科學模式：</div>
                    <select id="sel-mode-sci" style="width:100%; padding:4px; font-weight:bold; font-size:11px; border:1.5px solid #5c3a21;">
                        <option value="ALL" ${sm.sci === 'ALL' ? 'selected' : ''}>🎲 全部題型混合</option>
                        <option value="INTERACTIVE" ${sm.sci === 'INTERACTIVE' ? 'selected' : ''}>🧩 互動題 (看圖/分類)</option>
                        <option value="FILL_MC" ${sm.sci === 'FILL_MC' ? 'selected' : ''}>📝 填充與選擇題</option>
                        <option value="QA_SCENARIO" ${sm.sci === 'QA_SCENARIO' ? 'selected' : ''}>💬 簡答與情境題</option>
                    </select>
                </div>
                <div style="background:#fffdf7; border:2px solid #8c6239; padding:6px; border-radius:4px;">
                    <div style="font-size:12px; font-weight:900; color:#b45309; margin-bottom:4px;">🌍 人文模式：</div>
                    <select id="sel-mode-hum" style="width:100%; padding:4px; font-weight:bold; font-size:11px; border:1.5px solid #5c3a21;">
                        <option value="ALL" ${sm.hum === 'ALL' ? 'selected' : ''}>🎲 全部題型混合</option>
                        <option value="INTERACTIVE" ${sm.hum === 'INTERACTIVE' ? 'selected' : ''}>🧩 互動題 (看圖/分類)</option>
                        <option value="FILL_MC" ${sm.hum === 'FILL_MC' ? 'selected' : ''}>📝 填充與選擇題</option>
                        <option value="QA_SCENARIO" ${sm.hum === 'QA_SCENARIO' ? 'selected' : ''}>💬 簡答與情境題</option>
                    </select>
                </div>
            </div>
        `;

        const typeRow = document.createElement('div');
        typeRow.style.cssText = 'display:flex; gap:5px; flex-wrap:wrap; padding-top:4px; border-top:1px dashed #8c6239;';
        const modes = [
            { id: 'ALL', name: '全部題型' },
            { id: '填充題', name: '填充題' },
            { id: '分類題', name: '分類題' },
            { id: '看圖填充題', name: '看圖填充題' },
            { id: '簡答題', name: '簡答題' },
            { id: '選擇題', name: '選擇題' },
            { id: '情境題', name: '情境題' },
            { id: '字詞解釋', name: '中:字詞解釋' },
            { id: '英文串字', name: '英:串字' }
        ];

        modes.forEach(m => {
            const isAllActive = this.activeTypes.includes('ALL');
            const isSelected = m.id === 'ALL' ? isAllActive : (!isAllActive && this.activeTypes.includes(m.id));
            const b = document.createElement('button');
            b.className = `px-btn ${isSelected ? 'success' : ''}`;
            b.style.cssText = `padding:3px 8px; font-size:11px; ${isSelected ? '' : 'opacity:0.75;'}`;
            b.innerText = `${isSelected ? '☑ ' : '☐ '}${m.name}`;
            b.onclick = () => {
                if (m.id === 'ALL') {
                    this.activeTypes = ['ALL'];
                } else {
                    if (this.activeTypes.includes('ALL')) this.activeTypes = [m.id];
                    else if (this.activeTypes.includes(m.id)) {
                        this.activeTypes = this.activeTypes.filter(t => t !== m.id);
                        if (this.activeTypes.length === 0) this.activeTypes = ['ALL'];
                    } else {
                        this.activeTypes.push(m.id);
                    }
                }
                this.questionSystem.setActiveTypes(this.activeTypes);
                this.renderSubjectSettings();
            };
            typeRow.appendChild(b);
        });
        fourModesBox.appendChild(typeRow);
        container.appendChild(fourModesBox);

        ['chi', 'eng', 'sci', 'hum'].forEach(sKey => {
            const selEl = fourModesBox.querySelector(`#sel-mode-${sKey}`);
            if (selEl) {
                selEl.onchange = (e) => {
                    this.questionSystem.setSubjectMode(sKey, e.target.value);
                    this.renderSubjectSettings();
                };
            }
        });

        fourModesBox.querySelector('#btn-test-mode-now').onclick = () => {
            this.toggle();
            eventBus.emit('ENCOUNTER_ENEMY', 'random_monster');
        };

        const quickFilterBar = document.createElement('div');
        quickFilterBar.style.cssText = 'display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px; margin-bottom:6px; background:#ebd5b3; padding:6px 10px; border:2px solid #5c3a21;';
        quickFilterBar.innerHTML = `
            <span style="font-size:12px; font-weight:900; color:#2b1d0e;">📚 選擇溫習科目與課節 (可單選一科或多科混搭)：</span>
            <div style="display:flex; gap:4px; flex-wrap:wrap;">
                <button class="px-btn success" id="qf-all" style="padding:2px 7px; font-size:11px;">全選四科</button>
                <button class="px-btn primary" id="qf-chi" style="padding:2px 7px; font-size:11px;">只選中文</button>
                <button class="px-btn primary" id="qf-eng" style="padding:2px 7px; font-size:11px;">只選英文</button>
                <button class="px-btn primary" id="qf-sci" style="padding:2px 7px; font-size:11px;">只選科學</button>
                <button class="px-btn primary" id="qf-hum" style="padding:2px 7px; font-size:11px;">只選人文</button>
            </div>
        `;
        container.appendChild(quickFilterBar);

        const selectOnlySub = (targetSubId) => {
            this.activeUnits = [];
            this.questionSystem.subjectData.forEach(s => {
                if (targetSubId === 'ALL' || s.id === targetSubId) {
                    s.units.forEach(u => this.activeUnits.push(u.id));
                }
            });
            eventBus.emit('UPDATE_SUBJECTS', this.activeUnits);
            this.renderSubjectSettings();
        };
        quickFilterBar.querySelector('#qf-all').onclick = () => selectOnlySub('ALL');
        quickFilterBar.querySelector('#qf-chi').onclick = () => selectOnlySub('chi');
        quickFilterBar.querySelector('#qf-eng').onclick = () => selectOnlySub('eng');
        quickFilterBar.querySelector('#qf-sci').onclick = () => selectOnlySub('sci');
        quickFilterBar.querySelector('#qf-hum').onclick = () => selectOnlySub('hum');

        const unitsBox = document.createElement('div');
        unitsBox.className = 'subject-group';
        const grid = document.createElement('div');
        grid.className = 'unit-grid';
        grid.style.cssText = 'display:grid; grid-template-columns:repeat(3, minmax(0, 1fr)); gap:6px;';

        const subBadgeColors = { chi: '#1d4ed8', eng: '#0284c7', sci: '#15803d', hum: '#b45309' };

        this.questionSystem.subjectData.forEach(sub => {
            sub.units.forEach(u => {
                const lbl = document.createElement('label');
                lbl.className = 'unit-label';
                lbl.style.cssText = 'display:flex; align-items:center; gap:5px; background:#fffdf7; border:1.5px solid #8c6239; padding:4px 8px; border-radius:4px; cursor:pointer; font-size:12px; font-weight:bold;';
                lbl.innerHTML = `
                    <input type="checkbox" class="unit-cb" value="${u.id}" ${this.activeUnits.includes(u.id) ? 'checked' : ''}>
                    <span style="color:${subBadgeColors[sub.id] || '#2b1d0e'};">${u.name} (${u.questions?.length || 0})</span>
                `;
                grid.appendChild(lbl);
            });
        });

        unitsBox.appendChild(grid);
        container.appendChild(unitsBox);

        unitsBox.querySelectorAll('.unit-cb').forEach(cb => {
            cb.addEventListener('change', (e) => {
                if (e.target.checked && !this.activeUnits.includes(e.target.value)) {
                    this.activeUnits.push(e.target.value);
                } else if (!e.target.checked) {
                    this.activeUnits = this.activeUnits.filter(id => id !== e.target.value);
                }
                eventBus.emit('UPDATE_SUBJECTS', this.activeUnits);
                this.renderSubjectSettings();
            });
        });
        eventBus.emit('UPDATE_SUBJECTS', this.activeUnits);
    }

    // =========================================================================
    // 🏰 進階改造 A：主城實體 NPC 視覺小說對話框 & 據點設施升級系統 (消耗木石素材)
    // =========================================================================
    initCampHubAndUpgrades() {
        // 初始化據點建築等級並套用屬性加成
        try {
            const savedCamp = localStorage.getItem('rpg_camp_buildings');
            if (savedCamp && !this.gameState.campBuildings) {
                this.gameState.campBuildings = JSON.parse(savedCamp);
            }
        } catch (e) {}

        if (!this.gameState.campBuildings) {
            this.gameState.campBuildings = { forge: 0, altar: 0, storage: 0, greenhouse: 0 };
        }
        this.applyCampBuildingBonuses();

        // 在建造模式面板加入「🏰 據點設施升級」快捷按鈕
        const buildUi = document.getElementById('build-mode-ui');
        if (buildUi && !document.getElementById('btn-open-camp-upgrades')) {
            const upgBtn = document.createElement('button');
            upgBtn.id = 'btn-open-camp-upgrades';
            upgBtn.className = 'px-btn success';
            upgBtn.style.cssText = 'width:100%; margin-top:8px; padding:6px; font-size:13px;';
            upgBtn.innerHTML = '🏰 打開【皇家據點設施升級】';
            upgBtn.onclick = () => this.openCampUpgradeModal();
            buildUi.appendChild(upgBtn);
        }

        eventBus.on('OPEN_CAMP_NPC', (npcId) => {
            this.openCampNpcDialog(npcId);
        });
    }

    saveCampBuildings() {
        try {
            localStorage.setItem('rpg_camp_buildings', JSON.stringify(this.gameState.campBuildings));
        } catch (e) {}
    }

    applyCampBuildingBonuses() {
        const p = this.gameState.player;
        const b = this.gameState.campBuildings || { forge: 0, altar: 0, storage: 0, greenhouse: 0 };
        if (!p._baseStatsBackup) {
            p._baseStatsBackup = {
                str: p.stats?.str || 10,
                vit: p.stats?.vit || 10,
                int: p.stats?.int || 10
            };
        }
        // 將據點建築加成注入角色基礎能力與最大血魔
        const bonusAtk = (b.forge || 0) * 15;
        const bonusHp = (b.altar || 0) * 60;
        const bonusMp = (b.altar || 0) * 15;
        const bonusDef = (b.greenhouse || 0) * 12;

        p.campBonusAtk = bonusAtk;
        p.campBonusDef = bonusDef;

        if (!p._origCalcAtk && typeof p.calcAtk === 'function') {
            const origAtk = p.calcAtk.bind(p);
            p._origCalcAtk = origAtk;
            p.calcAtk = () => origAtk() + (p.campBonusAtk || 0);
        }
        if (!p._origCalcDef && typeof p.calcDef === 'function') {
            const origDef = p.calcDef.bind(p);
            p._origCalcDef = origDef;
            p.calcDef = () => origDef() + (p.campBonusDef || 0);
        }

        const baseMaxHp = 100 + ((p.level || 1) - 1) * 20 + ((p.stats?.vit || 10) * 6);
        p.maxHp = Math.max(p.maxHp || 160, baseMaxHp + bonusHp);
        p.maxMp = Math.max(p.maxMp || 60, 60 + bonusMp);
    }

    openCampNpcDialog(npcId) {
        const dialogLayer = document.getElementById('pixel-dialog-layer');
        const titleEl = document.getElementById('pixel-dialog-title');
        const textEl = document.getElementById('pixel-dialog-text');
        if (!dialogLayer || !titleEl || !textEl) return;

        const p = this.gameState.player;
        const b = this.gameState.campBuildings || { forge: 0, altar: 0, storage: 0, greenhouse: 0 };

        const npcConfigs = {
            guild_master: {
                name: '公會會長 亞瑟',
                role: '冒險者公會總長',
                avatar: '👑',
                greeting: `「辛苦了，${p.name || 'Justin'}！無知迷霧仍在侵蝕外圍群島。\n\n目前你的公會榮譽等級為 Lv.${p.level || 1}。需要查看各島嶼的委託任務，還是打開群島海圖揚帆出征？」`,
                actions: [
                    { label: '🗼 挑戰【知識試煉之塔】(5層連戰)', fn: () => { dialogLayer.style.display = 'none'; eventBus.emit('ENCOUNTER_ENEMY', 'obelisk_trial'); } },
                    { label: '📜 查看委託任務', fn: () => { dialogLayer.style.display = 'none'; this.openToTab('tab-quests', 'QUESTS'); } },
                    { label: '⛵ 打開群島世界海圖', fn: () => { dialogLayer.style.display = 'none'; this.openToTab('tab-quests', 'WORLD_MAP'); } },
                    { label: '🎯 討伐錯題懸賞錄', fn: () => { dialogLayer.style.display = 'none'; this.openToTab('tab-mistakes'); } }
                ]
            },
            blacksmith: {
                name: '鐵匠大師 托爾',
                role: '皇家首席鍛造師',
                avatar: '🔨',
                greeting: `「哈哈！在野外收集到不少木材和圓石吧？別讓它們塞爆你的背包！\n\n把木頭與礦石交給我來【升級據點設施】，不僅能永久擴充倉庫容量，還能大幅提升你的攻擊力與血量上限！」`,
                actions: [
                    { label: '🏰 升級據點設施 (消耗木石)', fn: () => { dialogLayer.style.display = 'none'; this.openCampUpgradeModal(); } },
                    { label: '⚒️ 進入武器與工具鍛造坊', fn: () => { dialogLayer.style.display = 'none'; this.openToTab('tab-crafting'); } },
                    { label: '🧱 開啟營地自由建造模式', fn: () => { dialogLayer.style.display = 'none'; document.getElementById('btn-build-toggle')?.click(); } }
                ]
            },
            alchemist: {
                name: '煉金導師 薇薇安',
                role: '王國首席草藥學者',
                avatar: '⚗️',
                greeting: `「歡迎來到煉金溫室！在荒島採集消耗了不少體力吧？\n\n我已經為你施展了免費的【聖光治癒術】恢復全部 HP 與 MP！如果你升級了『煉金藥草溫室 (目前 Lv.${b.greenhouse || 0})』，每次還能找我領取免費草藥補給喔！」`,
                actions: [
                    {
                        label: '💚 免費恢復全部 HP/MP 並領取溫室草藥',
                        fn: () => {
                            p.hp = p.maxHp;
                            p.mp = p.maxMp || 60;
                            const herbBonus = Math.max(1, b.greenhouse || 1);
                            p.addItem('MAT_201', herbBonus);
                            eventBus.emit('PLAY_SOUND', 'collect');
                            eventBus.emit('HUD_UPDATE');
                            eventBus.emit('SHOW_TOAST', `✨ 體力魔力全滿！並領取溫室產出：【止血草 x${herbBonus}】！`);
                            dialogLayer.style.display = 'none';
                        }
                    },
                    { label: '💡 聽取各章節機關破關秘訣', fn: () => {
                        textEl.innerHTML = `<div style="background:#fffdf7; border:2px solid #8c6239; padding:8px; border-radius:4px; font-size:12px; line-height:1.6;">
                            <b>📌 荒島破關四大秘訣：</b><br>
                            1. <b>第二章 (沙漠裂縫牆)</b>：需於【製作 -> 工具】合成「開山火藥桶」炸開裂牆。<br>
                            2. <b>第三章 (劇毒迷瘴島)</b>：製作並穿戴「淨化防毒面具」可免疫毒水傷害。<br>
                            3. <b>第六章 (泰坦發條島)</b>：紅色電子閘門需消耗「魔力電池」開啟。<br>
                            4. <b>第七章 (星辰浮空島)</b>：跨越虛空深淵需裝備「精鋼飛索抓鉤」。
                        </div>`;
                    } },
                    { label: '🏰 升級煉金藥草溫室', fn: () => { dialogLayer.style.display = 'none'; this.openCampUpgradeModal(); } }
                ]
            }
        };

        const cfg = npcConfigs[npcId] || npcConfigs.guild_master;
        titleEl.innerHTML = `<span style="font-size:20px; margin-right:6px;">${cfg.avatar}</span>${cfg.name} <span style="font-size:12px; color:#b45309; margin-left:6px;">— ${cfg.role}</span>`;

        textEl.innerHTML = `
            <div style="margin-bottom:10px; line-height:1.55;">${cfg.greeting.replace(/\n/g, '<br>')}</div>
            <div id="npc-vn-options" style="display:flex; flex-direction:column; gap:6px; margin-top:8px;"></div>
        `;

        const optBox = textEl.querySelector('#npc-vn-options');
        cfg.actions.forEach(act => {
            const btn = document.createElement('button');
            btn.className = 'px-btn primary';
            btn.style.cssText = 'width:100%; padding:8px 12px; font-size:13px; justify-content:flex-start; text-align:left;';
            btn.innerText = act.label;
            btn.onclick = act.fn;
            optBox.appendChild(btn);
        });

        dialogLayer.style.display = 'flex';
    }

    // 🏰 皇家據點四大設施升級面板 (消耗過剩木材、圓石與金幣)
    openCampUpgradeModal() {
        const dialogLayer = document.getElementById('pixel-dialog-layer');
        const titleEl = document.getElementById('pixel-dialog-title');
        const textEl = document.getElementById('pixel-dialog-text');
        if (!dialogLayer || !titleEl || !textEl) return;

        const p = this.gameState.player;
        const inv = p.inventory || {};
        const b = this.gameState.campBuildings;

        // 統計玩家身上的木材類與石材類總數 (優先消耗 MAT_001 橡木原木 與 MAT_051 圓石)
        const woodCnt = (inv['MAT_001'] || 0) + (inv['wood'] || 0);
        const stoneCnt = (inv['MAT_051'] || 0) + (inv['stone'] || 0);

        const buildingsDef = [
            {
                key: 'forge',
                name: '⚒️ 皇家鐵匠鍛造爐',
                desc: '每級永久提升 <b>攻擊力 +15</b>',
                curBonus: `目前加成：攻擊力 +${(b.forge || 0) * 15}`,
                woodBase: 6,
                stoneBase: 6,
                goldBase: 150
            },
            {
                key: 'altar',
                name: '📚 遠古知識祭壇',
                desc: '每級永久提升 <b>最大生命 +60 HP、魔力 +15 MP</b>',
                curBonus: `目前加成：+${(b.altar || 0) * 60} HP / +${(b.altar || 0) * 15} MP`,
                woodBase: 5,
                stoneBase: 8,
                goldBase: 150
            },
            {
                key: 'storage',
                name: '🎒 探險家大倉庫',
                desc: '每級永久擴充 <b>背包負重上限 +50 格</b>',
                curBonus: `目前加成：背包容量 +${(b.storage || 0) * 50} 格`,
                woodBase: 8,
                stoneBase: 4,
                goldBase: 120
            },
            {
                key: 'greenhouse',
                name: '🌿 煉金藥草溫室',
                desc: '每級永久提升 <b>防禦力 +12</b> 及每日免費草藥產量',
                curBonus: `目前加成：防禦力 +${(b.greenhouse || 0) * 12}`,
                woodBase: 6,
                stoneBase: 5,
                goldBase: 120
            }
        ];

        titleEl.innerHTML = `🏰 皇家基地營 • 據點設施升級 <span style="font-size:12px; color:#15803d; margin-left:8px;">🪵木材:${woodCnt} ｜ 🪨圓石:${stoneCnt} ｜ 💰${p.gold || 0}G</span>`;

        const wrap = document.createElement('div');
        wrap.style.cssText = 'display:flex; flex-direction:column; gap:8px; max-height:310px; overflow-y:auto; padding-right:4px;';

        buildingsDef.forEach(def => {
            const curLv = b[def.key] || 0;
            const isMax = curLv >= 5;
            const nextLv = curLv + 1;
            const reqWood = def.woodBase * nextLv;
            const reqStone = def.stoneBase * nextLv;
            const reqGold = def.goldBase * nextLv;

            const canAfford = !isMax && woodCnt >= reqWood && stoneCnt >= reqStone && (p.gold || 0) >= reqGold;

            const card = document.createElement('div');
            card.style.cssText = 'background:#f3dbb3; border:2px solid #4a2e16; border-radius:4px; padding:6px 10px; display:flex; justify-content:space-between; align-items:center; gap:8px;';
            card.innerHTML = `
                <div style="flex:1;">
                    <div style="font-size:13px; font-weight:900; color:#2b1d0e;">
                        ${def.name} <span style="background:#3b2614; color:#fde047; padding:1px 6px; border-radius:3px; font-size:11px;">Lv.${curLv}/5</span>
                    </div>
                    <div style="font-size:11px; color:#5c3a21;">${def.desc}（<span style="color:#15803d; font-weight:bold;">${def.curBonus}</span>）</div>
                    ${!isMax ? `<div style="font-size:11px; color:${canAfford ? '#1e3a8a' : '#b91c1c'}; font-weight:bold; margin-top:2px;">升級需求：🪵橡木 x${reqWood}、🪨圓石 x${reqStone}、💰${reqGold} G</div>` : '<div style="font-size:11px; color:#15803d; font-weight:bold;">✨ 已達最高等級！</div>'}
                </div>
                <button class="px-btn ${canAfford ? 'success' : ''}" style="padding:6px 12px; font-size:12px; flex-shrink:0;" ${canAfford ? '' : 'disabled'}>
                    ${isMax ? 'MAX' : '⬆️ 升級'}
                </button>
            `;

            if (canAfford) {
                card.querySelector('button').onclick = () => {
                    // 扣除木材
                    let wLeft = reqWood;
                    const m001 = inv['MAT_001'] || 0;
                    if (m001 >= wLeft) { p.removeItem('MAT_001', wLeft); wLeft = 0; }
                    else { p.removeItem('MAT_001', m001); wLeft -= m001; if (wLeft > 0) p.removeItem('wood', wLeft); }

                    // 扣除石材
                    let sLeft = reqStone;
                    const m051 = inv['MAT_051'] || 0;
                    if (m051 >= sLeft) { p.removeItem('MAT_051', sLeft); sLeft = 0; }
                    else { p.removeItem('MAT_051', m051); sLeft -= m051; if (sLeft > 0) p.removeItem('stone', sLeft); }

                    p.gold = Math.max(0, (p.gold || 0) - reqGold);
                    b[def.key] = nextLv;
                    this.saveCampBuildings();
                    this.applyCampBuildingBonuses();
                    p.hp = p.maxHp;

                    eventBus.emit('PLAY_SOUND', 'collect');
                    eventBus.emit('HUD_UPDATE');
                    eventBus.emit('SAVE_GAME');
                    eventBus.emit('SHOW_TOAST', `🎉【${def.name}】成功升至 Lv.${nextLv}！能力與據點規模大幅提升！`);
                    this.openCampUpgradeModal();
                };
            }
            wrap.appendChild(card);
        });

        textEl.innerHTML = '';
        textEl.appendChild(wrap);
        dialogLayer.style.display = 'flex';
    }
}
