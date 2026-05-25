App.Adapters.ChatPersistence = {
    pendingQueue: [],
    
    init() {
        if (App.Adapters.EventBus) {
            App.Adapters.EventBus.on('socket.connected', this.flushQueue.bind(this));
        }
    },

    syncHistory(roomId) {
        App.Logger.log(`[SYNC] Fetching chat history for room: ${roomId}`, "Persistence");
        // Simulated local history or network fetch
        return App.State.data.chatHistory || [];
    },

    cacheLocal(role, text) {
        App.State.addMessage(role, text); // Delegate to Store where saving happens
    },

    queuePending(messageEvent) {
        this.pendingQueue.push(messageEvent);
        App.Logger.log(`[QUEUE] Message queued for later delivery. Pending: ${this.pendingQueue.length}`, "Persistence");
    },

    flushQueue() {
        if (this.pendingQueue.length === 0) return;
        App.Logger.log(`[FLUSH] Sending ${this.pendingQueue.length} pending messages to Realtime layer`, "Persistence");
        const toFlush = [...this.pendingQueue];
        this.pendingQueue = [];
        toFlush.forEach(msg => {
            if (App.Adapters.Socket) {
                App.Adapters.Socket.emit(msg.event, msg.payload);
            }
        });
    }
};
