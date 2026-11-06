// src/view/CombatUI.js
// 🌟 終極完整版 (整合第三步劇情/限時詠唱/狂暴 + 進階改造B：🗼知識試煉之塔 Roguelike 連戰、三選一賜福卡、👑Boss護盾與異常狀態戰術)：
// 1. 觸碰「知識方尖碑 (tile 51)」自動啟動 5 層 Roguelike 試煉之塔，每層勝利彈出「三選一秘寶賜福卡」
// 2. Boss 與精英怪實裝「🛡️絕對晶壁護盾」、「🔇沉默禁魔」、「❄️極寒冰封(扣減答題時間)」、「☠️深淵劇毒」
// 3. 戰鬥藥水策略反制：飲用治療藥水可「淨化所有異常狀態 + 獲得護盾」；投擲火藥彈可「瞬間擊碎 Boss 護盾」

import { eventBus } from '../core/EventBus.js';
import { Base64Strings, getPixelIconHtml } from '../data/assets.js';
import { enrichAnyClassifyQuestion } from '../systems/QuestionSystem.js';

export const CHAPTER_STORY_SCRIPTS = {
    starter_island: {
        title: '📜 序章：無知迷霧與翠綠荒島',
        speaker: '大賢者艾爾文 (古卷殘影)',
        text: '「甦醒吧，年輕的知識守護者！百年前『無知迷霧』吞噬了真理圖書館，將四科知識化為散落群島的記憶碎片。\n\n這座【翠綠新手荒島】是你的起點。採集橡木與礦石、修復裝備，並運用中文、英文、科學與人文的知識詠唱戰技，穿過右下方的遠古傳送門吧！」'
    },
    safe_camp: {
        title: '⛺ 安全區：冒險者皇家基地營',
        speaker: '營地總管 巴頓',
        text: '「歡迎回到【皇家基地營】！這裏不受無知迷霧侵襲。\n\n你可以與廣場中央的【公會會長、鐵匠大師、煉金導師】交談，消耗木材與圓石升級據點設施，或觸碰右側的『知識方尖碑』挑戰 5 層試煉之塔！」'
    },
    desert_ruins: {
        title: '⏳ 第二章：時光沙漏遺跡',
        speaker: '考古學者 羅蘭',
        text: '「黃沙掩埋了昔日輝煌的【時光沙漏遺跡】。傳聞西北方的古老石牆出現了裂縫，若能於工坊製作『開山火藥桶』將其炸開，便能奪回失落的古代秘寶！\n\n小心沙漠中的骸骨戰士，唯有精準的知識詠唱能擊碎牠們的護甲！」'
    },
    poison_swamp: {
        title: '☠️ 第三章：劇毒迷瘴沼澤',
        speaker: '煉金術士 薇薇安',
        text: '「前方的【劇毒迷瘴沼澤】瀰漫著腐蝕紫霧！在沒有配戴『淨化防毒面具』前，切勿長時間踏入紫色毒水。\n\n這裏的針葉林與紫晶礦蘊含強大魔力，收集它們來鍛造二階神兵吧！」'
    },
    ice_ruins: {
        title: '❄️ 第四章：永凍冰晶神殿',
        speaker: '極地守望者 弗羅斯',
        text: '「刺骨寒風封印了【永凍冰晶神殿】！神殿四周盡是堅硬的萬年玄冰與藍寶石晶簇，普通工具難以開採。\n\n擊退寒冰魔物、點亮松脂火把，尋找通往深海遺跡的冰封漩渦！」'
    },
    deep_sea: {
        title: '🔱 第五章：亞特蘭提斯深海',
        speaker: '人魚祭司 珊娜',
        text: '「歡迎來到沉沒千年的【亞特蘭提斯深海】！幽暗的海床遍佈珍貴的夜光珊瑚與深海秘銀。\n\n在深海威壓下，魔物的攻勢將更加猛烈，請務必準備充足的料理與藥水！」'
    },
    clockwork: {
        title: '⚙️ 第六章：泰坦發條要塞',
        speaker: '機械工匠 尼古拉',
        text: '「這座【泰坦發條要塞】由上古齒輪與高壓電流驅動！要塞內部的『紅色電子閘門』已被鎖死，你必須搜集或合成『魔力電池』才能將其開啟，通往星辰浮空島！」'
    },
    floating: {
        title: '🌌 第七章：星辰虛空群島',
        speaker: '星象導師 賽莉亞',
        text: '「我們已抵達天空盡頭的【星辰虛空群島】！島嶼之間是萬丈深淵，唯有裝備『精鋼飛索抓鉤』方能跨越虛空。\n\n前方就是最後的聖殿，準備好迎接最終的知識試煉了嗎？」'
    },
    boss_arena: {
        title: '👑 終章：創世獸神聖殿',
        speaker: '混沌獸神 巴哈姆特',
        text: '「凡人，你竟能破開重重迷霧來到本座面前！\n\n在【創世獸神聖殿】中，本座將施展元素晶壁與禁魔威壓！展現你所學的一切智慧，與本座決一死戰吧！」'
    }
};

// 🗼 試煉之塔 Roguelike 秘寶賜福卡池
const TOWER_BUFF_POOL = [
    { id: 'atk_up',     icon: '⚔️', name: '破軍之刃', desc: '試煉期間，全戰技造成的傷害提升 +35%！' },
    { id: 'time_ext',   icon: '⏳', name: '時光沙漏', desc: '試煉期間，每題限時詠唱倒數時間延長 +8 秒！' },
    { id: 'vamp_heal',  icon: '🧛', name: '鮮血渴求', desc: '每次答對發動攻擊時，自動吸取回復 18% 最大生命值！' },
    { id: 'start_shd',  icon: '🛡️', name: '不朽聖盾', desc: '立即獲得 200 點護盾，且每層開戰自動刷新護盾！' },
    { id: 'chain_bolt', icon: '⚡', name: '連鎖雷霆', desc: '每次答對時，額外召喚落雷對全體敵人造成 90 點真實傷害！' },
    { id: 'full_rec',   icon: '🌿', name: '生命湧泉', desc: '立即恢復 70% 最大生命值與 100% 魔力，並驅散所有負面狀態！' },
    { id: 'rich_loot',  icon: '💎', name: '賢者祝福', desc: '立即獲得 💎真理碎片 x2 與 💰300 金幣！' }
];

export class CombatUI {
    constructor() {
        this.layer = document.getElementById('combat-layer');
        this.hud = document.getElementById('hud');
        this.turnNum = document.getElementById('combat-turn-num');
        this.chessboard = document.getElementById('enemies-chessboard');
        this.sceneryLayer = document.getElementById('arena-scenery-layer');

        this.quizModal = document.getElementById('quiz-modal-layer');
        this.quizTitle = document.getElementById('quiz-modal-title');
        this.qText = document.getElementById('q-text');
        this.qSvgContainer = document.getElementById('q-svg-container');
        this.qOptions = document.getElementById('q-options');

        this.badgeLvl = document.getElementById('arena-player-lvl');
        this.badgeTruth = document.getElementById('arena-truth-count');
        this.badgeClass = document.getElementById('arena-player-class');
        this.badgeAtk = document.getElementById('arena-player-atk');
        this.badgeDef = document.getElementById('arena-player-def');
        this.chapterTitle = document.getElementById('arena-chapter-title');

        this.currentQuestion = null;
        this.currentState = null;
        this.optionButtons = [];
        this.isAnimating = false;
        this.speedMultiplier = 1;

        this.quizTimerInterval = null;
        this.quizTimeLeft = 0;
        this.quizMaxTime = 25;

        this.enragedBossIndices = new Set();
        this.seenChapters = new Set();
        this.loadSeenChapters();

        // 🗼 試煉之塔 Roguelike 狀態
        this.towerState = {
            active: false,
            floor: 1,
            maxFloor: 5,
            buffs: new Set()
        };

        this.cleanDuplicateHudDom();
        this.injectArenaDecorAndHero();
        this.injectSkillIcons();
        this.injectQuizTimerBar();
        this.bindEvents();
        this.bindStoryDirector();
        this.bindRoguelikeTowerEvents();
    }

    cleanDuplicateHudDom() {
        const hud = document.getElementById('hud');
        if (!hud) return;
        const rightGroups = hud.querySelectorAll('.srpg-top-right');
        if (rightGroups.length > 1) {
            rightGroups[0].remove();
        }
    }

    loadSeenChapters() {
        try {
            const raw = localStorage.getItem('rpg_seen_chapters');
            if (raw) JSON.parse(raw).forEach(k => this.seenChapters.add(k));
        } catch (e) {}
    }

    saveSeenChapters() {
        try {
            localStorage.setItem('rpg_seen_chapters', JSON.stringify(Array.from(this.seenChapters)));
        } catch (e) {}
    }

