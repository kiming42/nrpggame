// src/view/CanvasRenderer.js
// 🌟 100% 還原圖3視覺與新素材 + 修復頂部與左邊界遮擋：
// 1. 對齊 index.html 的 960x540 畫布與 maps.js 的 TILE_SIZE = 48
// 2. 完整還原圖3的紅蘑菇、向日葵黃花、雙色樹木、紫/綠/紅/金礦石、安全營地帳篷與右上角羅盤雷達
// 3. 鏡頭支援頂部 HUD (36px) 自動避讓，走到第 0 行或第 0 列時絕不會被切掉或遮擋！

import { sprites } from '../data/assets.js';
import { TILE_SIZE } from '../data/maps.js';

export class CanvasRenderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 960;
        this.canvas.height = 540;
        this.ctx.imageSmoothingEnabled = false;
        this.particles = [];
        this.cameraX = 0;
        this.cameraY = 0;

        // 同時清洗 index.html 頂部多餘重複的一組 .srpg-top-right (消除重複的 💎0 💰500)
        this.cleanDuplicateHudDom();
    }

    cleanDuplicateHudDom() {
        const hud = document.getElementById('hud');
        if (!hud) return;
        const rightGroups = hud.querySelectorAll('.srpg-top-right');
        // index.html 裡寫了兩個 .srpg-top-right，第一個是重複的假數值欄，直接移除它！
        if (rightGroups.length > 1) {
            rightGroups[0].remove();
        }
    }

    spawnParticles(col, row, color = '#ffffff', count = 10) {
        const centerX = col * TILE_SIZE + TILE_SIZE / 2;
        const centerY = row * TILE_SIZE + TILE_SIZE / 2;
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1.5 + Math.random() * 3;
            this.particles.push({
                x: centerX,
                y: centerY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 1,
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

    // 繪製圖3同款的像素紅蘑菇 (帶白點或純紅傘)
    drawPixelMushroom(x, y, withSpots = true) {
        const ctx = this.ctx;
        // 菇柄
        ctx.fillStyle = '#000000';
        ctx.fillRect(x + 16, y + 26, 16, 16);
        ctx.fillStyle = '#f5dfb8';
        ctx.fillRect(x + 19, y + 26, 10, 13);
        // 紅菇傘外框與內部
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

    // 繪製圖3同款的像素向日葵黃花
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

    // 繪製圖3同款的多色斑點礦石 (紫晶/綠翡/赤紅/金黃/青藍)
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

    // 繪製右上角 N/E/S/W 羅盤框內的迷你小地圖
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

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const t = currentMap.tiles[r][c];
                if (t === 7) mCtx.fillStyle = '#0284c7';
                else if (t === 16) mCtx.fillStyle = '#4c1d95';
                else if (t === 1 || t === 17) mCtx.fillStyle = '#15803d';
                else if ([2, 30, 31, 32, 33, 34].includes(t)) mCtx.fillStyle = '#facc15';
                else if (t === 11) mCtx.fillStyle = '#ea580c';
                else mCtx.fillStyle = currentMap.id === 'desert_ruins' ? '#d97706' : '#4d922b';
                mCtx.fillRect(c * cellW, r * cellH, Math.ceil(cellW), Math.ceil(cellH));
            }
        }
        // 玩家紅點
        mCtx.fillStyle = '#ffffff';
        mCtx.fillRect(player.col * cellW - 2, player.row * cellH - 2, 5, 5);
        mCtx.fillStyle = '#ef4444';
        mCtx.fillRect(player.col * cellW - 1, player.row * cellH - 1, 3, 3);
    }

    render(gameState, gameTime = 0, weather = 'CLEAR') {
        const { currentMap, player } = gameState;
        if (!currentMap || !currentMap.tiles) return;

        // 1. 自動修復舊存檔中可能遺失的「安全基地帳篷(11)」
        if (currentMap.id === 'starter_island' && currentMap.tiles[1]) {
            if (currentMap.tiles[1][4] !== 11 && currentMap.tiles[1][8] !== 11) {
                currentMap.tiles[1][4] = 11;
            }
        }

        const mapRows = currentMap.tiles.length;
        const mapCols = currentMap.tiles[0].length;
        currentMap.rows = mapRows;
        currentMap.cols = mapCols;

        const mapPixelW = mapCols * TILE_SIZE;
        const mapPixelH = mapRows * TILE_SIZE;

        // 🌟 2. 計算鏡頭跟隨 (Camera Follow)：
        // 頂部預留 38px 給 #hud 木紋狀態列，確保走到第 0 行時，最頂行絕對不會被 #hud 擋住！
        const hudHeight = 38;
        const minCamX = 0;
        const maxCamX = Math.max(0, mapPixelW - this.canvas.width);
        const minCamY = -hudHeight;
        const maxCamY = Math.max(0, mapPixelH - this.canvas.height);

        const targetCamX = (player.col * TILE_SIZE + TILE_SIZE / 2) - (this.canvas.width / 2);
        const targetCamY = (player.row * TILE_SIZE + TILE_SIZE / 2) - (this.canvas.height / 2);

        this.cameraX = Math.max(minCamX, Math.min(maxCamX, targetCamX));
        this.cameraY = Math.max(minCamY, Math.min(maxCamY, targetCamY));

        gameState.cameraX = this.cameraX;
        gameState.cameraY = this.cameraY;
        gameState.viewWidth = this.canvas.width;
        gameState.viewHeight = this.canvas.height;
        gameState.tileSize = TILE_SIZE;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.save();
        this.ctx.translate(-Math.floor(this.cameraX), -Math.floor(this.cameraY));

        for (let r = 0; r < mapRows; r++) {
            for (let c = 0; c < mapCols; c++) {
                const tile = currentMap.tiles[r][c];
                const x = c * TILE_SIZE;
                const y = r * TILE_SIZE;

                if (x + TILE_SIZE < this.cameraX || x > this.cameraX + this.canvas.width ||
                    y + TILE_SIZE < this.cameraY || y > this.cameraY + this.canvas.height) {
                    continue;
                }

                const vHash = (r * 19 + c * 31) % 10;

                // --- A. 繪製底層地形 ---
                if (currentMap.id === 'desert_ruins') {
                    // 第二章：原版黃沙走道與綠洲草地交錯
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
                        this.ctx.fillStyle = '#e0f2fe';
                        this.ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                    }
                } else if (currentMap.id === 'deep_sea' || tile === 40) {
                    if (!this.drawSprite('sea_floor', x, y)) {
                        this.ctx.fillStyle = '#0c4a6e';
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

                if (tile === 45) this.drawSprite('sky_void', x, y);
                else if (tile === 7) this.drawSprite('water', x, y);
                else if (tile === 16) this.drawSprite('poison_water', x, y);
                else if (tile === 12) this.drawSprite('farm_empty', x, y);
                else if (tile === 13) this.drawSprite('farm_seeded', x, y);
                else if (tile === 14) this.drawSprite('farm_ready', x, y);
                else if (tile === 20) this.drawSprite('wood_floor', x, y);

                // --- B. 繪製原版豐富素材 (100% 還原圖3的松樹、白樺樹、紅蘑菇、向日葵與各色礦石) ---
                if (tile === 1) {
                    if (vHash === 0 || vHash === 1) {
                        this.drawSprite('pine_tree', x, y);
                    } else if (vHash === 2 || vHash === 3) {
                        // 圖3的白樺樹幹圓樹
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
                    this.drawSprite('portal', x, y);
                }
                else if (tile === 3) {
                    this.drawSprite('stone', x, y);
                }
                else if (tile === 4) {
                    this.drawSprite('iron', x, y);
                }
                else if (tile === 47) {
                    // 礦脈 A：圖3的綠翡礦 / 鐵礦
                    if (vHash % 2 === 0) this.drawColoredOre(x, y, '#688828', '#ffffff');
                    else this.drawSprite('iron', x, y);
                }
                else if (tile === 48) {
                    // 高階晶礦 B：圖3的紫晶礦 / 赤紅礦
                    if (vHash % 2 === 0) this.drawColoredOre(x, y, '#6a2c91', '#ffffff');
                    else this.drawColoredOre(x, y, '#c6362c', '#ffffff');
                }
                else if (tile === 49) {
                    // 元素結晶：金斑黑礦
                    if (!this.drawSprite('coal', x, y)) this.drawColoredOre(x, y, '#4a4a4a', '#facc15');
                }
                else if (tile === 19) this.drawSprite('ice_crystal', x, y);
                else if (tile === 46) this.drawColoredOre(x, y, '#b91c1c', '#fca5a5');
                else if (tile === 5) this.drawSprite('boss', x, y);
                else if (tile === 6) this.drawSprite('merchant', x, y);
                else if (tile === 8) this.drawSprite('cracked_wall', x, y);
                else if (tile === 9 || tile === 43) this.drawSprite('chest', x, y);
                else if (tile === 10 || tile === 21) this.drawSprite('ruin_wall', x, y);
                else if (tile === 11) this.drawSprite('tent', x, y);
                else if (tile === 15) {
                    // 野生植物：還原圖3的紅白點蘑菇、紅傘菇、向日葵黃花與藥草！
                    if (vHash < 4) this.drawPixelMushroom(x, y, true);
                    else if (vHash < 7) this.drawPixelMushroom(x, y, false);
                    else if (vHash === 7) this.drawPixelYellowFlower(x, y);
                    else this.drawSprite('herb_bush', x, y);
                }
                else if (tile === 41) this.drawSprite('coral', x, y);
                else if (tile === 44) this.drawSprite('cyber_gate', x, y);
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
                    if (!this.drawSprite('obelisk', x, y)) this.drawSprite('portal', x, y);
                }
            }
        }

        // --- C. 繪製玩家角色 ---
        const bobOffset = Math.sin(gameTime * 0.08) > 0 ? -2 : 0;
        const px = player.col * TILE_SIZE;
        const py = player.row * TILE_SIZE;
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

        // --- D. 粒子特效 ---
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
        this.ctx.globalAlpha = 1.0;

        this.ctx.restore();

        // 更新右上角圓形羅盤內的迷你地圖
        this.drawCompassMinimap(currentMap, player);
    }
}
