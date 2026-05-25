App.UI.syncRoleLayouts = function() {
    const p = App.State.data.userProfile;
    if(!p) return;

    const nameEl = document.getElementById('user-profile-name');
    if (nameEl) nameEl.innerHTML = p.name;
    
    const balanceEl = document.getElementById('nav-val-balance');
    if (balanceEl && p.wallet) balanceEl.innerHTML = p.wallet.balance + ' ₺';
    
    const infoSpan = document.querySelector('.nu-info span');
    if (infoSpan) {
        let roleText = p.designation ? p.designation : (p.role === 'customer' ? 'Müşteri Profili' : (p.role === 'craftsman' ? 'Saha Ustası' : 'Ağ Partneri'));
        if(p.approved === false && p.role !== 'customer') {
            roleText += ' (Onay Bekliyor)';
        }
        infoSpan.textContent = roleText;
        infoSpan.style.display = 'inline-block';
        infoSpan.style.padding = '3px 8px';
        infoSpan.style.marginTop = '4px';
        infoSpan.style.borderRadius = '4px';
        infoSpan.style.fontWeight = 'bold';
        
        if (p.role === 'craftsman') {
            infoSpan.style.background = 'rgba(245, 158, 11, 0.2)';
            infoSpan.style.color = '#f59e0b';
        } else if (p.role === 'partner') {
            infoSpan.style.background = 'rgba(16, 185, 129, 0.2)';
            infoSpan.style.color = '#10b981';
        } else {
            infoSpan.style.background = 'rgba(59, 130, 246, 0.2)';
            infoSpan.style.color = '#3b82f6';
        }
    }
    
    // UI Resets
    document.querySelectorAll('.nav-item').forEach(n => n.style.display = 'none');
    
    const bChat = document.getElementById('nav-chat-btn');
    const bOps = document.getElementById('nav-ops-btn');
    const bWallet = document.getElementById('nav-wallet-btn');
    const bProfile = document.getElementById('nav-profile-btn');
    const bSupport = document.getElementById('nav-support-btn');
    const bHistory = document.getElementById('nav-history-btn');
    
    const adminGroup = document.getElementById('admin-nav-group');
    if(adminGroup) adminGroup.style.display = 'none';

    if (p.role === 'customer' || p.approved === false) {
       [bChat, bOps, bWallet, bHistory, bProfile, bSupport].forEach(b => { if(b) b.style.display = 'flex'; });
       if (p.approved === false) {
           App.UI.Chat.updateOperationalBanner(true, "Başvurunuz alındı. Yönetici onayından sonra tüm özelliklere erişebileceksiniz.", "warning");
       }
       if(bChat) bChat.click();
    } 
    else if (p.role === 'craftsman' && p.approved !== false) {
       const cdash = document.getElementById('nav-c-dash-btn'); // C-Dash
       if(cdash) cdash.style.display = 'flex'; 
       [bChat, bWallet, bProfile, bSupport].forEach(b => { if(b) b.style.display = 'flex'; });
       
       const upgBtn = document.getElementById('upgrade-craftsman-btn');
       if(upgBtn) upgBtn.style.display = 'none';
       
       document.getElementById('header-name').textContent = 'Saha Görev Yöneticisi';
       if(cdash) cdash.click();
    } 
    else if (p.role === 'partner' && p.approved !== false) {
       const pdash = document.getElementById('nav-p-dash-btn'); // P-Dash
       if(pdash) pdash.style.display = 'flex'; 
       [bChat, bProfile, bSupport].forEach(b => { if(b) b.style.display = 'flex'; });
       
       document.getElementById('header-name').textContent = 'KliFox Partner Merkezi';
       if(pdash) pdash.click();
    }
    else if (p.role === 'admin') {
       [bChat, bOps, bWallet, bProfile, bSupport].forEach(b => { if(b) b.style.display = 'flex'; });
       if(adminGroup) adminGroup.style.display = 'block';
       
       const e1 = document.getElementById('nav-enterprise-btn');
       if(e1) e1.style.display = 'flex';
       ['nav-arch-btn', 'nav-economy-btn', 'nav-predictive-btn', 'nav-topology-btn', 'nav-ai-tracker-btn', 'nav-api-btn'].forEach(id => {
           const el = document.getElementById(id);
           if(el && !App.Config.MVP_MODE) el.style.display = 'flex';
           if(id === 'nav-arch-btn' && el) el.style.display = 'flex';
       });
       
       if(e1) e1.click(); 
       if (App.UI.Enterprise) App.UI.Enterprise.render();
       if (App.UI.ApiDocs) App.UI.ApiDocs.render();
       if (App.UI.Topology && !App.Config.MVP_MODE) App.UI.Topology.render();
       if (App.UI.AiTracker && !App.Config.MVP_MODE) App.UI.AiTracker.render();
    }

    // Force render economy view universally since it uses metrics if visible
    if (App.UI.Economy) App.UI.Economy.render();
    if (App.UI.Wallet) App.UI.Wallet.render();
    if (App.UI.Operations) App.UI.Operations.render();
    if (App.UI.Profile) App.UI.Profile.render();
    if (App.UI.History) App.UI.History.render();
};

