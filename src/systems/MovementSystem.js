// src/systems/MovementSystem.js
// 🌟 第一步商業級改造 (基於最新穩定觸控版)：
// 1. 保留 cloneNode + pointerdown + 100ms 防連跳鎖，確保手機輕按 1 下精準只行 1 格
// 2. 保留 TILE_SIZE = 48 與 cameraX/Y 點擊座標換算
// 3. 實裝「多段敲擊耐久度」、「體力消耗」、「背包負重上限 (120/250)」與「稀有礦脈守衛伏擊」

import { eventBus } from '../core/EventBus.js';
import { Items } from '../data/items.js';
import { GatheringTools, GatheringFormulas, getRegionNodeConfig } from '../data/worldNodes.js';
import { getPixelIconHtml } from '../data/assets.js';

export class MovementSystem {
    constructor(gameState) {
        this.gameState = gameState;
        this.buildItems = ['wood_plank', 'stone_wall', 'farm_plot', 'recycler', 'fossil_rex', 'golden_compass'];
        this.buildTileIds = { 'wood_plank': 20, 'stone_wall': 21, 'farm_plot': 12, 'recycler': 24, 'fossil_rex': 22, 'golden_compass': 23 };
        this.selectedQuickFoodId = 'cooked_fish';

        this.holdStartTimeout = null;
        this.holdMoveInterval = null;
        this._lastMoveTime = 0;

        // 記錄地圖上每個資源點的當前剩餘耐久度 key: `${mapId}_${row}_${col}`
        this.nodeHealthMap = {};
        // 野外步行飢餓計步器
        this.stepHungerCounter = 0;

        this.bindKeys();
        this.bindMobileTouchAndCanvasTap();
        this.bindQuickFoodEvents();
        setTimeout(() => this.updateContextActionUI(), 200);
    }

    // 計算背包當前總物品數與負重上限
    getInventoryLoadInfo() {
        const p = this.gameState.player;
        let totalCount = 0;
        for (const [k, cnt] of Object.entries(p.inventory || {})) {
            if (cnt > 0 && k !== 'truth_fragment') totalCount += cnt;
        }
        const hasBigBag = p.equipment.includes('ACC_BAG_T1') || p.equipment.includes('ACC_BAG_T3') || (p.inventory['ACC_BAG_T1'] || 0) > 0;
        const maxCap = hasBigBag ? 250 : 120;
        return { totalCount, maxCap, isFull: totalCount >= maxCap };
    }

    // 手機方向鍵與畫面點擊移動 (已徹底解決按 1 下跳 3 格問題)
    bindMobileTouchAndCanvasTap() {
        const stopHoldMove = () => {
            if (this.holdStartTimeout) {
                clearTimeout(this.holdStartTimeout);
                this.holdStartTimeout = null;
            }
            if (this.holdMoveInterval) {
                clearInterval(this.holdMoveInterval);
                this.holdMoveInterval = null;
            }
        };

        ['up', 'down', 'left', 'right'].forEach(dir => {
            const oldBtn = document.getElementById(`btn-${dir}`);
            if (!oldBtn) return;

            const btn = oldBtn.cloneNode(true);
            oldBtn.parentNode.replaceChild(btn, oldBtn);

            const startMove = (e) => {
                if (e.cancelable) e.preventDefault();
                e.stopPropagation();
                stopHoldMove();
                this.handleMove(dir);
                this.holdStartTimeout = setTimeout(() => {
                    this.holdMoveInterval = setInterval(() => {
                        this.handleMove(dir);
                    }, 180);
                }, 320);
            };

            btn.addEventListener('pointerdown', startMove);
            btn.addEventListener('pointerup', stopHoldMove);
            btn.addEventListener('pointercancel', stopHoldMove);
            btn.addEventListener('pointerleave', stopHoldMove);
        });

        const oldActBtn = document.getElementById('btn-action');
        if (oldActBtn) {
            const actBtn = oldActBtn.cloneNode(true);
            oldActBtn.parentNode.replaceChild(actBtn, oldActBtn);

            actBtn.addEventListener('pointerdown', (e) => {
                if (e.cancelable) e.preventDefault();
                e.stopPropagation();
                const dialogLayer = document.getElementById('pixel-dialog-layer');
                if (dialogLayer && dialogLayer.style.display === 'flex') {
                    document.getElementById('btn-dialog-ok')?.click();
                    return;
                }
                if (this.gameState.currentState === 'FISHING') {
                    eventBus.emit('CATCH_FISH_NOW');
                    return;
                }
                this.interact();
            });
        }

        const canvas = document.getElementById('gameCanvas');
        if (canvas) {
            canvas.addEventListener('pointerdown', (e) => {
                const popup = document.getElementById('quick-food-popup');
                if (popup && popup.style.display === 'block') {
                    popup.style.display = 'none';
                    return;
                }

                const rect = canvas.getBoundingClientRect();
                if (!rect.width || !rect.height) return;

                const { player, currentMap } = this.gameState;
                if (!player || !currentMap) return;

                const tileSize = this.gameState.tileSize || 48;
                const viewW = this.gameState.viewWidth || 960;
                const viewH = this.gameState.viewHeight || 540;
                const camX = this.gameState.cameraX || 0;
                const camY = this.gameState.cameraY || 0;
                const tapCol = Math.floor((((e.clientX - rect.left) / rect.width) * viewW + camX) / tileSize);
                const tapRow = Math.floor((((e.clientY - rect.top) / rect.height) * viewH + camY) / tileSize);

                const dCol = tapCol - player.col;
                const dRow = tapRow - player.row;

                if (dCol === 0 && dRow === 0) {
                    this.interact();
                    return;
                }

                if (Math.abs(dCol) + Math.abs(dRow) === 1) {
                    const dir = dCol === 1 ? 'right' : (dCol === -1 ? 'left' : (dRow === 1 ? 'down' : 'up'));
                    player.direction = dir;
                    const targetTile = currentMap.tiles[tapRow]?.[tapCol];
                    const walkableTiles = [0, 2, 7, 11, 12, 13, 14, 15, 18, 20, 30, 31, 32, 33, 34, 40, 42, 45];
                    if (!walkableTiles.includes(targetTile) || [14, 15].includes(targetTile)) {
                        this.updateContextActionUI();
                        this.interact();
                        return;
                    }
                    this.handleMove(dir);
                    return;
                }

                let primaryDir = Math.abs(dCol) >= Math.abs(dRow) ? (dCol > 0 ? 'right' : 'left') : (dRow > 0 ? 'down' : 'up');
                this.handleMove(primaryDir);
            });
        }
    }