    bindStoryDirector() {
        const checkAndPlayStory = (mapId) => {
            if (!mapId || this.seenChapters.has(mapId)) return;
            const script = CHAPTER_STORY_SCRIPTS[mapId];
            if (!script) return;

            this.seenChapters.add(mapId);
            this.saveSeenChapters();

            setTimeout(() => {
                const dialogLayer = document.getElementById('pixel-dialog-layer');
                const titleEl = document.getElementById('pixel-dialog-title');
                const textEl = document.getElementById('pixel-dialog-text');
                if (dialogLayer && titleEl && textEl) {
                    titleEl.innerHTML = `${script.title} <span style="font-size:12px; color:#b45309; margin-left:6px;">— ${script.speaker}</span>`;
                    textEl.innerText = script.text;
                    dialogLayer.style.display = 'flex';
                }
            }, 350);
        };

        const btnStart = document.getElementById('btn-start-game');
        const btnNew = document.getElementById('btn-new-game');
        if (btnStart) btnStart.addEventListener('click', () => setTimeout(() => checkAndPlayStory('starter_island'), 500));
        if (btnNew) {
            btnNew.addEventListener('click', () => {
                this.seenChapters.clear();
                this.saveSeenChapters();
                setTimeout(() => checkAndPlayStory('starter_island'), 500);
            });
        }

        eventBus.on('CHANGE_MAP', (targetKey) => {
            const keyToMapId = {
                campMap: 'safe_camp',
                starter_island: 'starter_island',
                starter_island_from_camp: 'starter_island',
                testMap: 'starter_island',
                level2Map: 'desert_ruins',
                level2Map_from_poison: 'desert_ruins',
                poisonMap: 'poison_swamp',
                poisonMap_from_ice: 'poison_swamp',
                iceMap: 'ice_ruins',
                ice_ruins_from_sea: 'ice_ruins',
                deepSeaMap: 'deep_sea',
                deep_sea_from_clock: 'deep_sea',
                clockworkMap: 'clockwork',
                clockwork_from_float: 'clockwork',
                floatingMap: 'floating',
                floating_from_boss: 'floating',
                bossMap: 'boss_arena'
            };
            checkAndPlayStory(keyToMapId[targetKey] || targetKey);
        });
    }

    // 🌟 進階改造 B-1：綁定「🗿 知識方尖碑」Roguelike 5 層試煉之塔事件
    bindRoguelikeTowerEvents() {
        eventBus.on('ENCOUNTER_ENEMY', (type) => {
            if (type === 'obelisk_trial' && !this.towerState.active) {
                this.towerState.active = true;
                this.towerState.floor = 1;
                this.towerState.buffs.clear();
                eventBus.emit('SHOW_TOAST', '🗼 進入【知識試煉之塔】第 1 / 5 層！擊敗守衛可挑選秘寶賜福！');
            }
        });
    }

    // 彈出「三選一秘寶賜福卡」羊皮紙選單
    showTowerBuffSelectionModal() {
        const dialogLayer = document.getElementById('pixel-dialog-layer');
        const titleEl = document.getElementById('pixel-dialog-title');
        const textEl = document.getElementById('pixel-dialog-text');
        const okBtn = document.getElementById('btn-dialog-ok');
        if (!dialogLayer || !titleEl || !textEl) return;

        if (okBtn) okBtn.style.display = 'none';

        const curFloor = this.towerState.floor;
        titleEl.innerHTML = `🗼 試煉之塔 • 突破第 ${curFloor} / ${this.towerState.maxFloor} 層！ <span style="font-size:12px; color:#15803d; margin-left:6px;">請選擇 1 項秘寶賜福</span>`;

        // 隨機抽出 3 張不重複賜福卡
        const shuffled = [...TOWER_BUFF_POOL].sort(() => Math.random() - 0.5).slice(0, 3);

        const wrap = document.createElement('div');
        wrap.style.cssText = 'display:flex; flex-direction:column; gap:8px; margin-top:6px;';

        shuffled.forEach(card => {
            const btn = document.createElement('button');
            btn.className = 'px-btn';
            btn.style.cssText = 'width:100%; background:#f3dbb3; color:#2b1d0e; border:2.5px solid #4a2e16; padding:10px 12px; display:flex; align-items:center; justify-content:flex-start; gap:10px; text-align:left; border-radius:6px;';
            btn.innerHTML = `
                <span style="font-size:26px; background:#3b2614; padding:6px; border-radius:6px;">${card.icon}</span>
                <div style="flex:1;">
                    <div style="font-size:14px; font-weight:900; color:#b45309;">【${card.name}】</div>
                    <div style="font-size:12px; color:#2b1d0e; margin-top:2px;">${card.desc}</div>
                </div>
                <span style="background:#15803d; color:#fff; padding:4px 8px; border-radius:4px; font-size:11px;">選擇 ▶</span>
            `;
            btn.onclick = () => {
                if (okBtn) okBtn.style.display = 'inline-block';
                dialogLayer.style.display = 'none';
                this.applyTowerBuffAndNextFloor(card);
            };
            wrap.appendChild(btn);
        });

        const leaveBtn = document.createElement('button');
        leaveBtn.className = 'px-btn danger';
        leaveBtn.style.cssText = 'width:100%; margin-top:4px; padding:7px;';
        leaveBtn.innerText = '🏃 見好就收，帶著目前戰利品離開試煉之塔';
        leaveBtn.onclick = () => {
            if (okBtn) okBtn.style.display = 'inline-block';
            dialogLayer.style.display = 'none';
            this.towerState.active = false;
            this.towerState.buffs.clear();
            eventBus.emit('SHOW_TOAST', `🗼 已安全撤離試煉之塔（止步於第 ${curFloor} 層）！`);
        };
        wrap.appendChild(leaveBtn);

        textEl.innerHTML = '';
        textEl.appendChild(wrap);
        dialogLayer.style.display = 'flex';
    }

    applyTowerBuffAndNextFloor(card) {
        const p = this.currentState?.player;
        this.towerState.buffs.add(card.id);

        if (p) {
            if (card.id === 'start_shd') {
                p.shieldHp = (p.shieldHp || 0) + 200;
            } else if (card.id === 'full_rec') {
                p.hp = Math.min(p.maxHp, p.hp + Math.round(p.maxHp * 0.7));
                p.mp = p.maxMp || 60;
                p.statuses = [];
            } else if (card.id === 'rich_loot') {
                p.addItem('truth_fragment', 2);
                p.gold = (p.gold || 0) + 300;
            }
            eventBus.emit('HUD_UPDATE');
        }

        this.towerState.floor++;
        eventBus.emit('PLAY_SOUND', 'collect');
        eventBus.emit('SHOW_TOAST', `✨ 獲得賜福【${card.name}】！邁向試煉之塔第 ${this.towerState.floor} / ${this.towerState.maxFloor} 層！`);

        setTimeout(() => {
            if (this.towerState.floor >= this.towerState.maxFloor) {
                eventBus.emit('BOSS_ENCOUNTER');
            } else {
                eventBus.emit('ENCOUNTER_ENEMY', 'obelisk_floor_next');
            }
        }, 380);
    }

    injectQuizTimerBar() {
        if (!this.quizModal || document.getElementById('quiz-timer-wrap')) return;
        const header = this.quizModal.querySelector('.quiz-parchment-header');
        if (!header) return;

        const timerWrap = document.createElement('div');
        timerWrap.id = 'quiz-timer-wrap';
        timerWrap.style.cssText = 'width:100%; height:20px; background:#2b1d0e; border-bottom:2px solid #5c3a21; position:relative; overflow:hidden; display:flex; align-items:center;';
        timerWrap.innerHTML = `
            <div id="quiz-timer-fill" style="width:100%; height:100%; background:#16a34a; transition:width 0.25s linear, background-color 0.3s;"></div>
            <span id="quiz-timer-label" style="position:absolute; left:0; top:0; width:100%; height:100%; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:900; color:#ffffff; text-shadow:1px 1px 0 #000;">⏳ 詠唱倒數：25s</span>
        `;
        header.insertAdjacentElement('afterend', timerWrap);
    }

    startQuizTimer() {
        this.clearQuizTimer();
        const p = this.currentState?.player;
        const hasBoss = Array.isArray(this.currentState?.enemies) && this.currentState.enemies.some(e => e.hp > 0 && (e.isBoss || e.maxHp >= 350));
        let baseTime = hasBoss ? 20 : 30;

        // 試煉之塔「時光沙漏」賜福 +8 秒
        if (this.towerState.active && this.towerState.buffs.has('time_ext')) {
            baseTime += 8;
        }
        // 若玩家中了 Boss 的「❄️ 極寒冰封」異常狀態，答題時間 -5 秒！
        const isChilled = Array.isArray(p?.statuses) && p.statuses.some(s => s.statusId === 'DEBUFF_CHILL');
        if (isChilled) {
            baseTime = Math.max(10, baseTime - 5);
        }

        this.quizMaxTime = baseTime;
        this.quizTimeLeft = this.quizMaxTime;
        this.updateQuizTimerUI(isChilled);

        this.quizTimerInterval = setInterval(() => {
            if (this.isAnimating || !this.quizModal || this.quizModal.style.display === 'none') {
                this.clearQuizTimer();
                return;
            }
            this.quizTimeLeft = Math.max(0, this.quizTimeLeft - 0.25);
            this.updateQuizTimerUI(isChilled);

            if (this.quizTimeLeft <= 0) {
                this.clearQuizTimer();
                eventBus.emit('SHOW_TOAST', '⏳ 詠唱超時！咒語反噬並遭到魔物突襲！');
                this.handleAnswer('__TIME_OUT_WRONG__');
            }
        }, 250);
    }

    updateQuizTimerUI(isChilled = false) {
        const fillEl = document.getElementById('quiz-timer-fill');
        const labelEl = document.getElementById('quiz-timer-label');
        if (!fillEl || !labelEl) return;

        const pct = Math.max(0, Math.min(100, (this.quizTimeLeft / this.quizMaxTime) * 100));
        fillEl.style.width = `${pct}%`;

        if (pct > 50) fillEl.style.backgroundColor = isChilled ? '#0284c7' : '#16a34a';
        else if (pct > 25) fillEl.style.backgroundColor = '#d97706';
        else fillEl.style.backgroundColor = '#dc2626';

        const sec = Math.ceil(this.quizTimeLeft);
        labelEl.innerText = `⏳ 限時詠唱倒數：${sec} 秒 ${isChilled ? '(❄️冰封減速中)' : ''} ${sec <= 5 ? '⚠️ 快作答！' : ''}`;
    }

    clearQuizTimer() {
        if (this.quizTimerInterval) {
            clearInterval(this.quizTimerInterval);
            this.quizTimerInterval = null;
        }
    }

