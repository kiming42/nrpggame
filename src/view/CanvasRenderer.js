// src/view/CanvasRenderer.js
// 🌟 絕對穩定版：修復多尺寸地圖切換時的頂行切斷、座標偏移與素材錯亂問題

import { sprites } from '../data/assets.js';

const TILE_SIZE = 32;

export class CanvasRenderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;
        this.particles = [];
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

    render(gameState, gameTime = 0, weather = 'CLEAR') {
        const { currentMap, player } = gameState;
        if (!currentMap || !currentMap.tiles) return;

        // 🌟 嚴格對齊地圖實際行列數，防止越界與錯位
        const mapRows = currentMap.tiles.length;
        const mapCols = currentMap.tiles[0] ? currentMap.tiles[0].length : (currentMap.cols || 15);
        currentMap.rows = mapRows;
        currentMap.cols = mapCols;

        const targetW = mapCols * TILE_SIZE;
        const targetH = mapRows * TILE_SIZE;

        if (this.canvas.width !== targetW || this.canvas.height !== targetH) {
            this.canvas.width = targetW;
            this.canvas.height = targetH;
            this.ctx.imageSmoothingEnabled = false;
        }

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const isWaterLike = (t) => t === 7 || t === 16 || t === 40;

        for (let r = 0; r < mapRows; r++) {
            if (!currentMap.tiles[r]) continue;
            for (let c = 0; c < mapCols; c++) {
                const tile = currentMap.tiles[r][c];
                const x = c * TILE_SIZE;
                const y = r * TILE_SIZE;

                // 1. 繪製底層地形
                if (currentMap.id === 'desert_ruins') this.drawSprite('sand', x, y);
                else if (currentMap.id === 'ice_ruins') this.drawSprite('snow', x, y);
                else if (currentMap.id === 'deep_sea') this.drawSprite('sea_floor', x, y);
                else if (currentMap.id === 'clockwork') this.drawSprite('metal_floor', x, y);
                else this.drawSprite('grass', x, y);

                if (tile === 18) this.drawSprite('snow', x, y);
                else if (tile === 40) this.drawSprite('sea_floor', x, y);
                else if (tile === 42) this.drawSprite('metal_floor', x, y);
                else if (tile === 45) this.drawSprite('sky_void', x, y);
                else if (tile === 7) this.drawSprite('water', x, y);
                else if (tile === 16) this.drawSprite('poison_water', x, y);
                else if (tile === 12) this.drawSprite('farm_empty', x, y);
                else if (tile === 13) this.drawSprite('farm_seeded', x, y);
                else if (tile === 14) this.drawSprite('farm_ready', x, y);
                else if (tile === 20) this.drawSprite('wood_floor', x, y);

                // 2. 邊界海岸線與邊框
                const isEdgeRowCol = (r === 0 || r === mapRows - 1 || c === 0 || c === mapCols - 1);
                if (!isWaterLike(tile) && tile !== 45) {
                    this.ctx.fillStyle = currentMap.id === 'ice_ruins' ? '#bae6fd' : '#f3d078';
                    if (r > 0 && currentMap.tiles[r - 1] && isWaterLike(currentMap.tiles[r - 1][c])) this.ctx.fillRect(x, y, TILE_SIZE, 4);
                    if (r < mapRows - 1 && currentMap.tiles[r + 1] && isWaterLike(currentMap.tiles[r + 1][c])) this.ctx.fillRect(x, y + TILE_SIZE - 4, TILE_SIZE, 4);
                    if (c > 0 && isWaterLike(currentMap.tiles[r][c - 1])) this.ctx.fillRect(x, y, 4, TILE_SIZE);
                    if (c < mapCols - 1 && isWaterLike(currentMap.tiles[r][c + 1])) this.ctx.fillRect(x + TILE_SIZE - 4, y, 4, TILE_SIZE);

                    if (isEdgeRowCol) {
                        this.ctx.fillStyle = 'rgba(14, 116, 144, 0.75)';
                        if (r === 0) this.ctx.fillRect(x, y, TILE_SIZE, 5);
                        if (r === mapRows - 1) this.ctx.fillRect(x, y + TILE_SIZE - 5, TILE_SIZE, 5);
                        if (c === 0) this.ctx.fillRect(x, y, 5, TILE_SIZE);
                        if (c === mapCols - 1) this.ctx.fillRect(x + TILE_SIZE - 5, y, 5, TILE_SIZE);
                    }
                }

                // 3. 繪製地面物件 (確保代號 100% 準確對應)
                if (tile === 1) this.drawSprite('tree', x, y);
                else if (tile === 17) this.drawSprite('pine_tree', x, y);
                else if ([2, 30, 31, 32, 33, 34].includes(tile)) this.drawSprite('portal', x, y);
                else if (tile === 3) this.drawSprite('stone', x, y);
                else if (tile === 4) this.drawSprite('iron', x, y);
                else if (tile === 19) this.drawSprite('ice_crystal', x, y);
                else if (tile === 47) this.drawSprite('copper', x, y);
                else if (tile === 49) this.drawSprite('coal', x, y);
                else if (tile === 46) this.drawSprite('ruby_vein', x, y);
                else if (tile === 48) this.drawSprite('sapphire_vein', x, y);
                else if (tile === 5) this.drawSprite('boss', x, y);
                else if (tile === 6) this.drawSprite('merchant', x, y);
                else if (tile === 8) this.drawSprite('cracked_wall', x, y);
                else if (tile === 9 || tile === 43) this.drawSprite('chest', x, y);
                else if (tile === 10) this.drawSprite('ruin_wall', x, y);
                else if (tile === 11) this.drawSprite('tent', x, y);
                else if (tile === 15) this.drawSprite('herb_bush', x, y);
                else if (tile === 41) this.drawSprite('coral', x, y);
                else if (tile === 44) this.drawSprite('cyber_gate', x, y);
                else if (tile === 21) this.drawSprite('ruin_wall', x, y);
                else if (tile === 22) this.drawSprite('fossil', x, y);
                else if (tile === 23) this.drawSprite('compass', x, y);
                else if (tile === 24) this.drawSprite('recycler_box', x, y);
                else if (tile === 50) this.drawSprite('healing_spring', x, y);
                else if (tile === 51) this.drawSprite('obelisk', x, y);
            }
        }

        this.ctx.strokeStyle = '#1e293b';
        this.ctx.lineWidth = 4;
        this.ctx.strokeRect(2, 2, this.canvas.width - 4, this.canvas.height - 4);

        // 4. 繪製玩家角色
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
        this.ctx.globalAlpha = 1.0;
    }
}