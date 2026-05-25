App.API = {
    async simLatency(min = 200, max = 800) {
        if (!App.Config.latencyEnabled) return Promise.resolve();
        const delay = Math.floor(Math.random() * (max - min + 1)) + min;
        return new Promise(resolve => setTimeout(resolve, delay));
    },

    async getUser(userId) {
        await this.simLatency(100, 300);
        return App.State.data.userProfile; // Sourced dynamically from Live State vs Static JSON
    },

    async updateWallet(userId, deduction) {
        await this.simLatency(400, 800);
        const p = App.State.data.userProfile;
        p.wallet.balance -= deduction;
        App.State.save();
        return { success: true, newBalance: p.wallet.balance };
    },

    async requestDispatch(context) {
        await this.simLatency(800, 1500); 
        let activeCraftsmen = App.DB.Craftsmen.filter(c => c.status === 'online');
        activeCraftsmen.sort((a,b) => b.rating - a.rating);
        return activeCraftsmen[0]; 
    }
};
