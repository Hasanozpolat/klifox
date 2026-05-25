window.Admin = {
    login() {
        const pass = document.getElementById('admin-pass').value;
        if (pass === 'admin123') {
            document.getElementById('login-overlay').style.display = 'none';
            document.getElementById('admin-dashboard').style.display = 'flex';
            this.refreshData();
            
            // Auto refresh every 5 seconds for live view
            setInterval(() => {
                if (document.visibilityState === 'visible') {
                    this.refreshData(true);
                }
            }, 5000);
            
            this.initSocket();
        } else {
            alert('Hatalı şifre.');
        }
    },

    currentTab: 'live',

    showTab(tabName) {
        this.currentTab = tabName;
        document.querySelectorAll('.admin-sidebar li').forEach(el => el.classList.remove('active'));
        event.currentTarget.classList.add('active');
        
        const titles = {
            'live': { title: 'Canlı Operasyonlar', icon: 'fa-satellite-dish' },
            'pending': { title: 'Onay Bekleyenler', icon: 'fa-user-clock' },
            'finance': { title: 'Finans & Komisyon', icon: 'fa-chart-pie' },
            'cancelled': { title: 'İptal Edilenler', icon: 'fa-ban' }
        };
        
        document.getElementById('tab-title').innerText = titles[tabName].title;
        document.getElementById('tab-icon').className = 'fas ' + titles[tabName].icon;
        
        this.refreshData();
    },

    getState() {
        const raw = localStorage.getItem('klifox_state');
        if (raw) return JSON.parse(raw);
        return { services: [], userProfile: {} }; // Mock fallback
    },

    getUsers() {
        const raw = localStorage.getItem('klifox_users');
        if (raw) return JSON.parse(raw);
        return {};
    },

    initSocket() {
        if (window.io && !this.socket) {
            this.socket = io('http://localhost:3000');
            this.socket.on('global.sync', (state) => {
                if (state.users) localStorage.setItem('klifox_users', JSON.stringify(state.users));
                if (state.services) {
                    const localState = this.getState();
                    localState.services = state.services;
                    localStorage.setItem('klifox_state', JSON.stringify(localState));
                }
                this.refreshData(true);
            });
            this.socket.on('global.state.sync', (partialState) => {
                if (partialState.users) {
                    const localUsers = this.getUsers();
                    Object.assign(localUsers, partialState.users);
                    localStorage.setItem('klifox_users', JSON.stringify(localUsers));
                }
                if (partialState.services) {
                    const localState = this.getState();
                    localState.services = partialState.services;
                    localStorage.setItem('klifox_state', JSON.stringify(localState));
                }
                this.refreshData(true);
            });
        }
    },

    refreshData(silent = false) {
        const state = this.getState();
        const content = document.getElementById('tab-content');
        
        if (this.currentTab === 'live') {
            this.renderLive(content, state);
        } else if (this.currentTab === 'pending') {
            this.renderPendingApprovals(content, state);
        } else if (this.currentTab === 'finance') {
            this.renderFinance(content, state);
        } else if (this.currentTab === 'cancelled') {
            this.renderCancelled(content, state);
        }
    },
    
    approveUser(userId) {
        const users = this.getUsers();
        if(users[userId]) {
            users[userId].approved = true;
            if (users[userId].pendingRole) {
                users[userId].role = users[userId].pendingRole;
                if (users[userId].role === 'craftsman') users[userId].designation = 'Saha Ustası';
                if (users[userId].role === 'partner') users[userId].designation = 'KliFox Partner';
                delete users[userId].pendingRole;
            }
            localStorage.setItem('klifox_users', JSON.stringify(users));
            if (this.socket) this.socket.emit('global.state.update', { users: users });
            alert('Kullanıcı onaylandı!');
            this.refreshData();
        }
    },
    
    rejectUser(userId) {
        const users = this.getUsers();
        if(users[userId]) {
            users[userId].approved = true; // Clear pending state
            users[userId].role = 'customer'; // Revert back to customer completely
            delete users[userId].pendingRole;
            localStorage.setItem('klifox_users', JSON.stringify(users));
            if (this.socket) this.socket.emit('global.state.update', { users: users });
            alert('Başvuru reddedildi ve müşteri rolüne düşürüldü.');
            this.refreshData();
        }
    },

    renderPendingApprovals(container, state) {
        const users = this.getUsers();
        let pendingUsers = [];
        
        for (const uid in users) {
            const p = users[uid];
            if (p.approved === false && p.pendingRole) {
                pendingUsers.push(p);
            }
        }
        
        let html = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Tarih</th>
                        <th>Kullanıcı Adı</th>
                        <th>Rol</th>
                        <th>Telefon / Bölge</th>
                        <th>Aksiyon</th>
                    </tr>
                </thead>
                <tbody>
        `;

        if (pendingUsers.length === 0) {
            html += `<tr><td colspan="5" style="text-align:center; color:#666;">Onay bekleyen kayıt bulunmuyor.</td></tr>`;
        } else {
            pendingUsers.forEach(profile => {
                const roleName = profile.pendingRole === 'craftsman' ? 'Saha Ustası' : 'Ağ Partneri';
                const dateStr = new Date(profile.createdAt || Date.now()).toLocaleDateString('tr-TR');
                html += `
                    <tr>
                        <td>${dateStr}</td>
                        <td style="color:#fff;">${profile.name}</td>
                        <td><span class="status-badge PARTNER_ESCALATED">${roleName}</span></td>
                        <td>${profile.phone || '-'} / ${profile.district || '-'}</td>
                        <td>
                            <button onclick="window.Admin.approveUser('${profile.id}')" style="background:#10b981; color:#fff; border:none; padding:5px 10px; border-radius:5px; cursor:pointer;"><i class="fas fa-check"></i> Onayla</button>
                            <button onclick="window.Admin.rejectUser('${profile.id}')" style="background:#ef4444; color:#fff; border:none; padding:5px 10px; border-radius:5px; cursor:pointer; margin-left:5px;"><i class="fas fa-times"></i> Red</button>
                        </td>
                    </tr>
                `;
            });
        }

        html += `</tbody></table>`;
        container.innerHTML = html;
    },

    renderLive(container, state) {
        const services = state.services || [];
        const active = services.filter(s => s.status !== 'CANCELLED' && s.status !== 'COMPLETED');
        
        let html = `
            <div class="stats-grid">
                <div class="stat-card"><h4>Aktif Operasyonlar</h4><div class="val">${active.length}</div></div>
                <div class="stat-card"><h4>Eskalasyon (Partner)</h4><div class="val red">${active.filter(s => s.status === 'PARTNER_ESCALATED').length}</div></div>
                <div class="stat-card"><h4>Bugün Tamamlanan</h4><div class="val green">${services.filter(s => s.status === 'COMPLETED').length}</div></div>
                <div class="stat-card"><h4>Toplam İşlem Hacmi</h4><div class="val blue">${services.filter(s => s.status === 'COMPLETED').reduce((acc, s) => acc + (s.price || 1000), 0)} ₺</div></div>
            </div>
            
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Tarih</th>
                        <th>Bölge</th>
                        <th>Müşteri Talebi</th>
                        <th>Durum</th>
                        <th>Atanan Usta / Partner</th>
                    </tr>
                </thead>
                <tbody>
        `;

        if (services.length === 0) {
            html += `<tr><td colspan="5" style="text-align:center; color:#666;">Sistemde kayıtlı operasyon bulunmuyor.</td></tr>`;
        }

        services.forEach(s => {
            if (s.status === 'CANCELLED' || s.status === 'COMPLETED') return; // Hide history from live view
            
            const date = new Date(s.createdAt).toLocaleTimeString('tr-TR');
            const cName = s.assignedCraftsman ? s.assignedCraftsman.name : '-';
            html += `
                <tr>
                    <td>${date}</td>
                    <td>${s.location || '-'}</td>
                    <td style="color:#fff;">${s.problem || s.type}</td>
                    <td><span class="status-badge ${s.status}">${s.status}</span></td>
                    <td>${s.status === 'PARTNER_ESCALATED' ? '<i class="fas fa-network-wired text-warning"></i> Partner Bekleniyor' : cName}</td>
                </tr>
            `;
        });

        html += `</tbody></table>`;
        container.innerHTML = html;
    },

    renderFinance(container, state) {
        const services = state.services || [];
        const completed = services.filter(s => s.status === 'COMPLETED');
        
        let totalVol = 0;
        let totalAdminRev = 0;
        let totalPartnerRev = 0;

        completed.forEach(s => {
            const price = s.price || 1000;
            totalVol += price;
            
            // Simulate split
            const hasPartner = s.partnerCode || (state.userProfile && state.userProfile.partnerData); // Mock check
            if (hasPartner) {
                totalAdminRev += (price * 0.06);
                totalPartnerRev += (price * 0.10); // 8% earn + 2% credit
            } else {
                totalAdminRev += (price * 0.16);
            }
        });

        const html = `
            <div class="stats-grid">
                <div class="stat-card"><h4>Toplam Yaratılan Hacim</h4><div class="val">${totalVol} ₺</div></div>
                <div class="stat-card"><h4>%16 Komisyon Toplamı</h4><div class="val blue">${totalAdminRev + totalPartnerRev} ₺</div></div>
                <div class="stat-card"><h4>KliFox Kasa (Admin)</h4><div class="val green">${totalAdminRev} ₺</div></div>
                <div class="stat-card"><h4>Partner Dağıtımı</h4><div class="val">${totalPartnerRev} ₺</div></div>
            </div>
            <div style="padding:20px; background:rgba(59,130,246,0.1); border:1px solid rgba(59,130,246,0.2); border-radius:12px;">
                <h3 style="margin-top:0; color:#3b82f6;"><i class="fas fa-info-circle"></i> Komisyon Politikası</h3>
                <p style="color:#aaa; font-size:14px; line-height:1.6; margin:0;">
                    Ustalardan işlem başına <b>%16</b> sabit komisyon kesilir.<br>
                    Müşteri bir Partnere bağlıysa: <b>%8</b> Partner Nakit, <b>%2</b> Partner Hediye Kredi, <b>%6</b> KliFox Admin.<br>
                    Müşteri bir Partnere bağlı DEĞİLSE: Kesintinin <b>%16</b>'sı tamamen KliFox Admin'e aktarılır.
                </p>
            </div>
        `;
        container.innerHTML = html;
    },

    renderCancelled(container, state) {
        const services = state.services || [];
        const cancelled = services.filter(s => s.status === 'CANCELLED');

        let html = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Tarih</th>
                        <th>İptal Eden (Rol)</th>
                        <th>İptal Nedeni</th>
                        <th>Hizmet Bölgesi</th>
                    </tr>
                </thead>
                <tbody>
        `;

        if (cancelled.length === 0) {
            html += `<tr><td colspan="4" style="text-align:center; color:#666;">İptal edilmiş operasyon bulunmuyor.</td></tr>`;
        }

        cancelled.forEach(s => {
            const date = new Date(s.createdAt).toLocaleTimeString('tr-TR');
            html += `
                <tr>
                    <td>${date}</td>
                    <td><span style="color:#fff;">${s.cancellationActor || '-'}</span></td>
                    <td style="color:#ef4444;">${s.cancellationReason || 'Belirtilmedi'}</td>
                    <td>${s.location || '-'}</td>
                </tr>
            `;
        });

        html += `</tbody></table>`;
        container.innerHTML = html;
    }
};

