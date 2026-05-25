App.UI.PartnerOnboarding = {
    render() {
        this.renderStep1();
    },

    renderStep1() {
        const html = `
        <div class="onboarding-flow" style="display:flex; justify-content:center; align-items:center; min-height:100%; background:var(--bg-main); padding: 40px; overflow-y:auto;">
            <div style="background:var(--bg-sec); padding:30px; border-radius:16px; max-width:800px; width:100%; border:1px solid rgba(255,255,255,0.05); box-shadow: 0 10px 40px rgba(0,0,0,0.5);">
                <div style="font-size:12px; color:var(--text-muted); margin-bottom:10px;">ADIM 1/2</div>
                <h2 style="color:#fff; margin-bottom:10px; font-weight:700;"><i class="fas fa-handshake" style="color:#f59e0b;"></i> KliFox Partner Ağına Katılın</h2>
                <p style="color:var(--text-muted); font-size:14px; margin-bottom:25px; line-height:1.6;">Operasyonel büyüme katmanımıza katılarak ağınızı kurun, kendi kitlenizi yönetin ve ekosistem gelirlerinden pay alın.</p>
                
                <div style="display:flex; flex-direction:column; gap:15px; margin-bottom:25px;">
                    <input type="text" id="partner-name" placeholder="Ad Soyad veya Kurum Adı" style="width:100%; padding:15px; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.1); border-radius:12px; color:#fff; font-size:14px; outline:none;" value="${(App.State.data.userProfile && App.State.data.userProfile.name) ? App.State.data.userProfile.name : ''}">
                    <input type="text" id="partner-phone" placeholder="Cep Telefonu Numaranız" style="width:100%; padding:15px; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.1); border-radius:12px; color:#fff; font-size:14px; outline:none;" value="${(App.State.data.userProfile && App.State.data.userProfile.phone) ? App.State.data.userProfile.phone : ''}">
                </div>

                <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:20px; margin-bottom:30px;">
                    <!-- Starter -->
                    <div class="partner-pack" onclick="App.UI.PartnerOnboarding.selectPackage('starter', 3000)" style="cursor:pointer; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:20px; text-align:center; transition:0.2s;">
                        <h3 style="color:#fff; margin-bottom:5px;">Starter</h3>
                        <div style="color:var(--text-muted); font-size:12px; margin-bottom:15px;">100 Üye Kapasitesi</div>
                        <div style="font-size:24px; font-weight:bold; color:#f59e0b; margin-bottom:15px;">3.000 ₺</div>
                        <ul style="list-style:none; padding:0; margin:0; text-align:left; font-size:12px; color:var(--text-muted); display:flex; flex-direction:column; gap:8px;">
                            <li><i class="fas fa-check" style="color:var(--success);"></i> Referans Linki</li>
                            <li><i class="fas fa-check" style="color:var(--success);"></i> Temel Dashboard</li>
                        </ul>
                    </div>
                    
                    <!-- Growth -->
                    <div class="partner-pack" onclick="App.UI.PartnerOnboarding.selectPackage('growth', 5000)" style="cursor:pointer; background:rgba(245, 158, 11, 0.1); border:1px solid rgba(245, 158, 11, 0.5); border-radius:12px; padding:20px; text-align:center; transition:0.2s; position:relative;">
                        <div style="position:absolute; top:-10px; left:50%; transform:translateX(-50%); background:#f59e0b; color:#000; font-size:10px; font-weight:bold; padding:4px 10px; border-radius:12px;">POPÜLER</div>
                        <h3 style="color:#fff; margin-bottom:5px;">Growth</h3>
                        <div style="color:var(--text-muted); font-size:12px; margin-bottom:15px;">300 Üye Kapasitesi</div>
                        <div style="font-size:24px; font-weight:bold; color:#f59e0b; margin-bottom:15px;">5.000 ₺</div>
                        <ul style="list-style:none; padding:0; margin:0; text-align:left; font-size:12px; color:var(--text-muted); display:flex; flex-direction:column; gap:8px;">
                            <li><i class="fas fa-check" style="color:var(--success);"></i> Referans Linki</li>
                            <li><i class="fas fa-check" style="color:var(--success);"></i> Gelişmiş Dashboard</li>
                            <li><i class="fas fa-check" style="color:var(--success);"></i> Kredi Dağıtımı</li>
                        </ul>
                    </div>

                    <!-- Pro -->
                    <div class="partner-pack" onclick="App.UI.PartnerOnboarding.selectPackage('pro', 10000)" style="cursor:pointer; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:20px; text-align:center; transition:0.2s;">
                        <h3 style="color:#fff; margin-bottom:5px;">Pro</h3>
                        <div style="color:var(--text-muted); font-size:12px; margin-bottom:15px;">1000 Üye Kapasitesi</div>
                        <div style="font-size:24px; font-weight:bold; color:#f59e0b; margin-bottom:15px;">10.000 ₺</div>
                        <ul style="list-style:none; padding:0; margin:0; text-align:left; font-size:12px; color:var(--text-muted); display:flex; flex-direction:column; gap:8px;">
                            <li><i class="fas fa-check" style="color:var(--success);"></i> Limitsiz Ağ Yönetimi</li>
                            <li><i class="fas fa-check" style="color:var(--success);"></i> Operasyonel Destek</li>
                        </ul>
                    </div>
                </div>

                <div style="text-align:right;">
                    <button onclick="App.UI.Profile.render()" class="btn-demo">İptal</button>
                </div>
            </div>
        </div>
        <style>
            .partner-pack:hover { transform: translateY(-5px); box-shadow: 0 5px 15px rgba(245,158,11,0.2); }
        </style>
        `;
        document.getElementById('view-profile').innerHTML = html;
        document.querySelector('.side-nav').style.display = 'none'; // Hide sidebar during onboarding
    },

    selectPackage(pkgName, price) {
        const nameNode = document.getElementById('partner-name');
        const phoneNode = document.getElementById('partner-phone');
        
        if(!nameNode || !phoneNode || !nameNode.value || !phoneNode.value) {
            App.UI.toast('Hata', 'Lütfen ad soyad ve telefon bilgilerinizi giriniz.', 'danger');
            return;
        }

        this.selectedPackage = { 
            name: pkgName, 
            price: price,
            uName: nameNode.value,
            uPhone: phoneNode.value
        };
        this.renderStep2();
    },

    renderStep2() {
        const html = `
        <div class="onboarding-flow" style="display:flex; justify-content:center; align-items:center; min-height:100%; background:var(--bg-main); padding: 40px;">
            <div style="background:var(--bg-sec); padding:30px; border-radius:16px; max-width:600px; width:100%; border:1px solid rgba(255,255,255,0.05); box-shadow: 0 10px 40px rgba(0,0,0,0.5);">
                <div style="font-size:12px; color:var(--text-muted); margin-bottom:10px;">ADIM 2/2</div>
                <h2 style="color:#fff; margin-bottom:10px; font-weight:700;"><i class="fas fa-file-signature" style="color:#f59e0b;"></i> Partner Sözleşmesi</h2>
                <p style="color:var(--text-muted); font-size:14px; margin-bottom:25px; line-height:1.6;">KliFox Partner Ağına katılmak için yasal sözleşmeyi onaylamanız gerekmektedir.</p>
                
                <div style="background:rgba(0,0,0,0.3); padding:15px; border-radius:8px; height:150px; overflow-y:auto; font-size:12px; color:var(--text-muted); margin-bottom:20px; line-height:1.5;">
                    <b>1. Operasyonel Kurallar:</b> Partnerler sistemdeki kullanıcıların iletişim bilgilerine sadece hizmet kalitesini artırmak amacıyla erişebilir. <br><br>
                    <b>2. Gizlilik:</b> Müşterilerin açık adresleri ve platformun global finansal verileri gizlidir. Partnerler yalnızca kendi ağlarını (network) görüntüleyebilir.<br><br>
                    <b>3. Ödemeler:</b> Partnerler, ağlarında gerçekleşen başarılı operasyonlardan %8 komisyon kazancı ve %2 dağıtılabilir kredi elde ederler. (MVP sürecinde bu kazançlar sanal bakiyedir).<br><br>
                    <b>4. Etik Kurallar:</b> Sistemin manipüle edilmesi veya kötüye kullanımı durumunda partner hesabı sonlandırılır.
                </div>

                <label style="display:flex; align-items:flex-start; gap:10px; cursor:pointer; margin-bottom:25px;">
                    <input type="checkbox" id="partner-agreement" style="margin-top:3px;">
                    <span style="font-size:13px; color:#fff;">KliFox Partner Sözleşmesi'ni ve Gizlilik Politikası'nı okudum, anladım ve kabul ediyorum.</span>
                </label>

                <div style="display:flex; gap:10px;">
                    <button onclick="App.UI.PartnerOnboarding.renderStep1()" class="btn-demo" style="flex:1;"><i class="fas fa-arrow-left"></i> Geri</button>
                    <button onclick="App.UI.PartnerOnboarding.completeUpgrade()" class="btn-main" style="flex:2; background:#f59e0b; color:#000;">Onayla ve Partner Ol <i class="fas fa-check"></i></button>
                </div>
            </div>
        </div>
        `;
        document.getElementById('view-profile').innerHTML = html;
    },

    completeUpgrade() {
        const agreementNode = document.getElementById('partner-agreement');
        if(!agreementNode || !agreementNode.checked) {
            App.UI.toast('Hata', 'Lütfen sözleşmeyi onaylayın.', 'danger');
            return;
        }

        if (!App.State.data.userProfile) {
            App.State.data.userProfile = {
                id: 'U-' + Math.floor(Math.random()*100000),
                name: this.selectedPackage.uName,
                phone: this.selectedPackage.uPhone,
                role: 'customer' // Keep as customer initially
            };
            App.State.data.onboardingComplete = true;
            App.State.data.activeUserId = App.State.data.userProfile.id;
        }

        const up = App.State.data.userProfile;
        up.name = this.selectedPackage.uName;
        up.phone = this.selectedPackage.uPhone;
        up.pendingRole = 'partner';
        up.designation = 'KliFox Partner Adayı';
        up.approved = false;
        
        // Setup Partner Data
        up.partnerData = {
            level: this.selectedPackage.name,
            referralCode: 'PRT-' + Math.floor(Math.random()*90000 + 10000),
            earnings: 0,
            credits: 0,
            networkUsers: []
        };

        App.State.save();
        
        // Notify backend about new user if socket connected
        if (App.Adapters.Socket && App.Adapters.Socket.connected) {
            App.Adapters.Socket.emit('admin.sync_request', { type: 'users' });
        }

        App.UI.toast('Başvuru Alındı', `Başvurunuz admin onayına iletildi. Onaylandıktan sonra Partner Merkezi'ne erişebileceksiniz.`, 'success');
        
        // Return to customer dashboard for now
        App.UI.syncRoleLayouts();
        App.UI.Operations.render();
    }
};
