App.Rules.Service = {
    STATES: ['WAITING', 'NEGOTIATING', 'APPROVED', 'IN_PROGRESS', 'COMPLETED', 'DISPUTED', 'CANCELLED'],
    TIMERS: { autoCompleteMinutes: 120, userInactivityFallback: 15 },
    currentOffer: null,

    handleChat(text) {
        // Craftsman Mode Chat Handler
        // If Role is Admin/Simulation we simulate the Craftsman sending offers
        const txt = text.toLowerCase();
        
        App.UI.Chat.doTimeline('Yapay Zeka Analizi / Güvenlik Filtresi Aktif');

        // AI Transaction Assistance: Monitor
        if (txt.includes('pahalı') || txt.includes('indirim')) {
            setTimeout(() => {
                App.UI.Chat.addMessage('ai', "Sistem Notu: Platformumuzdaki fiyatlar 'Adil Tutar Politikası' güvencesi altındadır. Anlaşmazlık durumunda Canlı Operatör davet edebilirsiniz.");
            }, 1000);
        }

        const currentState = App.State.data.transactionState || 'WAITING';

        if (currentState === 'WAITING') {
            App.State.data.transactionState = 'NEGOTIATING';
            App.State.save();
            setTimeout(() => {
                App.UI.Chat.addMessage('craftsman', 'Merhaba, arıza kaydınızı ve bölgenizi inceledim. Gerekli onarım için size resmi bir servis teklifi iletiyorum.');
                this.proposeOffer(1200, '30 DAKİKA');
            }, 2500);
            return;
        }

        if (currentState === 'NEGOTIATING') {
            if (txt.includes('kabul') || txt.includes('onay')) {
                this.customerApproveOffer();
            } else if (txt.includes('red') || txt.includes('hayır') || txt.includes('iptal')) {
                App.UI.Chat.addMessage('craftsman', 'Teklifi onaylamadığınız için işlemi şu an beklemeye alıyorum, başka bir usta ile görüşmek isterseniz çağrınızı havuza geri atabilirim.');
            }
            return;
        }

        if (currentState === 'IN_PROGRESS') {
            if (txt.includes('bitti') || txt.includes('tamam')) {
                this.requestCompletion();
            } else if (txt.includes('sorun') || txt.includes('şikayet') || txt.includes('operatör')) {
                this.escalateToOperator();
            }
            return;
        }

        if (currentState === 'COMPLETED_PENDING_REVIEW') {
            if (txt.includes('1') || txt.includes('2') || txt.includes('3') || txt.includes('4') || txt.includes('5')) {
                this.submitReview(txt);
            }
        }
    },

    proposeOffer(price, eta) {
        App.State.data.transactionState = 'NEGOTIATING';
        this.currentOffer = { price, eta };
        App.State.save();

        const offerHtml = `
        <div style="background:rgba(16, 185, 129, 0.1); border:1px solid rgba(16, 185, 129, 0.3); border-radius:10px; padding:15px; margin:10px 0;">
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:10px; margin-bottom:10px;">
                <strong style="color:#10b981; font-size:1.1rem;"><i class="fas fa-file-invoice-dollar"></i> Saha Ustası Teklifi</strong>
                <span style="background:#10b981; color:#fff; padding:2px 8px; border-radius:12px; font-size:0.8rem;">YENİ</span>
            </div>
            <div style="color:#f8fafc; margin-bottom:10px;">
                <div style="margin-bottom:5px;"><span style="color:#94a3b8;"><i class="fas fa-clock"></i> Tahmini Varış:</span> <strong style="color:#fff;">${eta}</strong></div>
                <div><span style="color:#94a3b8;"><i class="fas fa-lira-sign"></i> Servis Tutarı:</span> <strong style="color:#fff; font-size:1.1rem;">${price} ₺</strong></div>
            </div>
            <div style="display:flex; gap:10px;">
                <button onclick="App.Rules.Service.customerApproveOffer()" style="flex:1; background:#10b981; color:#fff; border:none; padding:10px; border-radius:8px; cursor:pointer;"><i class="fas fa-check"></i> Kabul Et</button>
                <button onclick="App.UI.Chat.addMessage('user', 'Teklifi reddediyorum');" style="background:#ef4444; color:#fff; border:none; padding:10px; border-radius:8px; cursor:pointer;"><i class="fas fa-times"></i></button>
            </div>
        </div>`;
        
        App.UI.Chat.doSys(offerHtml);
        App.UI.Chat.doTimeline("Teklif İletildi. Müşteri Onayı Bekleniyor.");
    },

    async customerApproveOffer() {
        if (!this.currentOffer) return;
        
        const cost = this.currentOffer.price;
        const bal = App.State.data.userProfile.wallet.balance;

        App.UI.Chat.addMessage('user', `Servis teklifini (${cost} ₺) kabul ediyorum.`);

        if (bal < cost) {
            App.UI.Chat.addMessage('ai', `<i class="fas fa-exclamation-triangle"></i> Cüzdan bakiyeniz yetersiz. Mevcut bakiye: ${bal} ₺. Sistem anında Sanal POS'a geçiyor...`);
            // Sandbox will simulate direct credit card
            setTimeout(() => this.simulateDirectCardPayment(cost), 2000);
            return;
        }

        try {
            App.UI.Chat.doTimeline("Güvenli Ödeme Ağı Bekleniyor...");
            const txResult = await App.Adapters.PaymentGateway.processTransaction(cost, 'WALLET');
            
            // Real Wallet Integration: Deduct partially or fully, place pending payment
            App.State.data.userProfile.wallet.balance -= cost;
            
            // Invoice & Escrow Lock
            const breakdown = App.Adapters.InvoiceEngine.calculateBreakdown(cost);
            const receipt = App.Adapters.InvoiceEngine.generateEscrowReceipt(txResult.transactionId, App.State.data.userProfile, breakdown);
            this.currentReceiptId = receipt.receiptId;
            this.currentReceiptBreakdown = breakdown;

            App.State.data.walletHistory = App.State.data.walletHistory || [];
            App.State.data.walletHistory.push({ type: 'PENDING_SERVICE', amount: -cost, desc: `Emanet Makbuzu: ${receipt.receiptId}`, date: new Date().toISOString() });
            
            App.State.data.transactionState = 'APPROVED';
            App.UI.syncRoleLayouts(); // Refresh wallet UI
            App.State.save();

            App.UI.Chat.doTimeline("Sözleşme Onaylandı. Ücret KliFox Emanet Kasasına Alındı.");
            App.Engine.Audio.play('success');
            
            // Show Invoice UI
            App.UI.Chat.doSys(App.Adapters.InvoiceEngine.renderInvoiceUI(receipt));
            
            // Mobile PWA Push for Craftsman
            if (App.Adapters.PWARuntime) App.Adapters.PWARuntime.mockLockscreenNotification('Teklif Onaylandı!', 'Müşteri fiyatı onayladı, ödeme blokesi gerçekleşti.');

            this.postApproveCraftsmanFlow();

        } catch (err) {
            App.UI.Chat.addMessage('ai', `Ödeme sisteminde hata oluştu: ${err.reason}. Lütfen tekrar deneyiniz.`);
        }
    },

    async simulateDirectCardPayment(cost) {
        try {
            App.UI.Chat.doTimeline("Kredi Kartı İşlemi Sürüyor (Sandbox)");
            const txResult = await App.Adapters.PaymentGateway.processTransaction(cost, 'CREDIT_CARD');
            
            const breakdown = App.Adapters.InvoiceEngine.calculateBreakdown(cost);
            const receipt = App.Adapters.InvoiceEngine.generateEscrowReceipt(txResult.transactionId, App.State.data.userProfile, breakdown);
            this.currentReceiptId = receipt.receiptId;
            this.currentReceiptBreakdown = breakdown;

            App.State.data.transactionState = 'APPROVED';
            App.State.save();
            App.Engine.Audio.play('success');
            App.UI.Chat.doSys(App.Adapters.InvoiceEngine.renderInvoiceUI(receipt));

            this.postApproveCraftsmanFlow();
        } catch(e) {
            App.UI.Chat.addMessage('ai', `Banka reddi: ${e.reason}`);
        }
    },

    postApproveCraftsmanFlow() {
            App.UI.Chat.addMessage('craftsman', 'Anlaştık! Cihazlarım hazır, yola çıkıyorum.');
            App.State.data.transactionState = 'IN_PROGRESS';
            App.State.save();
            App.UI.Chat.doTimeline("Hizmet Sağlayıcı Yolda");
            
            // Add mobile-focused UI for Craftsman ETA and Navigation
            const navHtml = `
                <div style="background:rgba(59, 130, 246, 0.1); border:1px solid rgba(59, 130, 246, 0.3); padding:15px; border-radius:12px; margin:15px 0;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                        <strong style="color:#60a5fa;"><i class="fas fa-route"></i> Aktif Rota (Craftsman View)</strong>
                        <span style="background:rgba(239, 68, 68, 0.2); color:#ef4444; padding:4px 8px; border-radius:8px; font-weight:bold; font-size:0.8rem; animation:pulse 1s infinite;"><i class="fas fa-stopwatch"></i> ETA: <span id="eta-countdown">12:00</span></span>
                    </div>
                    <button onclick="App.UI.toast('Navigasyon', 'Cihazın harita uygulaması açılıyor...', 'info')" style="width:100%; background:#3b82f6; color:#fff; border:none; padding:12px; border-radius:8px; cursor:pointer; font-weight:bold; margin-bottom:10px;"><i class="fas fa-location-arrow"></i> Cihaz Haritalarına Geç (Navigasyon)</button>
                    
                    <div style="background:rgba(245, 158, 11, 0.1); border:1px dashed #f59e0b; padding:10px; border-radius:8px; text-align:center; cursor:pointer; color:#f59e0b;" onclick="App.Rules.Service.triggerCraftsmanArrival()">
                        <i class="fas fa-forward"></i> [Demo] Usta Adrese Vardı ve İşi Bitirdi
                    </div>
                </div>`;
            App.UI.Chat.doSys(navHtml);
            
            // Start simple ETA interval mock
            let s = 12 * 60;
            const timer = setInterval(() => {
                const el = document.getElementById('eta-countdown');
                if(!el) return clearInterval(timer);
                s--;
                const m = Math.floor(s/60);
                const sec = s % 60;
                el.innerText = `${m}:${sec.toString().padStart(2, '0')}`;
            }, 1000);
            
            // Add to Payout Queue
            if (this.currentReceiptId && App.Adapters.PayoutOrchestrator && this.currentReceiptBreakdown) {
                 // Simulated craftsman ID for now
                 App.Adapters.PayoutOrchestrator.queueCraftsmanPayout('CRAFT-001', this.currentReceiptBreakdown.craftsmanNet, this.currentReceiptId);
            }
    },

    triggerCraftsmanArrival() {
        App.UI.Chat.addMessage('craftsman', 'Merhaba, servis işlemini tamamladım. Klimanız sorunsuz çalışıyor. Sistem üzerinden işlemi \'Tamamlandı\' olarak işaretleyebilir misiniz?');
        App.UI.Chat.doTimeline("Onarım Tamamlandı. Güvenlik ve Müşteri Doğrulaması Bekleniyor.");
        
        const confirmHtml = `
        <div style="background:#1e293b; border:1px solid #334155; border-radius:10px; padding:15px; margin:10px 0;">
            <p style="color:#cbd5e1; margin-bottom:15px; font-size:0.95rem;">Usta işlemi tamamladığını bildirdi. Hizmeti onaylarsanız "Emanet Kasa"daki ücret ustaya aktarılacaktır.</p>
            <div style="display:flex; gap:10px;">
                <button onclick="App.Rules.Service.confirmCompletion()" style="flex:2; background:#3b82f6; color:#fff; border:none; padding:10px; border-radius:8px; cursor:pointer; font-weight:bold;"><i class="fas fa-check-double"></i> Hizmeti Onayla</button>
                <button onclick="App.Rules.Service.escalateToOperator()" style="flex:1; background:#ef4444; color:#fff; border:none; padding:10px; border-radius:8px; cursor:pointer;"><i class="fas fa-gavel"></i> Sorun Var</button>
            </div>
        </div>`;
        App.UI.Chat.doSys(confirmHtml);
    },

    confirmCompletion() {
        App.UI.Chat.addMessage('user', 'Hizmeti teslim aldım. Teşekkürler.');
        App.State.data.transactionState = 'COMPLETED_PENDING_REVIEW';
        App.State.save();

        App.UI.Chat.doTimeline("Ödeme Aktarıldı. Akıllı Sözleşme Kapandı.");
        App.Engine.Audio.play('connected');

        setTimeout(() => {
            const reviewHtml = `
            <div style="text-align:center; padding:15px; background:rgba(192, 132, 252, 0.1); border:1px solid #c084fc; border-radius:10px;">
                <p style="color:#e9d5ff; margin-bottom:10px;"><i class="fas fa-star" style="color:#fbbf24;"></i> Ustanızı Puanlayın (1-5)</p>
                <p style="color:#d8b4fe; font-size:0.85rem;">Sisteme "5 Yıldız" gibi bir puan yazabilirsiniz.</p>
            </div>`;
            App.UI.Chat.doSys(reviewHtml);
        }, 1000);
    },

    submitReview(text) {
        if (text.includes('1') || text.includes('2') || text.includes('3')) {
            App.UI.Chat.addMessage('ai', "Geri bildiriminiz için teşekkürler. Kalite standartlarımızı geliştirmek üzere puanınızı düşük gördüğümüz için iç denetim sürecini başlatıyoruz.");
        } else {
            App.UI.Chat.addMessage('ai', "Mükemmel! Memnun ayrıldığınız için çok sevindik. Ustanızın 'Güven Puanı' (Trust Score) sistemde artırılmıştır.");
        }
        App.State.data.transactionState = 'COMPLETED';
        App.State.save();
        App.UI.Chat.doTimeline("Hizmet Akışı Sona Erdi.");
    },

    escalateToOperator() {
        App.UI.Chat.addMessage('user', 'İşlemle ilgili sorunum var. Canlı Operatör talep ediyorum.');
        App.State.data.transactionState = 'DISPUTED';
        App.State.save();

        App.UI.Chat.doTimeline("UYARI: Anlaşmazlık Algılandı (Dispute)");
        App.Engine.Audio.play('error');
        
        // PWA Lockscreen Push for Admin
        if (App.Adapters.PWARuntime) App.Adapters.PWARuntime.mockLockscreenNotification('⚠️ ACİL MÜDAHALE (Eskalasyon)', 'Sahadan bir itiraz aldınız. Lütfen odaya bağlanın.');

        setTimeout(() => {
            App.UI.Chat.addMessage('ai', "<i class='fas fa-shield-alt'></i> Tüketici Hakları Koruma Modülü devrede. Emanet Kasa ödemesi donduruldu.");
            App.UI.Chat.addMessage('admin', "Merhaba, ben KliFox Çözüm Merkezi Uzmanı. Yazışmalarınızı inceledim, sorunu çözmek için buradayım.");
            document.getElementById('header-status').textContent = 'Canlı Operatör ile Görüşülüyor';
            document.getElementById('header-avatar').innerHTML = '<i class="fas fa-headset"></i>';
            document.getElementById('header-avatar').className = 'avatar admin-avatar';
            document.getElementById('status-dot').style.background = 'var(--danger)';
        }, 1500);
    }
};
