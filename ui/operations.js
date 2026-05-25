App.UI.Operations = {
    render() {
        const view = document.getElementById('view-operations');
        if(!view) return;
        
        const services = App.State.data.services || [];
        
        let html = `<div class="operations-dashboard"><div class="ops-header"><h2>Taleplerim</h2></div>`;
        
        if (services.length === 0) {
            html += `<div class="empty-state">
                <i class="fas fa-clipboard" style="font-size:3rem; color:#475569; margin-bottom:15px;"></i>
                <h3>Aktif talebiniz bulunmuyor.</h3>
                <p>Ana sayfadan yeni bir servis talebi oluşturabilirsiniz.</p>
            </div></div>`;
            view.innerHTML = html;
            return;
        }

        let activeHtml = `<h3 style="color:#fff; font-size:16px; margin:20px 0 10px 0;">Aktif Taleplerim</h3><div style="display:flex; flex-direction:column; gap:20px;">`;
        let completedHtml = `<h3 style="color:var(--text-muted); font-size:16px; margin:30px 0 10px 0;">Geçmiş Taleplerim</h3><div style="display:flex; flex-direction:column; gap:20px; opacity:0.7;">`;
        
        let hasActive = false;
        let hasCompleted = false;

        [...services].reverse().forEach(srv => {
            let statusBadge = '';
            let sColor = '';
            
            const state = srv.status || 'DISPATCHING';
            
            if(state === 'DISPATCHING') { statusBadge = 'Bölgede Usta Aranıyor'; sColor = 'var(--accent)'; }
            else if(state === 'MATCHED') { statusBadge = 'Usta Yönlendirildi'; sColor = 'var(--warning)'; }
            else if(state === 'APPROVED') { statusBadge = 'Anlaşma Sağlandı'; sColor = 'var(--success)'; }
            else if(state === 'IN_PROGRESS') { statusBadge = 'Onay Bekleniyor'; sColor = 'var(--warning)'; }
            else if(state === 'COMPLETED') { statusBadge = 'Tamamlandı'; sColor = 'var(--success)'; }

            const ustaHtml = srv.assignedCraftsman ? `
                <div style="margin-top:15px; padding-top:15px; border-top:1px dashed rgba(255,255,255,0.1); display:flex; align-items:center; gap:10px;">
                    <img src="${srv.assignedCraftsman.avatar || 'https://i.pravatar.cc/150?u=' + srv.assignedCraftsman.id}" style="width:32px; height:32px; border-radius:50%; object-fit:cover;">
                    <div>
                        <div style="font-size:13px; font-weight:bold; color:#fff;">${srv.assignedCraftsman.name}</div>
                        <div style="font-size:11px; color:var(--text-muted);">${srv.assignedCraftsman.company || 'Bağımsız Usta'}</div>
                    </div>
                </div>
            ` : '';
            
            // Build Timeline UX
            const labels = ['Talep Oluşturuldu', 'Usta Bulundu', 'Anlaşıldı', 'Tamamlandı'];
            let progressIndex = 0;
            if (state === 'MATCHED') progressIndex = 1;
            if (state === 'APPROVED') progressIndex = 2;
            if (state === 'IN_PROGRESS' || state === 'COMPLETED') progressIndex = 3;
            
            let timelineHtml = `<div style="display:flex; justify-content:space-between; margin-top:15px; padding:10px; background:rgba(0,0,0,0.2); border-radius:8px;">`;
            labels.forEach((lbl, idx) => {
                const isPast = idx <= progressIndex;
                const isCurrent = idx === progressIndex;
                const icon = isPast ? 'fa-check' : 'fa-circle';
                const color = isPast ? 'var(--success)' : 'var(--text-muted)';
                const op = isPast ? '1' : '0.4';
                timelineHtml += `
                    <div style="display:flex; flex-direction:column; align-items:center; opacity:${op}; width:25%;">
                        <i class="fas ${icon}" style="color:${color}; font-size:14px; margin-bottom:5px;"></i>
                        <span style="font-size:9px; color:${color}; text-align:center; line-height:1.2;">${lbl}</span>
                    </div>
                `;
            });
            timelineHtml += `</div>`;

            const itemHtml = `
                <div onclick="App.UI.Operations.openChat('${srv.id}')" style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); border-radius:16px; padding:20px; box-shadow:0 10px 30px rgba(0,0,0,0.2); cursor:pointer; transition:0.2s;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                        <span style="font-family:var(--font-mono); font-size:12px; color:var(--text-muted);">${srv.id}</span>
                        <span style="background:rgba(255,255,255,0.1); padding:4px 10px; border-radius:12px; font-size:11px; font-weight:600; color:${sColor}; border:1px solid ${sColor};">${statusBadge}</span>
                    </div>
                    <div style="font-size:16px; font-weight:600; color:#fff; margin-bottom:5px;">${srv.problem || 'Klima Arızası'}</div>
                    <div style="font-size:13px; color:var(--text-muted); margin-bottom:5px;"><i class="fas fa-map-marker-alt"></i> ${srv.location}</div>
                    ${timelineHtml}
                    ${ustaHtml}
                </div>
            `;

            if (state === 'COMPLETED') {
                completedHtml += itemHtml;
                hasCompleted = true;
            } else {
                activeHtml += itemHtml;
                hasActive = true;
            }
        });
        
        activeHtml += `</div>`;
        completedHtml += `</div>`;

        view.innerHTML = html + (hasActive ? activeHtml : '') + (hasCompleted ? completedHtml : '');
    },
    
    openChat(serviceId) {
        App.State.data.currentRequestId = serviceId;
        App.State.save();
        const chatBtn = document.getElementById('nav-chat-btn');
        if (chatBtn) chatBtn.click();
    }
};
