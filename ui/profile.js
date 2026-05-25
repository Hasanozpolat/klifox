App.UI.Profile = {
    render() {
        const target = document.getElementById('view-profile');
        if (!target) return;

        const p = App.State.data.userProfile || {};
        const isUsta = p.role === 'craftsman';

        let html = `
        <div class="wallet-dashboard" style="max-width: 600px; margin: 0 auto;">
            <div class="dashboard-header" style="border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 15px; margin-bottom: 25px;">
                <h2 style="color: #60a5fa;"><i class="fas fa-id-badge"></i> Profil Ayarları</h2>
                <p style="color: #94a3b8; font-size: 0.9rem;">Hesap bilgilerinizi ve görünümünüzü buradan yönetebilirsiniz.</p>
            </div>
            
            <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; padding: 25px;">
                <div style="text-align:center; margin-bottom: 30px;">
                    <div style="position:relative; display:inline-block;">
                        <img id="profile-avatar-preview" src="${p.avatar || 'https://i.pravatar.cc/150?u=' + (p.id || 'new')}" style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 4px solid #3b82f6; box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);">
                        <button onclick="document.getElementById('avatar-file-input').click()" style="position:absolute; bottom: 0; right: 0; background: #3b82f6; color: white; border: none; border-radius: 50%; width: 36px; height: 36px; cursor: pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.3);"><i class="fas fa-camera"></i></button>
                        <input type="file" id="avatar-file-input" accept="image/*" style="display:none;" onchange="App.UI.Profile.handleAvatarUpload(this)">
                    </div>
                </div>

                <div class="form-group" style="margin-bottom: 20px; display:none;">
                    <input type="hidden" id="avatar-url-input" value="${p.avatar || ''}">
                </div>

                <div class="form-group" style="margin-bottom: 20px;">
                    <label style="display:block; color:#cbd5e1; margin-bottom:8px; font-size:0.9rem;">Ad Soyad</label>
                    <input type="text" id="profile-name-input" class="modern-input" value="${p.name || ''}" style="width:100%; padding:12px; border-radius:8px; background:rgba(0,0,0,0.2); border:1px solid rgba(255,255,255,0.1); color:#fff;">
                </div>
                
                <div class="form-group" style="margin-bottom: 20px;">
                    <label style="display:block; color:#cbd5e1; margin-bottom:8px; font-size:0.9rem;">Telefon Numarası</label>
                    <input type="text" id="profile-phone-input" class="modern-input" value="${p.phone || ''}" style="width:100%; padding:12px; border-radius:8px; background:rgba(0,0,0,0.2); border:1px solid rgba(255,255,255,0.1); color:#fff;">
                </div>
        `;

        if (isUsta) {
            html += `
                <div class="form-group" style="margin-bottom: 20px;">
                    <label style="display:block; color:#f59e0b; margin-bottom:8px; font-size:0.9rem;"><i class="fas fa-building"></i> Şirket / Servis Adı</label>
                    <input type="text" id="profile-company-input" class="modern-input" value="${p.company || ''}" style="width:100%; padding:12px; border-radius:8px; background:rgba(245, 158, 11, 0.05); border:1px solid rgba(245, 158, 11, 0.3); color:#fff;">
                </div>
                <div class="form-group" style="margin-bottom: 25px;">
                    <label style="display:block; color:#f59e0b; margin-bottom:8px; font-size:0.9rem;"><i class="fas fa-map-marker-alt"></i> Hizmet Bölgeleri (Birden Fazla İlçe Seçebilirsiniz)</label>
                    
                    <div style="display:flex; gap:10px; margin-bottom:10px;">
                        <select id="profile-city-select" style="flex:1; padding:12px; border-radius:8px; background:rgba(245, 158, 11, 0.05); border:1px solid rgba(245, 158, 11, 0.3); color:#fff;" onchange="App.UI.Profile.updateDistrictCheckboxes()">
                            <option value="">İl Seçiniz</option>
                            ${Object.keys(App.Data.Locations || {}).sort().map(city => {
                                const selectedCity = p.region ? p.region.split(':')[0].trim() : '';
                                return `<option value="${city}" ${city === selectedCity ? 'selected' : ''}>${city}</option>`;
                            }).join('')}
                        </select>
                    </div>
                    
                    <div id="profile-districts-container" style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; max-height:200px; overflow-y:auto; padding:10px; background:rgba(0,0,0,0.2); border-radius:8px; border:1px solid rgba(255,255,255,0.05);">
                        <div style="color:var(--text-muted); font-size:12px; grid-column:span 2; text-align:center;">Önce il seçiniz.</div>
                    </div>
                    
                    <input type="hidden" id="profile-region-input" value="${p.region || ''}">
                </div>
            `;
        }

        html += `
                <button onclick="App.UI.Profile.save()" style="width:100%; padding:15px; background:linear-gradient(135deg, #3b82f6, #2563eb); color:#fff; border:none; border-radius:12px; font-weight:bold; font-size:1.1rem; cursor:pointer; box-shadow:0 8px 15px rgba(59,130,246,0.3); margin-bottom: 15px;"><i class="fas fa-save"></i> Değişiklikleri Kaydet</button>
                <button onclick="App.UI.Auth.logout()" style="width:100%; padding:15px; background:rgba(239, 68, 68, 0.1); color:#ef4444; border:1px solid rgba(239, 68, 68, 0.3); border-radius:12px; font-weight:bold; font-size:1.1rem; cursor:pointer;"><i class="fas fa-sign-out-alt"></i> Çıkış Yap</button>
            </div>
        `;

        if (!isUsta) {
            html += `
            <div style="margin-top:20px; text-align:center; padding: 20px; background: rgba(16, 185, 129, 0.05); border: 1px dashed rgba(16, 185, 129, 0.3); border-radius: 12px;">
                <p style="color: #94a3b8; font-size: 0.9rem; margin-bottom: 15px;">Usta (Hizmet Veren) olarak KliFox ağına katılmak ister misiniz?</p>
                <button onclick="App.UI.CraftsmanOnboarding.render()" style="background: #10b981; color: white; padding: 10px 20px; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;"><i class="fas fa-toolbox"></i> Usta Olarak Başvur</button>
            </div>
            `;
        }
        
        const isPartner = p.role === 'partner';
        if (!isPartner && !isUsta) {
            html += `
            <div style="margin-top:20px; text-align:center; padding: 20px; background: rgba(245, 158, 11, 0.05); border: 1px dashed rgba(245, 158, 11, 0.3); border-radius: 12px;">
                <p style="color: #94a3b8; font-size: 0.9rem; margin-bottom: 15px;">KliFox ekosisteminden pay almak ve ağınızı kurmak ister misiniz?</p>
                <button onclick="App.UI.PartnerOnboarding.render()" style="background: #f59e0b; color: black; padding: 10px 20px; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;"><i class="fas fa-handshake"></i> KliFox Partner Ol</button>
            </div>
            `;
        }

        if (isUsta || isPartner) {
            html += `
            <div style="margin-top:20px; text-align:center; padding: 20px; background: rgba(255, 255, 255, 0.02); border: 1px dashed rgba(255, 255, 255, 0.1); border-radius: 12px;">
                <p style="color: #94a3b8; font-size: 0.9rem; margin-bottom: 15px;">Standart müşteri arayüzüne dönmek mi istiyorsunuz?</p>
                <button onclick="App.UI.Profile.revertToCustomer()" style="background: transparent; border: 1px solid #cbd5e1; color: #cbd5e1; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: bold;"><i class="fas fa-user"></i> Müşteri Hesabına Dön</button>
            </div>
            `;
        }

        html += `</div>`;
        target.innerHTML = html;
        
        if (isUsta) {
            setTimeout(() => this.updateDistrictCheckboxes(), 50);
        }
    },

    save() {
        if (!App.State.data.userProfile) App.State.data.userProfile = {};
        const p = App.State.data.userProfile;
        
        p.name = document.getElementById('profile-name-input').value;
        p.phone = document.getElementById('profile-phone-input').value;
        
        const avatarInput = document.getElementById('avatar-url-input').value;
        if (avatarInput.trim() !== '') {
            p.avatar = avatarInput;
        }

        if (p.role === 'craftsman') {
            p.company = document.getElementById('profile-company-input').value;
            
            const city = document.getElementById('profile-city-select').value;
            const cbNodes = document.querySelectorAll('.district-cb:checked');
            const dists = Array.from(cbNodes).map(n => n.value);
            
            if (city && dists.length > 0) {
                p.region = `${city}: ${dists.join(', ')}`;
            } else {
                p.region = 'Tüm Bölgeler';
            }
        }

        App.State.save();
        App.UI.syncRoleLayouts();
        App.UI.toast('Başarılı', 'Profil bilgileriniz güncellendi.', 'success');
        
        // Yeniden render et
        this.render();
    },

    updateDistrictCheckboxes() {
        const city = document.getElementById('profile-city-select').value;
        const container = document.getElementById('profile-districts-container');
        if (!city || !App.Data.Locations[city]) {
            container.innerHTML = '<div style="color:var(--text-muted); font-size:12px; grid-column:span 2; text-align:center;">Önce il seçiniz.</div>';
            return;
        }

        const districts = App.Data.Locations[city].sort();
        // pre-check if we had them
        const existingInput = document.getElementById('profile-region-input').value || '';
        const selectedDistricts = existingInput.split(':').length > 1 ? existingInput.split(':')[1].split(',').map(s=>s.trim()) : [];
        
        container.innerHTML = districts.map(d => {
            const isChecked = selectedDistricts.includes(d) ? 'checked' : '';
            return `<label style="color:#fff; font-size:13px; display:flex; align-items:center; gap:8px;">
                <input type="checkbox" class="district-cb" value="${d}" ${isChecked} style="accent-color:#f59e0b; width:16px; height:16px;"> ${d}
            </label>`;
        }).join('');
    },

    handleAvatarUpload(input) {
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('profile-avatar-preview').src = e.target.result;
                document.getElementById('avatar-url-input').value = e.target.result;
            };
            reader.readAsDataURL(input.files[0]);
        }
    },

    revertToCustomer() {
        if (!App.State.data.userProfile) return;
        App.State.data.userProfile.role = 'customer';
        App.State.save();
        App.UI.syncRoleLayouts();
        App.UI.toast('Bilgi', 'Müşteri profiline geçiş yapıldı.', 'info');
        this.render();
    }
};

