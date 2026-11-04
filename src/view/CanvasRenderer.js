// src/view/CanvasRenderer.js
// 🌟 100% 原版視覺還原 + 零裁切全螢幕貼合版：
// 1. 強制 object-fit: fill，保證上下左右四邊 (第0列至最後一列) 100% 完整顯示，絕不切走左邊角色或頂部！
// 2. 完整還原安全基地帳篷、海水、紅蘑菇、黃花、松樹及各色礦石圖塊！

import { sprites } from '../data/assets.js';

const TILE_SIZE = 32;

export class CanvasRenderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;
        this.particles = [];

        // 🌟 關鍵修復：強制解除 style.css 的 object-fit: cover 裁切，確保上下左右 100% 完整塞入螢幕！
        if (this.canvas) {
            this.canvas.style.cssText = 'width:100% !important; height:100% !important; object-fit:fill !important; display:block !important; margin:0 !important; padding:0 !important;';
        }
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

    // 繪製豐富像素物件 (自動對應紅蘑菇、黃花、松樹、帳篷、各色礦脈與秘寶)
    drawRichTileObject(tile, x, y, r, c) {
        const ctx = this.ctx;
        const hash = (r * 17 + c * 31) % 10;

        if (tile === 1) {
            // 樹木多樣化：混合圓樹與針葉松樹，還原圖3視覺！
            if (hash < 3 && sprites['pine_tree']) this.drawSprite('pine_tree', x, y);
            else this.drawSprite('tree', x, y);
        }
        else if (tile === 17) {
            if (!this.drawSprite('pine_tree', x, y)) this.drawSprite('tree', x, y);
        }
        else if ([2, 30, 31, 32, 33, 34].includes(tile)) {
            this.drawSprite('portal', x, y);
        }
        else if (tile === 3) {
            // 石頭與彩色礦石多樣化還原
            if (hash === 0 && sprites['copper']) this.drawSprite('copper', x, y);
            else if (hash === 1 && sprites['iron']) this.drawSprite('iron', x, y);
            else this.drawSprite('stone', x, y);
        }
        else if (tile === 4) {
            if (!this.drawSprite('iron', x, y)) this.drawSprite('stone', x, y);
        }
        else if (tile === 19) {
            if (!this.drawSprite('ice_crystal', x, y)) this.drawSprite('stone', x, y);
        }
        else if (tile === 47) {
            if (!this.drawSprite('copper', x, y)) this.drawSprite('stone', x, y);
        }
        else if (tile === 49) {
            if (!this.drawSprite('coal', x, y)) this.drawSprite('stone', x, y);
        }
        else if (tile === 46) {
            if (!this.drawSprite('ruby_vein', x, y)) this.drawSprite('stone', x, y);
        }
        else if (tile === 48) {
            if (!this.drawSprite('sapphire_vein', x, y)) this.drawSprite('stone', x, y);
        }
        else if (tile === 5) this.drawSprite('boss', x, y);
        else if (tile === 6) this.drawSprite('merchant', x, y);
        else if (tile === 8) this.drawSprite('cracked_wall', x, y);
        else if (tile === 9 || tile === 43) this.drawSprite('chest', x, y);
        else if (tile === 10 || tile === 21) this.drawSprite('ruin_wall', x, y);
        else if (tile === 11) this.drawSprite('tent', x, y);
        else if (tile === 15) {
            // 草本植物多樣化：還原圖3的紅蘑菇、黃花與藥草叢！
            if (hash < 4 && sprites['mushroom']) {
                this.drawSprite('mushroom', x, y);
            } else if (hash < 7 && sprites['flower']) {
                this.drawSprite('flower', x, y);
            } else if (!this.drawSprite('herb_bush', x, y)) {
                // 若無 mushroom sprite，直接繪製圖3經典像素紅白蘑菇！
                ctx.fillStyle = '#fef3c7';
                ctx.fillRect(x + 11, y + 18, 10, 10);
                ctx.fillStyle = '#dc2626';
                ctx.beginPath();
                ctx.arc(x + 16, y + 18, 11, Math.PI, 0);
                ctx.fill();
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(x + 10, y + 11, 4, 4);
                ctx.fillRect(x + 18, y + 12, 4, 4);
            }
        }
        else if (tile === 41) {
            if (!this.drawSprite('coral', x, y)) this.drawSprite('herb_bush', x, y);
        }
        else if (tile === 44) this.drawSprite('cyber_gate', x, y);
        else if (tile === 22) this.drawSprite('fossil', x, y);
        else if (tile === 23) this.drawSprite('compass', x, y);
        else if (tile === 24) this.drawSprite('recycler_box', x, y);
        else if (tile === 50) this.drawSprite('healing_spring', x, y);
        else if (tile === 51) this.drawSprite('obelisk', x, y);
    }

    render(gameState, gameTime = 0, weather = 'CLEAR') {
        const { currentMap, player } = gameState;
        if (!currentMap || !currentMap.tiles) return;

        // 確保強制全螢幕貼合，不裁切任何一格
        if (this.canvas && this.canvas.style.objectFit !== 'fill') {
            this.canvas.style.objectFit = 'fill';
            this.canvas.style.width = '100%';
            this.canvas.style.height = '100%';
        }

        const mapRows = currentMap.tiles.length;
        const mapCols = currentMap.tiles[0] ? currentMap.tiles[0].length : 15;
        currentMap.rows = mapRows;
        currentMap.cols = mapCols;

        // 🌟 自動保護新手荒島 (starter_island)：確保頂部海水與「安全基地帳篷 (tile 11)」永遠存在，不會消失！
        if (currentMap.id === 'starter_island') {
            let hasTent = false;
            for (let r = 0; r < mapRows; r++) {
                for (let c = 0; c < mapCols; c++) {
                    if (currentMap.tiles[r][c] === 11) hasTent = true;
                }
            }
            if (!hasTent && currentMap.tiles[1]) {
                currentMap.tiles[1][5] = 11; // 恢復圖3頂部中間偏左的橙色安全營地帳篷！
            }
        }

        const targetW = mapCols * TILE_SIZE;
        const targetH = mapRows * TILE_SIZE;
        if (this.canvas.width !== targetW || this.canvas.height !== targetH) {
            this.canvas.width = targetW;
            this.canvas.height = targetH;
            this.ctx.imageSmoothingEnabled = false;
        }

        // 不使用任何鏡頭偏移，整張地圖 1:1 完整呈現在螢幕內
        gameState.cameraX = 0;
        gameState.cameraY = 0;
        gameState.viewWidth = targetW;
        gameState.viewHeight = targetH;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let r = 0; r < mapRows; r++) {
            if (!currentMap.tiles[r]) continue;
            for (let c = 0; c < mapCols; c++) {
                const tile = currentMap.tiles[r][c];
                const x = c * TILE_SIZE;
                const y = r * TILE_SIZE;

                // 1. 繪製底層地形
                if (currentMap.id === 'desert_ruins') {
                    if (!this.drawSprite('sand', x, y)) {
                        this.ctx.fillStyle = '#e6b86a';
                        this.ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                    }
                } else if (currentMap.id === 'ice_ruins' || tile === 18) {
                    if (!this.drawSprite('snow', x, y)) {
                        this.ctx.fillStyle = '#dbeafe';
                        this.ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                    }
                } else if (currentMap.id === 'deep_sea' || tile === 40) {
                    if (!this.drawSprite('sea_floor', x, y)) {
                        this.ctx.fillStyle = '#0f4c75';
                        this.ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                    }
                } else if (currentMap.id === 'clockwork' || tile === 42) {
                    if (!this.drawSprite('metal_floor', x, y)) {
                        this.ctx.fillStyle = '#64748b';
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

                // 2. 繪製地面物件與豐富素材
                this.drawRichTileObject(tile, x, y, r, c);
            }
        }

        // 3. 繪製玩家角色
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

        // 4. 建造模式預覽框
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

        // 6. 雨天特效
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