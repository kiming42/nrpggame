// src/view/CanvasRenderer.js
// 🌟 第二步商業級改造：
// 1. 探索戰爭迷霧 (Fog of War)：自動記錄並撥開已探索區域，右上角羅盤小地圖同步顯示迷霧
// 2. 動態日夜光影與搖曳火把照明圈 (Dynamic Lighting & Torch Aura)：支援黃昏夕陽、黑夜暗幕與火把/提燈視野擴大
// 3. 畫面微震打擊感 (Screen Shake) 與浮動文字特效：採集敲擊時自動觸發震動與進度反饋
// 4. 動態水面波紋與魔法傳送門/治癒泉呼吸光暈

import { sprites } from '../data/assets.js';
import { TILE_SIZE } from '../data/maps.js';
import { eventBus } from '../core/EventBus.js';

export class CanvasRenderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 960;
        this.canvas.height = 540;
        this.ctx.imageSmoothingEnabled = false;

        this.particles = [];
        this.floatingTexts = [];
        this.cameraX = 0;
        this.cameraY = 0;

        // 畫面震動參數
        this.shakeTimer = 0;
        this.shakeMagnitude = 0;

        // 戰爭迷霧探索紀錄 key: `${mapId}` -> Set of `${r}_${c}`
        this.exploredMaps = {};
        this.loadFogData();

        // 離屏光影遮罩 Canvas (用於繪製柔和鏤空火把照明圈)
        this.lightCanvas = document.createElement('canvas');
        this.lightCanvas.width = 960;
        this.lightCanvas.height = 540;
        this.lightCtx = this.lightCanvas.getContext('2d');

        this.cleanDuplicateHudDom();
        this.bindJuiceEvents();
    }

    cleanDuplicateHudDom() {
        const hud = document.getElementById('hud');
        if (!hud) return;
        const rightGroups = hud.querySelectorAll('.srpg-top-right');
        if (rightGroups.length > 1) {
            rightGroups[0].remove();
        }
    }

    // 綁定打擊感事件：當產生粒子或碰撞時自動觸發微震動
    bindJuiceEvents() {
        eventBus.on('SPAWN_PARTICLES', (data) => {
            if (!data) return;
            const cnt = data.count || 10;
            this.triggerShake(cnt >= 14 ? 6 : 3.5, cnt >= 14 ? 12 : 7);
            if (cnt >= 14 && data.col !== undefined && data.row !== undefined) {
                this.spawnFloatingText(data.col, data.row, '✨ 採獲!', '#fde047');
            } else if (cnt === 8 && data.col !== undefined && data.row !== undefined) {
                this.spawnFloatingText(data.col, data.row, '💥 敲擊!', '#ffffff');
            }
        });
    }

    triggerShake(magnitude = 4, frames = 8) {
        this.shakeMagnitude = Math.max(this.shakeMagnitude, magnitude);
        this.shakeTimer = Math.max(this.shakeTimer, frames);
    }

    spawnFloatingText(col, row, text, color = '#fde047') {
        this.floatingTexts.push({
            x: col * TILE_SIZE + TILE_SIZE / 2,
            y: row * TILE_SIZE + 10,
            text,
            color,
            life: 28,
            maxLife: 28
        });
    }

    loadFogData() {
        try {
            const raw = localStorage.getItem('rpg_fog_explored');
            if (raw) {
                const parsed = JSON.parse(raw);
                for (const [mId, arr] of Object.entries(parsed)) {
                    this.exploredMaps[mId] = new Set(arr);
                }
            }
        } catch (e) {}
    }

    saveFogData() {
        try {
            const out = {};
            for (const [mId, setObj] of Object.entries(this.exploredMaps)) {
                out[mId] = Array.from(setObj);
            }
            localStorage.setItem('rpg_fog_explored', JSON.stringify(out));
        } catch (e) {}
    }

    // 更新玩家周圍的探索迷霧
    updateFogOfWar(mapId, playerRow, playerCol, radius = 4) {
        if (mapId === 'safe_camp') return;
        if (!this.exploredMaps[mapId]) {
            this.exploredMaps[mapId] = new Set();
        }
        const setObj = this.exploredMaps[mapId];
        let added = false;

        for (let dr = -radius; dr <= radius; dr++) {
            for (let dc = -radius; dc <= radius; dc++) {
                if (dr * dr + dc * dc <= radius * radius + 2) {
                    const key = `${playerRow + dr}_${playerCol + dc}`;
                    if (!setObj.has(key)) {
                        setObj.add(key);
                        added = true;
                    }
                }
            }
        }
        if (added) {
            this.saveFogData();
        }
    }

    spawnParticles(col, row, color = '#ffffff', count = 10) {
        const centerX = col * TILE_SIZE + TILE_SIZE / 2;
        const centerY = row * TILE_SIZE + TILE_SIZE / 2;
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1.5 + Math.random() * 3.2;
            this.particles.push({
                x: centerX,
                y: centerY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 1.2,
                size: 4 + Math.floor(Math.random() * 4),
                color: color,
                alpha: 1,
                life: 20 + Math.random() * 15
            });
        }
    }

    drawSprite(key, x, y, size = TILE_SIZE) {
        const img = sprites[key];
        if (img && img.complete && img.naturalWidth > 0) {
            this.ctx.drawImage(img, x, y, size, size);
            return true;
        }
        return false;
    }

    drawPortalTile(x, y, gameTime = 0) {
        const pulse = Math.sin(gameTime * 0.1) * 4;
        const ctx = this.ctx;
        ctx.save();
        ctx.fillStyle = 'rgba(56, 189, 248, 0.28)';
        ctx.beginPath();
        ctx.arc(x + 24, y + 24, 22 + pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        if (this.drawSprite('portal', x, y)) return;
        ctx.fillStyle = '#4c1d95';
        ctx.fillRect(x + 4, y + 4, 40, 40);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(x + 10, y + 10, 28, 28);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 16, y + 16, 16, 16);
    }

    drawTentTile(x, y) {
        if (this.drawSprite('tent', x, y)) return;
        const ctx = this.ctx;
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.moveTo(x + 24, y + 6);
        ctx.lineTo(x + 44, y + 40);
        ctx.lineTo(x + 4, y + 40);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.moveTo(x + 24, y + 10);
        ctx.lineTo(x + 40, y + 38);
        ctx.lineTo(x + 8, y + 38);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#27170c';
        ctx.fillRect(x + 20, y + 26, 8, 12);
    }

    drawWaterTile(x, y, gameTime, r, c) {
        this.drawSprite('water', x, y);
        // 動態海浪反光白紋
        const ctx = this.ctx;
        const waveShift = Math.floor(Math.sin(gameTime * 0.06 + r * 0.7 + c * 0.5) * 4);
        ctx.fillStyle = 'rgba(224, 242, 254, 0.45)';
        ctx.fillRect(x + 10 + waveShift, y + 14, 12, 3);
        ctx.fillRect(x + 22 - waveShift, y + 32, 10, 3);
    }

    drawPoisonWaterTile(x, y, gameTime, r, c) {
        if (!this.drawSprite('poison_water', x, y)) {
            this.ctx.fillStyle = '#3b1561';
            this.ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        }
        const ctx = this.ctx;
        ctx.fillStyle = '#4ade80';
        const offset = Math.floor(Math.sin(gameTime * 0.08 + r + c) * 3);
        ctx.fillRect(x + 10, y + 14 + offset, 5, 5);
        ctx.fillRect(x + 30, y + 28 - offset, 6, 6);
    }

    drawIceCrystalTile(x, y) {
        if (this.drawSprite('ice_crystal', x, y)) return;
        const ctx = this.ctx;
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(x + 6, y + 6, 36, 36);
        ctx.fillStyle = '#bae6fd';
        ctx.fillRect(x + 12, y + 12, 24, 24);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 16, y + 16, 8, 8);
    }

    drawCoralTile(x, y) {
        if (this.drawSprite('coral', x, y)) return;
        const ctx = this.ctx;
        ctx.fillStyle = '#be185d';
        ctx.fillRect(x + 10, y + 12, 28, 28);
        ctx.fillStyle = '#f472b6';
        ctx.fillRect(x + 14, y + 16, 20, 20);
    }

    drawClockworkWallTile(x, y, isGate = false) {
        if (isGate && this.drawSprite('cyber_gate', x, y)) return;
        if (!isGate && this.drawSprite('chest', x, y)) return;
        const ctx = this.ctx;
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
        ctx.fillStyle = isGate ? '#dc2626' : '#d97706';
        ctx.fillRect(x + 6, y + 6, TILE_SIZE - 12, TILE_SIZE - 12);
    }

    drawPixelMushroom(x, y, withSpots = true) {
        const ctx = this.ctx;
        ctx.fillStyle = '#000000';
        ctx.fillRect(x + 16, y + 26, 16, 16);
        ctx.fillStyle = '#f5dfb8';
        ctx.fillRect(x + 19, y + 26, 10, 13);
        ctx.fillStyle = '#000000';
        ctx.fillRect(x + 8, y + 12, 32, 16);
        ctx.fillRect(x + 12, y + 8, 24, 6);
        ctx.fillStyle = '#d93829';
        ctx.fillRect(x + 11, y + 14, 26, 12);
        ctx.fillRect(x + 14, y + 11, 20, 4);
        if (withSpots) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(x + 14, y + 15, 5, 5);
            ctx.fillRect(x + 27, y + 16, 6, 5);
        }
    }

    drawPixelYellowFlower(x, y) {
        const ctx = this.ctx;
        ctx.fillStyle = '#000000';
        ctx.fillRect(x + 18, y + 26, 12, 14);
        ctx.fillStyle = '#4caf50';
        ctx.fillRect(x + 21, y + 26, 6, 11);
        ctx.fillStyle = '#000000';
        ctx.fillRect(x + 10, y + 10, 28, 18);
        ctx.fillStyle = '#ffeb3b';
        ctx.fillRect(x + 13, y + 13, 22, 12);
        ctx.fillStyle = '#f57f17';
        ctx.fillRect(x + 18, y + 16, 12, 6);
    }

    drawColoredOre(x, y, baseColor, spotColor) {
        const ctx = this.ctx;
        ctx.fillStyle = '#000000';
        ctx.fillRect(x + 6, y + 16, 36, 22);
        ctx.fillRect(x + 10, y + 12, 28, 6);
        ctx.fillStyle = baseColor;
        ctx.fillRect(x + 9, y + 18, 30, 17);
        ctx.fillRect(x + 13, y + 15, 22, 4);
        ctx.fillStyle = spotColor;
        ctx.fillRect(x + 16, y + 19, 8, 4);
        ctx.fillRect(x + 18, y + 26, 8, 4);
    }

    ensurePortalsAndTentExist(currentMap) {
        const t = currentMap.tiles;
        if (!t || t.length < 11) return;
        const id = currentMap.id;

        if (id === 'starter_island') {
            t[1][3] = 11;
            t[1][8] = 11;
            t[2][6] = 6;
            t[7][8] = 2;
        } else if (id === 'desert_ruins') {
            t[1][1] = 2;
            t[10][9] = 30;
        } else if (id === 'poison_swamp') {
            t[1][1] = 2;
            t[10][9] = 31;
        } else if (id === 'ice_ruins') {
            t[1][1] = 30;
            t[10][9] = 32;
        } else if (id === 'deep_sea') {
            t[1][1] = 31;
            t[10][9] = 33;
        } else if (id === 'clockwork') {
            t[1][1] = 32;
            t[10][9] = 34;
        } else if (id === 'floating') {
            t[1][1] = 33;
            t[10][9] = 2;
        } else if (id === 'safe_camp') {
            t[10][4] = 11;
        }
    }

    // 繪製日夜光影、黃昏色溫與玩家動態火把照明圈
    renderDynamicLightingAndTorch(currentMap, player, screenPlayerX, screenPlayerY, gameTime) {
        const cycle = (gameTime % 6000) / 6000;
        let darkness = 0;
        let ambientTint = '10, 15, 35'; // 預設夜晚深藍

        // 0.35 ~ 0.50：黃昏夕陽氛圍
        if (cycle >= 0.35 && cycle <= 0.50) {
            const duskRatio = Math.sin(((cycle - 0.35) / 0.15) * Math.PI);
            this.ctx.fillStyle = `rgba(234, 88, 12, ${duskRatio * 0.22})`;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }

        // 0.48 ~ 0.92：夜晚降臨
        if (cycle > 0.48 && cycle < 0.92) {
            darkness = Math.sin(((cycle - 0.48) / 0.44) * Math.PI) * 0.72;
        }

        // 特殊章節固有幽暗氛圍
        if (currentMap.id === 'poison_swamp') {
            darkness = Math.max(darkness, 0.32);
            ambientTint = '20, 10, 38';
        } else if (currentMap.id === 'deep_sea') {
            darkness = Math.max(darkness, 0.52);
            ambientTint = '4, 24, 48';
        } else if (currentMap.id === 'boss_arena') {
            darkness = Math.max(darkness, 0.45);
            ambientTint = '28, 8, 16';
        }

        if (darkness <= 0.04) return;

        const lCtx = this.lightCtx;
        lCtx.clearRect(0, 0, 960, 540);

        // 1. 鋪滿夜幕遮罩
        lCtx.globalCompositeOperation = 'source-over';
        lCtx.fillStyle = `rgba(${ambientTint}, ${darkness})`;
        lCtx.fillRect(0, 0, 960, 540);

        // 2. 計算火把/提燈照明半徑 (帶呼吸搖曳效果)
        const hasLantern = player.equipment?.includes('lantern') || player.equipment?.includes('torch_light') ||
                           (player.inventory?.['lantern'] || 0) > 0 || (player.inventory?.['torch_light'] || 0) > 0;
        const baseRadius = hasLantern ? 240 : 145;
        const flicker = Math.sin(gameTime * 0.22) * 6 + Math.cos(gameTime * 0.37) * 4;
        const lightRadius = baseRadius + flicker;

        // 3. 在離屏遮罩上「挖空」玩家周圍的光圈
        lCtx.globalCompositeOperation = 'destination-out';
        const cutGrad = lCtx.createRadialGradient(screenPlayerX, screenPlayerY, 18, screenPlayerX, screenPlayerY, lightRadius);
        cutGrad.addColorStop(0, 'rgba(0, 0, 0, 1)');
        cutGrad.addColorStop(0.65, 'rgba(0, 0, 0, 0.75)');
        cutGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        lCtx.fillStyle = cutGrad;
        lCtx.beginPath();
        lCtx.arc(screenPlayerX, screenPlayerY, lightRadius, 0, Math.PI * 2);
        lCtx.fill();

        // 將光影遮罩貼回主畫布
        this.ctx.drawImage(this.lightCanvas, 0, 0);

        // 4. 疊加一層溫暖的橙黃火光暈染
        const warmGrad = this.ctx.createRadialGradient(screenPlayerX, screenPlayerY, 8, screenPlayerX, screenPlayerY, lightRadius * 0.85);
        warmGrad.addColorStop(0, 'rgba(255, 190, 70, 0.22)');
        warmGrad.addColorStop(0.6, 'rgba(255, 140, 40, 0.08)');
        warmGrad.addColorStop(1, 'rgba(255, 140, 40, 0)');
        this.ctx.fillStyle = warmGrad;
        this.ctx.beginPath();
        this.ctx.arc(screenPlayerX, screenPlayerY, lightRadius * 0.85, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawCompassMinimap(currentMap, player) {
        const compassEl = document.getElementById('btn-compass-map');
        if (!compassEl) return;

        let miniCanvas = compassEl.querySelector('canvas');
        if (!miniCanvas) {
            miniCanvas = document.createElement('canvas');
            miniCanvas.width = 68;
            miniCanvas.height = 68;
            miniCanvas.style.cssText = 'width:100%; height:100%; border-radius:50%; display:block; pointer-events:none;';
            compassEl.insertBefore(miniCanvas, compassEl.firstChild);
        }

        const mCtx = miniCanvas.getContext('2d');
        mCtx.clearRect(0, 0, 68, 68);
        const rows = currentMap.tiles.length;
        const cols = currentMap.tiles[0].length;
        const cellW = 68 / cols;
        const cellH = 68 / rows;
        const exploredSet = this.exploredMaps[currentMap.id];

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const t = currentMap.tiles[r][c];
                const isPortalOrTent = [2, 11, 30, 31, 32, 33, 34].includes(t);
                const isExplored = currentMap.id === 'safe_camp' || isPortalOrTent || (exploredSet && exploredSet.has(`${r}_${c}`));

                if (!isExplored) {
                    mCtx.fillStyle = '#0f172a';
                } else if (t === 7) mCtx.fillStyle = '#0284c7';
                else if (t === 16) mCtx.fillStyle = '#4c1d95';
                else if (t === 19) mCtx.fillStyle = '#38bdf8';
                else if (t === 1 || t === 17) mCtx.fillStyle = '#15803d';
                else if ([2, 30, 31, 32, 33, 34].includes(t)) mCtx.fillStyle = '#facc15';
                else if (t === 11) mCtx.fillStyle = '#ea580c';
                else mCtx.fillStyle = currentMap.id === 'desert_ruins' ? '#d97706' : (currentMap.id === 'ice_ruins' ? '#bae6fd' : '#4d922b');

                mCtx.fillRect(c * cellW, r * cellH, Math.ceil(cellW), Math.ceil(cellH));
            }
        }
        mCtx.fillStyle = '#ffffff';
        mCtx.fillRect(player.col * cellW - 2, player.row * cellH - 2, 5, 5);
        mCtx.fillStyle = '#ef4444';
        mCtx.fillRect(player.col * cellW - 1, player.row * cellH - 1, 3, 3);
    }

    render(gameState, gameTime = 0, weather = 'CLEAR') {
        const { currentMap, player } = gameState;
        if (!currentMap || !currentMap.tiles || !currentMap.tiles[0]) return;

        if (this.canvas.width !== 960 || this.canvas.height !== 540) {
            this.canvas.width = 960;
            this.canvas.height = 540;
            this.ctx.imageSmoothingEnabled = false;
        }

        const mapRows = currentMap.tiles.length;
        const mapCols = currentMap.tiles[0].length;
        currentMap.rows = mapRows;
        currentMap.cols = mapCols;

        if (typeof player.col !== 'number' || isNaN(player.col) || player.col < 0 || player.col >= mapCols) {
            player.col = 2;
        }
        if (typeof player.row !== 'number' || isNaN(player.row) || player.row < 0 || player.row >= mapRows) {
            player.row = 2;
        }

        this.ensurePortalsAndTentExist(currentMap);

        // 更新玩家當前位置的探索迷霧 (持有提燈/火把時探索視野 +1)
        const hasTorch = player.equipment?.includes('lantern') || player.equipment?.includes('torch_light') ||
                         (player.inventory?.['lantern'] || 0) > 0;
        const sightRadius = hasTorch ? 5 : 4;
        this.updateFogOfWar(currentMap.id, player.row, player.col, sightRadius);
        const exploredSet = this.exploredMaps[currentMap.id];

        const mapPixelW = mapCols * TILE_SIZE;
        const mapPixelH = mapRows * TILE_SIZE;

        const hudHeight = 38;
        const minCamX = 0;
        const maxCamX = Math.max(0, mapPixelW - this.canvas.width);
        const minCamY = -hudHeight;
        const maxCamY = Math.max(0, mapPixelH - this.canvas.height);

        const targetCamX = (player.col * TILE_SIZE + TILE_SIZE / 2) - (this.canvas.width / 2);
        const targetCamY = (player.row * TILE_SIZE + TILE_SIZE / 2) - (this.canvas.height / 2);

        this.cameraX = Math.max(minCamX, Math.min(maxCamX, targetCamX));
        this.cameraY = Math.max(minCamY, Math.min(maxCamY, targetCamY));

        // 計算畫面震動偏移 (Screen Shake)
        let shakeOffsetX = 0;
        let shakeOffsetY = 0;
        if (this.shakeTimer > 0) {
            this.shakeTimer--;
            shakeOffsetX = (Math.random() - 0.5) * 2 * this.shakeMagnitude;
            shakeOffsetY = (Math.random() - 0.5) * 2 * this.shakeMagnitude;
            if (this.shakeTimer <= 0) this.shakeMagnitude = 0;
        }

        gameState.cameraX = this.cameraX;
        gameState.cameraY = this.cameraY;
        gameState.viewWidth = this.canvas.width;
        gameState.viewHeight = this.canvas.height;
        gameState.tileSize = TILE_SIZE;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.save();
        this.ctx.translate(-Math.floor(this.cameraX - shakeOffsetX), -Math.floor(this.cameraY - shakeOffsetY));

        for (let r = 0; r < mapRows; r++) {
            for (let c = 0; c < mapCols; c++) {
                const tile = currentMap.tiles[r][c];
                const x = c * TILE_SIZE;
                const y = r * TILE_SIZE;

                if (x + TILE_SIZE < this.cameraX - 48 || x > this.cameraX + this.canvas.width + 48 ||
                    y + TILE_SIZE < this.cameraY - 48 || y > this.cameraY + this.canvas.height + 48) {
                    continue;
                }

                const vHash = (r * 19 + c * 31) % 10;

                // 1. 底層地形
                if (currentMap.id === 'desert_ruins') {
                    if (tile === 0 || tile === 2 || tile === 30) {
                        this.ctx.fillStyle = '#e5b567';
                        this.ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                        this.ctx.fillStyle = '#c89646';
                        this.ctx.fillRect(x + 8, y + 12, 4, 2);
                        this.ctx.fillRect(x + 30, y + 34, 4, 2);
                    } else {
                        this.drawSprite('grass', x, y);
                    }
                } else if (currentMap.id === 'ice_ruins' || tile === 18) {
                    if (!this.drawSprite('snow', x, y)) {
                        this.ctx.fillStyle = '#cffafe';
                        this.ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                    }
                } else if (currentMap.id === 'deep_sea' || tile === 40) {
                    if (!this.drawSprite('sea_floor', x, y)) {
                        this.ctx.fillStyle = '#075985';
                        this.ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                    }
                } else if (currentMap.id === 'clockwork' || tile === 42) {
                    if (!this.drawSprite('metal_floor', x, y)) {
                        this.ctx.fillStyle = '#475569';
                        this.ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                    }
                } else {
                    this.drawSprite('grass', x, y);
                }

                if (tile === 45) {
                    if (!this.drawSprite('sky_void', x, y)) {
                        this.ctx.fillStyle = '#090d16';
                        this.ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                    }
                }
                else if (tile === 7) this.drawWaterTile(x, y, gameTime, r, c);
                else if (tile === 16) this.drawPoisonWaterTile(x, y, gameTime, r, c);
                else if (tile === 12) this.drawSprite('farm_empty', x, y);
                else if (tile === 13) this.drawSprite('farm_seeded', x, y);
                else if (tile === 14) this.drawSprite('farm_ready', x, y);
                else if (tile === 20) this.drawSprite('wood_floor', x, y);

                // 2. 地面物件
                if (tile === 1) {
                    if (vHash === 0 || vHash === 1) {
                        this.drawSprite('pine_tree', x, y);
                    } else if (vHash === 2 || vHash === 3) {
                        this.drawSprite('tree', x, y);
                        this.ctx.fillStyle = '#ffffff';
                        this.ctx.fillRect(x + 20, y + 32, 8, 10);
                        this.ctx.fillStyle = '#000000';
                        this.ctx.fillRect(x + 22, y + 35, 4, 2);
                    } else {
                        this.drawSprite('tree', x, y);
                    }
                }
                else if (tile === 17) {
                    if (!this.drawSprite('pine_tree', x, y)) this.drawSprite('tree', x, y);
                }
                else if ([2, 30, 31, 32, 33, 34].includes(tile)) {
                    this.drawPortalTile(x, y, gameTime);
                }
                else if (tile === 3) this.drawSprite('stone', x, y);
                else if (tile === 4) this.drawSprite('iron', x, y);
                else if (tile === 47) {
                    if (vHash % 2 === 0) this.drawColoredOre(x, y, '#688828', '#ffffff');
                    else this.drawSprite('iron', x, y);
                }
                else if (tile === 48) {
                    if (vHash % 2 === 0) this.drawColoredOre(x, y, '#6a2c91', '#ffffff');
                    else this.drawColoredOre(x, y, '#c6362c', '#ffffff');
                }
                else if (tile === 49) {
                    if (!this.drawSprite('coal', x, y)) this.drawColoredOre(x, y, '#4a4a4a', '#facc15');
                }
                else if (tile === 19) this.drawIceCrystalTile(x, y);
                else if (tile === 46) this.drawColoredOre(x, y, '#b91c1c', '#fca5a5');
                else if (tile === 5) this.drawSprite('boss', x, y);
                else if (tile === 6) this.drawSprite('merchant', x, y);
                else if (tile === 8) this.drawSprite('cracked_wall', x, y);
                else if (tile === 9) this.drawSprite('chest', x, y);
                else if (tile === 43) this.drawClockworkWallTile(x, y, false);
                else if (tile === 44) this.drawClockworkWallTile(x, y, true);
                else if (tile === 10 || tile === 21) this.drawSprite('ruin_wall', x, y);
                else if (tile === 11) this.drawTentTile(x, y);
                else if (tile === 15) {
                    if (vHash < 4) this.drawPixelMushroom(x, y, true);
                    else if (vHash < 7) this.drawPixelMushroom(x, y, false);
                    else if (vHash === 7) this.drawPixelYellowFlower(x, y);
                    else this.drawSprite('herb_bush', x, y);
                }
                else if (tile === 41) this.drawCoralTile(x, y);
                else if (tile === 22) this.drawSprite('fossil', x, y);
                else if (tile === 23) this.drawSprite('compass', x, y);
                else if (tile === 24) this.drawSprite('recycler_box', x, y);
                else if (tile === 50) {
                    if (!this.drawSprite('healing_spring', x, y)) {
                        this.ctx.fillStyle = '#0284c7';
                        this.ctx.beginPath();
                        this.ctx.arc(x + 24, y + 24, 18, 0, Math.PI * 2);
                        this.ctx.fill();
                        this.ctx.fillStyle = '#7dd3fc';
                        this.ctx.beginPath();
                        this.ctx.arc(x + 24, y + 24, 11, 0, Math.PI * 2);
                        this.ctx.fill();
                    }
                }
                else if (tile === 51) {
                    if (!this.drawSprite('obelisk', x, y)) this.drawPortalTile(x, y, gameTime);
                }
            }
        }

        // 繪製玩家角色
        const bobOffset = Math.sin(gameTime * 0.08) > 0 ? -2 : 0;
        const px = player.col * TILE_SIZE;
        const py = player.row * TILE_SIZE;

        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        this.ctx.beginPath();
        this.ctx.ellipse(px + 24, py + 42, 14, 5, 0, 0, Math.PI * 2);
        this.ctx.fill();

        const standingTile = currentMap.tiles[player.row]?.[player.col];
        if (standingTile === 7 || player.isSailing) {
            if (!this.drawSprite('boat', px, py + bobOffset)) {
                this.drawSprite('player', px, py + bobOffset);
            }
        } else {
            const dirKey = `player_${player.direction || 'down'}`;
            if (!this.drawSprite(dirKey, px, py + bobOffset)) {
                this.drawSprite('player', px, py + bobOffset);
            }
        }

        // 5. 粒子特效
        for (let i = this.particles.length - 1; i >= 0; i--) {
            let pt = this.particles[i];
            pt.x += pt.vx;
            pt.y += pt.vy;
            pt.vy += 0.15;
            pt.life--;
            pt.alpha = Math.max(0, pt.life / 30);
            this.ctx.fillStyle = pt.color;
            this.ctx.globalAlpha = pt.alpha;
            this.ctx.fillRect(Math.floor(pt.x), Math.floor(pt.y), pt.size, pt.size);
            if (pt.life <= 0) this.particles.splice(i, 1);
        }

        // 6. 浮動打擊文字特效
        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            const ft = this.floatingTexts[i];
            ft.y -= 0.8;
            ft.life--;
            this.ctx.globalAlpha = Math.max(0, ft.life / ft.maxLife);
            this.ctx.font = 'bold 13px sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.fillStyle = '#000000';
            this.ctx.fillText(ft.text, ft.x + 1, ft.y + 1);
            this.ctx.fillStyle = ft.color;
            this.ctx.fillText(ft.text, ft.x, ft.y);
            if (ft.life <= 0) this.floatingTexts.splice(i, 1);
        }
        this.ctx.globalAlpha = 1.0;

        this.ctx.restore();

        // 7. 繪製日夜光影與動態火把照明圈
        const screenPlayerX = (player.col * TILE_SIZE + TILE_SIZE / 2) - this.cameraX;
        const screenPlayerY = (player.row * TILE_SIZE + TILE_SIZE / 2) - this.cameraY;
        this.renderDynamicLightingAndTorch(currentMap, player, screenPlayerX, screenPlayerY, gameTime);

        // 8. 雨天屏幕雨絲特效
        if (weather === 'RAIN') {
            this.ctx.fillStyle = 'rgba(125, 211, 252, 0.55)';
            for (let i = 0; i < 32; i++) {
                const rx = ((gameTime * 9 + i * 73) % this.canvas.width);
                const ry = ((gameTime * 15 + i * 53) % this.canvas.height);
                this.ctx.fillRect(rx, ry, 2, 12);
            }
        }

        this.drawCompassMinimap(currentMap, player);
    }
}
