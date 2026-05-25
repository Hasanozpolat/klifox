document.addEventListener('DOMContentLoaded', async () => {
    
    const bootTimeout = (ms, name) => new Promise((_, reject) => setTimeout(() => reject(new Error(`Timeout: ${name}`)), ms));
    const safeInit = async (name, initFn) => {
        try {
            if (App.UI.DevPanel) App.UI.DevPanel.log(`[BOOT] Başlatılıyor: ${name}`, "info");
            await Promise.race([
                Promise.resolve(initFn()),
                bootTimeout(2500, name)
            ]);
            if (App.UI.DevPanel) App.UI.DevPanel.log(`[BOOT] Başarılı: ${name}`, "success");
        } catch (e) {
            if (App.UI.DevPanel) App.UI.DevPanel.log(`[BOOT ERROR] ${name} başarısız oldu: ${e.message}. Fallback aktif.`, "error");
            console.error(`Boot Phase Error [${name}]:`, e);
        }
    };

    // Core Engine Bootstrap with Timeout Safety
    await safeInit('State', () => {
        App.State.init();
        
        // Capture referral from URL
        const params = new URLSearchParams(window.location.search);
        const refCode = params.get('ref');
        if (refCode) {
            App.State.data.pendingReferral = refCode;
            App.State.save();
        }
    });
    
    // Core Auth Check
    await safeInit('Auth', () => {
        if(App.UI.Auth) App.UI.Auth.init();
        
        // Disable auth check for admin panel
        if (window.location.pathname.includes('admin.html')) return;

        if(!App.State.data.activeUserId || !App.State.data.userProfile) {
            if(App.UI.Auth) App.UI.Auth.show();
        } else {
            const users = JSON.parse(localStorage.getItem('klifox_users') || '{}');
            if(!users[App.State.data.activeUserId]) {
                if(App.UI.Auth) App.UI.Auth.logout();
            }
        }
    });
    
    await safeInit('PWARuntime', () => { if (App.Adapters.PWARuntime) App.Adapters.PWARuntime.init(); });
    await safeInit('Orchestrator', () => { if (App.Engine.Orchestrator) App.Engine.Orchestrator.init(); });
    await safeInit('Presence', () => { if (App.Adapters.Presence) App.Adapters.Presence.init(); });
    await safeInit('ChatPersistence', () => { if (App.Adapters.ChatPersistence) App.Adapters.ChatPersistence.init(); });
    await safeInit('Socket', () => { if (App.Adapters.Socket) App.Adapters.Socket.connect(); });
    await safeInit('Dispatch', () => { if (App.Engine.Dispatch && App.Engine.Dispatch.init) App.Engine.Dispatch.init(); });
    await safeInit('Referral', () => { if (App.Engine.Referral && App.Engine.Referral.init) App.Engine.Referral.init(); });
    await safeInit('UIBindings', () => App.UI.initBindings());
    
    // Pre-Render Modules safely
    try {
        if (App.UI.Architecture) App.UI.Architecture.render(); 
    } catch(e) { console.error("Architecture render failed:", e); }

    if (App.UI.DevPanel) App.UI.DevPanel.log(`[BOOT] Environment: ${App.Config.ENV.toUpperCase()}`, "success");
    
    // Auth & Gateway verification with failure protection
    try {
        if (!App.State.data.onboardingComplete || !App.State.data.userProfile) {
            if (App.UI.DevPanel) App.UI.DevPanel.log("[GATEWAY] Doğrudan Müşteri Kaydı Aktif", "info");
            const landing = document.getElementById('view-landing');
            if (landing) landing.classList.remove('active');
            App.UI.Onboarding.start();
            App.UI.Onboarding.renderStep3('customer');
        } else {
            if (App.UI.DevPanel) App.UI.DevPanel.log(`[AUTH] Kriptolu Oturum Devam Ediyor: ${App.State.data.userProfile.name}`, "success");
            App.UI.syncRoleLayouts();
        }
    } catch (e) {
        if (App.UI.DevPanel) App.UI.DevPanel.log(`[AUTH ERROR] Arayüz Yüklenemedi: ${e.message}`, "error");
        if(App.UI.Landing) App.UI.Landing.render(); // Safe fallback
    }
    
    if (!App.Config.MVP_MODE) {
        if (App.Simulation && App.Simulation.start) App.Simulation.start();
    } else {
        if (App.UI.DevPanel) App.UI.DevPanel.log(`[BOOT] MVP Mode Active. Simulation engines are frozen.`, "info");
        // Hide non-MVP navigation items safely
        ['nav-economy-btn', 'nav-predictive-btn', 'nav-topology-btn', 'nav-ai-tracker-btn'].forEach(id => {
            const el = document.getElementById(id);
            if(el) el.style.display = 'none';
        });
    }

    if (App.UI.DevPanel) App.UI.DevPanel.log(`[BOOT COMPLETE] Sistem Kullanıma Hazır.`, "success");
    
    // Remove any hard-coded "Yükleniyor..." if syncRoleLayouts didn't trigger
    const nameEl = document.getElementById('user-profile-name');
    if (nameEl && nameEl.textContent === 'Yükleniyor...') {
        nameEl.textContent = 'Ziyaretçi';
    }
});
