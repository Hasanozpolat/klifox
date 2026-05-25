App.Engine.Dispatch = {
    init() {
        if(App.Adapters.EventBus) {
            App.Adapters.EventBus.on('dispatch.status_change', (payload) => {
                const srv = (App.State.data.services || []).find(s => s.id === payload.id);
                if (srv) {
                    srv.status = payload.status;
                    if (!srv.timeline) srv.timeline = [];
                    srv.timeline.push(payload.status);
                    App.State.save();
                    
                    if (App.UI.Operations) App.UI.Operations.render();
                    if (App.UI.Chat) App.UI.Chat.refreshQuickActions();
                    
                    if (payload.status === 'APPROVED' && !srv.escrowLocked) {
                        srv.escrowLocked = true;
                        // DISABLED FOR MVP
                        // App.UI.Chat.doSys(`<div style="font-family:var(--font-mono); font-size:11px; color:var(--success);"><i class="fas fa-terminal"></i> [Sistem] escrow.locked({ amount: 500 }) => Secure</div>`);
                        /*
                        if (App.State.data.userProfile && App.State.data.userProfile.wallet && App.State.data.userProfile.role === 'customer') {
                            App.State.data.userProfile.wallet.balance -= 500;
                            if (!App.State.data.userProfile.wallet.transactions) App.State.data.userProfile.wallet.transactions = [];
                            App.State.data.userProfile.wallet.transactions.unshift({
                                id: 'TXN-' + Date.now(),
                                date: new Date().toISOString(),
                                type: 'debit',
                                amount: 500,
                                title: 'Güvenli Emanet Kasası (Escrow)'
                            });
                        }
                        */
                    }

                    if (payload.status === 'COMPLETED' && !srv.escrowReleased) {
                        srv.escrowReleased = true;
                        
                        const price = srv.serviceCard ? srv.serviceCard.price : (App.State.data.currentServicePrice || 1000);
                        const commissionTotal = price * 0.16;
                        const partnerEarnings = price * 0.08;
                        const partnerCredits = price * 0.02;
                        const adminRevenue = price * 0.06;
                        
                        // 1. Deduct 16% from Craftsman Wallet
                        App.UI.Chat.doSys(`<div style="font-family:var(--font-mono); font-size:11px; color:#ef4444;"><i class="fas fa-arrow-down"></i> [Finans] Usta Cüzdanından %16 Komisyon Kesildi: -${commissionTotal} ₺</div>`);
                        
                        // For MVP simulation: If the current user acting in the demo has a craftsman role/wallet, deduct it.
                        if (App.State.data.userProfile && App.State.data.userProfile.wallet && App.State.data.userProfile.role === 'craftsman') {
                            App.State.data.userProfile.wallet.balance -= commissionTotal;
                            if (!App.State.data.userProfile.wallet.transactions) App.State.data.userProfile.wallet.transactions = [];
                            App.State.data.userProfile.wallet.transactions.unshift({
                                id: 'TXN-' + Date.now(),
                                date: new Date().toISOString(),
                                type: 'debit',
                                amount: commissionTotal,
                                title: 'Platform İşlem Komisyonu (%16)'
                            });
                        }
                        
                        // 2. Distribute to Partner or Admin
                        // In MVP, we'll assume the current demo user profile holds the partner data if they ever visited the partner dash
                        if (App.State.data.userProfile && App.State.data.userProfile.partnerData) {
                            App.State.data.userProfile.partnerData.earnings += partnerEarnings;
                            App.State.data.userProfile.partnerData.credits += partnerCredits;
                            App.UI.Chat.doSys(`<div style="font-family:var(--font-mono); font-size:11px; color:#10b981;"><i class="fas fa-network-wired"></i> [Finans] Partner Payı (+${partnerEarnings} ₺) ve Hediye Kredi (+${partnerCredits} ₺) eklendi.</div>`);
                        } else {
                            // No partner -> all 16% goes to Admin
                            App.UI.Chat.doSys(`<div style="font-family:var(--font-mono); font-size:11px; color:#3b82f6;"><i class="fas fa-building"></i> [Finans] İşlemde partner yok. %16 Kesinti (${commissionTotal} ₺) KliFox Admin Havuzuna aktarıldı.</div>`);
                        }
                    }
                    
                    
                    App.State.save();
                    if (App.UI.Operations) App.UI.Operations.render();
                    if (App.UI.Wallet) App.UI.Wallet.render();
                    if (App.UI.Chat && App.State.data.currentRequestId === payload.id) {
                        App.UI.Chat.refreshQuickActions();
                    }
                }
            });
        }
    },
    
    async startCycle() {
        App.UI.DevPanel.log('Router: Başlatılıyor...', 'info');
        App.UI.Chat.updateOperationalBanner(true, 'Bölge ekipleri aranıyor...', 'info');
        App.UI.Chat.doTimeline('Bölge ekipleri aranıyor');
        
        const loc = App.State.data.memoryContext.location || 'Bölgeniz';
        const urg = App.State.data.memoryContext.urgencyScore;

        App.UI.Chat.updateOperationalBanner(true, `${loc} çevresindeki aktif ekipler taranıyor...`, 'info');
        App.UI.Chat.doSys(`<div style="font-family:var(--font-mono); font-size:11px; color:var(--text-muted);"><i class="fas fa-terminal"></i> [Sistem] dispatch.broadcast({ area: '${loc}' }) => Sent</div>`);
        
        await App.API.simLatency(1500, 2000);
        
        // Find 3 candidates
        let candidates = App.DB.Craftsmen.map(craftsman => {
            return {
                craftsman,
                score: App.Rules.Dispatch.evaluateMatchScore(craftsman, loc, urg)
            }
        }).filter(c => c.score >= 0).sort((a,b) => b.score - a.score).slice(0, 3);
        
        if(candidates.length === 0) candidates = [{craftsman: App.DB.Craftsmen[0], score: 50}]; // Fallback
        
        App.UI.Chat.updateOperationalBanner(true, `${candidates.length} uygun servis bulundu, durumları teyit ediliyor...`, 'info');
        App.UI.Chat.renderLiveQueue(candidates.map(c => c.craftsman));
        
        // Dispatch locally to same-instance users (For Demo)
        App.Adapters.EventBus.emit('dispatch.incoming', { 
            id: App.State.data.currentRequestId || 'JOB-' + Date.now(),
            loc, urgency: urg, problem: App.State.data.memoryContext.problem 
        });

        // Simulate Realtime Craftsman Reactions!
        setTimeout(() => {
            if(candidates[1]) App.UI.Chat.updateQueueStatus(candidates[1].craftsman.id, 'Uzakta', 'danger', false);
        }, 3000);

        setTimeout(() => {
            if(candidates[2]) App.UI.Chat.updateQueueStatus(candidates[2].craftsman.id, 'Teklif Hazırlıyor', 'warning', false);
        }, 5000);

        // HYBRID REAL HUMAN CHECK
        let humanFound = false;

        // Start the conversational AI loop while waiting
        let waitCount = 0;
        const aiWaitLoop = setInterval(() => {
            waitCount++;
            if (waitCount === 1) {
                App.UI.Chat.addMessage('ai', "Şu an bölgenizdeki saha uzmanlarından yanıt bekliyorum. Lütfen ayrılmayın...");
            } else if (waitCount === 3) {
                App.UI.Chat.addMessage('ai', "Talebiniz öncelikli sıraya alındı, en kısa sürede bir usta atanacak.");
            } else if (waitCount % 5 === 0) {
                App.UI.Chat.addMessage('ai', "Bölgedeki yoğunluk devam ediyor, arayışımız sürüyor...");
            }
        }, 8000);

        try {
            const acceptedBy = await this.waitForHumanAcceptance(); 
            clearInterval(aiWaitLoop);
            humanFound = true;
            
            App.UI.Chat.updateOperationalBanner(true, "Sağdaki canlı usta çağrıyı manuel kabul etti...", 'success');
            App.UI.Chat.doSys(`<div style="font-family:var(--font-mono); font-size:11px; color:var(--success);"><i class="fas fa-terminal"></i> [Sistem] dispatch.locked({ user: '${acceptedBy.id}' }) => Secure</div>`);
            
            App.State.data.isRealHumanCraftsman = true;
            App.State.data.assignedCraftsman = acceptedBy;
            App.State.data.assignmentTimestamp = Date.now();
            
            // --- VERTICAL SLICE: UPDATE SERVICE ---
            const srv = App.State.data.services.find(s => s.id === App.State.data.currentRequestId);
            if (srv) {
                srv.status = 'MATCHED';
                srv.assignedCraftsman = acceptedBy;
                if (!srv.timeline) srv.timeline = ['DISPATCHING', 'MATCHED'];
                else srv.timeline.push('MATCHED');
            }
            App.State.save();

            // Re-render global UI
            if (App.UI.Operations) App.UI.Operations.render();

            setTimeout(() => {
                const q = document.getElementById('live-queue-container');
                if(q) q.style.display = 'none';
                this.connectCraftsman(acceptedBy);
            }, 3000);
            
        } catch (e) {
            clearInterval(aiWaitLoop);
            if (e === 'TIMEOUT') {
                App.UI.Chat.updateOperationalBanner(true, "Operasyon Yöneticisine (Partner) Aktarılıyor...", 'warning');
                App.UI.Chat.doSys(`<div style="font-family:var(--font-mono); font-size:11px; color:#f59e0b;"><i class="fas fa-exclamation-triangle"></i> [Sistem] dispatch.timeout() => PARTNER_ESCALATED</div>`);
                
                const srv = App.State.data.services.find(s => s.id === App.State.data.currentRequestId);
                if (srv) {
                    srv.status = 'PARTNER_ESCALATED';
                    if (!srv.timeline) srv.timeline = [];
                    srv.timeline.push('PARTNER_ESCALATED');
                }
                App.State.save();
                
                if (App.UI.Operations) App.UI.Operations.render();
                
                App.UI.Chat.addMessage('sys', 'Bölgenizdeki ustalar şu an meşgul. Dosyanız doğrudan bölge operasyon yöneticimize (Partner) raporlandı. Yöneticimiz size en kısa sürede manuel olarak bir usta atayacaktır.');
                
                if (App.UI.PartnerDash) App.UI.PartnerDash.render();
                App.UI.Chat.refreshQuickActions();
            }
        }
    },

    waitForHumanAcceptance() {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject('TIMEOUT');
            }, 60000); // 60 seconds (1 minute) for MVP testing
            
            App.Adapters.EventBus.on('dispatch.human_accepted', (payload) => {
                clearTimeout(timeout);
                const prof = payload.craftsmanProfile || {};
                resolve({
                    id: prof.id || "CRAF-999", 
                    name: prof.name || "Gerçek Saha Ustası", 
                    company: prof.company || "Bağımsız KliFox Ustası", 
                    role: "craftsman", 
                    score: 5.0,
                    avatar: prof.avatar
                });
            });
        });
    },

    connectCraftsman(craftsman) {
        App.State.data.platformState = 'CRAFTSMAN';
        App.State.save();

        App.Engine.Audio.play('connected');
        App.UI.Chat.doTimeline('Usta bağlantısı sağlandı');
        App.UI.Chat.doSys(`<i class="fas fa-check-circle" style="color:var(--success)"></i> ${craftsman.name} (${craftsman.company}) bağlantıyı onayladı.`);
        
        App.UI.Chat.switchToCraftsmanMode(craftsman);
        App.UI.Chat.renderServiceCard();
        
        App.UI.DevPanel.enableCheckoutAction();

        setTimeout(() => {
            App.UI.scheduleMsg('craftsman', `Merhabalar, ben ${craftsman.name}. "<b>${App.State.data.memoryContext.problem}</b>" bildiriminizi aldım. Ekstra detay alabilir miyim?`);
        }, 2500);
    }
};

