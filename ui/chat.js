App.UI.Chat = {
    updateOperationalBanner(show, text, type = 'info') {
        const d = document.getElementById('dispatch-banner');
        const t = document.getElementById('dispatch-banner-text');
        const spinner = document.querySelector('.radar-spinner');
        
        if (d) {
            d.style.display = show ? 'flex' : 'none';
            if (type === 'success') {
                d.style.background = 'rgba(16, 185, 129, 0.15)';
                d.style.borderBottom = '1px solid rgba(16, 185, 129, 0.3)';
                if (spinner) spinner.style.display = 'none';
            } else if (type === 'warning') {
                d.style.background = 'rgba(245, 158, 11, 0.15)';
                d.style.borderBottom = '1px solid rgba(245, 158, 11, 0.3)';
                if (spinner) spinner.style.display = 'none';
            } else {
                d.style.background = 'rgba(59, 130, 246, 0.15)';
                d.style.borderBottom = '1px solid rgba(59, 130, 246, 0.3)';
                if (spinner) spinner.style.display = 'block';
            }
        }
        if (t && text) t.innerHTML = text;
    },
    
    renderLiveQueue(craftsmen) {
        const chatArea = document.getElementById('chat-area');
        if (!chatArea) return;
        
        let existingQueue = document.getElementById('live-queue-container');
        if(existingQueue) existingQueue.remove();
        
        const div = document.createElement('div');
        div.id = 'live-queue-container';
        div.style.cssText = 'background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); padding:15px; border-radius:16px; display:flex; flex-direction:column; gap:10px; margin-bottom:15px;';
        
        const title = document.createElement('div');
        title.style.cssText = 'font-size:12px; color:var(--text-muted); font-weight:600; text-transform:uppercase; letter-spacing:0.5px;';
        title.innerHTML = '<i class="fas fa-broadcast-tower" style="color:var(--accent); margin-right:5px; animation:pulse 1.5s infinite;"></i> Canlı Ağ Taraması';
        div.appendChild(title);
        
        const avatarsRow = document.createElement('div');
        avatarsRow.style.cssText = 'display:flex; gap:10px; flex-wrap:wrap;';
        
        craftsmen.forEach(c => {
            const cDiv = document.createElement('div');
            cDiv.id = `queue-craf-${c.id}`;
            cDiv.style.cssText = 'display:flex; align-items:center; gap:8px; background:rgba(255,255,255,0.03); padding:6px 12px; border-radius:20px; border:1px solid rgba(255,255,255,0.05); transition:0.3s; opacity:0.6;';
            cDiv.innerHTML = `
                <img src="https://i.pravatar.cc/150?u=${c.id}" style="width:24px; height:24px; border-radius:50%;">
                <span style="font-size:12px; color:#fff; font-weight:500;">${c.name}</span>
                <span id="status-${c.id}" style="font-size:10px; color:var(--warning); margin-left:4px;">İnceliyor...</span>
            `;
            avatarsRow.appendChild(cDiv);
        });
        
        div.appendChild(avatarsRow);
        chatArea.appendChild(div);
        this.scrollToBottom();
    },
    
    updateQueueStatus(id, text, color, highlight) {
        const span = document.getElementById(`status-${id}`);
        const cDiv = document.getElementById(`queue-craf-${id}`);
        if(span) {
            span.textContent = text;
            span.style.color = `var(--${color})`;
        }
        if(cDiv && highlight) {
            cDiv.style.opacity = '1';
            cDiv.style.borderColor = `var(--${color})`;
            cDiv.style.background = `rgba(16, 185, 129, 0.1)`;
        }
    },
    
    doTimeline(text) {
        const chatArea = document.getElementById('chat-area');
        if (!chatArea) return;
        const div = document.createElement('div');
        div.className = 'timeline-event';
        div.innerHTML = `<div class="timeline-dot"><i class="fas fa-check"></i></div> <span>${text}</span>`;
        chatArea.appendChild(div);
        this.scrollToBottom();
    },

    doSys(html) {
        const chatArea = document.getElementById('chat-area');
        if (!chatArea) return;
        const div = document.createElement('div');
        div.className = 'sys-msg';
        div.innerHTML = html;
        chatArea.appendChild(div);
        this.scrollToBottom();
    },

    addMessage(role, text) {
        const chatArea = document.getElementById('chat-area');
        if (!chatArea) return;
        const div = document.createElement('div');
        div.className = `message ${role}`;
        div.innerHTML = `<div class="message-bubble">${text}</div>`;
        chatArea.appendChild(div);
        this.scrollToBottom();
    },

    scrollToBottom() {
        const chatArea = document.getElementById('chat-area');
        if (chatArea) chatArea.scrollTop = chatArea.scrollHeight;
    },

    switchToCraftsmanMode(craftsman) {
        document.getElementById('header-name').textContent = craftsman.name;
        document.getElementById('header-status').textContent = 'Usta Yolda';
        document.getElementById('header-avatar').innerHTML = '<img src="' + (craftsman.avatar || 'https://i.pravatar.cc/150?u=' + craftsman.id) + '" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">';
        document.getElementById('header-avatar').className = 'avatar craftsman-avatar';
        document.getElementById('status-dot').style.background = 'var(--success)';
        
        App.State.data.assignedCraftsman = craftsman;
        App.State.data.platformState = 'CRAFTSMAN';
        App.State.save();
        
        this.refreshQuickActions();
    },

    renderServiceCard() {
        const chatArea = document.getElementById('chat-area');
        if (!chatArea) return;

        const p = App.State.data.memoryContext.problem || 'Klima Arızası';
        const d = App.State.data.memoryContext.location || 'Belirtilmemiş';
        const c = App.State.data.assignedCraftsman || { name: 'Ahmet Usta', distance: '3.2 km', type: 'Premium Uzman' };

        const cardHtml = `
        <div class="service-card">
            <div class="service-card-header">
                <div style="display:flex; align-items:center; gap:10px;">
                    <img src="${c.avatar || 'https://i.pravatar.cc/150?u=' + (c.id || '12')}" style="width:40px; height:40px; border-radius:50%; border:2px solid var(--accent);">
                    <div>
                        <div style="font-size:15px; color:#fff;">${c.name}</div>
                        <div style="font-size:11px; color:var(--success);"><i class="fas fa-check-circle"></i> Doğrulanmış Usta</div>
                    </div>
                </div>
                <div style="text-align:right;">
                    <div style="color:var(--warning); font-size:14px;"><i class="fas fa-star"></i> 4.9</div>
                    <div style="font-size:10px; color:var(--text-muted);">124 İşlem</div>
                </div>
            </div>
            <div class="service-card-content">
                <div class="service-card-row">
                    <span class="service-card-label"><i class="fas fa-map-marker-alt"></i> Tahmini Varış</span>
                    <span class="service-card-value text-success">15 Dakika (${c.distance || 'Yakın'})</span>
                </div>
                <div class="service-card-row">
                    <span class="service-card-label"><i class="fas fa-wrench"></i> Arıza Kaydı</span>
                    <span class="service-card-value">${p}</span>
                </div>
                <div class="service-card-row" style="margin-top:15px; border-top:1px dashed rgba(255,255,255,0.1); padding-top:15px;">
                    <span class="service-card-label"><i class="fas fa-shield-alt"></i> KliFox Güvencesi</span>
                    <span class="service-card-value" style="font-size:12px; color:#94a3b8;">Aktif</span>
                </div>
            </div>
        </div>`;
        this.doSys(cardHtml);
    },
    
    setQuickActions(chips) {
        const qa = document.getElementById('quick-actions');
        if (!qa) return;
        qa.innerHTML = '';
        if(!chips || chips.length === 0) return;
        
        // Add a small hint text above chips
        const hint = document.createElement('div');
        hint.style.cssText = 'width: 100%; font-size: 11px; color: var(--text-muted); margin-bottom: 5px; padding-left: 5px;';
        hint.innerHTML = '<i class="fas fa-info-circle"></i> Aşama bildirmek için aşağıdaki butonları kullanabilirsiniz:';
        qa.appendChild(hint);

        chips.forEach(chip => {
            const btn = document.createElement('button');
            btn.innerHTML = chip.label;
            
            if (chip.type === 'action') {
                btn.style.cssText = 'white-space:nowrap; background:rgba(16, 185, 129, 0.15); border:1px solid rgba(16, 185, 129, 0.4); color:#10b981; padding:8px 16px; border-radius:20px; font-size:0.9rem; font-weight:bold; cursor:pointer; flex-shrink:0; box-shadow:0 4px 10px rgba(16,185,129,0.1); transition:0.2s;';
            } else {
                btn.style.cssText = 'white-space:nowrap; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:#fff; padding:8px 16px; border-radius:20px; font-size:0.9rem; cursor:pointer; flex-shrink:0; transition:0.2s;';
            }
            
            btn.onclick = () => {
                if (chip.type === 'action') {
                    if (chip.action === 'approve') App.UI.Chat.handleActionApprove();
                    else if (chip.action === 'complete') App.UI.Chat.handleActionComplete();
                    else if (chip.action === 'finish') App.UI.Chat.handleActionFinish();
                    else if (chip.action === 'new_request') App.UI.Chat.startNewRequest();
                    else if (chip.action === 'call') App.UI.Chat.addMessage('me', '📞 Aranıyor...');
                    else if (chip.action === 'cancel') App.UI.Chat.handleActionCancel();
                    else if (chip.action === 'assign_craftsman') App.UI.Chat.handleActionAssignCraftsman();
                    else if (chip.action === 'select_city') {
                        const cities = Object.keys(App.Data.Locations || {}).sort();
                        App.UI.renderSearchModal(cities, (sel) => {
                            const inp = document.getElementById('message-input');
                            inp.value = sel;
                            document.getElementById('send-btn').click();
                        }, 'İl Ara (Örn: İstanbul)');
                    }
                    else if (chip.action === 'select_district') {
                        const dists = App.Data.Locations[App.State.data.memoryContext.city] || [];
                        App.UI.renderSearchModal(dists.sort(), (sel) => {
                            const inp = document.getElementById('message-input');
                            inp.value = sel;
                            document.getElementById('send-btn').click();
                        }, 'İlçe Ara...');
                    }
                } else {
                    const inp = document.getElementById('message-input');
                    inp.value = chip.value || chip.label;
                    document.getElementById('send-btn').click();
                }
                
                // Re-evaluate quick actions after action
                setTimeout(() => App.UI.Chat.refreshQuickActions(), 500);
            };
            qa.appendChild(btn);
        });
    },

    refreshQuickActions() {
        const reqId = App.State.data.currentRequestId;
        if (!reqId) return;
        const srv = (App.State.data.services || []).find(s => s.id === reqId);
        if (!srv) return;

        const role = App.State.data.userProfile ? App.State.data.userProfile.role : 'customer';
        const state = srv.status || 'DISPATCHING';

        let chips = [];
        if (role === 'customer') {
            if (state === 'DISPATCHING') {
                chips = [ { label: '❌ İptal Et', type: 'action', action: 'cancel' } ];
            } else if (state === 'PARTNER_ESCALATED') {
                chips = [ { label: '❌ İptal Et', type: 'action', action: 'cancel' } ];
            } else if (state === 'MATCHED') {
                chips = [
                    { label: '✅ Anlaştık', type: 'action', action: 'approve' },
                    { label: '❌ İptal Et', type: 'action', action: 'cancel' }
                ];
            } else if (state === 'APPROVED') {
                chips = [ { label: '❌ İptal Et', type: 'action', action: 'cancel' } ];
            } else if (state === 'IN_PROGRESS') {
                chips = [
                    { label: '✅ İşi Onayla', type: 'action', action: 'finish' }
                ];
            } else if (state === 'COMPLETED' || state === 'CANCELLED') {
                chips = [
                    { label: '🆕 Yeni Talep Oluştur', type: 'action', action: 'new_request' }
                ];
            }
        } else if (role === 'craftsman') {
            if (state === 'MATCHED') {
                chips = [
                    { label: '✅ Anlaştık!', type: 'action', action: 'approve' },
                    { label: '❌ İptal Et', type: 'action', action: 'cancel' }
                ];
            } else if (state === 'APPROVED') {
                chips = [
                    { label: '🛠 İş Tamamlandı', type: 'action', action: 'complete' },
                    { label: '❌ İptal Et', type: 'action', action: 'cancel' }
                ];
            } else if (state === 'IN_PROGRESS') {
                chips = []; // Müşteri onayı bekleniyor
            } else if (state === 'COMPLETED' || state === 'CANCELLED') {
                chips = [];
            }
        } else if (role === 'partner') {
            if (state === 'PARTNER_ESCALATED') {
                chips = [
                    { label: '👷 İşi Ustaya Devret', type: 'action', action: 'assign_craftsman' },
                    { label: '❌ İptal Et', type: 'action', action: 'cancel' }
                ];
            } else {
                chips = []; // Partner sadece izleyebilir
            }
        }
        
        this.setQuickActions(chips);
        this.syncBannerWithState(state, srv.assignedCraftsman);
        
        const inputArea = document.getElementById('chat-input-area');
        if (inputArea) {
            if (role === 'partner') {
                inputArea.style.display = 'none';
            } else {
                inputArea.style.display = 'flex';
            }
        }
    },

    syncBannerWithState(state, craftsman) {
        const name = craftsman ? craftsman.name : 'Usta';
        if (state === 'DISPATCHING') {
            this.updateOperationalBanner(true, 'Usta aranıyor...', 'info');
        } else if (state === 'PARTNER_ESCALATED') {
            this.updateOperationalBanner(true, '<i class="fas fa-exclamation-circle"></i> Bölge Yöneticisi (Partner) devrede.', 'warning');
        } else if (state === 'MATCHED') {
            this.updateOperationalBanner(true, `<i class="fas fa-check-circle"></i> ${name} çağrınızı kabul etti.`, 'success');
        } else if (state === 'APPROVED') {
            this.updateOperationalBanner(true, `<i class="fas fa-handshake"></i> Anlaşma Sağlandı. İşlem bekleniyor.`, 'warning');
        } else if (state === 'IN_PROGRESS') {
            this.updateOperationalBanner(true, `<i class="fas fa-hourglass-half"></i> Müşteri onayı bekleniyor.`, 'warning');
        } else if (state === 'COMPLETED') {
            this.updateOperationalBanner(true, `<i class="fas fa-check-double"></i> İş tamamlandı.`, 'success');
        } else if (state === 'CANCELLED') {
            this.updateOperationalBanner(true, `<i class="fas fa-times-circle"></i> İşlem iptal edildi.`, 'danger');
        } else {
            this.updateOperationalBanner(false);
        }
    },
    
    handleActionCancel() {
        const reason = prompt("Lütfen iptal nedeninizi kısaca belirtiniz:");
        if (!reason) return;
        
        if(!confirm("İşlemi iptal etmek istediğinize emin misiniz?")) return;

        App.UI.Chat.addMessage('me', `❌ İptal Edildi: ${reason}`);
        
        const myRole = (App.State.data.userProfile && App.State.data.userProfile.role) || 'customer';
        const actorName = App.State.data.userProfile ? App.State.data.userProfile.name : 'Kullanıcı';

        if (App.Adapters.Socket && App.Adapters.Socket.connected) {
            App.Adapters.Socket.emit('dispatch.chat_relay', { type: 'text', text: `❌ İşlem İptal Edildi (${actorName}). Neden: ${reason}`, role: myRole });
        }
        
        const srv = App.State.data.services.find(s => s.id === App.State.data.currentRequestId);
        if (srv) {
            srv.cancellationReason = reason;
            srv.cancellationActor = myRole;
        }

        App.Adapters.EventBus.emit('dispatch.status_change', { id: App.State.data.currentRequestId, status: 'CANCELLED' });
    },
    
    handleActionAssignCraftsman() {
        // List mock craftsmen for Partner to assign
        const mockCraftsmen = [
            'Ahmet Usta (Klima)',
            'Fatma Teknik (Tesisat)',
            'Mehmet Uzman (Beyaz Eşya)',
            'KliFox Merkez Servisi'
        ];
        
        App.UI.renderSearchModal(mockCraftsmen, (sel) => {
            if(!sel) return;
            
            const craftsman = {
                id: 'CRAF-' + Math.floor(Math.random() * 9000),
                name: sel,
                role: 'craftsman',
                avatar: 'https://i.pravatar.cc/150?u=' + Math.floor(Math.random() * 1000)
            };
            
            const srv = App.State.data.services.find(s => s.id === App.State.data.currentRequestId);
            if (srv) {
                srv.assignedCraftsman = craftsman;
                srv.status = 'MATCHED';
                if (!srv.timeline) srv.timeline = [];
                srv.timeline.push('MATCHED');
                App.State.save();
                
                App.Adapters.EventBus.emit('dispatch.status_change', { id: srv.id, status: 'MATCHED' });
                
                App.UI.toast('Başarılı', `${sel} başarıyla atandı.`, 'success');
                
                // Refresh UI since it's now matched
                App.UI.Chat.refreshQuickActions();
            }
        }, 'Atanacak Ustayı Seçin...');
    },
    
    handleActionApprove() {
        App.State.data.iAgreed = true;
        App.UI.Chat.addMessage('me', '✅ Anlaştık!');
        
        const myRole = (App.State.data.userProfile && App.State.data.userProfile.role === 'craftsman') ? 'craftsman' : 'user';

        if (App.Adapters.Socket && App.Adapters.Socket.connected) {
            App.Adapters.Socket.emit('dispatch.chat_relay', { type: 'text', text: '✅ Anlaştık!', role: myRole });
        }
        
        if (App.State.data.otherAgreed) {
            App.Adapters.EventBus.emit('dispatch.status_change', { id: App.State.data.currentRequestId, status: 'APPROVED' });
        } else {
            // Give a hint that we are waiting for the other side
            this.doSys(`<div style="color:var(--text-muted); font-size:12px; text-align:center;"><i class="fas fa-hourglass-half"></i> Karşı tarafın onayı bekleniyor...</div>`);
        }
    },
    
    handleActionComplete() {
        if (!App.UI.renderServiceCardModal) {
            console.error("renderServiceCardModal is missing!");
            return;
        }
        
        App.UI.renderServiceCardModal(App.State.data.currentRequestId, (cardData) => {
            // Attach card to service
            const srv = (App.State.data.services || []).find(s => s.id === App.State.data.currentRequestId);
            if (srv) {
                srv.serviceCard = cardData;
                App.State.save();
            }

            const msg = `🛠 İş Tamamlandı. Kategori: ${cardData.category}. Ekipman: ${cardData.equipment}. İşlem: ${cardData.operation}. Toplam Tutar: ${cardData.price} ₺. Müşteri onayı bekleniyor.`;
            App.UI.Chat.addMessage('me', msg);
            
            const myRole = (App.State.data.userProfile && App.State.data.userProfile.role === 'craftsman') ? 'craftsman' : 'user';

            if (myRole === 'craftsman') {
                App.State.data.currentServicePrice = cardData.price;
                if (App.Adapters.Socket && App.Adapters.Socket.connected) {
                    App.Adapters.Socket.emit('dispatch.job_priced', { 
                        price: cardData.price, 
                        ustaId: App.State.data.userProfile.id 
                    });
                }
            }

            if (App.Adapters.Socket && App.Adapters.Socket.connected) {
                App.Adapters.Socket.emit('dispatch.chat_relay', { type: 'text', text: msg, role: myRole });
            }
            
            App.Adapters.EventBus.emit('dispatch.status_change', { id: App.State.data.currentRequestId, status: 'IN_PROGRESS' });
        });
    },
    
    handleActionFinish() {
        App.UI.Chat.addMessage('me', '✅ İş Onaylandı. Geçmiş olsun!');
        
        const myRole = (App.State.data.userProfile && App.State.data.userProfile.role === 'craftsman') ? 'craftsman' : 'user';

        if (App.Adapters.Socket && App.Adapters.Socket.connected) {
            App.Adapters.Socket.emit('dispatch.chat_relay', { type: 'text', text: '✅ Müşteri işlemi onayladı. Defter kapatıldı.', role: myRole });
            
            if (myRole === 'user' && App.State.data.currentServicePrice) {
                App.Adapters.Socket.emit('financial.settlement', {
                    amount: App.State.data.currentServicePrice,
                    partnerCode: App.State.data.userProfile.referredBy,
                    customerId: App.State.data.userProfile.id
                });
            }
        }
        
        const rating = prompt("KliFox Ekosistemi: Lütfen ustamızı 1 ile 5 arasında puanlayınız:", "5");
        if (rating) {
            App.UI.Chat.addMessage('me', `🌟 Ustaya Puanım: ${rating}/5`);
            if (App.Adapters.Socket && App.Adapters.Socket.connected) {
                App.Adapters.Socket.emit('dispatch.chat_relay', { type: 'text', text: `🌟 Müşteri Puanı: ${rating}/5`, role: myRole });
            }
            // Update service history
            if (App.State.data.userProfile && App.State.data.currentRequestId) {
                if (!App.State.data.userProfile.serviceHistory) App.State.data.userProfile.serviceHistory = [];
                const srv = App.State.data.services.find(s => s.id === App.State.data.currentRequestId);
                if (srv) {
                    App.State.data.userProfile.serviceHistory.push({
                        id: srv.id,
                        date: new Date().toISOString(),
                        issue: srv.problem || App.State.data.memoryContext?.problem || 'Bilinmiyor',
                        craftsman: srv.assignedCraftsman ? srv.assignedCraftsman.name : 'Belirsiz',
                        rating: parseInt(rating)
                    });
                    App.State.save();
                }
            }
        }

        App.Adapters.EventBus.emit('dispatch.status_change', { id: App.State.data.currentRequestId, status: 'COMPLETED' });
    },

    startNewRequest() {
        App.State.data.currentRequestId = null;
        App.State.data.memoryContext = null;
        App.State.save();
        
        const chatArea = document.getElementById('chat-messages');
        if (chatArea) chatArea.innerHTML = '';
        
        App.UI.Chat.addMessage('sys', 'Yeni talep süreci başlatıldı.');
        
        // Start intent flow again by triggering greeting
        App.Engine.Orchestrator.greetingTriggered = false;
        
        if (App.Adapters.Socket && App.Adapters.Socket.connected && App.State.data.userProfile && App.State.data.userProfile.role === 'user') {
            App.Adapters.Socket.leaveRoom(App.State.data.currentRequestId);
        }
        
        App.UI.Chat.render();
    }
};

