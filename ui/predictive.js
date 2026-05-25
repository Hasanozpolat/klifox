App.UI.Predictive = {
    render() {
        const target = document.getElementById('predictive-render-target');
        if (!target) return;

        const pred = App.Engine.Predictive.state;
        
        let stratHtml = '';
        if (pred.strategies.length === 0) stratHtml = '<div style="color:#666; font-size:12px;">Sistem stabil, müdahale öngörüsü yok.</div>';
        pred.strategies.forEach(s => {
            const isCrit = s.includes('KRİTİK') ? 'var(--danger)' : 'var(--accent)';
            stratHtml += `
            <div style="background:rgba(255,255,255,0.03); padding:12px; border-radius:8px; border-left:3px solid ${isCrit}; font-size:12px; margin-bottom:8px; line-height:1.5;">
                ${s}
            </div>`;
        });

        let riskHtml = '';
        const sortedRisk = Object.entries(pred.riskMatrix).sort((a,b) => b[1] - a[1]);
        sortedRisk.forEach(r => {
            const rName = r[0]; const riskV = r[1];
            const rColor = riskV > 75 ? 'var(--danger)' : (riskV > 50 ? 'var(--warning)' : 'var(--success)');
            riskHtml += `
            <div style="margin-bottom:12px;">
                <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px;">
                    <span style="color:#fff;">${rName} Havzası</span>
                    <span style="color:${rColor}; font-weight:700;">Risk: %${riskV}</span>
                </div>
                <div style="width:100%; height:6px; background:rgba(255,255,255,0.1); border-radius:4px; overflow:hidden;">
                    <div style="width:${riskV}%; height:100%; background:${rColor}; transition: width 0.5s;"></div>
                </div>
            </div>`;
        });

        // Generate 7-Day Chart representation using CSS heights
        let chartHtml = '<div style="display:flex; align-items:flex-end; gap:8px; height:150px; margin-top:20px; padding-top:20px; border-top:1px solid rgba(255,255,255,0.1);">';
        const maxProj = Math.max(...pred.projection7D, 1);
        pred.projection7D.forEach((p, idx) => {
            const pHeight = Math.floor((p / maxProj) * 100);
            chartHtml += `
            <div style="flex:1; display:flex; flex-direction:column; align-items:center; gap:5px;">
                <div style="color:var(--text-muted); font-size:10px;">G+${idx+1}</div>
                <div style="width:100%; height:100px; background:rgba(255,255,255,0.05); border-radius:4px 4px 0 0; position:relative; display:flex; align-items:flex-end;">
                    <div style="width:100%; height:${pHeight}%; background:rgba(168, 85, 247, 0.4); border-top:2px solid #c084fc; border-radius:4px 4px 0 0; transition: height 0.5s;"></div>
                </div>
                <div style="color:#fff; font-size:9px; font-weight:600;">${(p/1000).toFixed(1)}k ₺</div>
            </div>`;
        });
        chartHtml += '</div>';

        let evoHtml = '';
        pred.evolutionLogs.forEach(l => {
            evoHtml += `<div style="font-family:var(--font-mono); font-size:10px; color:#c084fc; margin-bottom:8px; padding-bottom:8px; border-bottom:1px dashed rgba(255,255,255,0.05);">> ${l}</div>`;
        });

        const html = `
        <div class="ent-header" style="margin-bottom: 24px;">
            <h2><i class="fas fa-brain" style="color:#c084fc;"></i> Otonom Evrim & Öngörü Ağı (Predictive AI)</h2>
            <p style="color:#aaa; font-size:13px; margin-top:5px;">Ağ öğrenme modeli tarafından üretilen kriz engelleme sinyalleri ve projeksiyonlar.</p>
        </div>

        <div class="ent-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
            
            <div class="arch-layer" style="grid-column: span 1; height: 420px;">
                <h3 style="font-size:14px; margin-bottom:15px; color:#fff;"><i class="fas fa-lightbulb text-accent"></i> Otonom Karar Sinyalleri</h3>
                <div style="overflow-y:auto; max-height:85%;">
                    ${stratHtml}
                </div>
            </div>

            <div class="arch-layer" style="grid-column: span 1; height: 420px;">
                <h3 style="font-size:14px; margin-bottom:15px; color:#fff;"><i class="fas fa-chart-area text-warning"></i> 7-Günlük Trend & Demand Projeksiyonu</h3>
                <p style="font-size:11px; color:#aaa; line-height:1.4;">Yapay zeka algoritması, viral büyüme parametrelerini işleyerek önümüzdeki haftanın ekonomik likiditesini öngörüyor.</p>
                ${chartHtml}
            </div>

            <div class="arch-layer" style="grid-column: span 1; height: 420px; display:flex; flex-direction:column; gap:20px;">
                <div>
                   <h3 style="font-size:14px; margin-bottom:15px; color:#fff;"><i class="fas fa-shield-alt text-danger"></i> Bölgesel Kriz Haritası (Overload)</h3>
                   ${riskHtml}
                </div>
                <div style="flex:1; background:rgba(0,0,0,0.3); border-radius:8px; padding:12px; overflow-y:hidden;">
                   <h3 style="font-size:12px; margin-bottom:10px; color:#fff;">AI Davranış Şeffaflığı (Evolution Logic)</h3>
                   ${evoHtml}
                </div>
            </div>

        </div>
        `;
        target.innerHTML = html;
        App.UI.DevPanel.log("[ÖNGÖRÜ] Yapay zeka projeksiyon ağırlıkları güncellendi.", "info");
    }
};
