App.UI.Wallet = {
    render() {
        const view = document.getElementById('view-wallet');
        if(!view) return;
        
        const w = (App.State.data.userProfile && App.State.data.userProfile.wallet) ? App.State.data.userProfile.wallet : { balance: 0, transactions: [] };
        const txns = w.transactions || [];
        
        let html = `
        <div class="wallet-dashboard">
            <div class="dashboard-header"><h2>Cüzdan</h2></div>
            
            <div style="background:var(--accent); border-radius:16px; padding:25px; margin-bottom:25px; color:#fff; box-shadow:0 10px 30px rgba(14, 165, 233, 0.3); position:relative;">
                <div style="font-size:12px; text-transform:uppercase; opacity:0.8; margin-bottom:5px;">Toplam Bakiye</div>
                <div style="font-size:36px; font-weight:700;">${new Intl.NumberFormat('tr-TR').format(w.balance)} ₺</div>
                ${(App.State.data.userProfile && App.State.data.userProfile.role === 'craftsman') ? `
                <button onclick="App.UI.Wallet.addBalance()" style="position:absolute; right:25px; top:50%; transform:translateY(-50%); background:#fff; color:var(--accent); border:none; padding:10px 15px; border-radius:8px; font-weight:bold; cursor:pointer; font-size:13px; box-shadow:0 4px 10px rgba(0,0,0,0.2);">
                    <i class="fas fa-plus"></i> Bakiye Ekle
                </button>
                ` : ''}
            </div>
            
            <h3 style="color:#fff; font-size:16px; margin-bottom:15px;">Son İşlemler</h3>
        `;
        
        if(txns.length === 0) {
            html += `
            <div class="empty-state">
                <i class="fas fa-wallet" style="font-size:3rem; color:#475569; margin-bottom:15px;"></i>
                <h3>Henüz bir bakiye hareketiniz yok.</h3>
                <p>Hizmet ödemeleriniz ve iadeleriniz burada listelenecek.</p>
            </div>
            `;
        } else {
            let txHtml = `<div style="display:flex; flex-direction:column; gap:10px;">`;
            txns.forEach(tx => {
                const isDebit = tx.type === 'debit';
                const tColor = isDebit ? 'var(--danger)' : 'var(--success)';
                const sign = isDebit ? '-' : '+';
                const dateStr = new Date(tx.date).toLocaleString('tr-TR', { day: '2-digit', month: 'short', hour: '2-digit', minute:'2-digit' });
                
                txHtml += `
                <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); padding:15px; border-radius:12px; display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <div style="font-size:13px; font-weight:600; color:#fff; margin-bottom:4px;">${tx.title}</div>
                        <div style="font-size:11px; color:var(--text-muted);">${dateStr} • ${tx.id}</div>
                    </div>
                    <div style="font-size:16px; font-weight:bold; color:${tColor};">
                        ${sign}${tx.amount} ₺
                    </div>
                </div>
                `;
            });
            txHtml += `</div>`;
            html += txHtml;
        }
        
        html += `</div>`;
        view.innerHTML = html;
    },

    addBalance() {
        const val = prompt("Yüklenecek bakiye tutarını giriniz (₺):", "1000");
        if(val && !isNaN(val) && parseInt(val) > 0) {
            const amount = parseInt(val);
            const p = App.State.data.userProfile;
            if(!p.wallet) p.wallet = { balance: 0, transactions: [] };
            
            p.wallet.balance += amount;
            if(!p.wallet.transactions) p.wallet.transactions = [];
            
            p.wallet.transactions.unshift({
                id: 'TXN-' + Math.floor(Math.random()*90000 + 10000),
                type: 'credit',
                amount: amount,
                date: new Date().toISOString(),
                title: 'Kullanıcı Bakiye Yüklemesi (Otomatik Onaylı)'
            });
            
            App.State.save();
            this.render();
            App.UI.toast('Bakiye Yüklendi', `${amount} ₺ cüzdanınıza eklendi.`, 'success');
        }
    }
};
