App.UI.History = {
    render() {
        const target = document.getElementById('view-history');
        if(!target) return;
        
        const services = (App.State.data.services || []).filter(s => s.status === 'COMPLETED' && s.serviceCard);
        
        // Sort by date descending
        services.sort((a,b) => {
            const d1 = new Date(a.serviceCard.date).getTime();
            const d2 = new Date(b.serviceCard.date).getTime();
            return d2 - d1;
        });

        let html = `
        <div class="operations-dashboard">
            <div class="ops-header">
                <h2>Hizmet Geçmişim</h2>
                <div style="font-size:12px; color:var(--text-muted); margin-top:5px;">KliFox ekosistemindeki tüm kayıtlı işlemleriniz</div>
            </div>
        `;
        
        if (services.length === 0) {
            html += `
            <div class="empty-state">
                <i class="fas fa-history" style="font-size:3rem; color:#475569; margin-bottom:15px;"></i>
                <h3>Geçmiş işleminiz bulunmuyor.</h3>
                <p>Tamamlanan servis hizmetleriniz burada Hizmet Kartı olarak listelenecektir.</p>
            </div>
            `;
        } else {
            html += `<div style="display:flex; flex-direction:column; gap:20px; padding-bottom:30px;">`;
            
            services.forEach(s => {
                const c = s.serviceCard;
                const d = new Date(c.date);
                const dateStr = d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
                
                let catIcon = 'fa-tools';
                if(c.category.includes('Klima')) catIcon = 'fa-snowflake';
                else if(c.category.includes('Beyaz')) catIcon = 'fa-washer';
                else if(c.category.includes('Su')) catIcon = 'fa-tint';
                else if(c.category.includes('Elektrik')) catIcon = 'fa-bolt';
                else if(c.category.includes('Kombi')) catIcon = 'fa-fire';

                html += `
                <div style="background:var(--bg-sec); border-radius:16px; border:1px solid rgba(255,255,255,0.05); padding:20px; position:relative; overflow:hidden;">
                    <div style="position:absolute; top:0; left:0; width:4px; height:100%; background:var(--accent);"></div>
                    
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:15px;">
                        <div style="display:flex; align-items:center; gap:10px;">
                            <div style="width:40px; height:40px; border-radius:10px; background:rgba(245, 158, 11, 0.1); display:flex; align-items:center; justify-content:center; color:var(--accent); font-size:1.2rem;">
                                <i class="fas ${catIcon}"></i>
                            </div>
                            <div>
                                <div style="color:#fff; font-weight:bold; font-size:1.1rem;">${c.category}</div>
                                <div style="color:var(--text-muted); font-size:0.85rem;">${dateStr}</div>
                            </div>
                        </div>
                        <div style="background:rgba(16, 185, 129, 0.1); color:#10b981; padding:5px 12px; border-radius:20px; font-size:0.8rem; font-weight:bold; display:flex; align-items:center; gap:5px;">
                            <i class="fas fa-check-circle"></i> Tamamlandı
                        </div>
                    </div>
                    
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px; margin-bottom:15px; background:rgba(0,0,0,0.2); padding:15px; border-radius:12px;">
                        <div>
                            <div style="color:var(--text-muted); font-size:0.8rem; margin-bottom:3px;">Cihaz / Ekipman</div>
                            <div style="color:#fff; font-size:0.95rem;">${c.equipment}</div>
                        </div>
                        <div>
                            <div style="color:var(--text-muted); font-size:0.8rem; margin-bottom:3px;">Şikayet</div>
                            <div style="color:#fff; font-size:0.95rem;">${c.issue}</div>
                        </div>
                        <div style="grid-column: span 2;">
                            <div style="color:var(--text-muted); font-size:0.8rem; margin-bottom:3px;">Uygulanan İşlem</div>
                            <div style="color:#fff; font-size:0.95rem;">${c.operation}</div>
                        </div>
                        ${c.notes ? `
                        <div style="grid-column: span 2; padding-top:10px; border-top:1px dashed rgba(255,255,255,0.1);">
                            <div style="color:var(--accent); font-size:0.8rem; margin-bottom:3px;"><i class="fas fa-info-circle"></i> Usta Notu / Tavsiye</div>
                            <div style="color:#cbd5e1; font-size:0.9rem; font-style:italic;">"${c.notes}"</div>
                        </div>
                        ` : ''}
                    </div>
                    
                    <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid rgba(255,255,255,0.05); padding-top:15px;">
                        <div style="display:flex; align-items:center; gap:10px;">
                            <img src="${c.craftsman && c.craftsman.avatar ? c.craftsman.avatar : 'https://ui-avatars.com/api/?name=' + (c.craftsman?c.craftsman.name:'U') + '&background=1e293b&color=f8fafc'}" style="width:30px; height:30px; border-radius:50%;">
                            <div style="color:#cbd5e1; font-size:0.9rem;">${c.craftsman ? c.craftsman.name : 'Saha Ustası'}</div>
                        </div>
                        <div style="color:#fff; font-weight:bold; font-size:1.1rem;">
                            ${c.price} ₺
                        </div>
                    </div>
                </div>
                `;
            });
            
            html += `</div>`;
        }
        
        html += `</div>`;
        target.innerHTML = html;
    }
};

