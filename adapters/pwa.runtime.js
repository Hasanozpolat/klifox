App.Adapters.PWARuntime = {
    offlineQueue: [],
    
    init() {
        this.registerServiceWorker();
        this.bindNetworkEvents();
        this.bindVisibilityEvents();
        this.simulateBatteryAwareness();
        
        App.Logger.log('Mobile Runtime: Aktif (PWA / Offline-First)', 'System');
        
        // Expose mock push for UI testing
        window.triggerPushMock = this.mockLockscreenNotification.bind(this);
    },

    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('./service-worker.js')
            .then(reg => App.Logger.log('PWA ServiceWorker Kaydedildi', 'success'))
            .catch(err => App.Logger.error('ServiceWorker Hatası', 'PWA', err));
        }
    },

    bindNetworkEvents() {
        window.addEventListener('online', () => {
            App.UI.toast('Bağlantı Kuruldu', 'Sistem tekrar çevrimiçi, senkronize ediliyor...', 'success');
            App.Logger.log('Network: Çevrimiçi. Offline Kuyruk Senkronize Ediliyor.', 'Network');
            this.syncQueue();
        });

        window.addEventListener('offline', () => {
            App.UI.toast('Bağlantı Koptu', 'Güvenli Çevrimdışı (Offline) Mod devrede.', 'warning');
            App.Logger.log('Network: Çevrimdışı, veriler önbelleğe alınıyor.', 'Network');
        });
    },

    bindVisibilityEvents() {
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                App.Logger.log('Cihaz Arka Plana Atıldı - Pil Optimizasyonu Aktif', 'Mobile');
                this.reduceRefreshRates();
            } else {
                App.Logger.log('Cihaz Ön Plana Alındı - UI Senkronize Edildi', 'Mobile');
                this.restoreRefreshRates();
            }
        });
    },

    queueAction(actionLabel, payload) {
        if (!navigator.onLine) {
            this.offlineQueue.push({ label: actionLabel, payload, time: Date.now() });
            App.UI.toast('Çevrimdışı Girdi', `"${actionLabel}" işlemi hatta bağlanınca iletilecek.`, 'info');
            return true; 
        }
        return false;
    },

    syncQueue() {
        if (this.offlineQueue.length === 0) return;
        
        const q = [...this.offlineQueue];
        this.offlineQueue = [];
        
        q.forEach(task => {
            App.Logger.log(`Senkronize Ediliyor: ${task.label}`, 'success');
            // Mock sync API
            setTimeout(() => {
                App.UI.toast('Senkronize', `Bekleyen işlem aktarıldı: ${task.label}`, 'success');
            }, 500);
        });
    },

    simulateBatteryAwareness() {
        // Reduced animation mode flag
        if (typeof navigator.getBattery === 'function') {
            navigator.getBattery().then(battery => {
                if (battery.level < 0.2 && !battery.charging) {
                    document.body.classList.add('low-battery-mode');
                    App.UI.toast('Düşük Pil', 'Animasyonlar optimize edildi.', 'warning');
                }
            });
        }
    },

    reduceRefreshRates() {
        // Slow down Simulation engine memory while locked
        if(App.Simulation && App.Simulation.timerRefs) {
             // Let's pretend we slow them down
             App.Config.SIM_RATE = 30000; 
        }
    },

    restoreRefreshRates() {
        App.Config.SIM_RATE = 12000;
    },

    mockLockscreenNotification(title, body) {
        if(Notification.permission === "granted") {
            navigator.serviceWorker.ready.then(r => {
                r.showNotification(title, {
                    body,
                    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>❄️</text></svg>",
                    vibrate: [200,100,200]
                });
            });
        } else if(Notification.permission !== "denied") {
            Notification.requestPermission().then(p => {
                if(p === 'granted') this.mockLockscreenNotification(title, body);
            });
        } else {
            // Fallback UI toast if actual notifications are blocked/unsupported
            App.UI.toast(`PUSH: ${title}`, body, 'info');
        }
    }
};