    injectSkillIcons() {
        const s1 = document.getElementById('sk-icon-slash');
        const s2 = document.getElementById('sk-icon-thunder');
        const s3 = document.getElementById('sk-icon-fire');
        const s4 = document.getElementById('sk-icon-heal');
        if (s1) s1.innerHTML = getPixelIconHtml('sword', 28);
        if (s2) s2.innerHTML = getPixelIconHtml('iron_sword', 28);
        if (s3) s3.innerHTML = getPixelIconHtml('fire_sword', 28);
        if (s4) s4.innerHTML = getPixelIconHtml('nature_sword', 28);

        const p1 = document.getElementById('pot-icon-hp');
        const p2 = document.getElementById('pot-icon-mag');
        const p3 = document.getElementById('pot-icon-bomb');
        if (p1) p1.innerHTML = getPixelIconHtml('potion', 22);
        if (p2) p2.innerHTML = getPixelIconHtml('magnifier', 22);
        if (p3) p3.innerHTML = getPixelIconHtml('bomb', 22);
    }

    injectArenaDecorAndHero() {
        const grid = document.getElementById('arena-board');
        if (!grid) return;

        if (this.sceneryLayer) {
            this.sceneryLayer.innerHTML = `
                <div style="position:absolute; top:11%; left:50%; transform:translateX(-50%); width:96px; height:32px; background:#d7ccc8; border:3px solid #5d4037; box-shadow:0 4px 0 #3e2723;"></div>
                ${this.buildPillarHtml('16%', '13%')}
                ${this.buildBrazierHtml('16%', '34%')}
                ${this.buildBrazierHtml('16%', '66%')}
                ${this.buildPillarHtml('16%', '87%')}
                ${this.buildBrazierHtml('62%', '34%')}
                ${this.buildBrazierHtml('62%', '66%')}
                ${this.buildCactusHtml('36%', '9%')}
                ${this.buildCactusHtml('18%', '28%')}
                ${this.buildCactusHtml('63%', '9%')}
                ${this.buildCactusHtml('68%', '70%')}
                ${this.buildCactusHtml('44%', '92%')}
                <div style="position:absolute; top:59%; left:15%; width:96px; height:52px; background:#00bcd4; border:3px solid #00838f;"></div>
                <div style="position:absolute; top:50%; left:48%; transform:translate(-50%,-50%); width:140px; height:140px; border:4px solid #ffca28;"></div>
            `;
        }

        const oldHero = document.getElementById('arena-hero-unit');
        if (oldHero) oldHero.remove();

        const heroDiv = document.createElement('div');
        heroDiv.id = 'arena-hero-unit';
        heroDiv.style.cssText = 'position:absolute; top:48%; left:20%; transform:translate(-50%,-50%); display:flex; flex-direction:column; align-items:center; z-index:6;';
        heroDiv.innerHTML = `
            <div id="player-float-Bucket" class="dmg-container"></div>
            <div id="arena-hero-statuses" style="display:flex; gap:3px; min-height:18px; margin-bottom:2px;"></div>
            <div class="arena-unit-name">Justin</div>
            <img id="arena-hero-img" src="${Base64Strings.player}" style="width:64px; height:64px; image-rendering:pixelated; filter:drop-shadow(0 5px 2px rgba(0,0,0,0.6));" alt="hero" />
            <div class="arena-hp-bar">
                <div id="arena-hero-hp-fill" class="arena-hp-fill"></div>
                <span id="arena-hero-hp-text" class="arena-hp-text">100</span>
            </div>
            <div class="arena-hp-bar" style="margin-top:2px; height:11px;">
                <div id="arena-hero-mp-fill" class="arena-hp-fill" style="background:#1e88e5;"></div>
                <span id="arena-hero-mp-text" class="arena-hp-text">60</span>
            </div>
        `;
        grid.appendChild(heroDiv);

        const oldFx = document.getElementById('combat-fx');
        if (oldFx) oldFx.remove();

        const fxDiv = document.createElement('div');
        fxDiv.id = 'combat-fx';
        fxDiv.className = 'combat-fx';
        grid.appendChild(fxDiv);

        this.playerUnit = heroDiv;
        this.combatFx = fxDiv;
    }

    buildPillarHtml(top, left) {
        return `<div style="position:absolute; top:${top}; left:${left}; width:34px; height:40px; background:#795548; border-top:6px solid #d7ccc8; border-bottom:6px solid #d7ccc8; box-shadow:0 4px 0 rgba(0,0,0,0.4);"></div>`;
    }

    buildBrazierHtml(top, left) {
        return `<div style="position:absolute; top:${top}; left:${left}; width:34px; height:36px; background:#795548; border-top:5px solid #e6cfa3; border-bottom:5px solid #e6cfa3;">
            <div style="width:14px; height:14px; background:#ffeb3b; border:2px solid #ff9800; margin:-12px auto 0 auto;"></div>
        </div>`;
    }

    buildCactusHtml(top, left) {
        return `<div style="position:absolute; top:${top}; left:${left}; width:10px; height:32px; background:#2e7d32; box-shadow:-8px 6px 0 -2px #2e7d32, 8px 2px 0 -2px #2e7d32;"></div>`;
    }

    renderStatusBadgesHtml(statuses = []) {
        if (!Array.isArray(statuses) || statuses.length === 0) return '';
        const bgColors = { buff: '#1e88e5', dot: '#8e24aa', debuff: '#e53935', cc: '#fb8c00' };
        return statuses.map(s => `
            <span title="${s.name || s.statusId} (剩餘 ${s.turnsLeft} 回合)" style="background:${bgColors[s.category] || '#333'}; color:#fff; border:1px solid #fff; padding:0 3px; font-size:10px; font-weight:900;">
                ${s.icon || '✨'}${s.stacks > 1 ? 'x' + s.stacks : ''}
            </span>
        `).join('');
    }

