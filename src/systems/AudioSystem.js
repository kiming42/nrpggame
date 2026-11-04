// src/systems/AudioSystem.js
export class AudioSystem {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.bgmEnabled = true;
        this.currentBgmMode = null;
        this.bgmTimer = null;
        this.noteIndex = 0;

        this.MELODIES = {
            EXPLORATION: [261.6, 329.6, 392.0, 523.2, 392.0, 329.6, 293.7, 349.2, 440.0, 349.2, 293.7, 261.6],
            COMBAT: [220.0, 220.0, 261.6, 293.7, 329.6, 293.7, 261.6, 196.0, 220.0, 261.6, 246.9, 196.0]
        };
    }
    
    resume() {
        if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    }

    toggleBgm() {
        this.bgmEnabled = !this.bgmEnabled;
        if (!this.bgmEnabled && this.bgmTimer) {
            clearInterval(this.bgmTimer);
            this.bgmTimer = null;
        } else if (this.bgmEnabled && this.currentBgmMode) {
            const mode = this.currentBgmMode;
            this.currentBgmMode = null;
            this.startBgm(mode);
        }
        return this.bgmEnabled;
    }

    startBgm(mode) {
        if (this.currentBgmMode === mode && this.bgmTimer) return;
        this.currentBgmMode = mode;
        if (this.bgmTimer) { clearInterval(this.bgmTimer); this.bgmTimer = null; }
        if (!this.bgmEnabled) return;

        this.noteIndex = 0;
        const notes = this.MELODIES[mode] || this.MELODIES.EXPLORATION;
        const tempo = mode === 'COMBAT' ? 190 : 340;

        this.bgmTimer = setInterval(() => {
            if (!this.bgmEnabled || !this.ctx || this.ctx.state !== 'running') return;
            const freq = notes[this.noteIndex % notes.length];
            this.playTone(freq, mode === 'COMBAT' ? 'square' : 'triangle', (tempo / 1000) * 0.75, 0.025);
            this.noteIndex++;
        }, tempo);
    }

    playTone(freq, type, duration, vol = 0.1) {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.005, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    playCollect() { this.playTone(587.3, 'square', 0.08, 0.12); setTimeout(() => this.playTone(880, 'square', 0.12, 0.12), 80); }
    playBump() { this.playTone(130, 'square', 0.08, 0.08); }
    playWin() { this.playTone(440, 'square', 0.09, 0.12); setTimeout(() => this.playTone(659.2, 'square', 0.18, 0.15), 90); }
    playLevelUp() {
        [523.2, 659.2, 783.9, 1046.5].forEach((f, idx) => {
            setTimeout(() => this.playTone(f, 'square', 0.14, 0.15), idx * 90);
        });
    }
    playHit() { this.playTone(110, 'sawtooth', 0.25, 0.18); }
    playPortal() { this.playTone(330, 'sine', 0.4, 0.15); }
}