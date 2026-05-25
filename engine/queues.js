window.App = window.App || {};
App.Engine = App.Engine || {};

App.Engine.Queues = {
    queues: {
        critical: [],    // Priority 1: Auth, Emergency Dispatch, System Fails
        standard: [],    // Priority 2: General routing, chat, AI processing
        delayed: [],     // Priority 3: Analytics, delayed retries
        deadLetter: []   // Failed 3+ times
    },

    stats: { processed: 0, failed: 0, retried: 0, overflows: 0 },

    init() {
        App.Logger.log("Message Queue Engine (MQ) Başlatıldı", "QueueEngine");
    },

    push(jobType, payload, priority = "standard") {
        if (!this.queues[priority]) priority = "standard";
        
        // Overflow protection
        if (this.queues[priority].length > 50) {
            App.Logger.log(`[MQ] Aşırı Yük Koruması (Kuyruk: ${priority})`, "QueueEngine");
            this.stats.overflows++;
            this.queues.delayed.push({ id: crypto.randomUUID(), type: jobType, payload, retries: 0, timestamp: Date.now() });
            return;
        }

        const job = { id: crypto.randomUUID(), type: jobType, payload, retries: 0, timestamp: Date.now() };
        this.queues[priority].push(job);
        
        if (App.UI.Topology) App.UI.Topology.updateQueueMetrics();
    },

    popHighestPriority() {
        if (this.queues.critical.length > 0) return this.queues.critical.shift();
        if (this.queues.standard.length > 0) return this.queues.standard.shift();
        
        // Check delayed queue readiness
        const now = Date.now();
        const readyDelayedIdx = this.queues.delayed.findIndex(j => now - j.timestamp > 3000);
        if (readyDelayedIdx > -1) {
            return this.queues.delayed.splice(readyDelayedIdx, 1)[0];
        }
        
        return null; // Empty
    },

    moveToDeadLetter(job) {
        this.queues.deadLetter.push(job);
        this.stats.failed++;
        App.Logger.log(`Job Sınıflandırılamadı -> DLQ: ${job.type} (${job.id})`, "QueueEngine");
        if (App.UI.Topology) App.UI.Topology.updateQueueMetrics();
    }
};
