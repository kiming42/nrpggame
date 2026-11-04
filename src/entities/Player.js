export class Player {
    constructor(row, col) {
        this.row = row;
        this.col = col;
        this.direction = 'down';
        this.hp = 100;
        this.maxHp = 100;
        this.inventory = {};
        this.equipment = [];
        this.combo = 0;
    }
    
    getPixelX(tileSize) { return this.col * tileSize; }
    getPixelY(tileSize) { return this.row * tileSize; }
    
    addItem(id, count) { 
        this.inventory[id] = (this.inventory[id] || 0) + count; 
    }
    
    removeItem(id, count) { 
        if (this.inventory[id]) { 
            this.inventory[id] -= count; 
            if (this.inventory[id] <= 0) delete this.inventory[id]; 
        } 
    }
}