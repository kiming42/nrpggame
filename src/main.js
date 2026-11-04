console.log("🚀 遊戲核心腳本開始載入...");

import './data/questions_chi.js';
import './data/questions_eng.js';
import './data/questions_sci.js';
import './data/questions_hum.js';
import { Game } from './core/Game.js';

function initGame() {
    console.log("✅ 準備啟動 Game 引擎...");
    try {
        const game = new Game();
        game.start();
        console.log("🎮 遊戲引擎啟動成功！按鈕已全部綁定。");
    } catch (error) {
        console.error("❌ 遊戲引擎啟動失敗：", error);
        alert("⚠️ 遊戲引擎啟動失敗！請檢查控制台。");
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
} else {
    initGame();
}