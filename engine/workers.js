window.App = window.App || {};
App.Engine = App.Engine || {};

App.Engine.Workers = {
    registry: [
        { id: "ai-node-alpha", type: "AI", status: "idle", uptime: 0, jobs: 0, failed: 0, cluster: "frankfurt" },
        { id: "ai-node-beta", type: "AI", status: "idle", uptime: 0, jobs: 0, failed: 0, cluster: "istanbul" },
        { id: "dsp-worker-1", type: "DISPATCH", status: "idle", uptime: 0, jobs: 0, failed: 0, cluster: "istanbul" },
        { id: "dsp-worker-2", type: "DISPATCH", status: "idle", uptime: 0, jobs: 0, failed: 0, cluster: "istanbul" },
        { id: "wallet-worker", type: "ECONOMY", status: "idle", uptime: 0, jobs: 0, failed: 0, cluster: "ankara" },
        { id: "notification-hub", type: "NOTIFIER", status: "idle", uptime: 0, jobs: 0, failed: 0, cluster: "global-edge" }
    ],

    async processJob(worker, job) {
        worker.status = "busy";
        worker.jobs++;
        
        // Simulating processing logic & latency
        const latency = Math.floor(Math.random() * 600) + 100;
        
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate occasional failure (worker crash or provider failure)
                const failChance = App.Engine.Orchestrator.failureRate || 0.05;
                if (Math.random() < failChance) {
                    worker.failed++;
                    worker.status = "crashed"; // Memory leak fix: prevent infinite busy
                    reject(new Error("Worker Crash or Timeout"));
                    return;
                }
                
                worker.status = "idle";
                resolve({ success: true, worker_id: worker.id });
            }, latency);
        });
    },

    getAvailableWorker(jobType) {
        let expectedType = "NOTIFIER";
        if (jobType.includes('ai.')) expectedType = "AI";
        if (jobType.includes('dispatch.')) expectedType = "DISPATCH";
        if (jobType.includes('wallet.')) expectedType = "ECONOMY";
        
        return this.registry.find(w => w.type === expectedType && w.status === "idle");
    },
    
    simulateCrash(workerId) {
        const w = this.registry.find(w => w.id === workerId);
        if (w) {
            w.status = "crashed";
            App.Logger.log(`[ALERT] Cluster Node düştü: ${workerId}. Yönlendirme kesildi.`, "warning");
        }
    },

    recoverNode(workerId) {
        const w = this.registry.find(w => w.id === workerId);
        if (w && w.status === "crashed") {
            w.status = "idle";
            App.Logger.log(`[RECOVERY] Cluster Node kurtarıldı: ${workerId}. Servis tekrar yayında.`, "success");
        }
    }
};
