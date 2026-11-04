// src/view/CanvasRenderer.js
import { TILE_SIZE } from '../data/maps.js';
import { sprites } from '../data/assets.js';

export class CanvasRenderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;
        this.particles = [];
    }

    spawnParticles(col, row, color = '#f7d51d', count = 12) {
        const centerX = col * TILE_SIZE + TILE_SIZE / 2;
        const centerY = row * TILE_SIZE + TILE_SIZE / 2;
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1.5 + Math.random() * 3.5;
            this.particles.push({
                x: centerX,
                y: centerY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 1.5,
                size: 4 + Math.floor(Math.random() * 4),
                color: color,
                life: 1.0
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

    drawPixelBadge(x, y, colorHex, markChar = '') {
        this.ctx.fillStyle = '#141013';
        this.ctx.fillRect(x + 12, y + 10, 24, 28);
        this.ctx.fillStyle = colorHex;
        this.ctx.fillRect(x + 15, y + 13, 18, 22);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(x + 17, y + 15, 4, 4);
        if (markChar) {
            this.ctx.fillStyle = '#141013';
            this.ctx.font = '900 12px monospace';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(markChar, x + 24, y + 29);
        }
    }

    render(gameState, gameTime = 0, weather = 'CLEAR') {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const { currentMap, player } = gameState;
        const bobOffset = Math.sin(gameTime * 0.04) > 0 ? -2 : 0;

        let camX = player.col * TILE_SIZE - this.canvas.width / 2 + TILE_SIZE / 2;
        let camY = player.row * TILE_SIZE - this.canvas.height / 2 + TILE_SIZE / 2;
        const maxCamX = Math.max(0, currentMap.cols * TILE_SIZE - this.canvas.width);
        const maxCamY = Math.max(0, currentMap.rows * TILE_SIZE - this.canvas.height);
        camX = Math.max(0, Math.min(camX, maxCamX));
        camY = Math.max(0, Math.min(camY, maxCamY));

        this.ctx.save();
        this.ctx.translate(-Math.floor(camX), -Math.floor(camY));

        for (let r = 0; r < currentMap.rows; r++) {
            for (let c = 0; c < currentMap.cols; c++) {
                const tile = currentMap.tiles[r][c];
                const x = c * TILE_SIZE;
                const y = r * TILE_SIZE;
                // 根據座標雜湊決定該格顯示哪一種樹/礦/草外觀，令地圖百花齊放！
                const variant = (r * 17 + c * 31) % 4;

                if (currentMap.id === 'desert_ruins' && tile === 0) {
                    this.ctx.fillStyle = '#d3976c';
                    this.ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                    this.ctx.fillStyle = '#9e5211';
                    this.ctx.fillRect(x + 8, y + 12, 4, 4);
                    this.ctx.fillRect(x + 32, y + 36, 4, 4);
                } else {
                    this.drawSprite('grass', x, y);
                }

                // 🌲 多樣化樹木外觀 (橡木、樺木、松木、緋紅靈木)
                if (tile === 1) {
                    const treeSprites = ['tree', 'birch_tree', 'pine_tree', 'crimson_tree'];
                    const spKey = treeSprites[variant] || 'tree';
                    if (!this.drawSprite(spKey, x, y)) this.drawSprite('tree', x, y);
                }
                else if ([2, 30, 31, 32, 33, 34].includes(tile)) this.drawSprite('portal', x, y);
                // ⛏️ 多樣化岩石與基礎礦石
                else if (tile === 3) {
                    const rockSprites = ['stone', 'copper', 'iron', 'stone'];
                    this.drawSprite(rockSprites[variant], x, y);
                }
                else if (tile === 4) this.drawSprite('iron', x, y);
                else if (tile === 5) this.drawSprite('boss', x, y + bobOffset);
                else if (tile === 6) this.drawSprite('merchant', x, y + bobOffset);
                else if (tile === 7) this.drawSprite('water', x, y);
                else if (tile === 8) this.drawSprite('cracked_wall', x, y);
                else if (tile === 9) this.drawSprite('chest', x, y);
                else if (tile === 10) this.drawSprite('ruin_wall', x, y);
                else if (tile === 11) this.drawSprite('camp_portal', x, y);
                else if (tile === 12) this.drawSprite('farm_empty', x, y);
                else if (tile === 13) this.drawSprite('farm_grow', x, y);
                else if (tile === 14) this.drawSprite('farm_ready', x, y);
                // 🌿 多樣化草藥與農產外觀 (止血草叢、黃金花、夜光藍菇、紅蘑菇)
                else if (tile === 15) {
                    const herbSprites = ['herb_bush', 'gold_flower', 'blue_mushroom', 'mushroom'];
                    const hKey = herbSprites[variant] || 'mushroom';
                    if (!this.drawSprite(hKey, x, y)) this.drawSprite('mushroom', x, y);
                }
                else if (tile === 16) {
                    this.ctx.fillStyle = '#3e1e54'; this.ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                    this.ctx.fillStyle = '#71aa34'; this.ctx.fillRect(x + 10, y + 14, 8, 8);
                    this.ctx.fillRect(x + 28, y + 30, 6, 6);
                }
                else if (tile === 17) {
                    this.ctx.fillStyle = '#2a4c28'; this.ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                    this.drawSprite('crimson_tree', x, y);
                }
                else if (tile === 18) {
                    this.ctx.fillStyle = '#c7e8f3'; this.ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                    this.ctx.fillStyle = '#ffffff'; this.ctx.fillRect(x + 6, y + 6, 8, 4);
                }
                else if (tile === 19) {
                    this.ctx.fillStyle = '#c7e8f3'; this.ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                    this.drawSprite(variant % 2 === 0 ? 'amethyst_vein' : 'gem', x, y);
                }
                else if (tile === 20) {
                    this.ctx.fillStyle = '#9e5211'; this.ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                    this.ctx.strokeStyle = '#472911'; this.ctx.lineWidth = 2;
                    this.ctx.strokeRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
                }
                else if (tile === 21) this.drawSprite('ruin_wall', x, y);
                else if (tile === 22) {
                    this.ctx.fillStyle = '#472911'; this.ctx.fillRect(x + 6, y + 6, TILE_SIZE - 12, TILE_SIZE - 12);
                    this.drawPixelBadge(x, y, '#f4cca1', 'R');
                }
                else if (tile === 23) {
                    this.ctx.fillStyle = '#153670'; this.ctx.fillRect(x + 6, y + 6, TILE_SIZE - 12, TILE_SIZE - 12);
                    this.drawPixelBadge(x, y, '#f7d51d', 'C');
                }
                else if (tile === 24) {
                    this.ctx.fillStyle = '#1d4018'; this.ctx.fillRect(x + 4, y + 4, TILE_SIZE - 8, TILE_SIZE - 8);
                    this.drawSprite('chest', x, y);
                }
                else if (tile === 40) {
                    this.ctx.fillStyle = '#0d2b52'; this.ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                    this.ctx.fillStyle = '#1976a6'; this.ctx.fillRect(x + 8, y + 20, 12, 4);
                }
                else if (tile === 41) {
                    this.ctx.fillStyle = '#0d2b52'; this.ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                    this.drawSprite(variant % 2 === 0 ? 'blue_mushroom' : 'gold_flower', x, y);
                }
                else if (tile === 42) {
                    this.ctx.fillStyle = '#363342'; this.ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                    this.ctx.strokeStyle = '#141013'; this.ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
                }
                else if (tile === 43) {
                    this.ctx.fillStyle = '#363342'; this.ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                    this.drawSprite('chest', x, y);
                }
                else if (tile === 44) {
                    this.ctx.fillStyle = '#8f1d14'; this.ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                    this.drawPixelBadge(x, y, '#f7d51d', 'E');
                }
                else if (tile === 45) {
                    this.ctx.fillStyle = '#0f0c1b'; this.ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                    this.ctx.fillStyle = '#ffffff';
                    if ((r + c) % 2 === 0) this.ctx.fillRect(x + 20, y + 20, 3, 3);
                }
                // 💎 多樣化元素晶簇與高階礦脈 (紅寶石、紫水晶、翡翠、黃金礦)
                else if (tile === 46 || tile === 48) {
                    const crystalSprites = ['ruby_vein', 'amethyst_vein', 'emerald_vein', 'gold'];
                    const cKey = crystalSprites[variant] || 'gold';
                    if (!this.drawSprite(cKey, x, y)) this.drawSprite('gold', x, y);
                }
                else if (tile === 47) {
                    const oreSprites = ['copper', 'iron', 'emerald_vein', 'ruby_vein'];
                    this.drawSprite(oreSprites[variant], x, y);
                }
                else if (tile === 49) {
                    this.drawSprite(variant % 2 === 0 ? 'amethyst_vein' : 'stone', x, y);
                    this.ctx.fillStyle = 'rgba(20, 16, 19, 0.45)';
                    this.ctx.fillRect(x + 8, y + 10, TILE_SIZE - 16, TILE_SIZE - 16);
                }
                else if (tile === 50) {
                    this.drawSprite('water', x, y);
                    this.ctx.fillStyle = '#42c5f5';
                    this.ctx.fillRect(x + 10, y + 10, TILE_SIZE - 20, TILE_SIZE - 20);
                    this.ctx.strokeStyle = '#ffffff';
                    this.ctx.lineWidth = 2;
                    this.ctx.strokeRect(x + 8, y + 8, TILE_SIZE - 16, TILE_SIZE - 16);
                }
                else if (tile === 51) {
                    this.ctx.fillStyle = '#3e1e54';
                    this.ctx.fillRect(x + 12, y + 4, TILE_SIZE - 24, TILE_SIZE - 8);
                    this.ctx.strokeStyle = '#f7d51d';
                    this.ctx.lineWidth = 2;
                    this.ctx.strokeRect(x + 12, y + 4, TILE_SIZE - 24, TILE_SIZE - 8);
                    this.drawPixelBadge(x, y, '#9b36b5', '?');
                }
            }
        }

        const px = player.col * TILE_SIZE;
        const py = player.row * TILE_SIZE;
        const standingTile = currentMap.tiles[player.row]?.[player.col];
        if (standingTile === 7 || player.isSailing) {
            // 影片 00:27 處：在海洋水格上自動顯示白色帆船！
            if (!this.drawSprite('boat', px, py + bobOffset)) {
                this.drawSprite('player', px, py + bobOffset);
            }
        } else {
            const dirKey = `player_${player.direction || 'down'}`;
            if (!this.drawSprite(dirKey, px, py + bobOffset)) {
                this.drawSprite('player', px, py + bobOffset);
            }
        }

        for (let i = this.particles.length - 1; i >= 0; i--) {
            let p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.18;
            p.life -= 0.04;
            if (p.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }
            this.ctx.fillStyle = '#141013';
            this.ctx.fillRect(Math.floor(p.x) - 1, Math.floor(p.y) - 1, p.size + 2, p.size + 2);
            this.ctx.fillStyle = p.color;
            this.ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
        }

        this.ctx.restore();

        if (!['poison_swamp', 'ice_ruins', 'deep_sea', 'clockwork', 'floating'].includes(currentMap.id)) {
            const cycle = Math.sin(gameTime * 0.0005);
            if (cycle < -0.2) {
                const alpha = Math.min(0.75, Math.abs(cycle + 0.2) * 0.9);
                const hasLantern = player.equipment.includes('lantern');
                this.ctx.fillStyle = `rgba(10, 8, 20, ${hasLantern ? alpha * 0.35 : alpha})`;
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            }
        }

        if (weather === 'RAIN' && !['deep_sea', 'clockwork', 'floating'].includes(currentMap.id)) {
            this.ctx.fillStyle = '#42c5f5';
            for (let i = 0; i < 35; i++) {
                let rx = (Math.sin(i * 789 + gameTime * 0.02) * 0.5 + 0.5) * this.canvas.width;
                let ry = ((gameTime * 0.8 + i * 50) % this.canvas.height);
                this.ctx.fillRect(Math.floor(rx), Math.floor(ry), 2, 10);
            }
        }

        this.renderMinimap(currentMap, player);
    }

// 🌟 請替換 src/view/CanvasRenderer.js 最底部的 renderMinimap 方法：
    renderMinimap(map, player) {
        // 對齊畫面右上角 .srpg-compass-ring 圓形羅盤位置 (960x540 畫布比例)
        const radius = 29;
        const centerX = this.canvas.width - 39;
        const centerY = 64;
        const size = radius * 2;
        const startX = centerX - radius;
        const startY = centerY - radius;
        const cellW = size / map.cols;
        const cellH = size / map.rows;

        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.clip();

        // 海洋底色
        this.ctx.fillStyle = '#0d47a1';
        this.ctx.fillRect(startX, startY, size, size);

        for (let r = 0; r < map.rows; r++) {
            for (let c = 0; c < map.cols; c++) {
                const t = map.tiles[r][c];
                if (t === 7 || t === 40) this.ctx.fillStyle = '#1565c0';
                else if (t === 0 || t === 18 || t === 42) this.ctx.fillStyle = '#4caf50';
                else if ([1, 17].includes(t)) this.ctx.fillStyle = '#2e7d32';
                else if ([2, 11, 30, 31, 32, 33, 34].includes(t)) this.ctx.fillStyle = '#e040fb';
                else if (t === 9) this.ctx.fillStyle = '#f7d51d';
                else if (t === 5) this.ctx.fillStyle = '#d93829';
                else if ([47, 48, 49].includes(t)) this.ctx.fillStyle = '#ff9800';
                else this.ctx.fillStyle = '#8d6e63';

                this.ctx.fillRect(
                    Math.floor(startX + c * cellW),
                    Math.floor(startY + r * cellH),
                    Math.ceil(cellW),
                    Math.ceil(cellH)
                );
            }
        }

        // 玩家中心亮點
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(
            Math.floor(startX + player.col * cellW) - 1,
            Math.floor(startY + player.row * cellH) - 1,
            4,
            4
        );

        this.ctx.restore();
    }
}