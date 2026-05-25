App.Engine.Referral = {
    init() {
        if (App.Adapters.EventBus) {
            App.Adapters.EventBus.on('referral.new_member', (data) => {
                const p = App.State.data.userProfile;
                if (p && p.role === 'partner' && p.partnerData && p.partnerData.referralCode === data.partnerCode) {
                    p.partnerData.networkUsers.push(data.user);
                    App.State.save();
                    if (App.UI.PartnerDash) App.UI.PartnerDash.render();
                    App.UI.toast('Yeni Üye Katıldı!', `${data.user.name} ağınıza katıldı.`, 'success');
                }
            });

            App.Adapters.EventBus.on('financial.settlement', (data) => {
                const p = App.State.data.userProfile;
                if (!p) return;

                // If this browser belongs to the USTA, deduct from their balance
                if (p.role === 'craftsman' && App.State.data.currentServicePrice === data.amount) {
                    const deduction = data.amount * 0.10; // 8% + 2%
                    if (p.wallet) {
                        p.wallet.balance = Math.max(0, p.wallet.balance - deduction);
                        App.State.save();
                        if (App.UI.Wallet) App.UI.Wallet.render();
                        App.UI.toast('Sistem Kesintisi', `Partner operasyon payı olarak ${deduction} ₺ bakiyenizden düşüldü.`, 'warning');
                    }
                }

                // If this browser belongs to the PARTNER, add to their earnings
                if (p.role === 'partner' && p.partnerData && p.partnerData.referralCode === data.partnerCode) {
                    const opsEarnings = data.amount * 0.08;
                    const creditEarnings = data.amount * 0.02;
                    p.partnerData.earnings += opsEarnings;
                    p.partnerData.credits += creditEarnings;
                    App.State.save();
                    if (App.UI.PartnerDash) App.UI.PartnerDash.render();
                    App.UI.toast('Operasyon Kazancı!', `Ağınızdaki bir işlemden ${opsEarnings} ₺ kazanç ve ${creditEarnings} ₺ kredi elde ettiniz!`, 'success');
                }
            });

            App.Adapters.EventBus.on('dispatch.job_priced', (data) => {
                App.State.data.currentServicePrice = data.price;
            });

            App.Adapters.EventBus.on('financial.gift_credit', (data) => {
                const p = App.State.data.userProfile;
                if (!p || p.role !== 'customer') return;

                if (p.id === data.userId) {
                    if (!p.wallet) p.wallet = { balance: 0, transactions: [] };
                    p.wallet.balance += data.amount;
                    if (!p.wallet.transactions) p.wallet.transactions = [];
                    p.wallet.transactions.unshift({
                        id: 'TXN-' + Math.floor(Math.random()*90000 + 10000),
                        type: 'credit',
                        amount: data.amount,
                        date: new Date().toISOString(),
                        title: `${data.partnerName} Partnerinden Hediye Kredi`
                    });
                    App.State.save();
                    if (App.UI.Wallet) App.UI.Wallet.render();
                    App.UI.toast('Hediye Kredi!', `${data.partnerName} size platform içi kullanabileceğiniz ${data.amount} ₺ hediye etti!`, 'success');
                }
            });
        }
    },

    async processSimulatedCheckout() {
        App.State.data.platformState = 'CHECKOUT';
        const completionTimeMs = Date.now() - (App.State.data.assignmentTimestamp || Date.now());
        const completionTimeSecs = completionTimeMs / 1000;

        App.UI.DevPanel.log('Router: Fatura Eventi Yaratıldı', 'success');

        App.UI.Chat.switchToAiMode();
        App.UI.Chat.doTimeline('Servis Tamamlandı');
        App.UI.Chat.doSys('<i class="fas fa-file-invoice-dollar text-success"></i> Sistem: Usta hizmeti tamamlamış ve faturayı iletmiştir.');

        // 1. Load Data
        const user = await App.API.getUser(App.State.data.activeUserId);
        const totalInvoice = 12000; 

        // 2. Pass through Risk & Security Rules Engine
        App.UI.DevPanel.log(`[RuleEngine] Risk Analizi başlıyor (Fatura: ${totalInvoice} ₺, Süre: ${completionTimeSecs.toFixed(1)} sn)`, 'rule');
        const riskAnalysis = App.Rules.Risk.evaluateTransaction(user, totalInvoice, completionTimeSecs);
        
        App.UI.DevPanel.log(`[Risk] Puanlama: Risk = ${riskAnalysis.riskScore}, Güven = ${riskAnalysis.trustScore}`, riskAnalysis.actionRequired ? 'danger' : 'info');
        
        if (riskAnalysis.actionRequired) {
            App.UI.DevPanel.log(`[Risk] Bayraklar Tespit Edildi: ${riskAnalysis.flags.join(', ')}. Müdahaleye alındı.`, 'danger');
            App.UI.toast('Güvenlik Duvarı', 'Anormal aktivite tespit edildi, fatura askıya alındı.', 'danger');
            // If it's a security flag, don't auto-checkout. Return simulation early.
            return; 
        }

        // 3. Process Wallet Usability Rules
        App.UI.DevPanel.log(`[RuleEngine] Wallet Limit (Max %${App.Rules.Wallet.MAX_CREDIT_USAGE_PERCENTAGE*100}) hesaplanıyor...`, 'rule');
        const creditUsage = App.Rules.Wallet.calculateUsableCredit(totalInvoice, user.wallet.balance);
        const remaining = totalInvoice - creditUsage;

        await App.API.updateWallet(user.id, creditUsage);
        App.UI.WalletView.render(); 

        // 4. Evaluate Future Referral Grants based on transaction health
        const eligible = App.Rules.Referral.isEligibleForReward(totalInvoice, riskAnalysis.trustScore);
        if (eligible) {
            App.UI.DevPanel.log(`[RuleEngine] Onay: Platform Ağ Büyütme Standartları (Referans Ödülü) karşılandı.`, 'success');
        }

        // Render to Customer
        const htmlStr = `Klima Bakım / Onarım faturanız sistem taramasından geçmiştir.<br><br>
            Hizmet Toplamı: <b>12.000 ₺</b><br>
            Uygulanan Maksimum Kredi İndirimi: <b class="text-success">-${creditUsage} ₺</b><br>
            <hr style="border-color:rgba(255,255,255,0.1); margin:8px 0;">
            Kalan Tutarınız: <b>${remaining} ₺</b><br><br>
            <em>Kredi bakiyeniz kural tanımlamalarına göre faturaya yansıtılmıştır.</em>
        `;
        
        setTimeout(() => App.UI.scheduleMsg('ai', htmlStr, true), 1500);
        setTimeout(() => {
            App.UI.scheduleMsg('ai', `Bizi tercih ettiğiniz için teşekkürler! Arkadaşlarınızı kendi kodunuzla (<b>${user.refCode}</b>) platforma kattığınızda, onların harcamalarından hizmet kredisi kazanırsınız!`);
        }, 6500);
    }
};
