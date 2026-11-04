// src/view/CombatUI.js
// 🌟 完整終極版：
// 1. 100% 對齊 index.html 真實 DOM ID (#enemies-chessboard, #arena-scenery-layer, #combat-skills-bar, #q-text 等)
// 2. 分類題透過 enrichAnyClassifyQuestion 自動補全完整文字，絕不出現無說明的純 A, B, C, D
// 3. 英文串字題自動留空「空白格」與「連字號」，玩家只需點擊純英文字母
// 4. 填充題完整保留題目原句，點選詞卡時即時嵌入句子空格預覽

import { eventBus } from '../core/EventBus.js';
import { Base64Strings, getPixelIconHtml } from '../data/assets.js';
import { enrichAnyClassifyQuestion } from '../systems/QuestionSystem.js';

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

        this.injectArenaDecorAndHero();
        this.injectSkillIcons();
        this.bindEvents();
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
                eventBus.emit('SELECT_COMBAT_SKILL', skillId);
                this.openQuizModal();
            });
        });

        const closeBtn = document.getElementById('btn-quiz-close');
        if (closeBtn) {
            closeBtn.onclick = (e) => {
                e.preventDefault();
                if (this.isAnimating) return;
                if (this.quizModal) this.quizModal.style.display = 'none';
            };
        }

        const ttsBtn = document.getElementById('btn-tts-read');
        if (ttsBtn) {
            ttsBtn.onclick = (e) => {
                e.preventDefault();
                if (this.currentQuestion) {
                    const q = this.currentQuestion;
                    if (q.qType === '英文串字') {
                        this.speakText(q.answer, 'eng');
                    } else {
                        const txt = q.question || q.prompt || '';
                        this.speakText(txt, q.subject);
                    }
                }
            };
        }

        const escBtn = document.getElementById('btn-combat-escape');
        if (escBtn) {
            escBtn.onclick = (e) => {
                e.preventDefault();
                if (this.isAnimating) return;
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
    }

    getEnemySprite(enemy) {
        if (enemy.isBoss) return Base64Strings.boss;
        if (enemy.isGoblin || enemy.sprite === 'skeleton') return Base64Strings.skeleton;
        if (enemy.element === 'FIRE' || enemy.sprite === 'fire_monster') return Base64Strings.fire_monster;
        if (enemy.element === 'WATER' || enemy.sprite === 'ice_monster') return Base64Strings.ice_monster;
        return Base64Strings[enemy.sprite] || Base64Strings.witch;
    }

    renderEnemies(state) {
        if (!this.chessboard) return;
        this.chessboard.innerHTML = '';

        state.enemies.forEach((enemy, idx) => {
            const isTargeted = (idx === state.selectedTargetIndex) && enemy.hp > 0;
            const isDead = enemy.hp <= 0;
            const hpPercent = Math.max(0, (enemy.hp / enemy.maxHp) * 100);
            const statusHtml = this.renderStatusBadgesHtml(enemy.statuses || []);

            const card = document.createElement('div');
            card.id = `enemy-card-${idx}`;
            card.className = `arena-enemy-card ${isTargeted ? 'targeted' : ''} ${isDead ? 'dead' : ''}`;
            card.innerHTML = `
                <div id="enemy-float-${idx}" class="dmg-container"></div>
                <div style="display:flex; gap:2px; min-height:16px; justify-content:center;">${statusHtml}</div>
                <div class="arena-lock-label">${isTargeted ? '▼ 目標' : '&nbsp;'}</div>
                <div class="arena-unit-name">${enemy.name}</div>
                <img class="arena-enemy-sprite" src="${this.getEnemySprite(enemy)}" alt="" />
                <div class="arena-hp-bar">
                    <div class="arena-hp-fill" style="width:${hpPercent}%;"></div>
                    <span class="arena-hp-text">${enemy.hp}</span>
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
        if (this.chapterTitle && state.chapterName) this.chapterTitle.innerText = `⏳ ${state.chapterName}`;

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

        // 1. 分類題 (完整顯示「A. 勤換衛生巾」與「1. 輸精管」文字字卡)
        if (isClassify) {
            this.renderInteractiveClassification(questionData, resolvedAns);
            return;
        }

        // 2. 看圖填充題
        if (qType === '看圖填充題' || questionData.interactiveType === 'fill_blanks') {
            this.renderInteractiveMultiBlank(questionData, resolvedAns);
            return;
        }

        // 3. 英文串字 (自動預設空白格與連字號)
        if (qType === '英文串字' && /^[A-Za-z\s-]{3,28}$/.test(resolvedAns.trim())) {
            this.renderInteractiveSpelling(questionData, resolvedAns.trim());
            return;
        }

        // 4. 填充題 (完整保留題目原句，並將空格轉為可預覽黃色填空槽)
        if (['填充題', '中文填充題', '英文填充題', '填空題'].includes(qType)) {
            this.renderInteractiveSingleBlank(questionData, resolvedAns);
            return;
        }

        // 5. 簡答題 / 情境題 / 選擇題 / 字詞解釋
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
                    if (fillTxt) {
                        return `<span class="blank-slot filled" style="margin:0 4px;">${fillTxt}</span>`;
                    }
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
        // 先通過萬能補全器確保 categories 與 items 齊全（連舊存檔錯題也能自動恢復項目文字！）
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
            // 若是配對題 (如 1配B｜2配C)，完整顯示題幹內的所有行數 (絕不截斷第二行項目說明！)
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
                    if (filledSlots[targetIdx] !== null) {
                        targetIdx = filledSlots.findIndex(v => v === null);
                    }
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

    // 🌟 英文串字預設留空「空白格」與「連字號」，玩家只需點擊純英文字母
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
                    box.title = '點擊退回此字母';
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
        this.isAnimating = true;
        this.optionButtons.forEach(b => b.disabled = true);
        if (this.quizModal) this.quizModal.style.display = 'none';

        const resolvedAns = this.resolveTargetAnswerString(this.currentQuestion);
        const isCorrect = (selectedOption === this.currentQuestion.answer) || (String(selectedOption).replace(/｜/g, '|') === resolvedAns);

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

    playEnemiesCounter(counterData, callback) {
        const step1 = Math.floor(150 / this.speedMultiplier);
        const step2 = Math.floor(740 / this.speedMultiplier);
        eventBus.emit('SHOW_TOAST', `詠唱失敗！正解：【${counterData.ans}】`);

        counterData.attackers.forEach(idx => {
            const card = document.getElementById(`enemy-card-${idx}`);
            if (card) card.classList.add('anim-lunge-left');
        });

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
        if (this.layer) this.layer.style.display = 'none';
        if (this.quizModal) this.quizModal.style.display = 'none';
        if (this.hud) this.hud.style.display = 'flex';
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