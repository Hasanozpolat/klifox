App.UI.Economy = {
    render() {
        const target = document.getElementById('economy-render-target');
        if (!target) return;

        const eco = App.Engine.Economy.state;
        const p = App.State.data.userProfile || {};

        let regionsHtml = '';
        const sortedRegions = Object.entries(eco.regions).sort((a,b) => b[1].trust - a[1].trust);
        sortedRegions.forEach((reg, index) => {
            const name = reg[0]; const data = reg[1];
            const statColor = data.status === 'Elite' ? 'var(--accent)' : (data.status === 'Critical' ? 'var(--danger)' : 'var(--success)');
            const incHTML = data.incentive > 0 ? `<span style="font-size:10px; background:var(--warning); color:#000; padding:2px 6px; border-radius:10px; font-weight:800; animation: pulseIcon 1.5s infinite;">+%${data.incentive} TEŞVİK FONU AKTİF</span>` : '';
            
            regionsHtml += `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:12px; background:rgba(255,255,255,0.03); border-radius:8px; margin-bottom:8px;">
                <div style="display:flex; align-items:center; gap:12px;">
                    <div style="font-size:18px; font-weight:800; color:#555;">#${index+1}</div>
                    <div>
                        <strong style="color:#fff; font-size:14px;">${name} Havzası</strong> ${incHTML}
                        <div style="font-size:11px; color:#aaa; margin-top:4px;"><i class="fas fa-check-circle"></i> Tamamlanan: ${data.jobs} | Hız: ${data.speed}</div>
                    </div>
                </div>
                <div><span style="font-size:11px; font-weight:600; padding:4px 8px; border-radius:12px; border:1px solid ${statColor}40; color:${statColor}">${data.trust} Güven Puanı</span></div>
            </div>`;
        });

        // Loyalty Tier Calculation
        let loyaltyHtml = '';
        if (p.role === 'customer') {
            const lTier = App.Engine.Economy.getLoyaltyTier(App.State.data.gamification?.level || 1);
            loyaltyHtml = `
            <div class="arch-layer" style="margin-bottom:20px; background:linear-gradient(to right, rgba(14, 165, 233, 0.1), rgba(0,0,0,0));">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <h3 style="color:#fff; margin-bottom:5px;"><i class="fas fa-crown text-accent"></i> Müşteri Sadakat Programı</h3>
                        <p style="color:#aaa; font-size:12px;">Sistemde ne kadar uzun kalırsanız AI yönlendirmeleriniz o kadar hızlanır.</p>
                    </div>
                    <div style="text-align:right;">
                        <div style="color:var(--accent); font-weight:800; font-size:18px;">${lTier.name}</div>
                        <div style="font-size:11px; color:#fff; background:var(--accent); padding:2px 8px; border-radius:12px; display:inline-block; margin-top:5px;">Sistem Ayrıcalığı: ${lTier.bonus}</div>
                    </div>
                </div>
            </div>
            `;
        }

        const html = `
        <div class="ent-header" style="margin-bottom: 24px;">
            <h2><i class="fas fa-globe text-accent"></i> Yapay Zeka Eko-Sistem Ekonomisi</h2>
            <p style="color:#aaa; font-size:13px; margin-top:5px;">Canlı teşvik ağları, bölgesel liderlikler ve büyüme metrikleri.</p>
        </div>

        ${loyaltyHtml}

        <div class="ent-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
            
            <!-- Economy Status Bar -->
            <div class="arch-layer" style="grid-column: span 3; display:grid; grid-template-columns: repeat(3, 1fr); gap:15px;">
                <div class="o-metric" style="border:none; background:transparent;"><span>Eko-Sistem Büyüme Oranı</span><strong style="color:var(--success); font-size:24px;">%${eco.growthPercentage.toFixed(2)}</strong></div>
                <div class="o-metric" style="border:none; background:transparent;"><span>Ağ Referans Hızı (Velocity)</span><strong style="color:#fff; font-size:24px;"><i class="fas fa-wind text-accent"></i> ${eco.referralVelocity.toFixed(1)} /saniye</strong></div>
                <div class="o-metric" style="border:none; background:transparent;"><span>Hizmet Likiditesi (Kredi Havuzu)</span><strong style="color:#fbbf24; font-size:24px;">${new Intl.NumberFormat('tr-TR').format(eco.liquidityVolume)} ₺</strong></div>
            </div>

            <!-- Regional Leaderboards -->
            <div class="arch-layer" style="grid-column: span 2; height: 380px; overflow-y:auto;">
                <h3 style="font-size:14px; margin-bottom:15px; color:#fff;"><i class="fas fa-map-marked-alt text-warning"></i> Canlı Bölgesel Rekabet Sıralaması</h3>
                ${regionsHtml}
            </div>

            <!-- Graph Network Map -->
            <div class="arch-layer" style="grid-column: span 1; height: 380px; overflow:hidden;">
                <h3 style="font-size:14px; margin-bottom:15px; color:#fff;"><i class="fas fa-project-diagram text-accent"></i> Büyüme Ağı Fraktalı</h3>
                
                <div class="tree-root">
                    <div class="tree-node root-node">Sistem Ağacı (Kök)</div>
                    <div class="tree-branches">
                        <div class="tree-branch">
                            <div class="tree-node partner-node">Ahmet (Üye)</div>
                            <div class="tree-branches">
                                <div class="tree-branch"><div class="tree-node leaf-node">Selin</div></div>
                                <div class="tree-branch"><div class="tree-node leaf-node">Berk</div></div>
                            </div>
                        </div>
                        <div class="tree-branch">
                            <div class="tree-node partner-node">Ağ Havuzu #2</div>
                            <div class="tree-branches">
                                <div class="tree-branch"><div class="tree-node leaf-node">Emre</div></div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

        </div>
        `;
        target.innerHTML = html;
    }
};
