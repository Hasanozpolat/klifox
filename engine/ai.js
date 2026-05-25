App.Engine.AI = {
    async processInput(text) {
        let reply = '';
        const txt = text.toLowerCase();
        
        await App.Adapters.AI.complete("ROUTING PROTOCOL", text);

        // LIVE EMOTION ENGINE - Modifying Mid-Operations Behaviors
        const isAngry = ['bıktım', 'nerede', 'gelmedi', 'yeter', 'iptal', 'rezalet', 'bekliyor'].some(w => txt.includes(w));
        const isHappy = ['teşekkür', 'harika', 'hızlı', 'memnun'].some(w => txt.includes(w));

        if (App.State.data.platformState === 'DISPATCHING') {
            if (isAngry) {
                reply = "Gecikme için çok üzgünüm. Bölgenizdeki yoğunluk sebebiyle biraz bekletiyoruz. Dosyanızı acil koduyla canlı destek ekibimize aktardım, lütfen hatta kalın.";
            } else if (isHappy) {
                reply = "Biz de ilginiz için teşekkür ederiz! Ekiplerimiz size yönlendirilmek üzere işlemlerine devam ediyor.";
            } else {
                reply = "Şu an arka planda en uygun profesyoneli sizin için arıyorum, bu işlem devam ederken biz sohbete devam edebiliriz.";
            }
            App.UI.scheduleMsg('ai', reply);
            return;
        }

        if (App.State.data.platformState === 'CRAFTSMAN') {
            if (isAngry) {
                App.UI.toast('Destek Merkezi', 'Yaşadığınız durum için Canlı Operatör bilgilendirildi.', 'info');
                // Let the craftsman system catch the message natively as well
            }
            // Will fallback to standard DOM hook if not fully handled
            return;
        }

        // --- Standard Step Array Base Logic ---

        if (App.State.data.collectionStep === 0) {
            App.State.data.memoryContext.problem = text;
            App.UI.Chat.doSys(`<div style="font-family:var(--font-mono); font-size:11px; color:var(--text-muted);"><i class="fas fa-terminal"></i> [Sistem] intent.analyze(text) => OK</div>`);
            
            if (App.Rules.Dispatch.isEmergency(txt)) {
                App.State.data.memoryContext.urgencyScore = 'CRITICAL';
                App.UI.Chat.doSys(`<div style="font-family:var(--font-mono); font-size:11px; color:var(--danger);"><i class="fas fa-exclamation-triangle"></i> [Sistem] risk.evaluate() => CRITICAL</div>`);
                reply = "Anlıyorum, bu acil bir durum görünüyor. Size en hızlı şekilde destek yönlendirebilmem için lütfen bulunduğunuz İLİ seçer misiniz?";
            } else {
                App.State.data.memoryContext.urgencyScore = 'NORMAL';
                reply = "Yaşadığınız sorunu anladım. Size en uygun ekibi yönlendirebilmem için lütfen bulunduğunuz İLİ seçin.";
            }
            
            App.State.data.collectionStep = 1;
            App.State.save();
            App.UI.scheduleMsg('ai', reply);
            setTimeout(() => {
                App.UI.Chat.setQuickActions([
                    {label: '🔍 Tüm İllerde Ara...', type: 'action', action: 'select_city'},
                    {label: '📍 İstanbul'}, {label: '📍 Ankara'}, {label: '📍 İzmir'}, {label: '📍 Gaziantep'}
                ]);
            }, 1500);
            return;
        }

        if (App.State.data.collectionStep === 1) {
            const closest = this.getClosestCity(text);
            
            if (closest && closest.distance > 0 && closest.distance <= 3) {
                App.State.data.memoryContext.tempCity = closest.match;
                App.State.data.collectionStep = 1.5;
                App.State.save();
                App.UI.scheduleMsg('ai', `Yazdığınız ili tam bulamadım, **${closest.match}** demek istemiş olabilir misiniz?`);
                setTimeout(() => App.UI.Chat.setQuickActions([{label: '✅ Evet', value: 'evet'}, {label: '❌ Hayır', value: 'hayir'}]), 1500);
                return;
            } else if (!closest || closest.distance > 3) {
                App.UI.scheduleMsg('ai', "Sistemde böyle bir il bulamadım. Lütfen geçerli bir il adı yazınız.");
                return;
            }

            const city = closest.match;
            App.State.data.memoryContext.city = city;
            App.UI.Chat.doSys(`<div style="font-family:var(--font-mono); font-size:11px; color:var(--text-muted);"><i class="fas fa-terminal"></i> [Sistem] region.setCity({ city: '${city}' }) => OK</div>`);
            
            reply = `Teşekkürler. Şimdi lütfen ${city} içindeki İLÇENİZİ seçiniz.`;
            App.State.data.collectionStep = 2;
            App.State.save();
            App.UI.scheduleMsg('ai', reply);
            setTimeout(() => {
                const dists = App.Data.Locations[city] || [];
                const quicks = [{label: '🔍 Tüm İlçelerde Ara...', type: 'action', action: 'select_district'}];
                dists.slice(0, 4).forEach(d => quicks.push({label: `📍 ${d}`}));
                App.UI.Chat.setQuickActions(quicks);
            }, 1500);
            return;
        }

        if (App.State.data.collectionStep === 1.5) {
            if (txt.includes('evet') || txt.includes('doğru') || txt.includes('aynen')) {
                const city = App.State.data.memoryContext.tempCity;
                App.State.data.memoryContext.city = city;
                App.UI.Chat.doSys(`<div style="font-family:var(--font-mono); font-size:11px; color:var(--text-muted);"><i class="fas fa-terminal"></i> [Sistem] region.setCity({ city: '${city}' }) => CORRECTION OK</div>`);
                
                reply = `Teşekkürler, il bilginizi ${city} olarak kaydettim. Şimdi lütfen İLÇENİZİ seçiniz.`;
                App.State.data.collectionStep = 2;
                App.State.save();
                App.UI.scheduleMsg('ai', reply);
                setTimeout(() => {
                    const dists = App.Data.Locations[city] || [];
                    const quicks = [{label: '🔍 Tüm İlçelerde Ara...', type: 'action', action: 'select_district'}];
                    dists.slice(0, 4).forEach(d => quicks.push({label: `📍 ${d}`}));
                    App.UI.Chat.setQuickActions(quicks);
                }, 1500);
            } else {
                reply = "Anladım, lütfen bulunduğunuz İLİ tekrar yazar mısınız?";
                App.State.data.collectionStep = 1;
                App.State.save();
                App.UI.scheduleMsg('ai', reply);
            }
            return;
        }

        if (App.State.data.collectionStep === 2) {
            App.State.data.memoryContext.location = `${App.State.data.memoryContext.city}, ${text}`;
            App.UI.Chat.doSys(`<div style="font-family:var(--font-mono); font-size:11px; color:var(--text-muted);"><i class="fas fa-terminal"></i> [Sistem] network.query({ region: '${App.State.data.memoryContext.location}' }) => 12 node(s)</div>`);
            
            if (App.State.data.memoryContext.urgencyScore === 'CRITICAL') {
                reply = "Bölgenizdeki nöbetçi ekiplerimizi kontrol ediyorum. Son olarak, klimanızın marka veya modeli hakkında bilginiz var mı?";
                App.State.data.collectionStep = 4; 
                setTimeout(() => App.UI.Chat.setQuickActions([{label: 'Bosch'}, {label: 'Arçelik'}, {label: 'Daikin'}, {label: 'Bilmiyorum'}]), 1500);
            } else {
                reply = "Teşekkürler. Bölgenizde ulaşılabilir ekiplerimiz var. Planlamayı doğru yapabilmemiz adına bu problemin sizin için aciliyeti nedir?";
                App.State.data.collectionStep = 3;
                setTimeout(() => App.UI.Chat.setQuickActions([{label: '🚨 Çok Acil (Hemen)'}, {label: '⏰ Bugün İçinde'}, {label: '📅 Yarın Uygun'}]), 1500);
            }
            App.State.save();
            App.UI.scheduleMsg('ai', reply);
            return;
        }

        if (App.State.data.collectionStep === 3) {
            App.State.data.memoryContext.urgency = text;
            App.UI.Chat.doSys(`<div style="font-family:var(--font-mono); font-size:11px; color:var(--text-muted);"><i class="fas fa-terminal"></i> [Sistem] dispatch.setSLA({ time: '${text}' }) => OK</div>`);
            
            if (txt.includes('acil') || txt.includes('hemen')) {
                App.State.data.memoryContext.urgencyScore = 'CRITICAL';
                App.UI.Chat.doSys(`<div style="font-family:var(--font-mono); font-size:11px; color:var(--danger);"><i class="fas fa-bolt"></i> [Sistem] escalation.trigger('VIP_ROUTING') => OK</div>`);
            }
            reply = "Peki, not aldım. Son olarak, klimanızın marka veya modeli hakkında bir detay iletebilir misiniz?";
            App.State.data.collectionStep = 4;
            App.State.save();
            App.UI.scheduleMsg('ai', reply);
            setTimeout(() => App.UI.Chat.setQuickActions([{label: 'Bosch'}, {label: 'Arçelik'}, {label: 'LG'}, {label: 'Daikin'}, {label: 'Bilmiyorum'}]), 1500);
            return;
        }

        if (App.State.data.collectionStep === 4) {
            App.State.data.memoryContext.type = text;
            if (!App.State.data.userProfile.phone) {
                App.State.data.collectionStep = 5;
                App.State.save();
                reply = "Teşekkürler. Size daha hızlı ulaşabilmemiz için iletişim numaranızı paylaşır mısınız?";
                App.UI.scheduleMsg('ai', reply);
                App.UI.Chat.setQuickActions([]);
                return;
            } else {
                App.State.data.collectionStep = 6;
            }
        }

        if (App.State.data.collectionStep === 5) {
            App.State.data.userProfile.phone = text;
            App.UI.Chat.doSys(`<div style="font-family:var(--font-mono); font-size:11px; color:var(--text-muted);"><i class="fas fa-terminal"></i> [Sistem] user.updatePhone() => OK</div>`);
            App.State.data.collectionStep = 6;
        }

        if (App.State.data.collectionStep === 6) {
            App.State.data.platformState = 'DISPATCHING';
            
            // --- VERTICAL SLICE: CREATE REAL PERSISTENT SERVICE OBJECT ---
            if (!App.State.data.services) App.State.data.services = [];
            const newService = {
                id: App.State.data.currentRequestId || 'SRV-' + Date.now(),
                createdAt: new Date().toISOString(),
                problem: App.State.data.memoryContext.problem,
                location: App.State.data.memoryContext.location,
                urgency: App.State.data.memoryContext.urgency,
                urgencyScore: App.State.data.memoryContext.urgencyScore,
                type: App.State.data.memoryContext.type,
                status: 'DISPATCHING', // DISPATCHING -> ASSIGNED -> IN_PROGRESS -> COMPLETED
                assignedCraftsman: null,
                price: null
            };
            
            App.State.data.services.unshift(newService);
            App.State.save();
            
            // Force re-render of Taleplerim globally if it is open
            if(App.UI.Operations) App.UI.Operations.render();
            
            App.UI.Chat.doSys(`<div style="font-family:var(--font-mono); font-size:11px; color:var(--text-muted);"><i class="fas fa-terminal"></i> [Sistem] dispatch.createJob({ priority: '${App.State.data.memoryContext.urgencyScore || 'NORMAL'}' }) => OK</div>`);
            App.UI.Chat.doTimeline('Usta Eşleştirme Başladı');
            
            const confReply = "Sorunu anladım. Biz konuşmaya devam ederken ben hızlıca müsait profesyonelleri kontrol ediyorum.";
            App.UI.scheduleMsg('ai', confReply);
            App.UI.Chat.setQuickActions([]);
            
            // PWA Lockscreen Push for Customer
            if (App.Adapters.PWARuntime) App.Adapters.PWARuntime.mockLockscreenNotification('Ekipler Aranıyor', 'Size en uygun ustayı eşleştiriyoruz, lütfen bekleyin.');

            setTimeout(() => App.Engine.Dispatch.startCycle(), 4000);
        }
    },

    getClosestCity(input) {
        input = input.trim().toLowerCase();
        const cities = Object.keys(App.Data.Locations || {});
        if(cities.length === 0) return null;
        
        // Exact match
        const exact = cities.find(c => c.toLowerCase() === input);
        if(exact) return { match: exact, distance: 0 };
        
        // Prefix match (like "gaziante" matching "Gaziantep")
        const prefix = cities.find(c => c.toLowerCase().startsWith(input) || input.startsWith(c.toLowerCase()));
        if(prefix) return { match: prefix, distance: 1 };
        
        // Levenshtein
        let closest = null;
        let minD = 999;
        cities.forEach(c => {
            const d = this.levenshtein(c.toLowerCase(), input);
            if(d < minD) { minD = d; closest = c; }
        });
        return { match: closest, distance: minD };
    },

    levenshtein(a, b) {
        if(a.length === 0) return b.length;
        if(b.length === 0) return a.length;
        const matrix = [];
        for(let i=0; i<=b.length; i++) matrix[i] = [i];
        for(let j=0; j<=a.length; j++) matrix[0][j] = j;
        for(let i=1; i<=b.length; i++) {
            for(let j=1; j<=a.length; j++) {
                if(b.charAt(i-1) == a.charAt(j-1)) matrix[i][j] = matrix[i-1][j-1];
                else matrix[i][j] = Math.min(matrix[i-1][j-1]+1, Math.min(matrix[i][j-1]+1, matrix[i-1][j]+1));
            }
        }
        return matrix[b.length][a.length];
    }
};
