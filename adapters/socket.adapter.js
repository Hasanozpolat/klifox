App.Adapters.Socket = {
    connected: false,
    rooms: new Set(),
    reconnectAttempts: 0,
    heartbeatInterval: null,
    ioClient: null,
    
    connect() {
        if (!App.Config.Realtime || !App.Config.Realtime.enabled) return;
        if (this.ioClient && this.ioClient.connected) return; // Prevent duplicate connections
        
        App.Logger.log(`WebSocket Gerçek Bağlantı Deneniyor (${App.Config.Realtime.host})...`, 'SocketIO');
        
        if (typeof io !== 'undefined') {
            if (this.ioClient) {
                this.ioClient.disconnect();
                this.ioClient.removeAllListeners();
            }
            this.ioClient = io(App.Config.Realtime.host, { 
                reconnectionDelay: App.Config.Realtime.reconnectionDelay,
                reconnectionAttempts: App.Config.Realtime.maxRetries,
                timeout: 2500
            });
            
            this.ioClient.on('connect', () => this._handleRealConnect());
            
            this.ioClient.on('connect_error', (err) => {
                if (!App.Config.SIMULATION_MODE) {
                    App.Logger.log(`[WSS ERROR] Gerçek nodejs sunucusu bulunamadı. SIMULATION fallback aktifleştiriliyor.`, 'error');
                }
                this.fallbackToSimulation();
            });
            
            this.ioClient.on('disconnect', () => {
                App.Logger.log('[WSS] Sunucu Bağlantısı Başarısız/Koptu', 'warning');
                this.connected = false;
                this.fallbackToSimulation();
            });
            
            // Server-to-Client listeners mapped dynamically
            this.ioClient.on('message.new', (msg) => this.triggerLocal('message.new', msg));
            this.ioClient.on('room.sync', (data) => this.triggerLocal('room.sync', data));
            this.ioClient.on('metrics.server', (m) => this.triggerLocal('metrics.server', m));
            this.ioClient.on('dispatch.incoming', (data) => this.triggerLocal('dispatch.incoming', data));
            this.ioClient.on('dispatch.human_accepted', (data) => this.triggerLocal('dispatch.human_accepted', data));
            this.ioClient.on('dispatch.chat_relay', (data) => this.triggerLocal('dispatch.chat_relay', data));
            this.ioClient.on('dispatch.status_change', (data) => this.triggerLocal('dispatch.status_change', data));
            this.ioClient.on('dispatch.job_priced', (data) => this.triggerLocal('dispatch.job_priced', data));
            this.ioClient.on('financial.settlement', (data) => this.triggerLocal('financial.settlement', data));
            this.ioClient.on('financial.gift_credit', (data) => this.triggerLocal('financial.gift_credit', data));
            this.ioClient.on('referral.new_member', (data) => this.triggerLocal('referral.new_member', data));
            
            // Global State Sync Handlers
            const handleStateSync = (partialState) => {
                if (partialState.services) {
                    App.State._isSyncing = true;
                    App.State.data.services = partialState.services;
                    App.State.save();
                    App.State._isSyncing = false;
                    
                    if (App.UI.CraftsmanDash && App.UI.CraftsmanDash.inited && document.getElementById('view-craftsman') && document.getElementById('view-craftsman').classList.contains('active')) App.UI.CraftsmanDash.renderJobs();
                    if (App.UI.Operations && document.getElementById('view-operations') && document.getElementById('view-operations').classList.contains('active')) App.UI.Operations.render();
                    if (window.Admin && typeof window.Admin.refreshData === 'function') window.Admin.refreshData(true);
                }
                if (partialState.users) {
                    const localUsers = JSON.parse(localStorage.getItem('klifox_users') || '{}');
                    // Merge
                    Object.assign(localUsers, partialState.users);
                    localStorage.setItem('klifox_users', JSON.stringify(localUsers));
                    if (window.Admin && typeof window.Admin.refreshData === 'function') window.Admin.refreshData(true);
                }
            };
            this.ioClient.on('global.sync', handleStateSync);
            this.ioClient.on('global.state.sync', handleStateSync);
            this.ioClient.on('dispatch.chat_relay', (data) => {
                const isUsta = App.State.data.userProfile && App.State.data.userProfile.role === 'craftsman';
                
                // Track dual approval
                if (data.text && data.text.includes('✅ Anlaştık!')) {
                    App.State.data.otherAgreed = true;
                    if (App.State.data.iAgreed) {
                        App.Adapters.EventBus.emit('dispatch.status_change', { id: App.State.data.currentRequestId, status: 'APPROVED' });
                    }
                }

                if (data.role === 'craftsman' && !isUsta) {
                    if (data.type === 'offer') {
                        if (App.Rules.Service) {
                            App.Rules.Service.proposeOffer(data.price, 'Canlı Usta Teklifi');
                        }
                    } else {
                        if (App.UI && App.UI.Chat) App.UI.Chat.addMessage('craftsman', data.text);
                    }
                }
                if (data.role === 'user' && isUsta) {
                    if (data.type !== 'offer') {
                        if (App.UI && App.UI.Chat) App.UI.Chat.addMessage('user', data.text);
                    }
                }
                
                // Add notification if not on chat screen
                if (App.UI && App.UI.Chat) {
                    const chatView = document.getElementById('view-chat');
                    if (!chatView || !chatView.classList.contains('active')) {
                        App.UI.toast('Yeni Mesaj', `${data.role === 'user' ? 'Müşteriden' : 'Ustadan'} yeni bir mesajınız var.`, 'info');
                    }
                }
            });
        } else {
            this.fallbackToSimulation();
        }
    },

    fallbackToSimulation() {
        if (this.ioClient) this.ioClient.close();
        if (this.connected && App.Config.SIMULATION_MODE) return; // Zaten simülasyonda

        App.Config.SIMULATION_MODE = true;
        this.connected = true;
        App.Logger.log('[HYBRID] Simulated Socket connection Devrede.', 'SocketIO');
        
        if (App.Adapters.EventBus) {
            App.Adapters.EventBus.emit('socket.connected', { status: 'simulated' });
        }
    },

    _handleRealConnect() {
        App.Config.SIMULATION_MODE = false;
        this.connected = true;
        this.reconnectAttempts = 0;
        App.Logger.log('[WSS] AKTİF: Gerçek Sunucuya Bağlanıldı! (Node/Socket.io Active)', 'success');
        
        if (App.Adapters.EventBus) {
            App.Adapters.EventBus.emit('socket.connected', { status: 'real' });
        }
        
        // Join previously requested rooms if reconnected
        this.rooms.forEach(r => {
            this.ioClient.emit('room.join', { room: r, user: { name: App.State?.data?.userProfile?.name } });
        });
    },

    joinRoom(roomType, resourceId) { 
        if (!this.connected) return;
        const roomId = `${roomType}_${resourceId}`;
        this.rooms.add(roomId);
        App.Logger.log(`Joined network room: [${roomId}]`, 'SocketIO');
        
        if (App.Adapters.EventBus) {
            App.Adapters.EventBus.emit('room.joined', { room: roomId });
        }

        if (!App.Config.SIMULATION_MODE && this.ioClient) {
            this.ioClient.emit('room.join', { room: roomId, user: { name: App.State?.data?.userProfile?.name } });
        }
    },

    leaveRoom(roomId) {
        this.rooms.delete(roomId);
        if (App.Adapters.EventBus) App.Adapters.EventBus.emit('room.left', { room: roomId });
    },

    emit(event, payload) {
        if (!this.connected) {
            App.Logger.log(`[QUEUE] Message queued (Offline): ${event}`, 'SocketIO');
            if (App.Adapters.ChatPersistence) {
                App.Adapters.ChatPersistence.queuePending({event, payload});
            }
            return;
        }
        
        App.Logger.log(`[WSS->] EMIT: ${event}`, 'SocketIO');
        if (App.Config.SIMULATION_MODE) {
            // Simülasyon döngüsü
        } else if (this.ioClient) {
            this.ioClient.emit(event, payload);
        }
    },

    on(event, callback) {
        if (App.Adapters.EventBus) App.Adapters.EventBus.on(event, callback);
    },

    triggerLocal(event, payload) {
        if (App.Adapters.EventBus) {
            App.Adapters.EventBus.emit(event, payload, true);
        }
    }
};
