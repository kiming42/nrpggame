// src/view/CanvasRenderer.js
// 🌟 終極穩定版：
// 1. 強制固定並恢復第一章「安全基地帳篷 (tile 11)」與「商會 (tile 6)」，不受舊存檔影響！
// 2. 完整繪製第三章紫色毒沼澤(16)、第四章立體冰晶(19)、第五章深海珊瑚(41)、第六章發條齒輪(43)，絕不隱形消失！

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

        this.cleanDuplicateHudDom();
    }

    cleanDuplicateHudDom() {
        const hud = document.getElementById('hud');
        if (!hud) return;
        const rightGroups = hud.querySelectorAll('.srpg-top-right');
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

    // 繪製像素安全基地橙色帳篷 (確保就算 tent 圖示未載入也 100% 清晰顯示)
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

        ctx.fillStyle = '#f97316';
        ctx.fillRect(x + 18, y + 16, 12, 10);
        ctx.fillStyle = '#27170c';
        ctx.fillRect(x + 20, y + 26, 8, 12);
    }

    // 繪製第三章：紫色冒泡毒沼澤 (tile 16)
    drawPoisonWaterTile(x, y, gameTime, r, c) {
        if (this.drawSprite('poison_water', x, y)) return;
        const ctx = this.ctx;
        ctx.fillStyle = '#3b1561';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        // 綠色毒氣氣泡點綴
        ctx.fillStyle = '#4caf50';
        const offset = Math.floor(gameTime * 0.05 + r + c) % 4;
        ctx.fillRect(x + 10, y + 12 + offset, 5, 5);
        ctx.fillRect(x + 30, y + 28 - offset, 6, 6);
    }

    // 繪製第四章：永凍冰晶礦牆 (tile 19) 與冰面 (tile 18)
    drawIceCrystalTile(x, y) {
        if (this.drawSprite('ice_crystal', x, y)) return;
        const ctx = this.ctx;
        // 冰藍色多面體結晶柱
        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.moveTo(x + 24, y + 6);
        ctx.lineTo(x + 40, y + 20);
        ctx.lineTo(x + 36, y + 42);
        ctx.lineTo(x + 12, y + 42);
        ctx.lineTo(x + 8, y + 20);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = '#bae6fd';
        ctx.beginPath();
        ctx.moveTo(x + 24, y + 10);
        ctx.lineTo(x + 34, y + 22);
        ctx.lineTo(x + 24, y + 36);
        ctx.lineTo(x + 14, y + 22);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 18, y + 14, 5, 8);
    }

    // 繪製第五章：亞特蘭提斯深海珊瑚礁 (tile 41)
    drawCoralTile(x, y) {
        if (this.drawSprite('coral', x, y)) return;
        const ctx = this.ctx;
        ctx.fillStyle = '#000000';
        ctx.fillRect(x + 10, y + 12, 28, 28);
        ctx.fillStyle = '#ec4899';
        ctx.fillRect(x + 13, y + 15, 8, 22);
        ctx.fillRect(x + 25, y + 14, 8, 23);
        ctx.fillRect(x + 13, y + 24, 20, 8);
        ctx.fillStyle = '#fbcfe8';
        ctx.fillRect(x + 15, y + 17, 4, 4);
        ctx.fillRect(x + 27, y + 16, 4, 4);
    }

    // 繪製第六章：泰坦發條齒輪壁壘 (tile 43) 與電子閘門 (tile 44)
    drawClockworkWallTile(x, y, isGate = false) {
        if (isGate && this.drawSprite('cyber_gate', x, y)) return;
        if (!isGate && this.drawSprite('chest', x, y)) return;
        const ctx = this.ctx;
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
        ctx.fillStyle = isGate ? '#dc2626' : '#d97706';
        ctx.fillRect(x + 6, y + 6, TILE_SIZE - 12, TILE_SIZE - 12);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(x + 18, y + 18, 12, 12);
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
        if (!currentMap || !currentMap.tiles) return;

        // 🌟 1. 強制修復第一章存檔：確保安全基地入口帳篷(11)、商會(6)與傳送門(2)永遠顯示在玩家附近！
        if (currentMap.id === 'starter_island' && currentMap.tiles.length > 8) {
            currentMap.tiles[1][3] = 11; // 玩家出生點正上方：橙色安全基地帳篷！
            currentMap.tiles[1][8] = 11; // 原版位置：橙色安全基地帳篷！
            currentMap.tiles[2][6] = 6;  // 商會
            currentMap.tiles[7][8] = 2;  // 傳送門
            // 確保帳篷下方一格暢通無阻，不會被樹堵死
            if (currentMap.tiles[2][3] !== 0) currentMap.tiles[2][3] = 0;
            if (currentMap.tiles[2][8] !== 0) currentMap.tiles[2][8] = 0;
        }

        const mapRows = currentMap.tiles.length;
        const mapCols = currentMap.tiles[0].length;
        currentMap.rows = mapRows;
        currentMap.cols = mapCols;

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

                // --- A. 繪製底層地形 (各章節專屬地面) ---
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
                        this.ctx.fillStyle = '#d8f3dc';
                        this.ctx.fillStyle = '#cffafe';
                        this.ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                        this.ctx.fillStyle = '#a5f3fc';
                        this.ctx.fillRect(x + 8, y + 10, 6, 3);
                        this.ctx.fillRect(x + 28, y + 32, 8, 3);
                    }
                } else if (currentMap.id === 'deep_sea' || tile === 40) {
                    if (!this.drawSprite('sea_floor', x, y)) {
                        this.ctx.fillStyle = '#075985';
                        this.ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                        this.ctx.fillStyle = '#0284c7';
                        this.ctx.fillRect(x + 10, y + 14, 10, 3);
                        this.ctx.fillRect(x + 24, y + 34, 12, 3);
                    }
                } else if (currentMap.id === 'clockwork' || tile === 42) {
                    if (!this.drawSprite('metal_floor', x, y)) {
                        this.ctx.fillStyle = '#475569';
                        this.ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                        this.ctx.strokeStyle = '#334155';
                        this.ctx.lineWidth = 2;
                        this.ctx.strokeRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
                    }
                } else {
                    this.drawSprite('grass', x, y);
                }

                // 特殊地形格
                if (tile === 45) {
                    if (!this.drawSprite('sky_void', x, y)) {
                        this.ctx.fillStyle = '#090d16';
                        this.ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                    }
                }
                else if (tile === 7) this.drawSprite('water', x, y);
                else if (tile === 16) this.drawPoisonWaterTile(x, y, gameTime, r, c);
                else if (tile === 12) this.drawSprite('farm_empty', x, y);
                else if (tile === 13) this.drawSprite('farm_seeded', x, y);
                else if (tile === 14) this.drawSprite('farm_ready', x, y);
                else if (tile === 20) this.drawSprite('wood_floor', x, y);

                // --- B. 繪製地面物件與豐富素材 ---
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
                    this.drawSprite('portal', x, y);
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
        this.drawCompassMinimap(currentMap, player);
    }
}