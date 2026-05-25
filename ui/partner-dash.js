App.UI.PartnerDash = {
    render() {
        const target = document.getElementById('partner-dash-render-target');
        if (!target) return;

        const p = App.State.data.userProfile || {};
        if (p.role !== 'partner') {
            target.innerHTML = `<div style="padding:40px; text-align:center; color:red;">Erişim Reddedildi.</div>`;
            return;
        }

        if (!App.State.data.suspendedUsers) {
            App.State.data.suspendedUsers = [
                { id: 'USR-8812', name: 'Mustafa K.', date: '21.05.2026', city: 'İstanbul', status: 'idle' },
                { id: 'USR-7734', name: 'Fatma G.', date: '22.05.2026', city: 'Ankara', status: 'idle' },
                { id: 'USR-9921', name: 'Ali V.', date: '23.05.2026', city: 'İzmir', status: 'active' }
            ];
            App.State.save();
        }

        const pData = p.partnerData || { package: 'Starter', referralCode: 'PRT-12345', earnings: 0, credits: 0, networkUsers: [], networkCraftsmen: [] };
        const packageName = pData.package || pData.level || 'Starter';
        
        // Initial populate if empty
        if (pData.networkUsers.length === 0 && !pData.initialized) {
            pData.networkUsers = [
                { id: 'USR-9123', name: 'Ayşe Yılmaz', date: '25.05.2026', city: 'Gaziantep', status: 'active' },
                { id: 'USR-4821', name: 'Ahmet K.', date: '24.05.2026', city: 'Gaziantep', status: 'idle' }
            ];
            pData.initialized = true;
            App.State.save();
        }

        const myUsers = pData.networkUsers;
        const suspendedUsers = App.State.data.suspendedUsers;
        
        let capacity = 100;
        if (packageName.toLowerCase() === 'growth') capacity = 300;
        else if (packageName.toLowerCase() === 'pro') capacity = 1000;

        const baseUrl = window.location.origin + window.location.pathname;
        const refLink = `${baseUrl}?ref=${pData.referralCode}`;

        let html = `
        <div style="max-width: 900px; margin: 0 auto; color: #fff;">
            
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 20px; margin-bottom: 30px;">
                <div>
                    <h2 style="color: #10b981; font-size:24px; margin-bottom:5px;"><i class="fas fa-network-wired"></i> KliFox Partner Merkezi</h2>
                    <p style="color: #94a3b8; font-size: 0.9rem;">Operasyonel Ağınız: <b>Türkiye Geneli</b> (Bölge kısıtlaması yok)</p>
                </div>
                <div style="text-align:right;">
                    <span style="background:rgba(245, 158, 11, 0.2); color:#f59e0b; padding:5px 12px; border-radius:12px; font-size:12px; font-weight:bold; border:1px solid rgba(245, 158, 11, 0.5);">
                        Paket: ${packageName.toUpperCase()}
                    </span>
                </div>
            </div>

            <!-- REFERRAL LINK -->
            <div style="background: rgba(16, 185, 129, 0.05); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 12px; padding: 20px; margin-bottom: 30px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <div style="font-size:12px; color:#10b981; font-weight:bold; margin-bottom:5px;">DAVET LİNKİNİZ</div>
                    <div style="font-family:var(--font-mono); font-size:16px; color:#fff;">${refLink}</div>
                    <div style="font-size:11px; color:var(--text-muted); margin-top:5px;">Bu link ile kayıt olan tüm kullanıcılar ağınıza dahil olur.</div>
                </div>
                <button onclick="navigator.clipboard.writeText('${refLink}'); App.UI.toast('Başarılı', 'Davet linki kopyalandı.', 'success');" style="background:#10b981; color:#fff; border:none; padding:10px 20px; border-radius:8px; cursor:pointer; font-weight:bold;"><i class="fas fa-copy"></i> Kopyala</button>
            </div>

            <!-- STATS GRID -->
            <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:15px; margin-bottom:30px;">
                <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); padding:20px; border-radius:12px; text-align:center;">
                    <div style="color:var(--text-muted); font-size:12px; margin-bottom:5px;">Ağdaki Kullanıcılar</div>
                    <div style="font-size:24px; font-weight:bold; color:#fff;">${myUsers.length} <span style="font-size:12px; color:var(--text-muted);">/ ${capacity}</span></div>
                </div>
                <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); padding:20px; border-radius:12px; text-align:center;">
                    <div style="color:var(--text-muted); font-size:12px; margin-bottom:5px;">Ağdaki Ustalar</div>
                    <div style="font-size:24px; font-weight:bold; color:#fff;">${(pData.networkCraftsmen && pData.networkCraftsmen.length) || 0}</div>
                </div>
                <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); padding:20px; border-radius:12px; text-align:center;">
                    <div style="color:var(--text-muted); font-size:12px; margin-bottom:5px;">Operasyon Kazancı</div>
                    <div style="font-size:24px; font-weight:bold; color:#10b981;">${pData.earnings} ₺</div>
                    <div style="font-size:9px; color:var(--warning); margin-top:5px;">(Sanal Bakiye)</div>
                </div>
                <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); padding:20px; border-radius:12px; text-align:center;">
                    <div style="color:var(--text-muted); font-size:12px; margin-bottom:5px;">Dağıtılabilir Kredi</div>
                    <div style="font-size:24px; font-weight:bold; color:#3b82f6;">${pData.credits} ₺</div>
                    <div style="font-size:9px; color:var(--warning); margin-top:5px;">(Müşterilere Hediye Edilebilir)</div>
                </div>
            </div>

            <!-- NETWORK LIST -->
            <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); border-radius:12px; overflow:hidden;">
                <div style="padding:20px; border-bottom:1px solid rgba(255,255,255,0.05); display:flex; justify-content:space-between; align-items:center;">
                    <h3 style="font-size:16px; margin:0;"><i class="fas fa-users"></i> Ağınızdaki Kullanıcılar</h3>
                    <button onclick="App.UI.PartnerDash.giftCreditPrompt()" class="btn-demo" style="font-size:12px; padding:5px 15px;"><i class="fas fa-gift"></i> Kullanıcıya Kredi Hediye Et</button>
                </div>
                <div style="padding:0;">
                    <table style="width:100%; border-collapse:collapse; font-size:14px; text-align:left;">
                        <thead>
                            <tr style="background:rgba(0,0,0,0.2);">
                                <th style="padding:15px 20px; color:var(--text-muted); font-weight:normal; border-bottom:1px solid rgba(255,255,255,0.05);">Ad Soyad</th>
                                <th style="padding:15px 20px; color:var(--text-muted); font-weight:normal; border-bottom:1px solid rgba(255,255,255,0.05);">Bölge</th>
                                <th style="padding:15px 20px; color:var(--text-muted); font-weight:normal; border-bottom:1px solid rgba(255,255,255,0.05);">Katılım</th>
                                <th style="padding:15px 20px; color:var(--text-muted); font-weight:normal; border-bottom:1px solid rgba(255,255,255,0.05);">Aksiyon</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${myUsers.map(u => `
                            <tr>
                                <td style="padding:15px 20px; border-bottom:1px solid rgba(255,255,255,0.02);">
                                    <div style="display:flex; align-items:center; gap:10px;">
                                        <div style="width:30px; height:30px; border-radius:50%; background:#27272a; display:flex; align-items:center; justify-content:center; font-size:12px; color:#fff;">
                                            ${u.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div style="color:#fff;">${u.name}</div>
                                            <div style="font-size:11px; color:var(--text-muted);">${u.id}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style="padding:15px 20px; border-bottom:1px solid rgba(255,255,255,0.02); color:var(--text-muted);">${u.city}</td>
                                <td style="padding:15px 20px; border-bottom:1px solid rgba(255,255,255,0.02); color:var(--text-muted);">${u.date}</td>
                                <td style="padding:15px 20px; border-bottom:1px solid rgba(255,255,255,0.02);">
                                    <button class="btn-demo" style="font-size:11px; padding:5px 10px; margin-right:5px;" onclick="App.UI.toast('Bilgi', 'Arama özelliği MVP de kapalıdır', 'info')"><i class="fas fa-phone"></i></button>
                                    <button class="btn-demo" style="font-size:11px; padding:5px 10px; background:rgba(239,68,68,0.1); color:#ef4444;" onclick="App.UI.PartnerDash.removeUser('${u.id}')"><i class="fas fa-user-minus"></i> Ağdan Çıkar</button>
                                </td>
                            </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <!-- SUSPENDED USERS LIST -->
            <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); border-radius:12px; overflow:hidden; margin-top:30px;">
                <div style="padding:20px; border-bottom:1px solid rgba(255,255,255,0.05); display:flex; justify-content:space-between; align-items:center;">
                    <h3 style="font-size:16px; margin:0; color:#cbd5e1;"><i class="fas fa-user-clock"></i> Askıda Müşteriler (Partneri Olmayanlar)</h3>
                </div>
                <div style="padding:0;">
                    <table style="width:100%; border-collapse:collapse; font-size:14px; text-align:left;">
                        <thead>
                            <tr style="background:rgba(0,0,0,0.2);">
                                <th style="padding:15px 20px; color:var(--text-muted); font-weight:normal; border-bottom:1px solid rgba(255,255,255,0.05);">Ad Soyad</th>
                                <th style="padding:15px 20px; color:var(--text-muted); font-weight:normal; border-bottom:1px solid rgba(255,255,255,0.05);">Bölge</th>
                                <th style="padding:15px 20px; color:var(--text-muted); font-weight:normal; border-bottom:1px solid rgba(255,255,255,0.05);">Aksiyon</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${suspendedUsers.length === 0 ? '<tr><td colspan="3" style="padding:20px; text-align:center; color:var(--text-muted);">Askıda müşteri bulunmuyor.</td></tr>' : ''}
                            ${suspendedUsers.map(u => `
                            <tr>
                                <td style="padding:15px 20px; border-bottom:1px solid rgba(255,255,255,0.02);">
                                    <div style="color:#cbd5e1;">${u.name} <span style="font-size:10px; color:var(--text-muted); margin-left:5px;">(${u.id})</span></div>
                                </td>
                                <td style="padding:15px 20px; border-bottom:1px solid rgba(255,255,255,0.02); color:var(--text-muted);">${u.city}</td>
                                <td style="padding:15px 20px; border-bottom:1px solid rgba(255,255,255,0.02);">
                                    <button class="btn-demo" style="font-size:11px; padding:5px 10px; background:rgba(16,185,129,0.1); color:#10b981;" onclick="App.UI.PartnerDash.adoptUser('${u.id}')"><i class="fas fa-user-plus"></i> Ağıma Ekle</button>
                                </td>
                            </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div style="text-align:center; margin-top:30px; font-size:11px; color:var(--text-muted);">
                <i class="fas fa-shield-alt"></i> Müşteri tam adresleri ve detaylı finansal veriler güvenlik nedeniyle Partnerlere gizlenmiştir.
            </div>
        </div>
        `;
        
        target.innerHTML = html;
    },

    giftCreditPrompt() {
        const userId = prompt("Kredi Hediye Edilecek Kullanıcı ID'si (Örn: USR-9123):");
        if (!userId) return;
        
        const amount = prompt("Kaç TL kredi hediye edilecek?");
        if (!amount || isNaN(amount) || amount <= 0) return;
        
        const pData = App.State.data.userProfile.partnerData;
        if (pData.credits < amount) {
            App.UI.toast('Hata', 'Yeterli Partner Krediniz bulunmuyor.', 'danger');
            return;
        }

        // MVP Simulation
        pData.credits -= parseInt(amount);
        App.State.save();
        this.render();
        
        if (App.Adapters.Socket && App.Adapters.Socket.connected) {
            App.Adapters.Socket.emit('financial.gift_credit', {
                userId: userId,
                amount: parseInt(amount),
                partnerName: App.State.data.userProfile.name
            });
        }
        
        App.UI.toast('Başarılı', `Kullanıcıya ${amount} ₺ başarıyla hediye edildi!`, 'success');
    },

    adoptUser(userId) {
        const pData = App.State.data.userProfile.partnerData;
        let capacity = 100;
        if (pData.package.toLowerCase() === 'growth') capacity = 300;
        else if (pData.package.toLowerCase() === 'pro') capacity = 1000;

        if (pData.networkUsers.length >= capacity) {
            App.UI.toast('Kapasite Sınırı', `Mevcut paketiniz (${pData.package}) maksimum ${capacity} kullanıcı barındırabilir. Lütfen paketinizi yükseltin.`, 'danger');
            return;
        }

        const idx = App.State.data.suspendedUsers.findIndex(u => u.id === userId);
        if (idx !== -1) {
            const u = App.State.data.suspendedUsers.splice(idx, 1)[0];
            pData.networkUsers.push(u);
            App.State.save();
            App.UI.toast('Başarılı', `${u.name} başarıyla ağınıza eklendi.`, 'success');
            this.render();
        }
    },

    removeUser(userId) {
        if(!confirm("Kullanıcıyı ağınızdan çıkarmak istediğinize emin misiniz? (Kullanıcı askıda müşteriler havuzuna geri dönecektir)")) return;
        
        const pData = App.State.data.userProfile.partnerData;
        const idx = pData.networkUsers.findIndex(u => u.id === userId);
        if (idx !== -1) {
            const u = pData.networkUsers.splice(idx, 1)[0];
            if (!App.State.data.suspendedUsers) App.State.data.suspendedUsers = [];
            App.State.data.suspendedUsers.push(u);
            App.State.save();
            App.UI.toast('Bilgi', `${u.name} ağınızdan çıkarıldı.`, 'warning');
            this.render();
        }
    }
};

