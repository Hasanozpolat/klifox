App.UI.Enterprise = {
    render() {
        const entDiv = document.getElementById('ent-render-target');
        if (!entDiv) return;

        const s = App.Simulation.state;
        const ai = App.Adapters && App.Adapters.AI ? App.Adapters.AI.usageStats : { total: 0 };
        const p = App.State.data.userProfile || {};

        let ticketsHtml = '';
        s.tickets.forEach(t => {
            const sevColor = t.severity === 'Kritik' ? 'var(--danger)' : (t.severity === 'Yüksek' ? 'var(--warning)' : 'var(--accent)');
            ticketsHtml += `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:12px; background:rgba(255,255,255,0.03); border-radius:8px; margin-bottom:8px; border-left: 3px solid ${sevColor}; animation: fadeSlideIn 0.3s ease;">
                <div>
                    <strong style="color:#fff; font-size:13px;">${t.id} - ${t.issue}</strong>
                    <div style="font-size:11px; color:#aaa; margin-top:4px;"><i class="fas fa-map-marker-alt"></i> ${t.region} | Açık</div>
                </div>
                <div><span style="font-size:11px; font-weight:600; padding:4px 8px; border-radius:12px; background:rgba(255,255,255,0.1); color:${sevColor}">${t.severity}</span></div>
            </div>`;
        });
        if(s.tickets.length === 0) ticketsHtml = `<div style="text-align:center; color:#666; font-size:12px; padding:20px;">0 Açık Bilet</div>`;

        let healthHtml = `
            <div class="o-metric" style="padding:12px;"><span><i class="fas fa-network-wired text-success"></i> API Gecikme</span><strong style="font-size:18px;">${s.health.apiLatency} ms</strong></div>
            <div class="o-metric" style="padding:12px;"><span><i class="fas fa-microchip text-accent"></i> CPU Yükü</span><strong style="font-size:18px;">%${s.health.cpuLoad}</strong></div>
            <div class="o-metric" style="padding:12px;"><span><i class="fas fa-exclamation-triangle text-warning"></i> Hata Oranı</span><strong style="font-size:18px;">%${s.health.errorRate}</strong></div>
            <div class="o-metric" style="padding:12px;"><span><i class="fas fa-bolt text-warning"></i> WS Ping</span><strong style="font-size:18px;">${s.health.wsPing} ms</strong></div>
        `;

        const html = `
        <div class="ent-header" style="display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 20px; margin-bottom: 24px;">
            <h2><i class="fas fa-chart-line text-accent"></i> Kurumsal Operasyon Paneli</h2>
            <div style="display:flex; gap:12px; align-items:center;">
                <span class="trust-badge" style="border:1px solid rgba(239, 68, 68, 0.3); color:var(--danger); background:rgba(239, 68, 68, 0.1); font-size:12px;"><i class="fas fa-lock"></i> ${p.designation || 'Yönetici'} Aktif</span>
            </div>
        </div>

        <div class="ent-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
            
            <!-- Financial Block -->
            <div class="arch-layer" style="grid-column: span 3; display:grid; grid-template-columns: repeat(4, 1fr); gap:15px; background:linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(0,0,0,0.5) 100%);">
                <div class="o-metric" style="border:none; background:transparent;"><span>Toplam İşlem Hacmi (Günlük)</span><strong style="color:var(--success); font-size:28px;">${new Intl.NumberFormat('tr-TR').format(s.dailyVolume)} ₺</strong></div>
                <div class="o-metric" style="border:none; background:transparent;"><span>Üretilen Cüzdan Kredisi</span><strong style="color:#fff; font-size:28px;">${new Intl.NumberFormat('tr-TR').format(s.generatedCredits)} ₺</strong></div>
                <div class="o-metric" style="border:none; background:transparent;"><span>Aktarım Marjı</span><strong style="color:var(--text-muted); font-size:28px;">%15 Net</strong></div>
                <div class="o-metric" style="border:none; background:transparent;"><span>Ağ Büyümesi</span><strong style="color:var(--accent); font-size:28px;">+ %34</strong></div>
            </div>

            <!-- Internal Tickets & Live Transactions -->
            <div class="arch-layer" style="grid-column: span 1; height: 350px; overflow-y:auto;">
                <h3 style="font-size:14px; margin-bottom:15px; color:#fff;"><i class="fas fa-headset text-warning"></i> Canlı İşlem ve İtirazlar</h3>
                
                <div style="display:flex; justify-content:space-between; align-items:center; padding:12px; background:rgba(255,255,255,0.03); border-radius:8px; margin-bottom:8px; border-left: 3px solid var(--accent)">
                    <div>
                        <strong style="color:#fff; font-size:13px;">TRX-ONGOING - Güncel İşlem</strong>
                        <div style="font-size:11px; color:#aaa; margin-top:4px;">Durum: <span style="color:var(--accent); font-weight:bold;">${App.State.data.transactionState || 'YOK'}</span></div>
                    </div>
                </div>
                ${ticketsHtml}
            </div>

            <!-- Health & AI Tokens -->
            <div class="arch-layer" style="grid-column: span 1; height: 350px;">
                <h3 style="font-size:14px; margin-bottom:15px; color:#fff;"><i class="fas fa-heartbeat text-success"></i> Sistem Sağlık Monitörü</h3>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                    ${healthHtml}
                </div>
                <h3 style="font-size:14px; margin-top:20px; margin-bottom:15px; color:#fff;"><i class="fas fa-brain text-accent"></i> AI Kullanım Maliyeti</h3>
                <div style="display:flex; justify-content:space-between; background:rgba(255,255,255,0.03); padding:12px; border-radius:8px;">
                    <span style="font-size:12px; color:#aaa;">Toplam Token Tüketimi (OpenAI):</span>
                    <strong style="font-family:var(--font-mono); color:#fff;">${ai.total} TX</strong>
                </div>
            </div>

            <!-- Financial Admin Dashboard -->
            <div class="arch-layer" style="grid-column: span 1; height: 350px; overflow-y:auto; position:relative;">
                <h3 style="font-size:14px; margin-bottom:15px; color:#10b981;"><i class="fas fa-money-bill-transfer"></i> Hakediş ve Ödeme Sırası</h3>
                <div id="payout-queue-target">
                </div>
                <button onclick="if(App.Adapters.PayoutOrchestrator){ App.Adapters.PayoutOrchestrator.processPayouts(); setTimeout(() => App.UI.Enterprise.render(), 2500); }" style="width:100%; position:sticky; bottom:-10px; background:#10b981; color:#fff; border:none; padding:10px; border-radius:8px; cursor:pointer; font-weight:bold; margin-top:10px;">Kuyruktaki Ödemeleri IBAN'a Geçi (Otonom)</button>
            </div>
            
            <script>
                // Hacky inline component for Payout queues on render
                setTimeout(() => {
                    const pqTarget = document.getElementById('payout-queue-target');
                    if (pqTarget && App.Adapters.PayoutOrchestrator) {
                        const q = App.Adapters.PayoutOrchestrator.payoutQueue;
                        if(q.length === 0) pqTarget.innerHTML = '<div style="text-align:center; color:#64748b; font-size:12px; padding:20px;">Bekleyen Ödeme Yok</div>';
                        else {
                            let qh = '';
                            q.forEach(req => {
                                const statusColor = req.status === 'PENDING' ? '#f59e0b' : '#10b981';
                                qh += \`<div style="display:flex; justify-content:space-between; align-items:center; padding:10px; background:rgba(255,255,255,0.03); border-radius:8px; margin-bottom:8px; border-left:3px solid \${statusColor};">
                                    <div><strong style="color:#fff; font-size:12px;">\${req.payoutId}</strong><div style="font-size:10px; color:#aaa;">\${req.craftsmanId}</div></div>
                                    <div style="text-align:right;"><strong style="color:#fff; font-size:13px;">\${req.amount.toFixed(2)} ₺</strong><div style="font-size:10px; color:\${statusColor};">\${req.status}</div></div>
                                </div>\`;
                            });
                            pqTarget.innerHTML = qh;
                        }
                    }
                }, 50);
            </script>

        </div>
        `;

        entDiv.innerHTML = html;
    }
};