Object.assign(App.UI, {
    initBindings() {
        document.querySelectorAll('.nav-item').forEach(el => {
            el.onclick = () => {
                const view = el.dataset.view;
                if(view === 'view-admin') { document.getElementById('view-admin').classList.add('open'); return; }
                document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
                document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
                el.classList.add('active');
                const tgt = document.getElementById(view);
                if(tgt) tgt.classList.add('active');
                
                if(view === 'view-enterprise' && App.UI.Enterprise) App.UI.Enterprise.render();
                if(view === 'view-economy' && App.UI.Economy) App.UI.Economy.render();
                if(view === 'view-predictive' && App.UI.Predictive) App.UI.Predictive.render();
                if(view === 'view-api-docs' && App.UI.ApiDocs) App.UI.ApiDocs.render();
                if(view === 'view-topology' && App.UI.Topology) App.UI.Topology.render();
                if(view === 'view-ai-tracker' && App.UI.AiTracker) App.UI.AiTracker.render();
                if(view === 'view-craftsman-dash' && App.UI.CraftsmanDash) App.UI.CraftsmanDash.render();
                if(view === 'view-partner-dash' && App.UI.PartnerDash) App.UI.PartnerDash.render();
                if(view === 'view-profile' && App.UI.Profile) App.UI.Profile.render();
                if(view === 'view-history' && App.UI.History) App.UI.History.render();
            };
        });

        const closeAdmin = document.getElementById('close-admin-btn');
        if(closeAdmin) closeAdmin.onclick = () => document.getElementById('view-admin').classList.remove('open');
        const openAdmin = document.getElementById('toggle-admin-btn');
        if(openAdmin) openAdmin.onclick = () => document.getElementById('view-admin').classList.add('open');

        // Ctrl+Shift+O to toggle operator console
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'o') {
                e.preventDefault();
                const c = document.getElementById('operator-console');
                if (c) c.style.display = (c.style.display === 'none') ? 'flex' : 'none';
            }
        });
        
        App.UI.setupOperatorConsole();
    },
    
    setupOperatorConsole() {
        const logArea = document.getElementById('operator-logs');
        if(!logArea) return;
        
        const doLog = (msg, color = '#cbd5e1') => {
            const time = new Date().toLocaleTimeString();
            const div = document.createElement('div');
            div.style.color = color;
            div.style.marginBottom = '4px';
            div.innerHTML = `[${time}] ${msg}`;
            logArea.appendChild(div);
            logArea.scrollTop = logArea.scrollHeight;
        };
        
        App.Adapters.EventBus.on('dispatch.incoming', (data) => doLog(`[ROUTER] Yeni operasyon oluşturuldu. Lokasyon: ${data.loc}, Aciliyet: ${data.urgency}`, '#3b82f6'));
        App.Adapters.EventBus.on('craftsman.accepted', (data) => doLog(`[AĞ] ${data.id} nolu usta görevi KABUL ETTİ.`, '#10b981'));
        
        // Expose a public logger for other parts of the system
        App.UI.operatorLog = doLog;
    },
    
    toast(title, message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast-message toast-${type}`;
        
        let icon = 'info-circle';
        if (type === 'success') icon = 'check-circle';
        if (type === 'warning') icon = 'exclamation-triangle';
        if (type === 'danger') icon = 'shield-alt';
        
        toast.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px;">
                <i class="fas fa-${icon}"></i>
                <div>
                    <div style="font-weight:bold; font-size:13px; margin-bottom:2px;">${title}</div>
                    <div style="font-size:12px; opacity:0.9;">${message}</div>
                </div>
            </div>
        `;
        
        container.prepend(toast);
        
        // Trigger reflow for animation
        setTimeout(() => toast.style.opacity = '1', 10);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                if (toast.parentNode === container) {
                    container.removeChild(toast);
                }
            }, 300);
        }, 4000);
    },
    
    renderSearchModal(items, onSelect, placeholder = 'Ara...') {
        let modal = document.getElementById('search-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'search-modal';
            modal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(15,23,42,0.9); z-index:10000; display:flex; flex-direction:column; padding:20px; box-sizing:border-box; backdrop-filter:blur(10px); justify-content:center; align-items:center;';
            document.body.appendChild(modal);
        }
        
        modal.innerHTML = `
            <div style="background:#1e293b; border-radius:16px; display:flex; flex-direction:column; width:100%; max-width:400px; max-height:80vh; box-shadow:0 20px 40px rgba(0,0,0,0.5); overflow:hidden; border:1px solid rgba(255,255,255,0.1);">
                <div style="padding:15px; border-bottom:1px solid rgba(255,255,255,0.05); display:flex; justify-content:space-between; align-items:center;">
                    <input type="text" id="search-modal-input" placeholder="${placeholder}" style="width:100%; padding:10px; background:transparent; border:none; color:#fff; font-size:16px; outline:none;">
                    <button onclick="document.getElementById('search-modal').style.display='none'" style="background:transparent; border:none; color:#ef4444; font-size:20px; cursor:pointer; margin-left:10px;"><i class="fas fa-times"></i></button>
                </div>
                <div id="search-modal-list" style="overflow-y:auto; flex:1; padding: 10px 0;"></div>
            </div>
        `;
        
        const listContainer = document.getElementById('search-modal-list');
        const input = document.getElementById('search-modal-input');
        
        const renderList = (filter = '') => {
            const filtered = items.filter(i => i.toLowerCase().includes(filter.toLowerCase()));
            if(filtered.length === 0) {
                listContainer.innerHTML = '<div style="padding:15px; color:#64748b; text-align:center;">Sonuç bulunamadı.</div>';
                return;
            }
            listContainer.innerHTML = filtered.map(item => `
                <div class="search-modal-item" style="padding:12px 20px; border-bottom:1px solid rgba(255,255,255,0.02); color:#cbd5e1; cursor:pointer;">
                    ${item}
                </div>
            `).join('');
            
            listContainer.querySelectorAll('.search-modal-item').forEach(el => {
                el.onclick = () => {
                    modal.style.display = 'none';
                    onSelect(el.innerText.trim());
                };
                el.onmouseover = () => el.style.background = 'rgba(255,255,255,0.05)';
                el.onmouseout = () => el.style.background = 'transparent';
            });
        };
        
        modal.style.display = 'flex';
        input.focus();
        renderList();
        
        input.addEventListener('input', (e) => renderList(e.target.value));
    },

    renderServiceCardModal(serviceId, onSubmit) {
        let modal = document.getElementById('scard-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'scard-modal';
            modal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(15,23,42,0.9); z-index:10000; display:flex; flex-direction:column; padding:20px; box-sizing:border-box; backdrop-filter:blur(10px); justify-content:center; align-items:center;';
            document.body.appendChild(modal);
        }
        
        const srv = (App.State.data.services || []).find(s => s.id === serviceId) || {};
        const problem = srv.problem || App.State.data.memoryContext.problem || '';
        
        modal.innerHTML = `
            <div style="background:#1e293b; border-radius:16px; display:flex; flex-direction:column; width:100%; max-width:500px; box-shadow:0 20px 40px rgba(0,0,0,0.5); overflow:hidden; border:1px solid rgba(255,255,255,0.1);">
                <div style="padding:20px; border-bottom:1px solid rgba(255,255,255,0.05); display:flex; justify-content:space-between; align-items:center;">
                    <h3 style="color:#f8fafc; margin:0;"><i class="fas fa-file-invoice" style="color:#3b82f6;"></i> Hizmet Kartı Oluştur</h3>
                    <button onclick="document.getElementById('scard-modal').style.display='none'" style="background:transparent; border:none; color:#ef4444; font-size:20px; cursor:pointer;"><i class="fas fa-times"></i></button>
                </div>
                
                <div style="padding:20px; flex:1; overflow-y:auto; display:flex; flex-direction:column; gap:15px;">
                    <div>
                        <label style="display:block; color:#cbd5e1; font-size:0.85rem; margin-bottom:5px;">Hizmet Kategorisi *</label>
                        <select id="scard-category" class="modern-input" style="width:100%; padding:12px; border-radius:8px; background:rgba(0,0,0,0.2); border:1px solid rgba(255,255,255,0.1); color:#fff; font-size:14px; outline:none;">
                            <option value="Klima Bakım/Onarım">Klima Bakım/Onarım</option>
                            <option value="Beyaz Eşya">Beyaz Eşya</option>
                            <option value="Su Tesisatı">Su Tesisatı</option>
                            <option value="Elektrik Tesisatı">Elektrik Tesisatı</option>
                            <option value="Kombi/Isıtma">Kombi/Isıtma</option>
                            <option value="Diğer">Diğer</option>
                        </select>
                    </div>
                    <div>
                        <label style="display:block; color:#cbd5e1; font-size:0.85rem; margin-bottom:5px;">Cihaz / Ekipman *</label>
                        <input type="text" id="scard-equipment" class="modern-input" placeholder="Örn: Duvar Tipi Klima, Çamaşır Makinesi" style="width:100%; padding:12px; border-radius:8px; background:rgba(0,0,0,0.2); border:1px solid rgba(255,255,255,0.1); color:#fff; font-size:14px; outline:none;">
                    </div>
                    <div>
                        <label style="display:block; color:#cbd5e1; font-size:0.85rem; margin-bottom:5px;">Şikayet / Problem *</label>
                        <input type="text" id="scard-issue" class="modern-input" value="${problem}" style="width:100%; padding:12px; border-radius:8px; background:rgba(0,0,0,0.2); border:1px solid rgba(255,255,255,0.1); color:#fff; font-size:14px; outline:none;">
                    </div>
                    <div>
                        <label style="display:block; color:#cbd5e1; font-size:0.85rem; margin-bottom:5px;">Uygulanan İşlem *</label>
                        <input type="text" id="scard-operation" class="modern-input" placeholder="Örn: Gaz basıldı, motor değişti" style="width:100%; padding:12px; border-radius:8px; background:rgba(0,0,0,0.2); border:1px solid rgba(255,255,255,0.1); color:#fff; font-size:14px; outline:none;">
                    </div>
                    <div>
                        <label style="display:block; color:#cbd5e1; font-size:0.85rem; margin-bottom:5px;">Toplam Tutar (₺) *</label>
                        <input type="number" id="scard-price" class="modern-input" placeholder="Örn: 1500" style="width:100%; padding:12px; border-radius:8px; background:rgba(0,0,0,0.2); border:1px solid rgba(255,255,255,0.1); color:#fff; font-size:14px; outline:none;">
                    </div>
                    <div>
                        <label style="display:block; color:#cbd5e1; font-size:0.85rem; margin-bottom:5px;">Ek Notlar / Tavsiyeler</label>
                        <textarea id="scard-notes" class="modern-input" rows="2" placeholder="Örn: 6 ay sonra filtre değişimi önerilir." style="width:100%; padding:12px; border-radius:8px; background:rgba(0,0,0,0.2); border:1px solid rgba(255,255,255,0.1); color:#fff; font-size:14px; outline:none; resize:none;"></textarea>
                    </div>
                </div>
                
                <div style="padding:20px; border-top:1px solid rgba(255,255,255,0.05);">
                    <button id="scard-submit-btn" style="width:100%; padding:15px; background:linear-gradient(135deg, #10b981, #059669); color:#fff; border:none; border-radius:12px; font-weight:bold; font-size:1.1rem; cursor:pointer; box-shadow:0 8px 15px rgba(16,185,129,0.3);"><i class="fas fa-check"></i> Kartı Oluştur ve İşlemi Tamamla</button>
                </div>
            </div>
        `;
        
        modal.style.display = 'flex';
        
        document.getElementById('scard-submit-btn').onclick = () => {
            const category = document.getElementById('scard-category').value;
            const equipment = document.getElementById('scard-equipment').value;
            const issue = document.getElementById('scard-issue').value;
            const operation = document.getElementById('scard-operation').value;
            const price = document.getElementById('scard-price').value;
            const notes = document.getElementById('scard-notes').value;
            
            if(!equipment || !issue || !operation || !price) {
                App.UI.toast('Hata', 'Lütfen zorunlu alanları doldurun.', 'danger');
                return;
            }
            
            modal.style.display = 'none';
            onSubmit({
                category,
                equipment,
                issue,
                operation,
                price: parseInt(price),
                notes,
                date: new Date().toISOString(),
                craftsman: App.State.data.userProfile
            });
        };
    }
});

