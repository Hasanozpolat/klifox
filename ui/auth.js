App.UI.Auth = {
    init() {
        // Ensure local user DB exists
        if (!localStorage.getItem('klifox_users')) {
            localStorage.setItem('klifox_users', JSON.stringify({}));
        }
    },

    show() {
        this.init();
        const overlay = document.getElementById('auth-overlay');
        if (overlay) {
            overlay.style.display = 'block';
            document.querySelector('.ecosystem-layout').style.filter = 'blur(10px)';
            this.renderQuickLogins();
        }
    },

    renderQuickLogins() {
        const users = JSON.parse(localStorage.getItem('klifox_users') || '{}');
        const container = document.getElementById('quick-login-buttons');
        const section = document.getElementById('quick-login-section');
        
        if (!container || !section) return;
        
        container.innerHTML = '';
        const userKeys = Object.keys(users);
        
        if (userKeys.length > 0) {
            section.style.display = 'block';
            userKeys.forEach(uid => {
                const u = users[uid];
                const roleColors = {
                    'customer': '#3b82f6',
                    'craftsman': '#f59e0b',
                    'partner': '#10b981'
                };
                const color = roleColors[u.role] || '#fff';
                
                const btn = document.createElement('button');
                btn.style = `padding: 10px; background: rgba(0,0,0,0.3); border: 1px solid ${color}; color: ${color}; border-radius: 8px; cursor: pointer; display: flex; justify-content: space-between; align-items: center;`;
                btn.innerHTML = `<span><strong>${u.name}</strong> (${u.phone})</span> <span style="font-size:11px; text-transform:uppercase;">${u.role}</span>`;
                btn.onclick = () => this.quickLogin(uid);
                container.appendChild(btn);
            });
        } else {
            section.style.display = 'none';
        }
    },

    quickLogin(userId) {
        const users = JSON.parse(localStorage.getItem('klifox_users') || '{}');
        if (users[userId]) {
            App.State.data.activeUserId = userId;
            App.State.data.userProfile = users[userId];
            App.State.save();
            this.hide();
            window.location.reload();
        }
    },

    hide() {
        const overlay = document.getElementById('auth-overlay');
        if (overlay) {
            overlay.style.display = 'none';
            document.querySelector('.ecosystem-layout').style.filter = 'none';
        }
    },

    toggleView(view) {
        if (view === 'login') {
            document.getElementById('auth-login-view').style.display = 'block';
            document.getElementById('auth-register-view').style.display = 'none';
        } else {
            document.getElementById('auth-login-view').style.display = 'none';
            document.getElementById('auth-register-view').style.display = 'block';
            
            // Auto-fill values for testing
            document.getElementById('auth-reg-name').value = 'Hasan Usta';
            document.getElementById('auth-reg-province').value = 'Gaziantep';
            document.getElementById('auth-reg-district').value = 'Şahinbey';
            
            // Generate unique phone (0539 431 XXXX)
            const randomPhoneDigits = Math.floor(1000 + Math.random() * 9000);
            document.getElementById('auth-reg-phone').value = '0539431' + randomPhoneDigits;
            
            // Generate unique email
            const randomEmailDigits = Math.floor(100 + Math.random() * 900);
            document.getElementById('auth-reg-email').value = 'hasan' + randomEmailDigits + '@123.com';
            
            // Check for referral link
            if (App.State.data.pendingReferral) {
                // Hide extra fields for quick onboarding
                document.getElementById('auth-reg-province').parentElement.style.display = 'none';
                document.getElementById('auth-reg-district').parentElement.style.display = 'none';
                document.getElementById('auth-reg-email').parentElement.style.display = 'none';
                document.getElementById('auth-reg-password').parentElement.style.display = 'none';
                document.getElementById('auth-reg-name').focus();
            } else {
                // Focus on password for normal flow
                document.getElementById('auth-reg-password').focus();
            }
        }
    },

    login() {
        const phone = document.getElementById('auth-login-phone').value.trim();
        const pass = document.getElementById('auth-login-password').value.trim();

        if (!phone || !pass) {
            App.Logger.log('Lütfen tüm alanları doldurun.', 'error');
            return;
        }

        const users = JSON.parse(localStorage.getItem('klifox_users'));
        let foundUser = null;

        for (const userId in users) {
            if (users[userId].phone === phone && users[userId].password === pass) {
                foundUser = users[userId];
                break;
            }
        }

        if (foundUser) {
            // Login Success
            App.State.data.activeUserId = foundUser.id;
            App.State.data.userProfile = foundUser;
            App.State.save();
            this.hide();
            
            // Reload to apply state correctly
            window.location.reload();
        } else {
            App.Logger.log('Telefon numarası veya şifre hatalı.', 'error');
            alert('Hatalı Giriş: Telefon numarası veya şifre yanlış!');
        }
    },

    register() {
        const isRef = !!App.State.data.pendingReferral;
        
        const name = document.getElementById('auth-reg-name').value.trim();
        const phone = document.getElementById('auth-reg-phone').value.trim();
        
        // Use auto-filled or default values if it's a referral link
        const province = isRef ? 'Gaziantep' : document.getElementById('auth-reg-province').value.trim();
        const district = isRef ? 'Şahinbey' : document.getElementById('auth-reg-district').value.trim();
        const email = isRef ? 'referral@klifox.com' : document.getElementById('auth-reg-email').value.trim();
        const pass = isRef ? phone : document.getElementById('auth-reg-password').value.trim();

        if (!name || !phone || !province || !district || !pass) {
            alert('Lütfen tüm zorunlu alanları doldurun!');
            return;
        }

        const users = JSON.parse(localStorage.getItem('klifox_users'));

        // Check if phone already registered
        for (const userId in users) {
            if (users[userId].phone === phone) {
                alert('Bu telefon numarası zaten kayıtlı!');
                return;
            }
        }

        const newId = 'U-' + Date.now();
        const newUser = {
            id: newId,
            name: name,
            phone: phone,
            province: province,
            district: district,
            email: email,
            password: pass, // Storing in plaintext for MVP testing purposes only
            role: 'customer',
            createdAt: new Date().toISOString()
        };

        if (isRef) {
            newUser.referredBy = App.State.data.pendingReferral;
        }

        users[newId] = newUser;
        localStorage.setItem('klifox_users', JSON.stringify(users));

        if (App.Adapters && App.Adapters.Socket && App.Adapters.Socket.connected) {
            App.Adapters.Socket.emit('global.state.update', { users: users });
        }

        // Auto Login
        App.State.data.activeUserId = newId;
        App.State.data.userProfile = newUser;
        App.State.save();
        
        if (isRef && App.Adapters.EventBus) {
            App.Adapters.EventBus.emit('referral.new_member', {
                partnerCode: App.State.data.pendingReferral,
                user: newUser
            });
            App.State.data.pendingReferral = null; // clear after use
            App.State.save();
            alert(`Tebrikler! ${newUser.referredBy} referans koduyla ağa katıldınız.\nŞifreniz telefon numaranız olarak belirlendi.`);
        }
        
        this.hide();
        
        // Reload to init with new user
        window.location.reload();
    },
    
    logout() {
        // Find existing klifox_users to persist current userProfile updates
        if(App.State.data.userProfile) {
            let users = JSON.parse(localStorage.getItem('klifox_users') || '{}');
            users[App.State.data.userProfile.id] = App.State.data.userProfile;
            localStorage.setItem('klifox_users', JSON.stringify(users));
            
            if (App.Adapters && App.Adapters.Socket && App.Adapters.Socket.connected) {
                App.Adapters.Socket.emit('global.state.update', { users: users });
            }
        }

        App.State.data.activeUserId = null;
        App.State.data.userProfile = null;
        App.State.save();
        window.location.reload();
    }
};
