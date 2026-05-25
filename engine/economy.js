App.Engine.Economy = {
    state: {
        growthPercentage: 14.2,
        referralVelocity: 3.4,
        liquidityVolume: 1245000,
        regions: {
            'Kadıköy': { trust: 97, jobs: 4120, speed: 95, status: 'Elite', incentive: 0 },
            'Şahinbey': { trust: 88, jobs: 1450, speed: 78, status: 'Stable', incentive: 0 },
            'Maltepe': { trust: 92, jobs: 2890, speed: 86, status: 'Stable', incentive: 0 },
            'Şehitkamil': { trust: 82, jobs: 940, speed: 71, status: 'Warning', incentive: 0 },
            'Nizip': { trust: 74, jobs: 312, speed: 64, status: 'Critical', incentive: 0 }
        },
        eliteCraftsmenCache: ['C-001', 'C-005'] // Hardcoded starting elites based on DB rating
    },

    tickEcosystem() {
        const volatility = (Math.random() * 2) - 0.5; 
        this.state.growthPercentage = Math.max(0, this.state.growthPercentage + volatility);
        this.state.referralVelocity += (Math.random() * 0.8) - 0.2;
        this.state.liquidityVolume += Math.floor(Math.random() * 50000);

        // AI Ecosystem Balancing Algorithm
        Object.keys(this.state.regions).forEach(key => {
            const reg = this.state.regions[key];
            reg.jobs += Math.floor(Math.random() * 5);
            
            // Random trust fluctuations
            if (Math.random() > 0.8) reg.trust = Math.min(99, Math.max(50, reg.trust + (Math.floor(Math.random()*5)-2)));

            // AI Intervention logic protecting Ecosystem collapse
            if (reg.trust < 75 || reg.speed < 70) {
                if (reg.incentive === 0) {
                    reg.incentive = 25; // 25% price bump to attract craftsmen
                    App.Simulation.logFeed(`[AI EKONOMİ KONTROLÜ] ${key} bölgesinde servis çöküş riski saptandı. Ağ teşvik fonu (Dalga) başlatıldı. Ustaların bu bölgedeki kazancı +%25 artırıldı!`, 'warning');
                }
                reg.status = 'Critical';
            } else if (reg.trust >= 95) {
                reg.status = 'Elite';
                reg.incentive = 0;
            } else {
                reg.status = 'Stable';
            }
        });

        // Elite Partner Promotions in Craftsman Economy
        if (Math.random() > 0.9) {
            const target = App.DB.Craftsmen[Math.floor(Math.random() * App.DB.Craftsmen.length)];
            if (!this.state.eliteCraftsmenCache.includes(target.id) && target.rating > 4.5) {
                this.state.eliteCraftsmenCache.push(target.id);
                App.Simulation.logFeed(`[AĞ İTİBARI] Platform başarısı: ${target.name} artık 'KliFox Elite Partner' rozetine sahip! Havuz önceliği artırıldı.`, 'success');
            }
        }

        // Viral Growth Waves
        if (Math.random() > 0.95) {
            this.state.referralVelocity += 5.0; // massive viral spike
            App.Simulation.logFeed(`[VİRAL BÜYÜME] Eko-Sistemde ani dalgalanma: Sosyal ağ referanslarında patlama tetiklendi!`, 'success');
        }

        if (App.UI.Economy) App.UI.Economy.render();
    },

    getLoyaltyTier(jobsCompleted) {
        if (jobsCompleted > 10) return { name: 'Premium Diamond', bonus: '%20 İndirim' };
        if (jobsCompleted > 5) return { name: 'Gold Networker', bonus: '%10 İndirim' };
        return { name: 'Standart Üye', bonus: 'Yok' };
    }
};
