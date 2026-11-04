// src/view/CanvasRenderer.js
// 🌟 完整修復版：自動適配不同尺寸地圖 (15x10 / 15x15)，絕不切掉上下左右邊界，並自動繪製四周邊界與海岸線

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

        // 🌟 關鍵修復：根據當前地圖的實際行列數 (例如 15x10 或 15x15) 動態同步 Canvas 內部解析度，確保上下左右邊界 100% 完整顯示！
        const mapRows = currentMap.tiles.length;
        const mapCols = currentMap.tiles[0] ? currentMap.tiles[0].length : currentMap.cols;
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

                // 2. 海岸金黃沙灘邊緣：當陸地格緊鄰水格，或位於地圖最外圍邊界時，自動繪製清晰沙灘/岩岸邊界！
                const isEdgeRowCol = (r === 0 || r === mapRows - 1 || c === 0 || c === mapCols - 1);
                if (!isWaterLike(tile) && tile !== 45) {
                    this.ctx.fillStyle = currentMap.id === 'ice_ruins' ? '#bae6fd' : '#f3d078';
                    if (r > 0 && isWaterLike(currentMap.tiles[r - 1][c])) this.ctx.fillRect(x, y, TILE_SIZE, 4);
                    if (r < mapRows - 1 && isWaterLike(currentMap.tiles[r + 1][c])) this.ctx.fillRect(x, y + TILE_SIZE - 4, TILE_SIZE, 4);
                    if (c > 0 && isWaterLike(currentMap.tiles[r][c - 1])) this.ctx.fillRect(x, y, 4, TILE_SIZE);
                    if (c < mapCols - 1 && isWaterLike(currentMap.tiles[r][c + 1])) this.ctx.fillRect(x + TILE_SIZE - 4, y, 4, TILE_SIZE);

                    // 🌟 為非第一張地圖的最外圍四邊加上明顯的島嶼海岸邊界線，讓玩家一眼看清地圖上下左右盡頭！
                    if (isEdgeRowCol) {
                        this.ctx.fillStyle = 'rgba(14, 116, 144, 0.75)';
                        if (r === 0) this.ctx.fillRect(x, y, TILE_SIZE, 5);
                        if (r === mapRows - 1) this.ctx.fillRect(x, y + TILE_SIZE - 5, TILE_SIZE, 5);
                        if (c === 0) this.ctx.fillRect(x, y, 5, TILE_SIZE);
                        if (c === mapCols - 1) this.ctx.fillRect(x + TILE_SIZE - 5, y, 5, TILE_SIZE);
                    }
                }

                // 3. 繪製地面物件
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

        // 🌟 繪製整張地圖外圍的立體像素邊框 (確保上下左右四條邊界清晰可見)
        this.ctx.strokeStyle = '#1e293b';
        this.ctx.lineWidth = 4;
        this.ctx.strokeRect(2, 2, this.canvas.width - 4, this.canvas.height - 4);

        // 4. 繪製玩家角色 (水面上自動變身白色帆船)
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

        // 5. 建造模式預覽框
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

        // 6. 粒子特效
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

        // 7. 雨天特效
        if (weather === 'RAIN') {
            this.ctx.fillStyle = 'rgba(120, 190, 255, 0.55)';
            for (let i = 0; i < 25; i++) {
                let rx = ((gameTime * 7 + i * 67) % this.canvas.width);
                let ry = ((gameTime * 13 + i * 43) % this.canvas.height);
                this.ctx.fillRect(rx, ry, 2, 10);
            }
        }

        // 8. 日夜光影
        const cycle = (gameTime % 6000) / 6000;
        let darkness = 0;
        if (cycle > 0.5 && cycle < 0.9) darkness = Math.sin(((cycle - 0.5) / 0.4) * Math.PI) * 0.65;
        if (currentMap.id === 'deep_sea') darkness = Math.max(darkness, 0.45);

        if (darkness > 0.05) {
            this.ctx.fillStyle = `rgba(10, 12, 28, ${darkness})`;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            if (player.equipment.includes('lantern') || player.equipment.includes('torch_light')) {
                const cx = px + 16, cy = py + 16;
                const grad = this.ctx.createRadialGradient(cx, cy, 12, cx, cy, 110);
                grad.addColorStop(0, 'rgba(255, 220, 120, 0.35)');
                grad.addColorStop(1, 'rgba(255, 220, 120, 0)');
                this.ctx.fillStyle = grad;
                this.ctx.beginPath();
                this.ctx.arc(cx, cy, 110, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
    }
}