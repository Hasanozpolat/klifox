App.UI.Onboarding = {
    role: null,
    start() {
        const onboardingView = document.getElementById('view-onboarding');
        const sideNav = document.querySelector('.side-nav');
        if (sideNav) sideNav.style.display = 'none';

        document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
        onboardingView.classList.add('active');
        onboardingView.style.zIndex = 9999;
        
        this.renderStep1();
    },
    
    renderStep1() {
        const reviewsHTML = `
        <div class="reviews-marquee">
            <div class="rm-track">
                <div class="rm-card"><div class="rm-stars">★★★★★</div><p>"AI asistan 5 dakika içinde usta yolladı. Harika teknoloji."</p><span>- Selin T. / Kadıköy</span></div>
                <div class="rm-card"><div class="rm-stars">★★★★★</div><p>"Usta çok temiz çalıştı. KliFox sistemi mükemmel çalışıyor."</p><span>- Burak Y. / Şahinbey</span></div>
                <div class="rm-card"><div class="rm-stars">★★★★☆</div><p>"Referansımla 750₺ kazandım, yeni nesil bir deneyim."</p><span>- Emre K. / Şehitkamil</span></div>
                <div class="rm-card"><div class="rm-stars">★★★★★</div><p>"Yaz sıcağında klimam bozuldu, 1 saatte geldiler. İnanılmaz."</p><span>- Ayşe C. / Maltepe</span></div>
            </div>
        </div>
        `;

        const html = `
            <div class="ob-container">
                <div class="ob-step cinematic-intro active">
                    <i class="fas fa-satellite-dish pulse-icon ob-logo"></i>
                    <h1 class="ob-title">KliFox AI Eko-Sistemi</h1>
                    <p class="ob-desc">Türkiye'nin ilk otonom iklimlendirme ve servis ağ platformuna bağlanıyorsunuz.</p>
                    
                    <div class="ob-stats-grid">
                        <div class="ob-stat"><span>Aktif Saha Ekibi</span><strong>104</strong></div>
                        <div class="ob-stat"><span>Son 24H Servis</span><strong>128 İşlem</strong></div>
                        <div class="ob-stat"><span>Ağ Güven Oranı</span><strong>%98.4</strong></div>
                    </div>
                    
                    ${reviewsHTML}

                    <div style="margin-top: 30px;">
                        <button class="btn-main" onclick="App.UI.Onboarding.renderStep2()">Platforma Giriş Yap <i class="fas fa-arrow-right"></i></button>
                    </div>
                </div>
            </div>
        `;
        document.getElementById('view-onboarding').innerHTML = html;
        if(App.Engine.Audio) App.Engine.Audio.play('notification');
    },

    renderStep2() {
        const html = `
            <div class="ob-container">
                <div class="ob-step role-selection active">
                    <h2 class="ob-title">Uygulamaya Giriş Yapın</h2>
                    <div class="ob-role-cards ob-4-grid">
                        <div class="ob-card" onclick="App.UI.Onboarding.renderStep3('customer')">
                            <i class="fas fa-user-astronaut"></i>
                            <h3>Müşteri (Hizmet Al)</h3>
                            <p>Anında otonom tesisat ve onarım hizmeti çağırın.</p>
                        </div>
                        <div class="ob-card" onclick="App.UI.Onboarding.renderStep3('craftsman')">
                            <i class="fas fa-tools"></i>
                            <h3>Saha Ekibi (Usta)</h3>
                            <p>KliFox ağından otonom iş almak için kayıt olun.</p>
                        </div>
                        <div class="ob-card" onclick="App.UI.Onboarding.renderStep3('admin')" style="border-color:var(--danger); background:rgba(239, 68, 68, 0.05);">
                            <i class="fas fa-building text-danger"></i>
                            <h3>Sistem Yöneticisi</h3>
                            <p>Ağı yönetmek için yetkili girişi sağlayın.</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.getElementById('view-onboarding').innerHTML = html;
    },

    renderStep3(role) {
        this.role = role;
        let inputsHtml = '';
        if (role === 'customer') {
            inputsHtml += `<input type="text" id="ob-name" placeholder="Adınız Soyadınız">`;
        } else if (role === 'craftsman') {
            inputsHtml += `<input type="text" id="ob-name" placeholder="Ad Soyad / Firma Adı">`;
        } else if (role === 'admin') {
            inputsHtml += `<input type="text" id="ob-name" placeholder="Operatör Kodu / Ad">`;
            inputsHtml += `<select id="ob-district" style="border-color:var(--danger);">
                <option value="Super Admin">Bölge Yöneticisi</option>
                <option value="Dispatch Operator">Operasyon İzleme Merkezi</option>
            </select>`;
        }

        const btnColor = role==='admin' ? 'background:var(--danger);' : '';
        const html = `
            <div class="ob-container">
                <div class="ob-step form-step active">
                    <h2 class="ob-title">Hızlı Kayıt</h2>
                    <p class="ob-desc">Devam etmek için bilgilerinizi doğrulayın.</p>
                    <div class="ob-form">
                        ${inputsHtml}
                        <button class="btn-main" style="${btnColor}" onclick="App.UI.Onboarding.complete()">İlerle <i class="fas fa-check"></i></button>
                    </div>
                </div>
            </div>
        `;
        document.getElementById('view-onboarding').innerHTML = html;
        setTimeout(() => { const n = document.getElementById('ob-name'); if(n) n.focus(); }, 100);
    },

    complete() {
        const nameInput = document.getElementById('ob-name');
        const name = nameInput ? nameInput.value.trim() : 'Ziyaretçi';
        const district = document.getElementById('ob-district') ? document.getElementById('ob-district').value : '';

        if ((!name || name === 'Ziyaretçi') && this.role !== 'admin') {
            App.UI.toast('Uyarı', 'Lütfen geçerli bir ad ve soyad giriniz.', 'warning');
            return;
        }

        const p = {
            id: 'U-' + Math.floor(Math.random()*100000),
            name: name,
            role: this.role,
            designation: this.role === 'admin' ? district : undefined,
            refCode: name.substring(0,4).toUpperCase() + '-KLF88',
            location: district,
            wallet: { balance: 0, pending: 0, transactions: [] },
            referrals: { invitedCount: 0, validServices: 0 },
            gamification: { level: 1, badges: [] }
        };

        if (this.role === 'craftsman') p.wallet.balance = 10000;
        
        if (App.State.data.pendingReferral) {
            p.referredBy = App.State.data.pendingReferral;
            App.State.data.pendingReferral = null;
            
            // Notify the partner in real-time
            if (App.Adapters.EventBus) {
                App.Adapters.EventBus.emit('referral.new_member', {
                    partnerCode: p.referredBy,
                    user: {
                        id: p.id,
                        name: p.name,
                        city: p.location,
                        date: new Date().toLocaleDateString('tr-TR')
                    }
                });
            }
        }

        App.State.data.activeUserId = p.id;
        App.State.data.userProfile = p;
        App.State.data.onboardingComplete = true;
        App.State.save();

        document.querySelector('.side-nav').style.display = 'flex';
        
        if (this.role === 'craftsman') {
            App.UI.CraftsmanOnboarding.render();
            document.querySelector('.side-nav').style.display = 'none'; // hide until complete
        } else {
            document.getElementById('view-onboarding').classList.remove('active');
            App.UI.syncRoleLayouts();
            App.UI.toast('Hoş Geldiniz', `${p.role==='admin'?'Yönetici Girişi':'Sisteme Kaydınız'} başarılı.`, 'success');
        }
    }
};
