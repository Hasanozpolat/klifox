App.Adapters.Presence = {
    onlineUsers: new Map(),
    activeSessions: new Map(),
    typingStatus: new Map(),
    regionalCounts: { istanbul: 1420, ankara: 850, izmir: 430 }, // Base realistic numbers

    init() {
        App.Adapters.EventBus.on('presence.update', this.handleUpdate.bind(this));
        App.Adapters.EventBus.on('presence.typing', this.handleTyping.bind(this));
    },

    setOnline(userId, role, region = 'istanbul') {
        this.onlineUsers.set(userId, { role, status: 'online', lastActive: Date.now() });
        this.regionalCounts[region]++;
        App.Adapters.EventBus.emit('presence.update', { userId, status: 'online', region });
    },

    setOffline(userId, region = 'istanbul') {
        this.onlineUsers.delete(userId);
        if (this.regionalCounts[region] > 0) this.regionalCounts[region]--;
        App.Adapters.EventBus.emit('presence.update', { userId, status: 'offline', region });
    },

    setTyping(userId, isTyping) {
        this.typingStatus.set(userId, isTyping);
        App.Adapters.EventBus.emit('presence.typing', { userId, isTyping });
    },

    getRegionalStats() {
        return this.regionalCounts;
    },

    handleUpdate(payload) {
        App.Logger.log(`Presence Update -> User ${payload.userId} is ${payload.status}`, "Presence");
    },

    handleTyping(payload) {
        App.Logger.log(`Presence Typing -> User ${payload.userId} typing: ${payload.isTyping}`, "Presence");
    }
};
