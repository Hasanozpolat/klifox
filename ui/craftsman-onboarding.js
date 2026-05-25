App.UI.CraftsmanOnboarding = {
    render() {
        this.renderStep1();
    },

    renderStep1() {
        const uName = (App.State.data.userProfile && App.State.data.userProfile.name) ? App.State.data.userProfile.name : '';
        const html = `
        <div class="onboarding-flow" style="display:flex; justify-content:center; align-items:center; height:100%; background:var(--bg-main); padding: 40px;">
            <div style="background:var(--bg-sec); padding:30px; border-radius:16px; max-width:600px; width:100%; border:1px solid rgba(255,255,255,0.05); box-shadow: 0 10px 40px rgba(0,0,0,0.5);">
                <div style="font-size:12px; color:var(--text-muted); margin-bottom:10px;">ADIM 1/2</div>
                <h2 style="color:#fff; margin-bottom:10px; font-weight:700;"><i class="fas fa-id-card" style="color:var(--accent);"></i> Temel Bilgiler</h2>
                <p style="color:var(--text-muted); font-size:14px; margin-bottom:25px; line-height:1.6;">Lütfen işletme ve iletişim bilgilerinizi giriniz. Müşterileriniz sizi bu isimle görecektir.</p>
                
                <div style="display:flex; flex-direction:column; gap:15px; margin-bottom:25px;">
                    <input type="text" id="reg-name" placeholder="Ad Soyad veya Firma Adı" style="width:100%; padding:15px; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.1); border-radius:12px; color:#fff; font-size:14px; outline:none;" value="${uName}">
                    
                    <input type="text" id="reg-phone" placeholder="Cep Telefonu Numaranız" style="width:100%; padding:15px; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.1); border-radius:12px; color:#fff; font-size:14px; outline:none;">
                    
                    <select id="reg-city" style="width:100%; padding:15px; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.1); border-radius:12px; color:#fff; font-size:14px; outline:none;" onchange="App.UI.CraftsmanOnboarding.updateDistricts()">
                        <option value="" disabled selected>Hizmet Verilecek İli Seçin</option>
                        ${Object.keys(App.Data.Locations || {}).sort().map(city => `<option value="${city}">${city}</option>`).join('')}
                    </select>
                    
                    <div id="reg-districts-container" style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; max-height:200px; overflow-y:auto; padding:15px; background:rgba(0,0,0,0.3); border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <div style="color:var(--text-muted); font-size:12px; grid-column:span 2; text-align:center;">Önce il seçiniz.</div>
                    </div>
                </div>

                <button onclick="App.UI.CraftsmanOnboarding.renderStep2()" class="btn-main">Devam Et <i class="fas fa-arrow-right"></i></button>
            </div>
        </div>
        `;
        document.getElementById('view-profile').innerHTML = html;
    },

    updateDistricts() {
        const city = document.getElementById('reg-city').value;
        const container = document.getElementById('reg-districts-container');
        if (!city || !App.Data.Locations[city]) return;
        
        const districts = App.Data.Locations[city].sort();
        container.innerHTML = districts.map(d => `
            <label style="color:#fff; font-size:13px; display:flex; align-items:center; gap:8px;">
                <input type="checkbox" class="reg-district-cb" value="${d}" style="accent-color:#f59e0b; width:16px; height:16px;"> ${d}
            </label>
        `).join('');
    },

    renderStep2() {
        const nameNode = document.getElementById('reg-name');
        const cityNode = document.getElementById('reg-city');
        const phoneNode = document.getElementById('reg-phone');
        const cbNodes = document.querySelectorAll('.reg-district-cb:checked');
        const dists = Array.from(cbNodes).map(n => n.value);
        
        if(!nameNode || !cityNode || !phoneNode || !nameNode.value || !cityNode.value || !phoneNode.value || dists.length === 0) {
            App.UI.toast('Hata', 'Lütfen tüm zorunlu alanları doldurun ve en az bir ilçe seçin.', 'danger');
            return;
        }

        // Store temp data
        this.tempData = {
            name: nameNode.value,
            district: `${cityNode.value}: ${dists.join(', ')}`,
            phone: phoneNode.value
        };

        const html = `
        <div class="onboarding-flow" style="display:flex; justify-content:center; align-items:center; height:100%; background:var(--bg-main); padding: 40px;">
            <div style="background:var(--bg-sec); padding:30px; border-radius:16px; max-width:600px; width:100%; border:1px solid rgba(255,255,255,0.05); box-shadow: 0 10px 40px rgba(0,0,0,0.5);">
                <div style="font-size:12px; color:var(--text-muted); margin-bottom:10px;">ADIM 2/2</div>
                <h2 style="color:#fff; margin-bottom:10px; font-weight:700;"><i class="fas fa-mobile-alt" style="color:var(--accent);"></i> Telefon Doğrulaması</h2>
                <p style="color:var(--text-muted); font-size:14px; margin-bottom:25px; line-height:1.6;"><b>${this.tempData.phone}</b> numaralı telefona gönderilen 6 haneli doğrulama kodunu giriniz. (Test için 123456 giriniz)</p>
                
                <div style="display:flex; flex-direction:column; gap:15px; margin-bottom:25px;">
                    <input type="text" id="reg-sms" placeholder="SMS Kodu" maxlength="6" style="text-align:center; letter-spacing:8px; width:100%; padding:15px; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.1); border-radius:12px; color:#fff; font-size:24px; outline:none; font-family:var(--font-mono);">
                </div>

                <div style="display:flex; gap:10px;">
                    <button onclick="App.UI.CraftsmanOnboarding.renderStep1()" class="btn-demo" style="flex:1;"><i class="fas fa-arrow-left"></i> Geri</button>
                    <button onclick="App.UI.CraftsmanOnboarding.completeUpgrade()" class="btn-main" style="flex:2;">Doğrula ve Ağa Bağlan <i class="fas fa-check"></i></button>
                </div>
            </div>
        </div>
        `;
        document.getElementById('view-profile').innerHTML = html;
    },

    completeUpgrade() {
        const smsNode = document.getElementById('reg-sms');
        if(!smsNode || smsNode.value !== '123456') {
            App.UI.toast('Hata', 'Geçersiz SMS kodu. Lütfen 123456 giriniz.', 'danger');
            return;
        }

        const data = this.tempData;

        if (!App.State.data.userProfile) {
            App.State.data.userProfile = {
                id: 'U-' + Math.floor(Math.random()*100000),
                name: data.name,
                role: 'craftsman'
            };
            App.State.data.onboardingComplete = true;
            App.State.data.activeUserId = App.State.data.userProfile.id;
        }

        const newCraftsman = {
            id: App.State.data.userProfile.id,
            name: data.name,
            company: 'KliFox Ustası',
            district: data.district,
            phone: data.phone,
            rating: 5.0,
            reviews: 0,
            status: 'online', // Important for availability toggle
            verified: true,
            avatar: 'https://i.pravatar.cc/150?u=' + App.State.data.userProfile.id
        };
        
        App.DB.Craftsmen.push(newCraftsman);

        App.State.data.userProfile.role = 'craftsman';
        App.State.data.userProfile.designation = 'Saha Ustası';
        App.State.data.userProfile.district = data.district;
        App.State.data.userProfile.approved = true; // Auto-approved for testing
        App.State.save();

        App.UI.toast('Tebrikler', 'Başvurunuz otomatik olarak onaylandı. Artık Saha Ustasısınız!', 'success');
        
        // Return side nav
        document.querySelector('.side-nav').style.display = 'flex';
        App.UI.syncRoleLayouts();
    }
};
