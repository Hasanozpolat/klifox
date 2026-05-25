App.State = {
    data: {
        activeUserId: null,
        onboardingComplete: false,
        userProfile: null,
        platformState: "AI", // AI, DISPATCHING, CRAFTSMAN, CHECKOUT
        currentRequestId: null,
        collectionStep: 0,
        chatHistory: [],
        memoryContext: {
            problem: '',
            location: '',
            urgency: '',
            type: '',
            urgencyScore: 'NORMAL'
        },
        services: [], // Persist actual service requests
        devConsoleVisible: false
    },
    
    init() {
        const stored = localStorage.getItem('klifox_state');
        if (stored) {
            try { this.data = JSON.parse(stored); } catch(e) {}
        }
        
        if (!this.data.currentRequestId) {
            this.data.currentRequestId = 'REQ-' + Math.floor(Math.random() * 90000 + 10000);
            this.save();
        }
    },

    save() {
        localStorage.setItem('klifox_state', JSON.stringify(this.data));
        
        // Sync active userProfile back to the global klifox_users registry
        if (this.data.userProfile && this.data.activeUserId) {
            let users = JSON.parse(localStorage.getItem('klifox_users') || '{}');
            if (users[this.data.activeUserId]) {
                // Check if there's an actual change to prevent unnecessary broadcasts
                if (JSON.stringify(users[this.data.activeUserId]) !== JSON.stringify(this.data.userProfile)) {
                    users[this.data.activeUserId] = this.data.userProfile;
                    localStorage.setItem('klifox_users', JSON.stringify(users));
                    
                    if (App.Adapters && App.Adapters.Socket && App.Adapters.Socket.connected && !this._isSyncing) {
                        App.Adapters.Socket.emit('global.state.update', { users: users });
                    }
                }
            }
        }

        if (App.UI.DevPanel && typeof App.UI.DevPanel.renderState === 'function') {
            App.UI.DevPanel.renderState();
        }
        
        // Broadcast global state parts to Node.js for Multi-Browser Testing
        if (App.Adapters && App.Adapters.Socket && App.Adapters.Socket.connected && !this._isSyncing) {
            App.Adapters.Socket.emit('global.state.update', { services: this.data.services });
        }
    },

    addMessage(role, text) {
        this.data.chatHistory.push({ role, text, time: Date.now() });
        this.save();
    },
    
    resetSession() {
        localStorage.removeItem('klifox_state');
        window.location.reload();
    }
};

window.addEventListener('storage', (e) => {
    if (e.key === 'klifox_state' && e.newValue) {
        try {
            App.State.data = JSON.parse(e.newValue);
            if (App.UI.CraftsmanDash && document.getElementById('view-craftsman') && document.getElementById('view-craftsman').classList.contains('active')) {
                App.UI.CraftsmanDash.render();
            }
            if (App.UI.Operations && document.getElementById('view-operations') && document.getElementById('view-operations').classList.contains('active')) {
                App.UI.Operations.render();
            }
            if (App.UI.PartnerDash && document.getElementById('view-partner') && document.getElementById('view-partner').classList.contains('active')) {
                App.UI.PartnerDash.render();
            }
        } catch(err) {}
    }
});
