App.UI.AiTracker = {
    metrics: { tokens: 0, fallbackCount: 0, avgLatency: "0ms", activeStreams: 0 },
    logs: [],
    inited: false,

    render() {
        if (!this.inited) {
            if (App.Adapters.EventBus) {
                 App.Adapters.EventBus.on('ai.stream.started', () => { this.metrics.activeStreams++; this.addLog('OpenAI Stream Başlatıldı'); this.render(); });
                 App.Adapters.EventBus.on('ai.stream.end', ({ usage }) => { this.metrics.activeStreams--; this.metrics.tokens += (usage?.total || 0); this.addLog(`AI Yanıtı Tamamlandı (${usage?.total || 0} Token)`); this.render(); });
                 App.Adapters.EventBus.on('ai.stream.fallback', ({ reason }) => { this.metrics.activeStreams=0; this.metrics.fallbackCount++; this.addLog(`[HATA] ${reason} -> Simülasyona Fallback Tetiklendi`, true); this.render(); });
                 App.Adapters.EventBus.on('ai.orchestrator.log', (text) => { this.addLog(text); this.render(); });
            }
            this.inited = true;
        }

        const target = document.getElementById('ai-tracker-render-target');
        if(!target) return;

        let html = `
            <div class="enterprise-header" style="margin-bottom:20px; border-bottom: 1px solid rgba(236, 72, 153, 0.2); padding-bottom: 10px;">
                <h2 style="color: #ec4899;"><i class="fas fa-microchip"></i> AI Orchestration Hub</h2>
                <p style="color: #94a3b8; font-size: 0.9rem;">Multi-Provider LLM & Realtime Streaming Performance Dashboard</p>
            </div>
            
            <div style="display:flex; gap:20px; margin-bottom: 20px; flex-wrap:wrap;">
                
                <!-- METRICS -->
                <div style="flex:1; background:rgba(236, 72, 153, 0.05); border:1px solid rgba(236, 72, 153, 0.3); border-radius:8px; padding:15px; display:grid; grid-template-columns: 1fr 1fr; gap:15px; min-width:250px;">
                    <div><span style="color:#a1a1aa; font-size:0.8rem;">İşlenen Token</span><br><strong style="color:#ec4899; font-size:1.3rem;">${this.metrics.tokens}</strong></div>
                    <div><span style="color:#a1a1aa; font-size:0.8rem;">Aktif Akış (Stream)</span><br><strong style="color:#ec4899; font-size:1.3rem;">${this.metrics.activeStreams}</strong> <i class="fas fa-spinner ${this.metrics.activeStreams > 0 ? 'fa-spin' : ''}" style="color:#f472b6;"></i></div>
                    <div><span style="color:#a1a1aa; font-size:0.8rem;">Hata / Fallback Oranı</span><br><strong style="color:#ec4899; font-size:1.3rem;">${this.metrics.fallbackCount}</strong></div>
                    <div><span style="color:#a1a1aa; font-size:0.8rem;">Model Sağlayıcısı</span><br><strong style="color:#ec4899; font-size:0.9rem;">${App.Config.SIMULATION_MODE ? 'LOCAL_RULE_ENGINE' : 'OPENAI_GPT4_MINI'}</strong></div>
                </div>

                <!-- LOGS -->
                <div style="flex:2; background:rgba(0,0,0,0.3); border:1px solid #1e293b; border-radius:8px; padding:15px; min-width:400px; max-height:220px; overflow-y:auto; font-family:'JetBrains Mono', monospace;">
                    <h3 style="color:#f472b6; font-size:0.9rem; margin-bottom:10px;"><i class="fas fa-terminal"></i> AI Routing Logs</h3>
                    <ul style="list-style:none; padding:0; margin:0;">
        `;

        this.logs.slice(-8).forEach(l => {
            html += `<li style="font-size:0.75rem; color:${l.err ? '#ef4444' : '#cbd5e1'}; margin-bottom:5px; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:5px;">
                <span style="color:#64748b;">[${new Date(l.time).toLocaleTimeString()}]</span> ${l.text}
            </li>`;
        });

        html += `</ul></div></div>`;
        target.innerHTML = html;
    },

    addLog(text, err=false) {
        this.logs.push({ text, err, time: Date.now() });
    }
};