Object.assign(App.UI, {
    DevPanel: {
        log: (msg, type) => {
            const list = document.getElementById('terminal-logs');
            if (list) {
                const el = document.createElement('div');
                el.className = `log-line ${type || ''}`;
                el.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
                list.insertBefore(el, list.firstChild);
            }
        },
        enableCheckoutAction: () => {}
    },
    scheduleMsg: (role, msg) => {
        const floatTyping = document.getElementById('floating-typing');
        if (floatTyping) floatTyping.style.display = 'block';
        App.UI.Chat.scrollToBottom();
        
        setTimeout(() => {
            if (floatTyping) floatTyping.style.display = 'none';
            App.UI.Chat.addMessage(role, msg);
        }, 1500);
    }
});

window.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('message-input');
    const btn = document.getElementById('send-btn');
    
    if (input && btn) {
        const send = () => {
            const val = input.value.trim();
            if(!val) return;
            
            input.value = '';

            const isRealUsta = App.State.data.userProfile && App.State.data.userProfile.role === 'craftsman';
            
            if (isRealUsta) {
                if (val.startsWith('/teklif ')) {
                    const price = val.replace('/teklif ', '').trim();
                    App.UI.Chat.addMessage('craftsman', `(Teklif Gönderildi: ${price} TL)`);
                    if (App.Adapters.Socket && App.Adapters.Socket.connected) {
                        App.Adapters.Socket.emit('dispatch.chat_relay', { type: 'offer', price: price, role: 'craftsman' });
                    }
                    return;
                }

                App.UI.Chat.addMessage('craftsman', val);
                if (App.Adapters.Socket && App.Adapters.Socket.connected) {
                    App.Adapters.Socket.emit('dispatch.chat_relay', { type: 'text', text: val, role: 'craftsman' });
                }
                return;
            }

            App.UI.Chat.addMessage('user', val);
            
            // Re-route input based on State
            if (App.State.data.platformState === 'CRAFTSMAN') {
                if (App.Adapters.Socket && App.Adapters.Socket.connected) {
                    App.Adapters.Socket.emit('dispatch.chat_relay', { type: 'text', text: val, role: 'user' });
                }
                if (!App.State.data.isRealHumanCraftsman) {
                    if (App.Rules.Service && App.Rules.Service.handleChat) {
                        App.Rules.Service.handleChat(val);
                    }
                }
            } else if (App.Engine.AI && App.Engine.AI.processInput) {
                App.Engine.AI.processInput(val);
            }
        };
        btn.addEventListener('click', send);
        input.addEventListener('keypress', (e) => { if(e.key === 'Enter') send(); });
    }
});

