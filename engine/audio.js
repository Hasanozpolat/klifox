App.Engine.Audio = {
    ctx: null,
    init() { if(!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)(); if(this.ctx.state === 'suspended') this.ctx.resume(); },
    play(type) {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain); gain.connect(this.ctx.destination);
        switch(type) {
            case 'send':
                osc.frequency.setValueAtTime(400, this.ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.1);
                gain.gain.setValueAtTime(0.05, this.ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
                osc.start(); osc.stop(this.ctx.currentTime + 0.1); break;
            case 'receive':
                osc.frequency.setValueAtTime(600, this.ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.15);
                gain.gain.setValueAtTime(0.05, this.ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
                osc.start(); osc.stop(this.ctx.currentTime + 0.15); break;
            case 'connected':
                osc.type = 'triangle'; osc.frequency.setValueAtTime(500, this.ctx.currentTime);
                osc.frequency.setValueAtTime(750, this.ctx.currentTime + 0.1); osc.frequency.setValueAtTime(1000, this.ctx.currentTime + 0.2);
                gain.gain.setValueAtTime(0.05, this.ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
                osc.start(); osc.stop(this.ctx.currentTime + 0.5); break;
            case 'notification':
                osc.type = 'sine'; osc.frequency.setValueAtTime(800, this.ctx.currentTime); osc.frequency.setValueAtTime(1200, this.ctx.currentTime + 0.1);
                gain.gain.setValueAtTime(0.08, this.ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
                osc.start(); osc.stop(this.ctx.currentTime + 0.3); break;
        }
    }
};