    bindQuickFoodEvents() {
        const foodBtn = document.getElementById('btn-quick-food');
        const popup = document.getElementById('quick-food-popup');
        const closePopup = document.getElementById('btn-close-food-popup');

        if (closePopup && popup) {
            closePopup.onclick = (e) => {
                e.stopPropagation();
                popup.style.display = 'none';
            };
        }

        if (foodBtn) {
            foodBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (popup && popup.style.display === 'block') {
                    this.consumeSelectedQuickFood();
                    popup.style.display = 'none';
                } else {
                    this.renderQuickFoodPopup();
                }
            };
        }

        eventBus.on('HUD_UPDATE', () => this.updateContextActionUI());
    }

    getAvailableFoods() {
        const p = this.gameState.player;
        const foodKeys = ['cooked_fish', 'bread', 'roast_meat', 'mushroom_soup', 'energy_juice', 'berry_jam', 'CON_POTION_T1', 'CON_ELIXIR_T4', 'health_potion', 'fish'];
        return foodKeys.filter(k => (p.inventory[k] || 0) > 0);
    }

    renderQuickFoodPopup() {
        const popup = document.getElementById('quick-food-popup');
        const grid = document.getElementById('quick-food-grid');
        if (!popup || !grid) return;

        const p = this.gameState.player;
        const avail = this.getAvailableFoods();
        if (avail.length === 0) {
            eventBus.emit('SHOW_TOAST', '⚠️ 背包內沒有食物或藥水！請釣魚或於【⚒️ 製作】烹飪補給品。');
            return;
        }

        grid.innerHTML = '';
        avail.slice(0, 6).forEach(fId => {
            const it = Items[fId];
            const cnt = p.inventory[fId] || 0;
            const box = document.createElement('div');
            box.className = `srpg-item-box ${this.selectedQuickFoodId === fId ? 'selected' : ''}`;
            box.style.cssText = 'width:46px; height:46px;';
            box.title = `點擊食用：${it?.name || fId}`;
            box.innerHTML = `
                ${getPixelIconHtml(it?.sprite || 'potion', 26)}
                <span class="qty-num">${cnt}</span>
            `;
            box.onclick = (e) => {
                e.stopPropagation();
                this.selectedQuickFoodId = fId;
                this.consumeSelectedQuickFood();
                popup.style.display = 'none';
            };
            grid.appendChild(box);
        });

        popup.style.display = 'block';
    }

    consumeSelectedQuickFood() {
        const p = this.gameState.player;
        const avail = this.getAvailableFoods();
        if (!p.inventory[this.selectedQuickFoodId] || p.inventory[this.selectedQuickFoodId] <= 0) {
            this.selectedQuickFoodId = avail[0] || null;
        }
        if (!this.selectedQuickFoodId) {
            eventBus.emit('SHOW_TOAST', '沒有可食用的食物或藥水！');
            return;
        }

        const it = Items[this.selectedQuickFoodId];
        p.removeItem(this.selectedQuickFoodId, 1);
        const healHp = it?.healHp || (this.selectedQuickFoodId === 'CON_ELIXIR_T4' ? p.maxHp : 120);
        const healMp = it?.healMp || 30;
        p.hp = Math.min(p.maxHp, p.hp + healHp);
        p.mp = Math.min(p.maxMp || 60, (p.mp || 0) + healMp);

        eventBus.emit('PLAY_SOUND', 'collect');
        eventBus.emit('SPAWN_PARTICLES', { col: p.col, row: p.row, color: '#69f0ae', count: 14 });
        eventBus.emit('SHOW_TOAST', `🍖 食用【${it?.name || '食物'}】：體力恢復 +${healHp} HP, +${healMp} MP！`);
        eventBus.emit('HUD_UPDATE');
        this.updateContextActionUI();
    }

    updateContextActionUI() {
        const { player, currentMap } = this.gameState;
        if (!player || !currentMap) return;

        const avail = this.getAvailableFoods();
        if (!player.inventory[this.selectedQuickFoodId] && avail.length > 0) {
            this.selectedQuickFoodId = avail[0];
        }
        const fIconEl = document.getElementById('quick-food-icon');
        const fCntEl = document.getElementById('quick-food-count');
        const curFoodItem = Items[this.selectedQuickFoodId] || Items.cooked_fish || Items.potion;
        if (fIconEl && curFoodItem) fIconEl.innerHTML = getPixelIconHtml(curFoodItem.sprite || 'fish_icon', 26);
        if (fCntEl) fCntEl.innerText = player.inventory[this.selectedQuickFoodId] || 0;

        const actIcoEl = document.getElementById('dynamic-action-icon');
        if (!actIcoEl) return;

        let tCol = player.col, tRow = player.row;
        if (player.direction === 'up') tRow--;
        else if (player.direction === 'down') tRow++;
        else if (player.direction === 'left') tCol--;
        else if (player.direction === 'right') tCol++;

        let targetTile = 0;
        if (tCol >= 0 && tCol < currentMap.cols && tRow >= 0 && tRow < currentMap.rows) {
            targetTile = currentMap.tiles[tRow][tCol];
        }

        if (targetTile === 1 || targetTile === 17) {
            actIcoEl.innerHTML = getPixelIconHtml('axe_icon', 34);
        } else if ([3, 4, 8, 19, 46, 47, 48, 49].includes(targetTile)) {
            actIcoEl.innerHTML = getPixelIconHtml('pickaxe', 34);
        } else if ([7, 16, 40].includes(targetTile)) {
            actIcoEl.innerHTML = getPixelIconHtml('rod_icon', 34);
        } else if ([15, 41, 9, 43, 14, 50].includes(targetTile)) {
            actIcoEl.innerHTML = getPixelIconHtml('hand_icon', 34);
        } else if ([5, 51].includes(targetTile)) {
            actIcoEl.innerHTML = getPixelIconHtml('sword', 34);
        } else if (targetTile === 0 && (player.equipment.includes('shovel') || player.equipment.includes('steel_shovel') || (player.inventory['steel_shovel'] || 0) > 0)) {
            actIcoEl.innerHTML = getPixelIconHtml('shovel_icon', 32);
        } else {
            actIcoEl.innerHTML = `<span style="opacity:0.45;">${getPixelIconHtml('hand_icon', 30)}</span>`;
        }
    }

    getBestPlayerTool(player, toolType) {
        if (toolType === 'none') return { tier: 5, speedBonus: 0, doubleDropChance: 0.05, power: 1, name: '徒手探索' };
        let best = { tier: 0, speedBonus: 0, doubleDropChance: 0, power: 1, name: '徒手' };

        GatheringTools.forEach(gt => {
            if (gt.toolType === toolType) {
                const hasIt = player.equipment.includes(gt.toolId) || (player.inventory[gt.toolId] || 0) > 0;
                if (hasIt && gt.tier >= best.tier) {
                    best = { ...gt, power: Math.max(1, gt.tier) };
                }
            }
        });

        if (toolType === 'axe' && (player.equipment.includes('lumber_axe') || (player.inventory['lumber_axe'] || 0) > 0)) {
            if (best.tier < 2) best = { tier: 2, speedBonus: 0.15, doubleDropChance: 0.15, power: 2, name: '伐木鋼斧' };
        }
        if (toolType === 'pickaxe') {
            if (player.equipment.includes('iron_pickaxe') || (player.inventory['iron_pickaxe'] || 0) > 0) {
                if (best.tier < 3) best = { tier: 3, speedBonus: 0.2, doubleDropChance: 0.15, power: 3, name: '精鐵十字鎬' };
            } else if (player.equipment.includes('stone_pickaxe') || (player.inventory['stone_pickaxe'] || 0) > 0) {
                if (best.tier < 2) best = { tier: 2, speedBonus: 0.05, doubleDropChance: 0.05, power: 2, name: '石製十字鎬' };
            }
        }
        return best;
    }

    pickSingleYieldItem(yields = []) {
        if (!Array.isArray(yields) || yields.length === 0) return null;
        const totalWeight = yields.reduce((sum, y) => sum + (y.dropRate || 0.2), 0);
        let roll = Math.random() * totalWeight;
        for (const y of yields) {
            roll -= (y.dropRate || 0.2);
            if (roll <= 0) return y;
        }
        return yields[0];
    }

    // 🌟 第一步核心：多段敲擊採集 + 體力消耗 + 背包負重上限 + 守衛伏擊
    executeNodeGathering(nodeConfig, row, col, originalTileId) {
        const { player, currentMap } = this.gameState;
        const mapTier = currentMap.tier || 1;

        // 1. 檢查背包負重上限
        const loadInfo = this.getInventoryLoadInfo();
        if (loadInfo.isFull) {
            eventBus.emit('PLAY_SOUND', 'bump');
            eventBus.emit('SHOW_TOAST', `🎒 背包已滿載 (${loadInfo.totalCount}/${loadInfo.maxCap})！請先打開【⚒️ 製作】加工素材或前往商會出售。`);
            return;
        }

        // 2. 檢查工具階級門檻
        const bestTool = this.getBestPlayerTool(player, nodeConfig.requiredToolType);
        const reqTier = nodeConfig.requiredToolTier || 1;
        if (nodeConfig.requiredToolType !== 'none' && reqTier >= 2 && bestTool.tier < reqTier - 1) {
            const toolTypeName = nodeConfig.requiredToolType === 'axe' ? '伐木斧' : (nodeConfig.requiredToolType === 'pickaxe' ? '十字鎬' : '採藥鐮');
            eventBus.emit('PLAY_SOUND', 'bump');
            eventBus.emit('SHOW_TOAST', `🔒 堅硬資源！需先於【⚒️ 製作】鍛造更高階的${toolTypeName}才能開採【${nodeConfig.name}】！`);
            return;
        }

        // 3. 檢查體力 (HP) 是否足夠揮動工具
        const staminaCost = nodeConfig.nodeType === 'harvesting' ? 1 : (1 + mapTier);
        if (player.hp <= staminaCost + 5) {
            eventBus.emit('PLAY_SOUND', 'bump');
            eventBus.emit('SHOW_TOAST', `💦 體力過低 (${player.hp} HP) 無法進行重度採集！請點擊右下角食物進食或回營地休息。`);
            return;
        }

        player.hp = Math.max(1, player.hp - staminaCost);

        // 4. 計算資源點耐久度 (多段敲擊)
        const nodeKey = `${currentMap.id}_${row}_${col}`;
        const defaultMaxHits = {
            logging: 3 + Math.floor(mapTier / 2),
            mining: 4 + Math.floor(mapTier / 2),
            crystal_vein: 5 + Math.floor(mapTier / 2),
            harvesting: 2,
            scavenging: 3
        }[nodeConfig.nodeType] || 3;

        if (this.nodeHealthMap[nodeKey] === undefined) {
            this.nodeHealthMap[nodeKey] = defaultMaxHits;
        }

        const hitPower = Math.max(1, bestTool.power || 1);
        this.nodeHealthMap[nodeKey] -= hitPower;

        const colorMap = { logging: '#8d5524', mining: '#9badb7', crystal_vein: '#42c5f5', harvesting: '#71aa34', scavenging: '#f7d51d' };
        const pColor = colorMap[nodeConfig.nodeType] || '#f7d51d';

        if (this.nodeHealthMap[nodeKey] > 0) {
            const leftHits = this.nodeHealthMap[nodeKey];
            const actionVerb = nodeConfig.nodeType === 'logging' ? '🪓 砍伐中' : (nodeConfig.nodeType === 'harvesting' ? '🌿 採集中' : '⛏️ 挖掘中');
            eventBus.emit('PLAY_SOUND', 'bump');
            eventBus.emit('SPAWN_PARTICLES', { col, row, color: pColor, count: 8 });
            eventBus.emit('SHOW_TOAST', `${actionVerb}【${nodeConfig.name}】... 還需敲擊 ${leftHits} 次 (-${staminaCost} 體力)`);
            eventBus.emit('HUD_UPDATE');
            return;
        }

        // 5. 耐久度歸零：獲得素材並進入長冷卻重生
        delete this.nodeHealthMap[nodeKey];
        const emptyTile = currentMap.id === 'ice_ruins' ? 18 : (currentMap.id === 'deep_sea' ? 40 : (currentMap.id === 'clockwork' ? 42 : 0));
        currentMap.tiles[row][col] = emptyTile;

        if (!this.gameState.respawnQueue) this.gameState.respawnQueue = [];
        const respawnSec = Math.max(55, (nodeConfig.respawnTimeSec || 30) * 3);
        this.gameState.respawnQueue.push({
            mapId: currentMap.id,
            row,
            col,
            tileId: originalTileId,
            respawnAt: performance.now() + (respawnSec * 1000)
        });

        // 6. 嚴格控制產量：每次精準產出 1~2 個
        const pickedY = this.pickSingleYieldItem(nodeConfig.yields);
        let qty = Math.random() < 0.25 ? 2 : 1;
        const afterDouble = GatheringFormulas.checkDoubleDrop(qty, bestTool.doubleDropChance || 0);
        const doubleTriggered = afterDouble > qty;
        qty = afterDouble;

        player.addItem(pickedY.materialId, qty);

        const itemName = Items[pickedY.materialId]?.name || pickedY.materialId;
        const expGain = nodeConfig.expReward || 15;
        player.exp = (player.exp || 0) + expGain;

        eventBus.emit('PLAY_SOUND', 'collect');
        eventBus.emit('SPAWN_PARTICLES', { col, row, color: pColor, count: 18 });
        eventBus.emit('SHOW_TOAST', `✨ 採獲：【${itemName} x${qty}】${doubleTriggered ? ' (★工具暴擊雙倍!)' : ''} (+${expGain} EXP ｜ 背包 ${loadInfo.totalCount + qty}/${loadInfo.maxCap})`);
        eventBus.emit('CHECK_LEVEL_UP');
        eventBus.emit('HUD_UPDATE');
        this.updateContextActionUI();

        // 7. 稀有晶礦與秘寶箱守衛突襲 (28% 機率)
        if ((nodeConfig.nodeType === 'crystal_vein' || nodeConfig.nodeType === 'scavenging') && Math.random() < 0.28) {
            setTimeout(() => {
                if (this.gameState.currentState === 'EXPLORATION') {
                    eventBus.emit('SHOW_TOAST', `⚠️ 採集【${nodeConfig.name}】驚動了潛伏的資源守護魔物！`);
                    eventBus.emit('ENCOUNTER_ENEMY', 'random_monster');
                }
            }, 350);
        }
    }

    bindKeys() {
        window.addEventListener('keydown', (e) => {
            if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;

            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
            if (e.key === 'b' || e.key === 'B') { this.toggleBuildMode(); return; }
            if (this.gameState.buildMode) {
                if (e.key === 'q' || e.key === 'Q') { this.cycleBuildItem(-1); return; }
                if (e.key === 'e' || e.key === 'E') { this.cycleBuildItem(1); return; }
            }
            let dir = null;
            if (['ArrowUp', 'w', 'W'].includes(e.key)) dir = 'up';
            else if (['ArrowDown', 's', 'S'].includes(e.key)) dir = 'down';
            else if (['ArrowLeft', 'a', 'A'].includes(e.key)) dir = 'left';
            else if (['ArrowRight', 'd', 'D'].includes(e.key)) dir = 'right';
            else if (e.key === ' ') { this.interact(); return; }
            if (dir) this.handleMove(dir);
        });

        const btnBuildToggle = document.getElementById('btn-build-toggle');
        if (btnBuildToggle) btnBuildToggle.addEventListener('click', (e) => { e.preventDefault(); this.toggleBuildMode(); });
        const btnBuildPrev = document.getElementById('btn-build-prev');
        if (btnBuildPrev) btnBuildPrev.addEventListener('click', (e) => { e.preventDefault(); this.cycleBuildItem(-1); });
        const btnBuildNext = document.getElementById('btn-build-next');
        if (btnBuildNext) btnBuildNext.addEventListener('click', (e) => { e.preventDefault(); this.cycleBuildItem(1); });
    }

    toggleBuildMode() {
        if (this.gameState.currentMap.id !== 'safe_camp') {
            eventBus.emit('SHOW_TOAST', '建造模式只能在【安全營地】中使用！');
            return;
        }
        this.gameState.buildMode = !this.gameState.buildMode;
        const buildUI = document.getElementById('build-mode-ui');
        if (buildUI) buildUI.style.display = this.gameState.buildMode ? 'block' : 'none';
        if (this.gameState.buildMode) this.updateBuildUI();
    }

    cycleBuildItem(dir) {
        this.gameState.buildIndex = (this.gameState.buildIndex || 0) + dir;
        if (this.gameState.buildIndex < 0) this.gameState.buildIndex = this.buildItems.length - 1;
        if (this.gameState.buildIndex >= this.buildItems.length) this.gameState.buildIndex = 0;
        this.updateBuildUI();
    }

    updateBuildUI() {
        const itemKey = this.buildItems[this.gameState.buildIndex || 0];
        const count = this.gameState.player.inventory[itemKey] || 0;
        const itemData = Items[itemKey] || { name: itemKey }; 
        const selectedItemLabel = document.getElementById('build-selected-item');
        if (selectedItemLabel) selectedItemLabel.innerHTML = `${itemData.name} (${count})`;
    }

    handleMove(dir) {
        // 100ms 防連跳鎖，確保手機點一下絕不跳 3 格
        const now = performance.now();
        if (this._lastMoveTime && now - this._lastMoveTime < 100) return;
        this._lastMoveTime = now;

        const dialogLayer = document.getElementById('pixel-dialog-layer');
        if (dialogLayer && dialogLayer.style.display === 'flex') {
            dialogLayer.style.display = 'none';
        }

        const uiLayer = document.getElementById('ui-layer');
        const combatLayer = document.getElementById('combat-layer');
        const merchLayer = document.getElementById('merchant-layer');
        const fishLayer = document.getElementById('fishing-layer');

        const isOverlayOpen =
            (uiLayer && uiLayer.style.display === 'flex') ||
            (combatLayer && combatLayer.style.display === 'block') ||
            (merchLayer && merchLayer.style.display === 'flex') ||
            (fishLayer && fishLayer.style.display === 'flex');

        if (!isOverlayOpen && this.gameState.currentState !== 'TITLE_SCREEN' && this.gameState.currentState !== 'ENDING_SCREEN') {
            this.gameState.currentState = 'EXPLORATION';
            if (this.uiManager) this.uiManager.isOpen = false;
        }

        if (this.gameState.currentState !== 'EXPLORATION') return;
        
        const { player, currentMap } = this.gameState;
        let targetCol = player.col;
        let targetRow = player.row;
        player.direction = dir;

        if (dir === 'up') targetRow -= 1;
        else if (dir === 'down') targetRow += 1;
        else if (dir === 'left') targetCol -= 1;
        else if (dir === 'right') targetCol += 1;

        if (targetCol >= 0 && targetCol < currentMap.cols && targetRow >= 0 && targetRow < currentMap.rows) {
            const targetTile = currentMap.tiles[targetRow][targetCol];
            
            if (targetTile === 45) {
                if (!player.equipment.includes('grappling_hook')) {
                    eventBus.emit('SHOW_TOAST', '前方是無底深淵，需裝備【精鋼飛索抓鉤】才能跨越！');
                    eventBus.emit('PLAY_SOUND', 'bump');
                    this.updateContextActionUI();
                    return;
                }
            }

            // 🌟 平衡性修正：無帆船時踏入水格會消耗 2 點體力涉水游泳，造出「遠洋白帆船」後即可免費揚帆！
            const hasBoat = player.equipment.includes('sailboat') || (player.inventory['sailboat'] || 0) > 0;
            if (targetTile === 7 && !hasBoat) {
                if (player.hp <= 10) {
                    eventBus.emit('SHOW_TOAST', '💦 體力過低無法涉水游泳！請補充食物或於【⚒️ 製作】造出「遠洋白帆船」！');
                    eventBus.emit('PLAY_SOUND', 'bump');
                    this.updateContextActionUI();
                    return;
                }
                player.hp -= 2;
                eventBus.emit('HUD_UPDATE');
            }

            const walkableTiles = [0, 2, 7, 11, 12, 13, 14, 15, 18, 20, 30, 31, 32, 33, 34, 40, 42, 45];

            if (walkableTiles.includes(targetTile)) {
                player.col = targetCol;
                player.row = targetRow;
                player.isSailing = (targetTile === 7);

                // 野外長途探索微幅消耗體力 (每 18 步扣 1 HP)
                if (currentMap.id !== 'safe_camp') {
                    this.stepHungerCounter++;
                    if (this.stepHungerCounter >= 18) {
                        this.stepHungerCounter = 0;
                        if (player.hp > 15) {
                            player.hp -= 1;
                            eventBus.emit('HUD_UPDATE');
                        }
                    }
                }

                this.updateContextActionUI();
                eventBus.emit('SAVE_GAME');

                if ([2, 11, 30, 31, 32, 33, 34].includes(targetTile)) {
                    const mapId = currentMap.id;
                    if (mapId === 'safe_camp') eventBus.emit('CHANGE_MAP', 'starter_island_from_camp');
                    else if (targetTile === 11) eventBus.emit('CHANGE_MAP', 'campMap');
                    else if (mapId === 'starter_island') eventBus.emit('CHANGE_MAP', 'level2Map');
                    else if (mapId === 'desert_ruins') { if (targetTile === 30) eventBus.emit('CHANGE_MAP', 'poisonMap'); else eventBus.emit('CHANGE_MAP', 'starter_island'); }
                    else if (mapId === 'poison_swamp') { if (targetTile === 31) eventBus.emit('CHANGE_MAP', 'iceMap'); else eventBus.emit('CHANGE_MAP', 'level2Map_from_poison'); }
                    else if (mapId === 'ice_ruins') { if (targetTile === 32) eventBus.emit('CHANGE_MAP', 'deepSeaMap'); else eventBus.emit('CHANGE_MAP', 'poisonMap_from_ice'); }
                    else if (mapId === 'deep_sea') { if (targetTile === 33) eventBus.emit('CHANGE_MAP', 'clockworkMap'); else eventBus.emit('CHANGE_MAP', 'ice_ruins_from_sea'); }
                    else if (mapId === 'clockwork') { if (targetTile === 34) eventBus.emit('CHANGE_MAP', 'floatingMap'); else eventBus.emit('CHANGE_MAP', 'deep_sea_from_clock'); }
                    else if (mapId === 'floating') { if (targetTile === 2) eventBus.emit('CHANGE_MAP', 'bossMap'); else eventBus.emit('CHANGE_MAP', 'clockwork_from_float'); }
                    else if (mapId === 'boss_arena') { eventBus.emit('CHANGE_MAP', 'floating_from_boss'); }
                    return; 
                }

                if (currentMap.id !== 'safe_camp' && targetTile !== 7) {
                    const rand = Math.random();
                    if (rand < 0.015) eventBus.emit('GOBLIN_ENCOUNTER');
                    else if (rand < 0.075) eventBus.emit('ENCOUNTER_ENEMY', 'random_monster');
                }
            } else {
                this.updateContextActionUI();
                eventBus.emit('PLAY_SOUND', 'bump');
            }
        }
    }

    interact() {
        const uiLayer = document.getElementById('ui-layer');
        if (this.gameState.currentState === 'UI_MENU' && (!uiLayer || uiLayer.style.display === 'none')) {
            this.gameState.currentState = 'EXPLORATION';
        }
        if (this.gameState.currentState !== 'EXPLORATION') return;

        const { player, currentMap } = this.gameState;
        const mapTier = currentMap.tier || 1;

        let targetCol = player.col;
        let targetRow = player.row;
        if (player.direction === 'up') targetRow -= 1;
        else if (player.direction === 'down') targetRow += 1;
        else if (player.direction === 'left') targetCol -= 1;
        else if (player.direction === 'right') targetCol += 1;

        if (targetCol >= 0 && targetCol < currentMap.cols && targetRow >= 0 && targetRow < currentMap.rows) {
            const targetTile = currentMap.tiles[targetRow][targetCol];
            
            if (this.gameState.buildMode && currentMap.id === 'safe_camp') {
                const selectedKey = this.buildItems[this.gameState.buildIndex || 0];
                const tileToPlace = this.buildTileIds[selectedKey];
                
                if (targetTile === 0) {
                    if ((player.inventory[selectedKey] || 0) > 0) {
                        player.removeItem(selectedKey, 1);
                        currentMap.tiles[targetRow][targetCol] = tileToPlace;
                        eventBus.emit('PLAY_SOUND', 'collect');
                        eventBus.emit('SPAWN_PARTICLES', { col: targetCol, row: targetRow, color: '#e88b25' });
                        this.updateBuildUI();
                        eventBus.emit('HUD_UPDATE');
                    } else { eventBus.emit('SHOW_TOAST', '建造材料不足！'); }
                } else if (Object.values(this.buildTileIds).includes(targetTile)) {
                    const itemToGive = Object.keys(this.buildTileIds).find(k => this.buildTileIds[k] === targetTile);
                    player.addItem(itemToGive, 1);
                    currentMap.tiles[targetRow][targetCol] = 0;
                    eventBus.emit('PLAY_SOUND', 'collect');
                    this.updateBuildUI();
                    eventBus.emit('HUD_UPDATE');
                } else { eventBus.emit('SHOW_TOAST', '此位置無法建造或拆除！'); }
                return;
            }

            if (targetTile === 0) {
                if (player.equipment.includes('shovel') || player.equipment.includes('steel_shovel') || (player.inventory['steel_shovel'] || 0) > 0) {
                    if (player.hp <= 8) {
                        eventBus.emit('SHOW_TOAST', '💦 體力過低無法挖掘地面！請先補充食物。');
                        return;
                    }
                    player.hp -= 3;
                    eventBus.emit('DIG_TREASURE');
                }
            }
            else if (targetTile === 1 || targetTile === 17) {
                const nodeCfg = getRegionNodeConfig(mapTier, 'logging');
                this.executeNodeGathering(nodeCfg, targetRow, targetCol, targetTile);
            }
            else if ([3, 4, 19, 47, 49].includes(targetTile)) {
                const nodeCfg = getRegionNodeConfig(mapTier, 'mining');
                this.executeNodeGathering(nodeCfg, targetRow, targetCol, targetTile);
            }
            else if ([46, 48].includes(targetTile)) {
                const nodeCfg = getRegionNodeConfig(mapTier, 'crystal_vein');
                this.executeNodeGathering(nodeCfg, targetRow, targetCol, targetTile);
            }
            else if ([15, 41].includes(targetTile)) {
                const nodeCfg = getRegionNodeConfig(mapTier, 'harvesting');
                this.executeNodeGathering(nodeCfg, targetRow, targetCol, targetTile);
            }
            else if ([9, 43].includes(targetTile)) {
                const nodeCfg = getRegionNodeConfig(mapTier, 'scavenging');
                this.executeNodeGathering(nodeCfg, targetRow, targetCol, targetTile);
            }
            else if (targetTile === 50) {
                player.hp = player.maxHp;
                player.mp = player.maxMp || 60;
                player.addItem('MAT_210', 1);
                eventBus.emit('PLAY_SOUND', 'collect');
                eventBus.emit('SPAWN_PARTICLES', { col: targetCol, row: targetRow, color: '#42c5f5', count: 18 });
                eventBus.emit('SHOW_TOAST', '💧 飲用治癒之泉：體力與魔力完全恢復，並裝滿【清澈泉水 x1】！');
                eventBus.emit('HUD_UPDATE');
            }
            else if (targetTile === 51) {
                eventBus.emit('ENCOUNTER_ENEMY', 'obelisk_trial');
            }
            else if (targetTile === 44) { 
                if ((player.inventory['battery'] || 0) > 0 || (player.inventory['MAT_266'] || 0) > 0) {
                    if ((player.inventory['battery'] || 0) > 0) player.removeItem('battery', 1);
                    else player.removeItem('MAT_266', 1);
                    currentMap.tiles[targetRow][targetCol] = 42; 
                    eventBus.emit('PLAY_SOUND', 'collect');
                    eventBus.emit('SPAWN_PARTICLES', { col: targetCol, row: targetRow, color: '#f7d51d' });
                    eventBus.emit('SHOW_TOAST', '消耗魔力電池，成功開啟電子閘門！');
                    eventBus.emit('HUD_UPDATE');
                } else { eventBus.emit('SHOW_TOAST', '電子閘門已鎖定，需要【魔力電池】供電！'); eventBus.emit('PLAY_SOUND', 'bump'); }
            }
            else if (targetTile === 24) {
                if ((player.inventory['MAT_001'] || 0) >= 10) {
                    player.removeItem('MAT_001', 10); player.addItem('truth_fragment', 1);
                    eventBus.emit('PLAY_SOUND', 'collect'); eventBus.emit('SHOW_TOAST', '物資轉換：消耗 10 橡木原木 ==> +1 真理碎片');
                } else if ((player.inventory['MAT_051'] || 0) >= 10) {
                    player.removeItem('MAT_051', 10); player.addItem('truth_fragment', 1);
                    eventBus.emit('PLAY_SOUND', 'collect'); eventBus.emit('SHOW_TOAST', '物資轉換：消耗 10 圓石 ==> +1 真理碎片');
                } else {
                    eventBus.emit('SHOW_TOAST', '轉換箱需要【10 個橡木原木】或【10 個圓石】！');
                    eventBus.emit('PLAY_SOUND', 'bump');
                }
                eventBus.emit('HUD_UPDATE');
            }
            else if (targetTile === 5) { eventBus.emit('BOSS_ENCOUNTER'); } 
            else if (targetTile === 6) { eventBus.emit('OPEN_MERCHANT'); } 
            else if (targetTile === 7 || targetTile === 16 || targetTile === 40) { 
                const hasRod = player.equipment.includes('fishing_rod') || (player.inventory['fishing_rod'] || 0) > 0;
                if (!hasRod) {
                    if (player.hp <= 8) {
                        eventBus.emit('SHOW_TOAST', '💦 體力過低無法徒手捕魚！請先休息或於【⚒️ 製作】打造「青竹釣魚竿」。');
                        return;
                    }
                    player.hp -= 2;
                    eventBus.emit('HUD_UPDATE');
                }
                eventBus.emit('START_FISHING');
            }
            else if (targetTile === 8) {
                if ((player.inventory['bomb'] || 0) > 0) {
                    player.removeItem('bomb', 1); currentMap.tiles[targetRow][targetCol] = 0;
                    eventBus.emit('SPAWN_PARTICLES', { col: targetCol, row: targetRow, color: '#d93829', count: 20 });
                    eventBus.emit('SHOW_TOAST', '轟隆！炸開了裂縫石牆！');
                    eventBus.emit('PLAY_SOUND', 'bump');
                } else { eventBus.emit('SHOW_TOAST', '牆上有裂縫，需要【開山火藥桶】才能炸開！'); eventBus.emit('PLAY_SOUND', 'bump'); }
            }
            else if (targetTile === 12) {
                if ((player.inventory['seed'] || 0) > 0 || (player.inventory['MAT_209'] || 0) > 0) {
                    if ((player.inventory['seed'] || 0) > 0) player.removeItem('seed', 1);
                    else player.removeItem('MAT_209', 1);
                    currentMap.tiles[targetRow][targetCol] = 13;
                    eventBus.emit('PLAY_SOUND', 'collect');
                    eventBus.emit('PLANT_SEED', { row: targetRow, col: targetCol });
                    eventBus.emit('SHOW_TOAST', '🌱 播種成功，等待作物成熟...');
                    eventBus.emit('HUD_UPDATE');
                } else { eventBus.emit('SHOW_TOAST', '耕地空置中，需要【種子】才能播種！'); }
            }
            else if (targetTile === 14) {
                currentMap.tiles[targetRow][targetCol] = 12;
                player.addItem('MAT_201', 2);
                eventBus.emit('PLAY_SOUND', 'collect');
                eventBus.emit('SPAWN_PARTICLES', { col: targetCol, row: targetRow, color: '#71aa34' });
                eventBus.emit('SHOW_TOAST', '🌿 收成溫室作物：獲得【止血草 x2】');
                eventBus.emit('HUD_UPDATE');
            }
            this.updateContextActionUI();
        }
    }
}