App.UI.CraftsmanDash = {
    activeJobs: [],
    inited: false,
    isAvailable: true,
    
    render() {
        const target = document.getElementById('craftsman-dash-render-target');
        if(!target) return;
        
        if(!this.inited) {
            if (App.Adapters.EventBus) {
                App.Adapters.EventBus.on('dispatch.incoming', (job) => this.handleIncomingJob(job));
            }
            this.inited = true;
        }

        // Dynamically pull pending dispatch operations
        this.activeJobs = [];
        const pendingServices = (App.State.data.services || []).filter(s => s.status === 'DISPATCHING');
        pendingServices.forEach(s => {
            this.activeJobs.push({
                id: s.id,
                loc: s.loc || 'Bölge Belirtilmedi',
                urgency: s.urgencyScore || 'NORMAL',
                problem: s.problem || 'Bilinmiyor'
            });
        });

        let html = `
            <div class="enterprise-header" style="margin-bottom:20px; border-bottom: 1px solid rgba(245, 158, 11, 0.2); padding-bottom: 10px;">
                <h2 style="color: #f59e0b;"><i class="fas fa-toolbox"></i> Saha Kontrol Merkezi</h2>
                <p style="color: #94a3b8; font-size: 0.9rem;">Mobil Uyumlu Canlı İş Emirleri Arayüzü (Gerçek İnsan Usta Ağı)</p>
            </div>
            
            <div style="background:#1e293b; border-radius:12px; padding:20px; text-align:center; margin-bottom:20px;">
                <div style="font-size:3rem; color:${this.isAvailable && App.Adapters.Socket && App.Adapters.Socket.connected ? '#10b981' : '#f59e0b'};"><i class="fas ${this.isAvailable ? 'fa-wifi' : 'fa-plane'}"></i></div>
                <h3 style="color:#f8fafc; margin-top:10px;">${this.isAvailable ? (App.Adapters.Socket && App.Adapters.Socket.connected ? 'Yayındasınız (Bağlı)' : 'Bağlantı Kuruluyor...') : 'Çevrimdışı (Pasif)'}</h3>
                <p style="color:#94a3b8; font-size:0.9rem; margin-bottom:15px;">${this.isAvailable ? 'Otonom sistem bölgenizdeki çağrıları size yönlendirmeye hazır.' : 'Şu an yeni iş almıyorsunuz.'}</p>
                <button onclick="App.UI.CraftsmanDash.toggleAvailability()" style="background:${this.isAvailable ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'}; color:${this.isAvailable ? '#ef4444' : '#10b981'}; border:1px solid ${this.isAvailable ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}; padding:10px 20px; border-radius:20px; font-weight:bold; cursor:pointer;">
                    ${this.isAvailable ? '<i class="fas fa-power-off"></i> Çevrimdışı Ol' : '<i class="fas fa-satellite-dish"></i> Yayına Başla'}
                </button>
            </div>
            
            <div id="c-dash-active-jobs" style="margin-bottom: 25px;"></div>
            
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                <h3 style="color:#cbd5e1; font-size:1.1rem; margin:0;">Canlı Dispatch Akışı</h3>
                <span class="badge badge-warning" style="background:#f59e0b; color:#fff; padding:2px 8px; border-radius:12px; font-size:0.8rem;">Pulse <i class="fas fa-heartbeat"></i></span>
            </div>
            <div id="c-dash-jobs-container" style="display:flex; flex-direction:column; gap:15px;">
        `;
        
        if (this.activeJobs.length === 0) {
            html += `<div style="text-align:center; padding:40px 20px; border:1px dashed rgba(245, 158, 11, 0.2); border-radius:8px; color:#64748b;"><i class="fas fa-search-location" style="font-size:2rem; margin-bottom:10px; color:#f59e0b; opacity:0.5;"></i><br>Bölgenizde şu an eşleşen otonom bir operasyon yok...</div>`;
        } else {
            this.activeJobs.forEach(job => {
                html += `
                <div class="swipe-card" style="background:rgba(245, 158, 11, 0.05); border:1px solid rgba(245, 158, 11, 0.3); border-radius:16px; padding:20px; box-shadow: 0 10px 20px rgba(0,0,0,0.2); position:relative; overflow:hidden;"
                     ontouchstart="this.startX = event.touches[0].clientX"
                     ontouchend="let dx = event.changedTouches[0].clientX - this.startX; if(dx > 50) App.UI.CraftsmanDash.acceptJob('${job.id}'); else if(dx < -50) App.UI.CraftsmanDash.rejectJob('${job.id}');">
                    
                    <div style="display:flex; justify-content:space-between; margin-bottom:15px; align-items:center;">
                        <span style="background:${job.urgency === 'CRITICAL' ? '#ef4444' : '#10b981'}; color:#fff; padding:6px 12px; border-radius:15px; font-size:0.75rem; font-weight:800; letter-spacing:1px; box-shadow: 0 4px 10px rgba(16,185,129,0.3);">${job.urgency === 'CRITICAL' ? '<i class="fas fa-exclamation-triangle"></i> ACİL DÜŞTÜ' : '<i class="fas fa-bell"></i> YENİ ÇAĞRI'}</span>
                        <span style="color:#94a3b8; font-size:0.85rem; font-weight:600;"><i class="fas fa-map-marker-alt" style="color:#f59e0b;"></i> ${job.loc || 'Bölge Belirsiz'} (<span style="color:#f8fafc;">3.2 km</span>)</span>
                    </div>
                    
                    <h3 style="color:#fff; font-size:1.3rem; font-weight:700; margin-bottom:10px; line-height:1.3;">"${job.problem || 'Bilinmeyen Şikayet'}"</h3>
                    
                    <div style="background:#0f172a; padding:12px; border-radius:10px; margin-bottom:20px; border-left:3px solid #c084fc;">
                        <span style="color:#c084fc; font-size:0.8rem; font-weight:700; display:block; margin-bottom:5px; text-transform:uppercase; letter-spacing:1px;"><i class="fas fa-bolt"></i> AI Saha Özeti:</span>
                        <p style="color:#cbd5e1; font-size:0.9rem; margin:0; line-height:1.5;">Otonom parça tahmini: %40 (Kompresör arızası şüphesi). Varış ETA: 12 dk.</p>
                    </div>

                    <div style="display:flex; gap:12px; margin-bottom:10px;">
                        <button onclick="App.UI.CraftsmanDash.acceptJob('${job.id}')" style="flex:2; background:linear-gradient(135deg, #10b981, #059669); color:#fff; border:none; padding:16px; border-radius:12px; font-weight:800; cursor:pointer; font-size:1.2rem; box-shadow:0 8px 15px rgba(16,185,129,0.3); transition:0.2s;"><i class="fas fa-check-circle"></i> KABULT ET</button>
                        <button onclick="App.UI.CraftsmanDash.rejectJob('${job.id}')" style="flex:1; background:#1e293b; color:#94a3b8; border:1px solid #334155; padding:16px; border-radius:12px; cursor:pointer; font-size:1.2rem; font-weight:600;"><i class="fas fa-times"></i></button>
                    </div>
                    <div style="text-align:center; font-size:0.75rem; color:#64748b; font-weight:600; opacity:0.7;">İPUCU: Kabul için sağa, reddetmek için sola kaydırın <i class="fas fa-arrows-alt-h"></i></div>
                </div>`;
            });
        }
        
        html += `</div>`;
        target.innerHTML = html;
        this.renderActiveJobs();
    },

    renderActiveJobs() {
        const container = document.getElementById('c-dash-active-jobs');
        if (!container) return;

        const allSrvs = (App.State.data.services || []).filter(s => s.status && s.status !== 'DISPATCHING').reverse();
        if (allSrvs.length === 0) {
            container.innerHTML = '';
            return;
        }

        let activeHtml = `<h3 style="color:#cbd5e1; font-size:1.1rem; margin-bottom:15px;">Aktif Operasyonlarım</h3>`;
        let compHtml = `<h3 style="color:#94a3b8; font-size:1.1rem; margin-top:25px; margin-bottom:15px;">Tamamlanan İşler</h3>`;
        
        let hasActive = false;
        let hasComp = false;

        allSrvs.forEach(srv => {
            let badge = '';
            let isCompleted = false;
            let bgColor = 'rgba(16, 185, 129, 0.05)';
            let borderColor = 'rgba(16, 185, 129, 0.3)';

            if (srv.status === 'MATCHED') badge = 'Müşteri Onayı Bekleniyor';
            else if (srv.status === 'APPROVED') badge = 'Anlaşıldı';
            else if (srv.status === 'ON_THE_WAY') badge = 'Yoldasınız';
            else if (srv.status === 'IN_PROGRESS') badge = 'Müşteri Onayı Bekleniyor';
            else if (srv.status === 'COMPLETED') { 
                badge = 'Tamamlandı'; 
                isCompleted = true;
                bgColor = 'rgba(255, 255, 255, 0.02)';
                borderColor = 'rgba(255, 255, 255, 0.05)';
            }

            const htmlSnippet = `
            <div onclick="App.UI.Operations.openChat('${srv.id}')" style="background:${bgColor}; border:1px solid ${borderColor}; border-radius:12px; padding:15px; margin-bottom:10px; cursor:pointer; ${isCompleted ? 'opacity:0.6;' : ''}">
                <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                    <span style="font-weight:bold; color:${isCompleted ? '#cbd5e1' : '#10b981'};">${srv.problem || 'Klima Arızası'}</span>
                    <span style="font-size:0.8rem; background:rgba(16, 185, 129, 0.2); padding:2px 8px; border-radius:12px; color:#10b981;">${badge}</span>
                </div>
                <div style="font-size:0.85rem; color:#94a3b8;"><i class="fas fa-map-marker-alt"></i> ${srv.loc || 'Adres Bekleniyor'}</div>
                <div style="margin-top:10px; font-size:0.8rem; color:#f8fafc; opacity:0.8;">${isCompleted ? 'Sohbet geçmişini gör' : 'Sohbete dönmek için dokunun'} <i class="fas fa-arrow-right"></i></div>
            </div>`;

            if (isCompleted) {
                compHtml += htmlSnippet;
                hasComp = true;
            } else {
                activeHtml += htmlSnippet;
                hasActive = true;
            }
        });
        
        container.innerHTML = (hasActive ? activeHtml : '') + (hasComp ? compHtml : '');
    },

    toggleAvailability() {
        this.isAvailable = !this.isAvailable;
        if(App.State.data.userProfile) {
            App.State.data.userProfile.status = this.isAvailable ? 'online' : 'offline';
            App.State.save();
        }
        App.UI.toast('Durum Güncellendi', this.isAvailable ? 'Sistem size yeni işler yönlendirecek.' : 'Görev alımı duraklatıldı.', this.isAvailable ? 'success' : 'warning');
        this.render();
    },

    handleIncomingJob(job) {
        if(!this.isAvailable) return;
        
        // Filter by district if set
        if (App.State.data.userProfile && App.State.data.userProfile.district) {
            if (job.loc && !job.loc.includes(App.State.data.userProfile.district)) {
                return; // Not in my area
            }
        }

        this.activeJobs.unshift(job);
        if(document.getElementById('view-craftsman-dash').classList.contains('active')) this.render();
        if(App.Engine.Audio) App.Engine.Audio.play('notification');
        App.UI.toast('Yeni Görev (Dispatch)', 'Bölgenizde yeni bir operasyon saptandı!', 'warning');
        
        // PWA Lockscreen Push
        if (App.Adapters.PWARuntime) {
            App.Adapters.PWARuntime.mockLockscreenNotification('Saha Görevi Otonom Atandı', `Yeni arıza talebi: ${job.problem} - ${job.loc}`);
        }
    },

    acceptJob(id) {
        const job = this.activeJobs.find(j => j.id === id);
        this.activeJobs = this.activeJobs.filter(j => j.id !== id);
        App.Logger.log('Human Dispatch Görevi Canlı Usta Tarafından Kabul Edildi!', 'success');
        
        // Save job to App.State.data.services for Usta tracking
        if (job) {
            if (!App.State.data.services) App.State.data.services = [];
            App.State.data.services.push({
                id: job.id,
                problem: job.problem,
                loc: job.loc,
                status: 'MATCHED',
                timeline: ['DISPATCHING', 'MATCHED'],
                assignedCraftsman: App.State.data.userProfile
            });
            App.State.data.currentRequestId = job.id;
            App.State.save();
        }

        if (App.Adapters.Socket) {
            App.Adapters.Socket.emit('craftsman.accept', { 
                job_id: id,
                craftsmanProfile: App.State.data.userProfile
            });
        }
        
        // Let the Dispatch Engine know human intervened, skipping simulation fallback
        if (App.Adapters.EventBus) {
            App.Adapters.EventBus.emit('dispatch.human_accepted', { id });
            // Also notify ourselves to update status
            App.Adapters.EventBus.emit('dispatch.status_change', { id: id, status: 'MATCHED' });
        }
        
        this.render(); 
        
        // Switch view automatically to chat operation
        document.getElementById('nav-chat-btn').click();
    },

    rejectJob(id) {
        this.activeJobs = this.activeJobs.filter(j => j.id !== id);
        this.render();
    }
};
