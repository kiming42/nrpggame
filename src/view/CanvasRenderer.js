// src/view/CanvasRenderer.js
// 🌟 終極修復版：
// 1. 固定 480x320 (15x10格) 黃金視野 + 鏡頭自動跟隨主角 (Camera Follow)，徹底解決 15x15 地圖切頂行/底行問題！
// 2. 內建沙漠、冰原、毒沼、深海、發條島專屬像素地板紋理，徹底解決地面變黑格與素材消失問題！

import { sprites } from '../data/assets.js';

const TILE_SIZE = 32;
const VIEW_COLS = 15;
const VIEW_ROWS = 10;

export class CanvasRenderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = VIEW_COLS * TILE_SIZE;  // 永遠固定 480
        this.canvas.height = VIEW_ROWS * TILE_SIZE; // 永遠固定 320
        this.ctx.imageSmoothingEnabled = false;
        this.particles = [];
        this.cameraX = 0;
        this.cameraY = 0;
    }

    spawnParticles(col, row, color = '#ffffff', count = 10) {
        const centerX = col * TILE_SIZE + TILE_SIZE / 2;
        const centerY = row * TILE_SIZE + TILE_SIZE / 2;
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 2.5;
            this.particles.push({
                x: centerX,
                y: centerY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 1,
                size: 3 + Math.floor(Math.random() * 3),
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

    // 🌟 內建全地形像素底磚繪製器 (就算 assets.js 缺少 sand/snow 圖示，也保證 100% 畫出精緻像素地板，絕不黑屏！)
    drawTerrainBackground(mapId, tile, x, y, r, c) {
        const ctx = this.ctx;

        if (mapId === 'desert_ruins') {
            if (!this.drawSprite('sand', x, y)) {
                ctx.fillStyle = '#eab664';
                ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                ctx.fillStyle = '#d69e46';
                ctx.fillRect(x + ((r * 7 + c * 13) % 20), y + ((r * 11 + c * 5) % 22), 4, 2);
                ctx.fillRect(x + ((r * 3 + c * 17) % 24), y + ((r * 19 + c * 7) % 24), 3, 3);
            }
        } else if (mapId === 'poison_swamp') {
            ctx.fillStyle = '#3b5e2b';
            ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
            ctx.fillStyle = '#2a471d';
            ctx.fillRect(x + 4, y + 6, 4, 4);
            ctx.fillRect(x + 20, y + 18, 5, 3);
        } else if (mapId === 'ice_ruins' || tile === 18) {
            if (!this.drawSprite('snow', x, y)) {
                ctx.fillStyle = '#dbeafe';
                ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                ctx.fillStyle = '#bfdbfe';
                ctx.fillRect(x + 5, y + 8, 5, 3);
                ctx.fillRect(x + 18, y + 20, 6, 3);
            }
        } else if (mapId === 'deep_sea' || tile === 40) {
            if (!this.drawSprite('sea_floor', x, y)) {
                ctx.fillStyle = '#0f4c75';
                ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                ctx.fillStyle = '#1b6ca8';
                ctx.fillRect(x + 6, y + 10, 8, 3);
                ctx.fillRect(x + 16, y + 22, 6, 3);
            }
        } else if (mapId === 'clockwork' || tile === 42) {
            if (!this.drawSprite('metal_floor', x, y)) {
                ctx.fillStyle = '#64748b';
                ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                ctx.strokeStyle = '#475569';
                ctx.lineWidth = 1;
                ctx.strokeRect(x + 1, y + 1, TILE_SIZE - 2, TILE_SIZE - 2);
                ctx.fillStyle = '#94a3b8';
                ctx.fillRect(x + 3, y + 3, 2, 2);
                ctx.fillRect(x + 27, y + 27, 2, 2);
            }
        } else {
            if (!this.drawSprite('grass', x, y)) {
                ctx.fillStyle = '#4d922b';
                ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
            }
        }
    }

    // 🌟 萬能物件繪製器：若特定高階礦物/珊瑚缺少對應 sprite，自動退回基礎石頭/寶石並加上顏色光澤，絕不消失！
    drawMapObject(tile, x, y) {
        const ctx = this.ctx;
        if (tile === 1) this.drawSprite('tree', x, y);
        else if (tile === 17) {
            if (!this.drawSprite('pine_tree', x, y)) this.drawSprite('tree', x, y);
        }
        else if ([2, 30, 31, 32, 33, 34].includes(tile)) this.drawSprite('portal', x, y);
        else if (tile === 3) this.drawSprite('stone', x, y);
        else if (tile === 4) {
            if (!this.drawSprite('iron', x, y)) this.drawSprite('stone', x, y);
        }
        else if (tile === 19) {
            if (!this.drawSprite('ice_crystal', x, y)) {
                this.drawSprite('stone', x, y);
                ctx.fillStyle = 'rgba(56, 189, 248, 0.5)';
                ctx.fillRect(x + 8, y + 8, 16, 16);
            }
        }
        else if (tile === 47) {
            if (!this.drawSprite('copper', x, y)) this.drawSprite('stone', x, y);
        }
        else if (tile === 49) {
            if (!this.drawSprite('coal', x, y)) this.drawSprite('stone', x, y);
        }
        else if (tile === 46) {
            if (!this.drawSprite('ruby_vein', x, y)) {
                this.drawSprite('stone', x, y);
                ctx.fillStyle = '#ef4444';
                ctx.fillRect(x + 10, y + 12, 5, 5);
                ctx.fillRect(x + 18, y + 16, 4, 4);
            }
        }
        else if (tile === 48) {
            if (!this.drawSprite('sapphire_vein', x, y)) {
                this.drawSprite('stone', x, y);
                ctx.fillStyle = '#3b82f6';
                ctx.fillRect(x + 10, y + 12, 5, 5);
                ctx.fillRect(x + 18, y + 16, 4, 4);
            }
        }
        else if (tile === 5) this.drawSprite('boss', x, y);
        else if (tile === 6) this.drawSprite('merchant', x, y);
        else if (tile === 8) {
            if (!this.drawSprite('cracked_wall', x, y)) this.drawSprite('ruin_wall', x, y);
        }
        else if (tile === 9 || tile === 43) this.drawSprite('chest', x, y);
        else if (tile === 10 || tile === 21) this.drawSprite('ruin_wall', x, y);
        else if (tile === 11) this.drawSprite('tent', x, y);
        else if (tile === 15) this.drawSprite('herb_bush', x, y);
        else if (tile === 41) {
            if (!this.drawSprite('coral', x, y)) this.drawSprite('herb_bush', x, y);
        }
        else if (tile === 44) {
            if (!this.drawSprite('cyber_gate', x, y)) this.drawSprite('ruin_wall', x, y);
        }
        else if (tile === 22) {
            if (!this.drawSprite('fossil', x, y)) this.drawSprite('chest', x, y);
        }
        else if (tile === 23) {
            if (!this.drawSprite('compass', x, y)) this.drawSprite('chest', x, y);
        }
        else if (tile === 24) {
            if (!this.drawSprite('recycler_box', x, y)) this.drawSprite('chest', x, y);
        }
        else if (tile === 50) {
            if (!this.drawSprite('healing_spring', x, y)) {
                ctx.fillStyle = '#38bdf8';
                ctx.beginPath();
                ctx.arc(x + 16, y + 16, 12, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        }
        else if (tile === 51) {
            if (!this.drawSprite('obelisk', x, y)) this.drawSprite('portal', x, y);
        }
    }

    render(gameState, gameTime = 0, weather = 'CLEAR') {
        const { currentMap, player } = gameState;
        if (!currentMap || !currentMap.tiles) return;

        // 永遠固定 Canvas 為 480x320 (15x10 格)，配合 CSS 100% 顯示，絕不超出螢幕！
        if (this.canvas.width !== VIEW_COLS * TILE_SIZE || this.canvas.height !== VIEW_ROWS * TILE_SIZE) {
            this.canvas.width = VIEW_COLS * TILE_SIZE;
            this.canvas.height = VIEW_ROWS * TILE_SIZE;
            this.ctx.imageSmoothingEnabled = false;
        }

        const mapRows = currentMap.tiles.length;
        const mapCols = currentMap.tiles[0] ? currentMap.tiles[0].length : (currentMap.cols || 15);
        currentMap.rows = mapRows;
        currentMap.cols = mapCols;

        const mapPixelW = mapCols * TILE_SIZE;
        const mapPixelH = mapRows * TILE_SIZE;

        // 🌟 計算鏡頭位置 (Camera Follow)：以玩家為中心，並自動夾在 (0, 0) 到 (地圖最大寬高 - 視窗寬高) 之間！
        const targetCamX = (player.col * TILE_SIZE + TILE_SIZE / 2) - (this.canvas.width / 2);
        const targetCamY = (player.row * TILE_SIZE + TILE_SIZE / 2) - (this.canvas.height / 2);

        this.cameraX = Math.max(0, Math.min(Math.max(0, mapPixelW - this.canvas.width), targetCamX));
        this.cameraY = Math.max(0, Math.min(Math.max(0, mapPixelH - this.canvas.height), targetCamY));

        // 將鏡頭座標存回 gameState，方便手機點擊螢幕時換算真實格子
        gameState.cameraX = this.cameraX;
        gameState.cameraY = this.cameraY;
        gameState.viewWidth = this.canvas.width;
        gameState.viewHeight = this.canvas.height;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.save();
        this.ctx.translate(-Math.floor(this.cameraX), -Math.floor(this.cameraY));

        const isWaterLike = (t) => t === 7 || t === 16 || t === 40;

        for (let r = 0; r < mapRows; r++) {
            if (!currentMap.tiles[r]) continue;
            for (let c = 0; c < mapCols; c++) {
                const tile = currentMap.tiles[r][c];
                const x = c * TILE_SIZE;
                const y = r * TILE_SIZE;

                // 只繪製在鏡頭可見範圍內的格子，提升手機流暢度
                if (x + TILE_SIZE < this.cameraX || x > this.cameraX + this.canvas.width ||
                    y + TILE_SIZE < this.cameraY || y > this.cameraY + this.canvas.height) {
                    continue;
                }

                // 1. 繪製底層地形 (永不黑屏)
                this.drawTerrainBackground(currentMap.id, tile, x, y, r, c);

                if (tile === 45) {
                    if (!this.drawSprite('sky_void', x, y)) {
                        this.ctx.fillStyle = '#090d16';
                        this.ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                    }
                } else if (tile === 7) {
                    if (!this.drawSprite('water', x, y)) {
                        this.ctx.fillStyle = '#0284c7';
                        this.ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                    }
                } else if (tile === 16) {
                    if (!this.drawSprite('poison_water', x, y)) {
                        this.ctx.fillStyle = '#581c87';
                        this.ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                    }
                } else if (tile === 12) this.drawSprite('farm_empty', x, y);
                else if (tile === 13) this.drawSprite('farm_seeded', x, y);
                else if (tile === 14) this.drawSprite('farm_ready', x, y);
                else if (tile === 20) this.drawSprite('wood_floor', x, y);

                // 2. 水岸沙灘邊緣與地圖最外圍邊界線
                if (!isWaterLike(tile) && tile !== 45) {
                    this.ctx.fillStyle = currentMap.id === 'ice_ruins' ? '#bae6fd' : '#f3d078';
                    if (r > 0 && currentMap.tiles[r - 1] && isWaterLike(currentMap.tiles[r - 1][c])) this.ctx.fillRect(x, y, TILE_SIZE, 4);
                    if (r < mapRows - 1 && currentMap.tiles[r + 1] && isWaterLike(currentMap.tiles[r + 1][c])) this.ctx.fillRect(x, y + TILE_SIZE - 4, TILE_SIZE, 4);
                    if (c > 0 && isWaterLike(currentMap.tiles[r][c - 1])) this.ctx.fillRect(x, y, 4, TILE_SIZE);
                    if (c < mapCols - 1 && isWaterLike(currentMap.tiles[r][c + 1])) this.ctx.fillRect(x + TILE_SIZE - 4, y, 4, TILE_SIZE);
                }

                // 3. 在地圖最外圍 (r=0, r=mapRows-1, c=0, c=mapCols-1) 繪製明顯的島嶼海岸護欄邊界！
                if (r === 0) {
                    this.ctx.fillStyle = '#0284c7';
                    this.ctx.fillRect(x, y, TILE_SIZE, 6);
                    this.ctx.fillStyle = '#fde047';
                    this.ctx.fillRect(x, y + 6, TILE_SIZE, 3);
                }
                if (r === mapRows - 1) {
                    this.ctx.fillStyle = '#fde047';
                    this.ctx.fillRect(x, y + TILE_SIZE - 9, TILE_SIZE, 3);
                    this.ctx.fillStyle = '#0284c7';
                    this.ctx.fillRect(x, y + TILE_SIZE - 6, TILE_SIZE, 6);
                }
                if (c === 0) {
                    this.ctx.fillStyle = '#0284c7';
                    this.ctx.fillRect(x, y, 6, TILE_SIZE);
                    this.ctx.fillStyle = '#fde047';
                    this.ctx.fillRect(x + 6, y, 3, TILE_SIZE);
                }
                if (c === mapCols - 1) {
                    this.ctx.fillStyle = '#fde047';
                    this.ctx.fillRect(x + TILE_SIZE - 9, y, 3, TILE_SIZE);
                    this.ctx.fillStyle = '#0284c7';
                    this.ctx.fillRect(x + TILE_SIZE - 6, y, 6, TILE_SIZE);
                }

                // 4. 繪製地面物件與素材
                this.drawMapObject(tile, x, y);
            }
        }

        // 5. 繪製玩家角色
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

        // 6. 建造模式預覽框
        if (gameState.buildMode && currentMap.id === 'safe_camp') {
            let tCol = player.col, tRow = player.row;
            if (player.direction === 'up') tRow--;
            else if (player.direction === 'down') tRow++;
            else if (player.direction === 'left') tCol--;
            else if (player.direction === 'right') tCol++;
            this.ctx.strokeStyle = '#ffeb3b';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(tCol * TILE_SIZE + 2, tRow * TILE_SIZE + 2, TILE_SIZE - 4, TILE_SIZE - 4);
        }

        // 7. 粒子特效
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

        // 8. 螢幕空間特效：雨天與日夜光影
        if (weather === 'RAIN') {
            this.ctx.fillStyle = 'rgba(120, 190, 255, 0.55)';
            for (let i = 0; i < 25; i++) {
                let rx = ((gameTime * 7 + i * 67) % this.canvas.width);
                let ry = ((gameTime * 13 + i * 43) % this.canvas.height);
                this.ctx.fillRect(rx, ry, 2, 10);
            }
        }
    }
}