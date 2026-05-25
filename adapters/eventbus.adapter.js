App.Adapters.EventBus = {
    _listeners: {},

    on(event, callback) {
        if (!this._listeners[event]) this._listeners[event] = [];
        this._listeners[event].push(callback);
    },

    off(event, callback) {
        if (!this._listeners[event]) return;
        this._listeners[event] = this._listeners[event].filter(cb => cb !== callback);
    },

    emit(event, payload, fromSocket = false) {
        App.Logger.log(`[EventBus] EMIT: ${event}`, "EventBus");
        
        if (this._listeners[event]) {
            this._listeners[event].forEach(cb => cb(payload));
        }

        // Bridge to Socket outbound if it's a networked event
        if (event.includes('.') && !fromSocket) { 
            // e.g. dispatch.created, craftsman.accepted
            if (App.Adapters.Socket && App.Adapters.Socket.connected) {
                App.Adapters.Socket.emit(event, payload);
            }
        }
    }
};
