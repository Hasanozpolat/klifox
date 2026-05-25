App.Logger = {
    history: [],
    
    log(msg, module = 'SYSTEM') {
        const entry = { time: new Date(), level: 'info', module, msg };
        this.history.push(entry);
        if (App.UI.DevPanel) App.UI.DevPanel.log(`[${module}] ${msg}`, 'info');
    },

    error(err, module = 'SYSTEM', payload = null) {
        const entry = { time: new Date(), level: 'error', module, err, payload };
        this.history.push(entry);
        
        console.error(`[REST_ERROR] ${module}:`, err, payload);
        if (App.UI.DevPanel) App.UI.DevPanel.log(`[ERROR: ${module}] ${err}`, 'danger');
        
        // Simulating Sentry capture
        this.captureSentry(entry);
    },

    captureSentry(errorEvent) {
        // Mock pushing to backend monitoring service
        // e.g., fetch('https://sentry.io/api/...', { method: 'POST' })
    },

    retryStrategy(asyncFunction, retries = App.Config.API.retryCount) {
        return async (...args) => {
            for (let i = 0; i < retries; i++) {
                try {
                    return await asyncFunction(...args);
                } catch (e) {
                    if (i === retries - 1) {
                        this.error(`Max retries reached`, 'NetworkLayer', e);
                        throw e;
                    }
                    await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i))); // Exponential backoff
                }
            }
        };
    }
};