    bindEvents() {
        document.querySelectorAll('#combat-skills-bar .arena-skill-card').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                if (this.isAnimating) return;
                if (btn.classList.contains('locked-skill')) {
                    eventBus.emit('SHOW_TOAST', '🔒 此戰技尚未研發！請打開選單【🔬 技能】解鎖！');
                    eventBus.emit('PLAY_SOUND', 'bump');
                    return;
                }
                const skillId = btn.dataset.skill;
                const p = this.currentState?.player;
                const isSilenced = Array.isArray(p?.statuses) && p.statuses.some(s => s.statusId === 'DEBUFF_SILENCE_SEAL');
                if (isSilenced && skillId !== 'slash') {
                    eventBus.emit('SHOW_TOAST', '🔇 你正處於【沉默禁魔】狀態！請使用 1 號基礎技，或飲用左下角【治療藥水】淨化！');
                    eventBus.emit('PLAY_SOUND', 'bump');
                    return;
                }
                eventBus.emit('SELECT_COMBAT_SKILL', skillId);
                this.openQuizModal();
            });
        });

        // 🌟 進階改造 B-2：強化戰鬥藥水與火藥彈的「淨化異常狀態 + 擊碎護盾」戰術效果
        const btnHeal = document.getElementById('btn-item-heal');
        if (btnHeal) {
            btnHeal.addEventListener('click', () => {
                const p = this.currentState?.player;
                if (!p) return;
                const hadDebuff = Array.isArray(p.statuses) && p.statuses.length > 0;
                p.statuses = [];
                p.shieldHp = (p.shieldHp || 0) + 80;
                if (hadDebuff) {
                    eventBus.emit('SHOW_TOAST', '✨ 藥水聖光淨化了所有負面異常狀態，並展開 🛡️80 護盾！');
                }
                setTimeout(() => this.updateStatus(this.currentState), 60);
            });
        }

        const btnBomb = document.getElementById('btn-item-3');
        if (btnBomb) {
            btnBomb.addEventListener('click', () => {
                if (!this.currentState?.enemies) return;
                let brokeShield = false;
                this.currentState.enemies.forEach(e => {
                    if ((e.shieldHp || 0) > 0) {
                        e.shieldHp = 0;
                        brokeShield = true;
                    }
                });
                if (brokeShield) {
                    eventBus.emit('SHOW_TOAST', '💥 爆裂火藥彈瞬間炸碎了頭目的【元素晶壁護盾】！');
                }
                setTimeout(() => this.updateStatus(this.currentState), 60);
            });
        }

        const closeBtn = document.getElementById('btn-quiz-close');
        if (closeBtn) {
            closeBtn.onclick = (e) => {
                e.preventDefault();
                if (this.isAnimating) return;
                this.clearQuizTimer();
                if (this.quizModal) this.quizModal.style.display = 'none';
            };
        }

        const ttsBtn = document.getElementById('btn-tts-read');
        if (ttsBtn) {
            ttsBtn.onclick = (e) => {
                e.preventDefault();
                if (this.currentQuestion) {
                    const q = this.currentQuestion;
                    if (q.qType === '英文串字') this.speakText(q.answer, 'eng');
                    else this.speakText(q.question || q.prompt || '', q.subject);
                }
            };
        }

        const escBtn = document.getElementById('btn-combat-escape');
        if (escBtn) {
            escBtn.onclick = (e) => {
                e.preventDefault();
                if (this.isAnimating) return;
                this.clearQuizTimer();
                if (this.towerState.active) {
                    this.towerState.active = false;
                    this.towerState.buffs.clear();
                    eventBus.emit('SHOW_TOAST', '🗼 已撤離知識試煉之塔！');
                }
                eventBus.emit('COMBAT_ESCAPE');
            };
        }

        const speedBtn = document.getElementById('btn-combat-speed');
        if (speedBtn) {
            speedBtn.onclick = (e) => {
                e.preventDefault();
                this.speedMultiplier = this.speedMultiplier === 1 ? 2 : 1;
                speedBtn.innerText = `⏩ x${this.speedMultiplier}`;
            };
        }

        const openTab = (tabId) => {
            this.clearQuizTimer();
            const floatBagBtn = document.getElementById('btn-float-bag');
            if (floatBagBtn) floatBagBtn.click();
            const tabBtn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
            if (tabBtn) tabBtn.click();
        };

        const bBag = document.getElementById('btn-arena-bag');
        if (bBag) bBag.onclick = () => openTab('tab-inventory');
        const bSkill = document.getElementById('btn-arena-skill');
        if (bSkill) bSkill.onclick = () => openTab('tab-skills');
        const bSet = document.getElementById('btn-arena-setting');
        if (bSet) bSet.onclick = () => openTab('tab-settings');
        const bJob = document.getElementById('btn-quick-job');
        if (bJob) bJob.onclick = () => openTab('tab-skills');
        const bMistakes = document.getElementById('btn-open-mistakes-combat');
        if (bMistakes) bMistakes.onclick = () => openTab('tab-mistakes');
        const bFs = document.getElementById('btn-arena-fs');
        if (bFs) bFs.onclick = () => document.getElementById('btn-hud-fullscreen')?.click();
        const bCamp = document.getElementById('btn-arena-camp');
        if (bCamp) bCamp.onclick = () => {
            this.clearQuizTimer();
            this.towerState.active = false;
            eventBus.emit('COMBAT_ESCAPE');
            eventBus.emit('CHANGE_MAP', 'campMap');
        };
    }

    speakText(text, subjectHint = '') {
        if (!('speechSynthesis' in window) || !text) return;
        window.speechSynthesis.cancel();
        const clean = String(text)
            .replace(/<[^>]*>/g, '')
            .replace(/[_＿]+/g, ' 空格 ')
            .replace(/[｜|]/g, '，');
        const utter = new SpeechSynthesisUtterance(clean);
        const isEng = String(subjectHint).toLowerCase().includes('eng') || String(subjectHint).includes('英') || /^[a-zA-Z0-9\s.,?!'"-]+$/.test(clean);
        const savedLang = localStorage.getItem('rpg_tts_lang') || 'zh-HK';
        const savedRate = parseFloat(localStorage.getItem('rpg_tts_rate') || '0.95');
        utter.lang = isEng ? 'en-US' : savedLang;
        utter.rate = savedRate;
        window.speechSynthesis.speak(utter);
    }

    startEncounter(questionData, state) {
        if (!questionData) {
            eventBus.emit('SHOW_TOAST', '題庫讀取失敗！請確認在「🧭 題庫」中至少勾選了一個溫習單元。');
            eventBus.emit('COMBAT_ESCAPE');
            return;
        }

        this.clearQuizTimer();
        if (state.turn === 1) {
            this.enragedBossIndices.clear();
            // 若處於試煉之塔，依層數強化敵人並套用開場聖盾賜福
            if (this.towerState.active) {
                const fl = this.towerState.floor;
                state.chapterName = `🗼 知識試煉之塔（第 ${fl} / ${this.towerState.maxFloor} 層）`;
                if (this.towerState.buffs.has('start_shd') && state.player) {
                    state.player.shieldHp = Math.max(state.player.shieldHp || 0, 180);
                }
                (state.enemies || []).forEach(e => {
                    if (!e._towerScaled) {
                        e._towerScaled = true;
                        const mult = 1 + (fl - 1) * 0.25;
                        e.maxHp = Math.round(e.maxHp * mult);
                        e.hp = e.maxHp;
                        e.atk = Math.round((e.atk || 25) * mult);
                        if (fl >= 3) e.shieldHp = 60 * (fl - 2);
                    }
                });
            }
        }

        if (this.hud) this.hud.style.display = 'none';
        if (this.layer) this.layer.style.display = 'block';
        if (this.quizModal) this.quizModal.style.display = 'none';

        this.currentState = state;
        this.injectSkillIcons();
        this.updateStatus(state);
        this.renderQuestion(questionData);
    }

    openQuizModal() {
        if (!this.currentQuestion || !this.quizModal) return;
        const p = this.currentState?.player;
        const branchNames = {
            earth_blademaster: { slash: '破甲順劈', thunder: '鋼鐵旋風', firestorm: '順劈重斬', heal: '泰坦隕落' },
            gale_ranger:       { slash: '穿雲二連射', thunder: '暗影瞬步', firestorm: '漫天箭雨', heal: '幻影殺陣' },
            star_arcanist:     { slash: '爆裂火球', thunder: '極寒冰環', firestorm: '連鎖閃電', heal: '星辰隕石' }
        };
        const curBranchMap = branchNames[p?.activeBranch || 'earth_blademaster'] || branchNames.earth_blademaster;
        const skName = curBranchMap[this.currentState?.selectedSkill || 'slash'] || '破甲順劈';
        const q = this.currentQuestion;
        const cleanSub = String(q.subject || '').replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s]/g, '').trim();
        const unitStr = String(q.unit || '');
        const subWithoutSuffix = cleanSub.replace(/科$/, '');
        const headerUnit = unitStr.startsWith(subWithoutSuffix) ? unitStr : `${cleanSub} ${unitStr}`;

        if (this.quizTitle) {
            this.quizTitle.innerText = `⚔️ 詠唱【${skName}】｜${headerUnit} • ${q.qType || '選擇題'}`;
        }
        this.quizModal.style.display = 'flex';
        this.startQuizTimer();
    }

    getEnemySprite(enemy) {
        if (enemy.isBoss) return Base64Strings.boss;
        if (enemy.isGoblin || enemy.sprite === 'skeleton') return Base64Strings.skeleton;
        if (enemy.element === 'FIRE' || enemy.sprite === 'fire_monster') return Base64Strings.fire_monster;
        if (enemy.element === 'WATER' || enemy.sprite === 'ice_monster') return Base64Strings.ice_monster;
        return Base64Strings[enemy.sprite] || Base64Strings.witch;
    }

    // 🌟 進階改造 B-3：頭目戰「元素護盾 + 半血狂暴 + 異常狀態」視覺與機制
    renderEnemies(state) {
        if (!this.chessboard) return;
        this.chessboard.innerHTML = '';

        state.enemies.forEach((enemy, idx) => {
            const isTargeted = (idx === state.selectedTargetIndex) && enemy.hp > 0;
            const isDead = enemy.hp <= 0;
            const hpPercent = Math.max(0, (enemy.hp / enemy.maxHp) * 100);

            const isBossOrElite = enemy.isBoss || enemy.maxHp >= 300;
            const isEnraged = !isDead && isBossOrElite && hpPercent <= 50;

            if (isEnraged && !this.enragedBossIndices.has(idx)) {
                this.enragedBossIndices.add(idx);
                enemy.atk = Math.round((enemy.atk || 35) * 1.35);
                enemy.shieldHp = (enemy.shieldHp || 0) + 150;
                eventBus.emit('SHOW_TOAST', `🔥 警告！【${enemy.name}】進入狂暴二階段，展開 🛡️150 元素晶壁護盾並提升攻擊力！`);
            }

            const statusHtml = this.renderStatusBadgesHtml(enemy.statuses || []);
            const enrageBadge = isEnraged
                ? `<span style="background:#dc2626; color:#fef08a; border:1px solid #fff; padding:0 4px; font-size:10px; font-weight:900;">🔥狂暴</span>`
                : '';
            const shieldBadge = (enemy.shieldHp || 0) > 0
                ? `<span style="background:#0284c7; color:#fff; border:1px solid #7dd3fc; padding:0 4px; font-size:10px; font-weight:900;">🛡️${enemy.shieldHp}</span>`
                : '';

            const card = document.createElement('div');
            card.id = `enemy-card-${idx}`;
            card.className = `arena-enemy-card ${isTargeted ? 'targeted' : ''} ${isDead ? 'dead' : ''}`;
            card.innerHTML = `
                <div id="enemy-float-${idx}" class="dmg-container"></div>
                <div style="display:flex; gap:2px; min-height:16px; justify-content:center;">${enrageBadge}${shieldBadge}${statusHtml}</div>
                <div class="arena-lock-label">${isTargeted ? '▼ 目標' : '&nbsp;'}</div>
                <div class="arena-unit-name" style="${isEnraged ? 'color:#fca5a5;' : ''}">${enemy.name}</div>
                <img class="arena-enemy-sprite" src="${this.getEnemySprite(enemy)}" style="${isEnraged ? 'filter:drop-shadow(0 0 8px #ef4444) sepia(0.4) saturate(3);' : ((enemy.shieldHp || 0) > 0 ? 'filter:drop-shadow(0 0 6px #38bdf8);' : '')}" alt="" />
                <div class="arena-hp-bar">
                    <div class="arena-hp-fill" style="width:${hpPercent}%; ${isEnraged ? 'background:#dc2626;' : ''}"></div>
                    <span class="arena-hp-text">${enemy.hp}${(enemy.shieldHp || 0) > 0 ? ` (+🛡️${enemy.shieldHp})` : ''}</span>
                </div>
                <div class="arena-atk-label">⚔️${enemy.atk || 26} <span style="color:#ffeb3b; font-size:9px;">${enemy.weaknessText || ''}</span></div>
            `;

            if (!isDead) {
                card.onclick = () => {
                    if (this.isAnimating) return;
                    eventBus.emit('SELECT_COMBAT_TARGET', idx);
                    this.openQuizModal();
                };
            }
            this.chessboard.appendChild(card);
        });
    }

    updateStatus(state) {
        this.currentState = state;
        if (this.turnNum) this.turnNum.innerText = state.turn;
        if (this.chapterTitle && state.chapterName) {
            const towerTag = this.towerState.active ? ` ｜ 🎁賜福:${this.towerState.buffs.size}` : '';
            this.chapterTitle.innerText = `⏳ ${state.chapterName}${towerTag}`;
        }

        const p = state.player;
        const nameEl = document.getElementById('arena-player-name');
        const unitNameEl = document.querySelector('#arena-hero-unit .arena-unit-name');
        if (nameEl) nameEl.innerText = p.name || 'Justin';
        if (unitNameEl) unitNameEl.innerText = p.name || 'Justin';

        if (this.badgeLvl) this.badgeLvl.innerText = `Lv.${p.level || 1}`;
        if (this.badgeTruth) this.badgeTruth.innerText = `🔥${p.combo || 0}`;
        if (this.badgeClass) this.badgeClass.innerText = p.jobTitle || '大地劍聖';
        if (this.badgeAtk) this.badgeAtk.innerText = p.calcAtk ? p.calcAtk() : 88;
        if (this.badgeDef) this.badgeDef.innerText = p.calcDef ? p.calcDef() : 117;

        const shieldEl = document.getElementById('arena-player-shield');
        if (shieldEl) {
            if ((p.shieldHp || 0) > 0) {
                shieldEl.style.display = 'inline-block';
                shieldEl.innerText = `🛡️${p.shieldHp}`;
            } else {
                shieldEl.style.display = 'none';
            }
        }

        const heroStatEl = document.getElementById('arena-hero-statuses');
        if (heroStatEl) {
            heroStatEl.innerHTML = this.renderStatusBadgesHtml(p.statuses || []);
        }

        const hpFill = document.getElementById('arena-hero-hp-fill');
        const hpTxt = document.getElementById('arena-hero-hp-text');
        const mpFill = document.getElementById('arena-hero-mp-fill');
        const mpTxt = document.getElementById('arena-hero-mp-text');

        const pHpPercent = Math.max(0, (p.hp / p.maxHp) * 100);
        if (hpFill) hpFill.style.width = `${pHpPercent}%`;
        if (hpTxt) hpTxt.innerText = `${p.hp}`;

        const maxMp = p.maxMp || 60;
        const curMp = p.mp !== undefined ? p.mp : 60;
        const pMpPercent = Math.max(0, (curMp / maxMp) * 100);
        if (mpFill) mpFill.style.width = `${pMpPercent}%`;
        if (mpTxt) mpTxt.innerText = `${curMp}`;

        const isSilenced = Array.isArray(p.statuses) && p.statuses.some(s => s.statusId === 'DEBUFF_SILENCE_SEAL');
        const branchSkillIds = {
            earth_blademaster: { slash: 'SK_EB_01', thunder: 'SK_EB_03', firestorm: 'SK_EB_03', heal: 'SK_EB_05' },
            gale_ranger:       { slash: 'SK_GR_01', thunder: 'SK_GR_03', firestorm: 'SK_GR_04', heal: 'SK_GR_05' },
            star_arcanist:     { slash: 'SK_SA_01', thunder: 'SK_SA_03', firestorm: 'SK_SA_04', heal: 'SK_SA_05' }
        };
        const branchNames = {
            earth_blademaster: { slash: '破甲劈', thunder: '鋼鐵旋風', firestorm: '順劈斬', heal: '泰坦隕落' },
            gale_ranger:       { slash: '二連射', thunder: '暗影瞬步', firestorm: '漫天箭雨', heal: '幻影殺陣' },
            star_arcanist:     { slash: '爆裂火球', thunder: '極寒冰環', firestorm: '連鎖閃電', heal: '星辰隕石' }
        };
        const curIds = branchSkillIds[p.activeBranch || 'earth_blademaster'] || branchSkillIds.earth_blademaster;
        const curNames = branchNames[p.activeBranch || 'earth_blademaster'] || branchNames.earth_blademaster;
        const costs = { slash: 0, thunder: 20, firestorm: 30, heal: 45 };

        document.querySelectorAll('#combat-skills-bar .arena-skill-card').forEach(btn => {
            const slot = btn.dataset.skill;
            const skId = curIds[slot];
            const isUnlocked = (slot === 'slash') || ((p.treeLevels && p.treeLevels[skId] > 0));

            btn.classList.toggle('locked-skill', !isUnlocked);
            btn.classList.toggle('active', isUnlocked && state.selectedSkill === slot);
            const nameEl = btn.querySelector('.sk-name');
            const costEl = btn.querySelector('.sk-cost');
            if (nameEl) nameEl.innerText = curNames[slot];

            if (costEl) {
                if (!isUnlocked) costEl.innerText = '🔒未研發';
                else if (isSilenced && slot !== 'slash') costEl.innerText = '🔇禁魔';
                else costEl.innerText = `消耗 ${costs[slot]}`;
            }
        });

        this.renderEnemies(state);
        this.updateItemCounts(p.inventory);
    }

    upgradeSvgDiagram(rawSvg) {
        if (!rawSvg) return '';
        return String(rawSvg).replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '');
    }

    resolveTargetAnswerString(questionData) {
        if (!questionData) return '';
        let ans = questionData.answer;
        if (Array.isArray(ans)) ans = ans[0];
        if (typeof ans === 'number' && Array.isArray(questionData.options) && questionData.options[ans] !== undefined) {
            ans = questionData.options[ans];
        }
        return String(ans || '').replace(/｜/g, '|');
    }

    renderQuestion(questionData) {
        this.isAnimating = false;
        this.currentQuestion = questionData;
        if (!questionData || !this.qText || !this.qOptions) return;

        const resolvedAns = this.resolveTargetAnswerString(questionData);
        const qType = questionData.qType || '選擇題';
        const isClassify = qType === '分類題' || questionData.interactiveType === 'classify';

        const typeBadgeColors = {
            '填充題': '#2563eb',
            '中文填充題': '#2563eb',
            '英文填充題': '#2563eb',
            '分類題': '#7c3aed',
            '看圖填充題': '#0d9488',
            '簡答題': '#d97706',
            '情境題': '#dc2626',
            '選擇題': '#475569',
            '字詞解釋': '#15803d',
            '英文串字': '#0284c7'
        };
        const badgeCol = typeBadgeColors[qType] || '#475569';
        const rawPrompt = String(questionData.question || questionData.prompt || '').replace(/^\[看圖填充.*?\]\s*/g, '');

        this.qText.innerHTML = `<span style="background:${badgeCol}; color:#fff; padding:2px 8px; border-radius:4px; font-size:12px; margin-right:6px; vertical-align:middle;">${qType}</span><span>${rawPrompt.replace(/\n/g, '<br>')}</span>`;

        const rawSvg = questionData.svgHtml || questionData.svg || questionData.image || '';
        const cleanSvg = this.upgradeSvgDiagram(rawSvg);
        if (cleanSvg && cleanSvg.includes('<svg')) {
            this.qSvgContainer.innerHTML = cleanSvg;
            this.qSvgContainer.style.display = 'flex';
            const svgEl = this.qSvgContainer.querySelector('svg');
            if (svgEl) {
                if (!svgEl.getAttribute('viewBox')) {
                    const w = svgEl.getAttribute('width') || 420;
                    const h = svgEl.getAttribute('height') || 120;
                    svgEl.setAttribute('viewBox', `0 0 ${parseInt(w)} ${parseInt(h)}`);
                }
                svgEl.removeAttribute('width');
                svgEl.removeAttribute('height');
            }
        } else {
            this.qSvgContainer.innerHTML = '';
            this.qSvgContainer.style.display = 'none';
        }

        this.qOptions.innerHTML = '';
        this.optionButtons = [];

        if (isClassify) {
            this.renderInteractiveClassification(questionData, resolvedAns);
            return;
        }
        if (qType === '看圖填充題' || questionData.interactiveType === 'fill_blanks') {
            this.renderInteractiveMultiBlank(questionData, resolvedAns);
            return;
        }
        if (qType === '英文串字' && /^[A-Za-z\s-]{3,28}$/.test(resolvedAns.trim())) {
            this.renderInteractiveSpelling(questionData, resolvedAns.trim());
            return;
        }
        if (['填充題', '中文填充題', '英文填充題', '填空題'].includes(qType)) {
            this.renderInteractiveSingleBlank(questionData, resolvedAns);
            return;
        }

        const shuffledOpts = [...(questionData.options || [])].sort(() => Math.random() - 0.5);
        shuffledOpts.forEach((option) => {
            const btn = document.createElement('button');
            btn.className = 'quiz-parchment-option option-btn';
            btn.dataset.val = option;

            const spanTxt = document.createElement('span');
            spanTxt.style.cssText = 'flex:1; text-align:left; padding-right:8px;';
            spanTxt.innerText = option;

            const spkSpan = document.createElement('span');
            spkSpan.style.cssText = 'background:#2b6cb0; color:#fff; border:2px solid #1a365d; padding:3px 7px; font-size:12px; flex-shrink:0;';
            spkSpan.innerText = '🔊';
            spkSpan.onclick = (e) => {
                e.stopPropagation();
                this.speakText(option, questionData.subject);
            };

            btn.appendChild(spanTxt);
            btn.appendChild(spkSpan);

            btn.onclick = () => {
                if (this.isAnimating) return;
                this.handleAnswer(option);
            };
            this.qOptions.appendChild(btn);
            this.optionButtons.push(btn);
        });
    }

    renderInteractiveSingleBlank(questionData, resolvedAns) {
        let selectedOption = null;
        const rawSentence = String(questionData.question || questionData.prompt || '');
        const badgeHtml = `<span style="background:#2563eb; color:#fff; padding:2px 8px; border-radius:4px; font-size:12px; margin-right:6px; vertical-align:middle;">${questionData.qType || '填充題'}</span>`;

        const updatePromptPreview = () => {
            const parts = selectedOption ? String(selectedOption).split(/[；;、]/).map(s => s.trim()) : [];
            let blankIdx = 0;
            const blankRegex = /（[＿_\s]+）|\([＿_\s]+\)|[＿_]{2,}/g;

            let replaced = rawSentence;
            if (blankRegex.test(rawSentence)) {
                replaced = rawSentence.replace(/（[＿_\s]+）|\([＿_\s]+\)|[＿_]{2,}/g, () => {
                    const fillTxt = parts[blankIdx] || selectedOption;
                    blankIdx++;
                    if (fillTxt) return `<span class="blank-slot filled" style="margin:0 4px;">${fillTxt}</span>`;
                    return `<span class="blank-slot" style="margin:0 4px;">❓ 點擊下方詞卡填入</span>`;
                });
            } else {
                const slotHtml = selectedOption
                    ? `<span class="blank-slot filled" style="margin-left:6px;">${selectedOption}</span>`
                    : `<span class="blank-slot" style="margin-left:6px;">❓ 點擊下方詞卡填入</span>`;
                replaced = `${rawSentence} ${slotHtml}`;
            }
            this.qText.innerHTML = `${badgeHtml}<span>${replaced}</span>`;
        };
        updatePromptPreview();

        const wrap = document.createElement('div');
        wrap.className = 'classify-interactive-wrap';

        const poolBox = document.createElement('div');
        poolBox.className = 'classify-pool-box';
        poolBox.innerHTML = `<div style="font-size:12px; font-weight:900; margin-bottom:6px; color:#2b1d0e;">請點擊選擇正確的詞語填入上方句子空格中：</div>`;

        const optGrid = document.createElement('div');
        optGrid.style.cssText = 'display:grid; grid-template-columns:repeat(2, minmax(0, 1fr)); gap:8px; width:100%;';

        const submitBtn = document.createElement('button');
        submitBtn.className = 'px-btn success';
        submitBtn.style.cssText = 'width:100%; padding:10px; font-size:15px;';
        submitBtn.disabled = true;
        submitBtn.innerText = '請先點擊下方詞語卡填入空格';

        const shuffledOpts = [...(questionData.options || [])].sort(() => Math.random() - 0.5);
        shuffledOpts.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'quiz-parchment-option option-btn';
            btn.dataset.val = opt;
            btn.innerHTML = `
                <span style="flex:1; text-align:left;">${opt}</span>
                <span class="spk-mini" style="background:#2b6cb0; color:#fff; padding:2px 6px; font-size:11px;">🔊</span>
            `;
            btn.querySelector('.spk-mini').onclick = (e) => {
                e.stopPropagation();
                this.speakText(opt, questionData.subject);
            };
            btn.onclick = () => {
                selectedOption = opt;
                optGrid.querySelectorAll('.option-btn').forEach(b => {
                    b.style.background = (b.dataset.val === opt) ? '#fefcbf' : '#fff';
                    b.style.borderColor = (b.dataset.val === opt) ? '#d69e2e' : '#2b1d0e';
                });
                updatePromptPreview();
                submitBtn.disabled = false;
                submitBtn.innerText = `⚔️ 確認填入【${opt}】，發動戰技！`;
            };
            optGrid.appendChild(btn);
            this.optionButtons.push(btn);
        });

        poolBox.appendChild(optGrid);
        wrap.appendChild(poolBox);

        submitBtn.onclick = () => {
            if (!selectedOption || this.isAnimating) return;
            this.handleAnswer(selectedOption);
        };
        wrap.appendChild(submitBtn);
        this.qOptions.appendChild(wrap);
    }

    renderInteractiveClassification(questionData, resolvedAns) {
        enrichAnyClassifyQuestion(questionData);
        const buckets = [];
        let allItems = [];

        if (Array.isArray(questionData.categories) && Array.isArray(questionData.items) && questionData.items.length > 0) {
            questionData.categories.forEach(cName => {
                const targetItems = questionData.items.filter(it => it.cat === cName).map(it => it.label);
                buckets.push({ name: cName, targetItems });
            });
            allItems = questionData.items.map(it => it.label);
        } else {
            const fullPrompt = String(questionData.question || questionData.prompt || '').replace(/\n/g, '<br>');
            this.qText.innerHTML = `<span style="background:#7c3aed; color:#fff; padding:2px 8px; border-radius:4px; font-size:12px; margin-right:6px; vertical-align:middle;">分類題</span><span>${fullPrompt}</span>`;
            const shuffledOpts = [...(questionData.options || [])].sort(() => Math.random() - 0.5);
            shuffledOpts.forEach(opt => {
                const btn = document.createElement('button');
                btn.className = 'quiz-parchment-option option-btn';
                btn.innerText = opt;
                btn.onclick = () => this.handleAnswer(opt);
                this.qOptions.appendChild(btn);
            });
            return;
        }

        const firstLinePrompt = String(questionData.question || questionData.prompt || '').split('\n')[0];
        this.qText.innerHTML = `<span style="background:#7c3aed; color:#fff; padding:2px 8px; border-radius:4px; font-size:12px; margin-right:6px; vertical-align:middle;">分類題</span><span>${firstLinePrompt}</span>`;

        for (let i = allItems.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allItems[i], allItems[j]] = [allItems[j], allItems[i]];
        }

        let activeBucketIdx = 0;
        const assignments = {};
        const wrap = document.createElement('div');
        wrap.className = 'classify-interactive-wrap';

        const renderBoard = () => {
            wrap.innerHTML = '';
            const bucketsRow = document.createElement('div');
            bucketsRow.className = 'classify-buckets-row';

            buckets.forEach((b, bIdx) => {
                const bDiv = document.createElement('div');
                bDiv.className = `classify-bucket ${activeBucketIdx === bIdx ? 'active-bucket' : ''}`;
                bDiv.onclick = () => { activeBucketIdx = bIdx; renderBoard(); };

                const assignedHere = allItems.filter(it => assignments[it] === bIdx);
                bDiv.innerHTML = `
                    <div class="bucket-header">
                        <span>【${b.name}】</span>
                        <span style="font-size:11px; color:#2b6cb0;">${activeBucketIdx === bIdx ? '◀ 放入此籃' : '點擊切換'}</span>
                    </div>
                    <div class="bucket-items"></div>
                `;
                const itemsBox = bDiv.querySelector('.bucket-items');
                if (assignedHere.length === 0) {
                    itemsBox.innerHTML = `<span style="font-size:12px; color:#a0aec0;">點擊下方項目放入...</span>`;
                } else {
                    assignedHere.forEach(itemTxt => {
                        const chip = document.createElement('span');
                        chip.className = 'classify-chip assigned';
                        chip.innerText = `${itemTxt} ✖`;
                        chip.onclick = (e) => {
                            e.stopPropagation();
                            delete assignments[itemTxt];
                            renderBoard();
                        };
                        itemsBox.appendChild(chip);
                    });
                }
                bucketsRow.appendChild(bDiv);
            });
            wrap.appendChild(bucketsRow);

            const unassigned = allItems.filter(it => assignments[it] === undefined);
            const poolBox = document.createElement('div');
            poolBox.className = 'classify-pool-box';
            poolBox.innerHTML = `<div style="font-size:12px; font-weight:900; margin-bottom:6px; color:#2b1d0e;">待分類項目（點擊放入「${buckets[activeBucketIdx].name}」）：</div>`;

            if (unassigned.length === 0) {
                poolBox.innerHTML += `<span style="font-size:12px; color:#15803d; font-weight:900;">✅ 全部項目已放入分類籃！請點擊下方按鈕提交。</span>`;
            } else {
                unassigned.forEach(itemTxt => {
                    const chip = document.createElement('button');
                    chip.className = 'classify-chip';
                    chip.style.cssText = 'padding:5px 10px; font-size:13px;';
                    chip.innerText = itemTxt;
                    chip.onclick = () => {
                        assignments[itemTxt] = activeBucketIdx;
                        renderBoard();
                    };
                    poolBox.appendChild(chip);
                });
            }
            wrap.appendChild(poolBox);

            const submitBtn = document.createElement('button');
            submitBtn.className = 'px-btn success';
            submitBtn.style.cssText = 'width:100%; padding:10px; font-size:15px;';
            submitBtn.disabled = unassigned.length > 0;
            submitBtn.innerText = unassigned.length > 0 ? `請先將剩餘 ${unassigned.length} 個項目放入分類籃` : '⚔️ 確認分類結果，發動戰技！';
            submitBtn.onclick = () => {
                let allCorrect = true;
                buckets.forEach((b, bIdx) => {
                    const userItems = allItems.filter(it => assignments[it] === bIdx);
                    if (userItems.length !== b.targetItems.length) allCorrect = false;
                    b.targetItems.forEach(t => { if (!userItems.includes(t)) allCorrect = false; });
                });
                this.handleAnswer(allCorrect ? questionData.answer : '__WRONG_CLASSIFY__');
            };
            wrap.appendChild(submitBtn);
        };

        renderBoard();
        this.qOptions.appendChild(wrap);
    }

    renderInteractiveMultiBlank(questionData, resolvedAns) {
        let targetParts = [];
        if (Array.isArray(questionData.blanks) && questionData.blanks.length > 0) {
            targetParts = questionData.blanks.map(s => String(s).trim());
        } else if (resolvedAns.includes('；') || resolvedAns.includes(';')) {
            targetParts = resolvedAns.split(/[；;]/).map(s => s.trim()).filter(Boolean);
        } else {
            targetParts = resolvedAns.split(/[、,，]/).map(s => s.trim()).filter(Boolean);
        }

        const wordPoolSet = new Set(targetParts);
        if (Array.isArray(questionData.wordPool)) {
            questionData.wordPool.forEach(w => wordPoolSet.add(String(w).trim()));
        }
        (questionData.options || []).forEach(opt => {
            const sep = (String(opt).includes('；') || String(opt).includes(';')) ? /[；;]/ : /[、,，]/;
            String(opt).split(sep).map(s => s.trim()).filter(Boolean).forEach(w => wordPoolSet.add(w));
        });

        const wordPool = Array.from(wordPoolSet).sort(() => Math.random() - 0.5);
        const filledSlots = new Array(targetParts.length).fill(null);
        let activeSlot = 0;

        const wrap = document.createElement('div');
        wrap.className = 'classify-interactive-wrap';

        const renderBlankUI = () => {
            wrap.innerHTML = '';
            const slotsRow = document.createElement('div');
            slotsRow.className = 'fill-blanks-row';
            for (let i = 0; i < targetParts.length; i++) {
                const val = filledSlots[i];
                const slot = document.createElement('div');
                slot.className = `blank-slot ${val ? 'filled' : ''}`;
                if (activeSlot === i && !val) slot.style.borderColor = '#d69e2e';
                slot.innerText = val ? `(${i + 1}) ${val} ✖` : `(${i + 1}) 點擊選詞填入`;
                slot.onclick = () => {
                    filledSlots[i] = null;
                    activeSlot = i;
                    renderBlankUI();
                };
                slotsRow.appendChild(slot);
            }
            wrap.appendChild(slotsRow);

            const poolBox = document.createElement('div');
            poolBox.className = 'classify-pool-box';
            poolBox.innerHTML = `<div style="font-size:12px; font-weight:900; margin-bottom:6px;">詞語庫（請依序點擊詞語填入上方空格）：</div>`;
            wordPool.forEach(word => {
                const btn = document.createElement('button');
                btn.className = 'classify-chip';
                btn.innerText = word;
                btn.onclick = () => {
                    let targetIdx = activeSlot;
                    if (filledSlots[targetIdx] !== null) targetIdx = filledSlots.findIndex(v => v === null);
                    if (targetIdx !== -1) {
                        filledSlots[targetIdx] = word;
                        const nextEmpty = filledSlots.findIndex(v => v === null);
                        if (nextEmpty !== -1) activeSlot = nextEmpty;
                        renderBlankUI();
                    }
                };
                poolBox.appendChild(btn);
            });
            wrap.appendChild(poolBox);

            const allFilled = filledSlots.every(v => v !== null);
            const submitBtn = document.createElement('button');
            submitBtn.className = 'px-btn success';
            submitBtn.style.cssText = 'width:100%; padding:10px; font-size:15px;';
            submitBtn.disabled = !allFilled;
            submitBtn.innerText = allFilled ? '⚔️ 確認看圖填充答案，發動戰技！' : '請先填滿所有看圖空格';
            submitBtn.onclick = () => {
                const isAllMatch = filledSlots.every((val, idx) => val === targetParts[idx]);
                this.handleAnswer(isAllMatch ? questionData.answer : '__WRONG_MULTI_BLANK__');
            };
            wrap.appendChild(submitBtn);
        };

        renderBlankUI();
        this.qOptions.appendChild(wrap);
    }

    renderInteractiveSpelling(questionData, targetWord) {
        const cleanWord = targetWord.trim();
        const allChars = cleanWord.split('');

        const letterIndices = [];
        const letterPool = [];
        allChars.forEach((ch, idx) => {
            if (ch !== ' ' && ch !== '-') {
                letterIndices.push(idx);
                letterPool.push({ ch, id: idx });
            }
        });

        const totalLettersNeeded = letterIndices.length;
        const distractorCount = Math.max(3, Math.min(5, 14 - totalLettersNeeded));
        const alphabet = 'abcdefghijklmnopqrstuvwxyz';

        for (let i = 0; i < distractorCount; i++) {
            const randCh = alphabet[Math.floor(Math.random() * alphabet.length)];
            letterPool.push({ ch: randCh, id: 1000 + i });
        }
        letterPool.sort(() => Math.random() - 0.5);

        let pickedIds = [];
        const wrap = document.createElement('div');
        wrap.className = 'classify-interactive-wrap';

        const renderSpellUI = () => {
            wrap.innerHTML = '';
            const slotsRow = document.createElement('div');
            slotsRow.style.cssText = 'display:flex; justify-content:center; align-items:center; gap:5px; flex-wrap:wrap; margin:6px 0;';

            let letterSlotPtr = 0;
            for (let i = 0; i < allChars.length; i++) {
                const targetCh = allChars[i];
                if (targetCh === ' ') {
                    const spaceDiv = document.createElement('div');
                    spaceDiv.style.cssText = 'width:18px; height:38px; display:inline-block;';
                    slotsRow.appendChild(spaceDiv);
                    continue;
                }
                if (targetCh === '-') {
                    const dashDiv = document.createElement('div');
                    dashDiv.style.cssText = 'width:18px; height:38px; display:flex; align-items:center; justify-content:center; font-size:20px; font-weight:900; color:#5c3a21;';
                    dashDiv.innerText = '-';
                    slotsRow.appendChild(dashDiv);
                    continue;
                }

                const currentPtr = letterSlotPtr;
                const pickedId = pickedIds[currentPtr];
                const letterObj = letterPool.find(l => l.id === pickedId);
                letterSlotPtr++;

                const box = document.createElement('div');
                box.style.cssText = `
                    width:34px; height:38px; border:3px solid ${letterObj ? '#2b6cb0' : '#8c6d48'};
                    background:${letterObj ? '#2b6cb0' : '#fffaf0'}; color:${letterObj ? '#fff' : '#a0aec0'};
                    font-size:18px; font-weight:900; display:flex; align-items:center; justify-content:center;
                    cursor:${letterObj ? 'pointer' : 'default'}; border-radius:4px;
                `;
                box.innerText = letterObj ? letterObj.ch : '_';
                if (letterObj) {
                    box.onclick = () => {
                        pickedIds.splice(currentPtr, 1);
                        renderSpellUI();
                    };
                }
                slotsRow.appendChild(box);
            }
            wrap.appendChild(slotsRow);

            const poolBox = document.createElement('div');
            poolBox.className = 'classify-pool-box';
            poolBox.style.textAlign = 'center';

            letterPool.forEach(lObj => {
                const isUsed = pickedIds.includes(lObj.id);
                const btn = document.createElement('button');
                btn.className = 'classify-chip';
                btn.style.cssText = `width:36px; height:36px; font-size:17px; text-align:center; padding:0; margin:3px; opacity:${isUsed ? '0.22' : '1'};`;
                btn.disabled = isUsed || pickedIds.length >= totalLettersNeeded;
                btn.innerText = lObj.ch;
                btn.onclick = () => {
                    if (pickedIds.length < totalLettersNeeded) {
                        pickedIds.push(lObj.id);
                        renderSpellUI();
                    }
                };
                poolBox.appendChild(btn);
            });

            const backBtn = document.createElement('button');
            backBtn.className = 'px-btn danger';
            backBtn.style.cssText = 'margin-left:8px; padding:5px 10px; font-size:12px;';
            backBtn.innerText = '⌫ 退格';
            backBtn.onclick = () => { pickedIds.pop(); renderSpellUI(); };
            poolBox.appendChild(backBtn);

            wrap.appendChild(poolBox);

            let ptr = 0;
            const builtChars = allChars.map(ch => {
                if (ch === ' ' || ch === '-') return ch;
                const pid = pickedIds[ptr++];
                return letterPool.find(l => l.id === pid)?.ch || '';
            });
            const userWord = builtChars.join('');

            const isFull = pickedIds.length === totalLettersNeeded;
            const submitBtn = document.createElement('button');
            submitBtn.className = 'px-btn success';
            submitBtn.style.cssText = 'width:100%; padding:10px; font-size:15px;';
            submitBtn.disabled = !isFull;
            submitBtn.innerText = isFull
                ? `⚔️ 確認拼字【${userWord}】，發動戰技！`
                : `請點擊字母拼出完整生字 (${pickedIds.length}/${totalLettersNeeded})`;
            submitBtn.onclick = () => {
                const ok = userWord.toLowerCase() === cleanWord.toLowerCase();
                this.handleAnswer(ok ? questionData.answer : '__WRONG_SPELL__');
            };
            wrap.appendChild(submitBtn);
        };

        renderSpellUI();
        this.qOptions.appendChild(wrap);
    }

    handleAnswer(selectedOption) {
        this.clearQuizTimer();
        this.isAnimating = true;
        this.optionButtons.forEach(b => b.disabled = true);
        if (this.quizModal) this.quizModal.style.display = 'none';

        const resolvedAns = this.resolveTargetAnswerString(this.currentQuestion);
        const isCorrect = (selectedOption === this.currentQuestion.answer) || (String(selectedOption).replace(/｜/g, '|') === resolvedAns);

        // 🌟 套用試煉之塔賜福卡效果 (破軍之刃 / 鮮血渴求 / 連鎖雷霆)
        const p = this.currentState?.player;
        const enemies = this.currentState?.enemies || [];
        if (isCorrect && this.towerState.active && p) {
            if (this.towerState.buffs.has('vamp_heal')) {
                const vamp = Math.round(p.maxHp * 0.18);
                p.hp = Math.min(p.maxHp, p.hp + vamp);
            }
            if (this.towerState.buffs.has('chain_bolt')) {
                enemies.forEach((e, idx) => {
                    if (e.hp > 0) {
                        e.hp = Math.max(0, e.hp - 90);
                        this.spawnFloatingText(`enemy-float-${idx}`, `-90 ⚡雷霆`, 'crit');
                    }
                });
            }
            if (this.towerState.buffs.has('atk_up')) {
                const target = enemies[this.currentState.selectedTargetIndex];
                if (target && target.hp > 0) {
                    const extra = Math.round((p.calcAtk ? p.calcAtk() : 80) * 0.35);
                    target.hp = Math.max(0, target.hp - extra);
                }
            }
        }

        // 處理敵方元素護盾吸收傷害邏輯
        if (isCorrect) {
            const target = enemies[this.currentState?.selectedTargetIndex || 0];
            if (target && (target.shieldHp || 0) > 0) {
                const isHeavySkill = this.currentState?.selectedSkill && this.currentState.selectedSkill !== 'slash';
                if (isHeavySkill) {
                    target.shieldHp = 0;
                    eventBus.emit('SHOW_TOAST', `💥 強力的進階戰技直接擊碎了【${target.name}】的元素護盾！`);
                } else {
                    target.shieldHp = Math.max(0, target.shieldHp - 60);
                    target.hp = Math.min(target.maxHp, target.hp + 35);
                    eventBus.emit('SHOW_TOAST', `🛡️【${target.name}】的護盾吸收了部分普攻傷害！（使用進階戰技或火藥彈可破盾）`);
                }
            }
        }

        eventBus.emit('COMBAT_TURN_RESOLVE', {
            isCorrect,
            correctAnswer: resolvedAns || this.currentQuestion.answer,
            questionObj: this.currentQuestion
        });
    }

    playPlayerAttack(attackData, callback) {
        const step1 = Math.floor(140 / this.speedMultiplier);
        const step2 = Math.floor(680 / this.speedMultiplier);
        if (this.playerUnit) this.playerUnit.classList.add('anim-lunge-right');

        setTimeout(() => {
            if (this.combatFx) this.combatFx.innerHTML = getPixelIconHtml(attackData.fxSprite || 'sword', 46);

            attackData.hits.forEach(hit => {
                const card = document.getElementById(`enemy-card-${hit.index}`);
                if (card) card.classList.add('anim-hurt');
                this.spawnFloatingText(`enemy-float-${hit.index}`, `-${hit.dmg}`, hit.isCrit ? 'crit' : '');
            });

            if (attackData.healAmount > 0) {
                this.spawnFloatingText('player-float-Bucket', `+${attackData.healAmount} HP`, 'heal');
            }
        }, step1);

        setTimeout(() => {
            if (this.combatFx) this.combatFx.innerHTML = '';
            if (this.playerUnit) this.playerUnit.classList.remove('anim-lunge-right');
            document.querySelectorAll('.arena-enemy-card').forEach(c => c.classList.remove('anim-hurt'));
            this.isAnimating = false;
            if (callback) callback();
        }, step2);
    }

    // 🌟 進階改造 B-4：敵方反擊時，Boss / 精英怪有機率施放「沉默禁魔、極寒冰封、深淵劇毒」異常狀態！
    playEnemiesCounter(counterData, callback) {
        const step1 = Math.floor(150 / this.speedMultiplier);
        const step2 = Math.floor(740 / this.speedMultiplier);
        eventBus.emit('SHOW_TOAST', `詠唱失敗！正解：【${counterData.ans}】`);

        counterData.attackers.forEach(idx => {
            const card = document.getElementById(`enemy-card-${idx}`);
            if (card) card.classList.add('anim-lunge-left');
        });

        // 檢查是否有 Boss 或試煉之塔高層魔物施放異常狀態
        const p = this.currentState?.player;
        const enemies = this.currentState?.enemies || [];
        const activeBoss = enemies.find(e => e.hp > 0 && (e.isBoss || e.maxHp >= 260 || this.towerState.active));

        if (activeBoss && p) {
            if (!Array.isArray(p.statuses)) p.statuses = [];
            const roll = Math.random();
            if (roll < 0.35 && !p.statuses.some(s => s.statusId === 'DEBUFF_SILENCE_SEAL')) {
                p.statuses.push({ statusId: 'DEBUFF_SILENCE_SEAL', name: '沉默禁魔', icon: '🔇', category: 'cc', turnsLeft: 2, stacks: 1 });
                eventBus.emit('SHOW_TOAST', `🔇【${activeBoss.name}】施放了「沉默禁魔」！進階技能被封印（飲用治療藥水可淨化）！`);
            } else if (roll < 0.70 && !p.statuses.some(s => s.statusId === 'DEBUFF_CHILL')) {
                p.statuses.push({ statusId: 'DEBUFF_CHILL', name: '極寒冰封', icon: '❄️', category: 'debuff', turnsLeft: 2, stacks: 1 });
                eventBus.emit('SHOW_TOAST', `❄️【${activeBoss.name}】施放了「極寒冰封」！下一題詠唱時間縮短 5 秒！`);
            } else if (!p.statuses.some(s => s.statusId === 'DOT_POISON')) {
                p.statuses.push({ statusId: 'DOT_POISON', name: '深淵劇毒', icon: '☠️', category: 'dot', turnsLeft: 3, stacks: 1 });
                const poisonDmg = Math.max(10, Math.round(p.maxHp * 0.06));
                p.hp = Math.max(1, p.hp - poisonDmg);
                eventBus.emit('SHOW_TOAST', `☠️【${activeBoss.name}】附加了「深淵劇毒」（-${poisonDmg} HP，飲用藥水可解毒）！`);
            }
        }

        setTimeout(() => {
            if (this.combatFx) this.combatFx.innerText = 'BAM!';
            if (this.playerUnit) this.playerUnit.classList.add('anim-hurt');
            this.spawnFloatingText('player-float-Bucket', `-${counterData.totalDmg}`, 'crit');
            if (counterData.thornsDmg > 0 && counterData.attackers.length > 0) {
                this.spawnFloatingText(`enemy-float-${counterData.attackers[0]}`, `-${counterData.thornsDmg} 反傷`, '');
            }
        }, step1);

        setTimeout(() => {
            if (this.combatFx) this.combatFx.innerText = '';
            document.querySelectorAll('.arena-enemy-card').forEach(c => c.classList.remove('anim-lunge-left'));
            if (this.playerUnit) this.playerUnit.classList.remove('anim-hurt');
            this.isAnimating = false;
            if (callback) callback();
        }, step2);
    }

    spawnFloatingText(containerId, text, extraClass = '') {
        const container = document.getElementById(containerId);
        if (!container) return;
        const el = document.createElement('div');
        el.className = `floating-dmg ${extraClass}`;
        el.innerText = text;
        container.appendChild(el);
        setTimeout(() => el.remove(), 800);
    }

    hide() {
        this.clearQuizTimer();
        if (this.layer) this.layer.style.display = 'none';
        if (this.quizModal) this.quizModal.style.display = 'none';
        if (this.hud) this.hud.style.display = 'flex';

        // 🌟 檢查是否剛打贏「知識試煉之塔」的某一層（全場敵人 HP <= 0 且玩家存活）
        const allEnemiesDead = Array.isArray(this.currentState?.enemies) &&
                               this.currentState.enemies.length > 0 &&
                               this.currentState.enemies.every(e => e.hp <= 0);
        const playerAlive = (this.currentState?.player?.hp || 0) > 0;

        this.currentQuestion = null;
        this.optionButtons = [];
        this.isAnimating = false;

        const uiLayer = document.getElementById('ui-layer');
        if (uiLayer) uiLayer.style.display = 'none';
        if (document.activeElement && typeof document.activeElement.blur === 'function') {
            document.activeElement.blur();
        }
        const canvas = document.getElementById('gameCanvas');
        if (canvas) canvas.focus();

        if (this.towerState.active) {
            if (allEnemiesDead && playerAlive) {
                if (this.towerState.floor < this.towerState.maxFloor) {
                    setTimeout(() => this.showTowerBuffSelectionModal(), 260);
                } else {
                    // 成功登頂第 5 層！頒發終極大獎！
                    const p = this.currentState?.player;
                    this.towerState.active = false;
                    this.towerState.buffs.clear();
                    if (p) {
                        p.addItem('truth_fragment', 5);
                        p.addItem('CON_ELIXIR_T4', 1);
                        p.gold = (p.gold || 0) + 1200;
                        eventBus.emit('HUD_UPDATE');
                        eventBus.emit('SAVE_GAME');
                    }
                    setTimeout(() => {
                        const dialogLayer = document.getElementById('pixel-dialog-layer');
                        const titleEl = document.getElementById('pixel-dialog-title');
                        const textEl = document.getElementById('pixel-dialog-text');
                        if (dialogLayer && titleEl && textEl) {
                            titleEl.innerHTML = '🏆 恭喜制霸【知識試煉之塔】全 5 層！';
                            textEl.innerText = '你成功突破了五層試煉與守門領主的考驗！\n\n🎁 登頂大獎已發放至背包：\n• 💎 真理碎片 x5\n• 💰 1,200 金幣\n• 🧪 九轉還魂丹 x1';
                            dialogLayer.style.display = 'flex';
                        }
                    }, 300);
                }
            } else if (!playerAlive) {
                this.towerState.active = false;
                this.towerState.buffs.clear();
            }
        }
    }

    updateItemCounts(inventory) {
        const magCount = inventory['magnifier'] || 0;
        const bombCount = inventory['fire_bomb'] || 0;
        const healCount = (inventory['CON_ELIXIR_T4'] || 0) + (inventory['CON_POTION_T1'] || 0) + (inventory['health_potion'] || 0) + (inventory['cooked_fish'] || 0) + (inventory['fish'] || 0);

        const cHeal = document.getElementById('count-item-heal');
        const c1 = document.getElementById('count-item-1');
        const c3 = document.getElementById('count-item-3');
        const btn1 = document.getElementById('btn-item-1');
        const btn3 = document.getElementById('btn-item-3');
        const btnHeal = document.getElementById('btn-item-heal');

        if (cHeal) cHeal.innerText = `x${healCount}`;
        if (c1) c1.innerText = `x${magCount}`;
        if (c3) c3.innerText = `x${bombCount}`;
        if (btnHeal) btnHeal.disabled = healCount <= 0;
        if (btn1) btn1.disabled = magCount <= 0;
        if (btn3) btn3.disabled = bombCount <= 0;
    }

    useMagnifier() {
        if (!this.currentQuestion || this.optionButtons.length <= 2) return false;
        if (this.quizModal && this.quizModal.style.display === 'none') {
            this.openQuizModal();
        }
        let wrongButtons = this.optionButtons.filter(b => b.dataset.val !== this.currentQuestion.answer && !b.classList.contains('hidden-ans'));
        if (wrongButtons.length >= 2) {
            wrongButtons.sort(() => Math.random() - 0.5);
            wrongButtons[0].classList.add('hidden-ans');
            wrongButtons[1].classList.add('hidden-ans');
            return true;
        }
        return false;
    }
}