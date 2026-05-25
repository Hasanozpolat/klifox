window.App = window.App || {};
App.Engine = App.Engine || {};

App.Engine.Orchestrator = {
    isRunning: false,
    tickRateMs: 500, // Process queues every 500ms
    failureRate: 0.03, // 3% job failure chance
    tickTimeout: null,

    init() {
        App.Logger.log("KliFox Backend Orchestrator Devreye Girdi (K8s Mock)", "Orchestrator");
        if (App.Engine.Queues) App.Engine.Queues.init();
        this.start();
        
        // Randomly simulate Kubernetes events
        setInterval(() => this.randomChaosEvent(), 35000);
    },

    start() {
        this.isRunning = true;
        this.loop();
    },
    
    stop() {
        this.isRunning = false;
        if(this.tickTimeout) clearTimeout(this.tickTimeout);
    },

    loop() {
        if (!this.isRunning) return;
        this.processCycle();
        
        if (App.UI.Topology) App.UI.Topology.render(); // Keep UI updated
        
        this.tickTimeout = setTimeout(() => this.loop(), this.tickRateMs);
    },

    async processCycle() {
        // Increment uptimes
        if (App.Engine.Workers && App.Engine.Queues) {
            App.Engine.Workers.registry.forEach(w => {
                if (w.status !== "crashed") w.uptime += (this.tickRateMs / 1000);
            });
            
            // Pop highest priority job
            const job = App.Engine.Queues.popHighestPriority();
            if (!job) return; // No jobs

            const worker = App.Engine.Workers.getAvailableWorker(job.type);
            
            if (worker) {
                try {
                    // Send job to designated worker node
                    await App.Engine.Workers.processJob(worker, job);
                    App.Engine.Queues.stats.processed++;
                } catch (error) {
                    this.handleJobFailure(job, worker);
                }
            } else {
                // No workers available -> Queuing pressure
                App.Logger.log(`[PRESSURE] Resource Wait: No idle workers for ${job.type}. Request delayed.`, "Orchestrator");
                App.Engine.Queues.queues.delayed.push({...job, timestamp: Date.now()});
            }
        }
    },

    handleJobFailure(job, worker) {
        job.retries++;
        App.Engine.Queues.stats.retried++;
        if (job.retries >= 3) {
            App.Engine.Queues.moveToDeadLetter(job);
        } else {
            job.timestamp = Date.now(); // Reset delay timer
            App.Engine.Queues.queues.delayed.push(job);
        }
        worker.status = "idle"; // Free the worker again
    },

    randomChaosEvent() {
        // Simulates real-world unreliability forcing self-healing
        const r = Math.random();
        if (r < 0.3 && App.Engine.Workers) {
            const workers = App.Engine.Workers.registry;
            const target = workers[Math.floor(Math.random() * workers.length)];
            
            if (target.status !== "crashed") {
                App.Engine.Workers.simulateCrash(target.id);
                // Auto-recover after 8 seconds (Simulating Kubernetes StatefulSets)
                setTimeout(() => App.Engine.Workers.recoverNode(target.id), 8000);
            }
        } else if (r < 0.6 && App.Engine.Queues) {
            // Traffic spike simulation
            App.Logger.log("[AUTOSCALING] KliFox Network Traffic Spike Detected! Allocating virtual resources...", "Orchestrator");
            for(let i=0; i<15; i++) {
                App.Engine.Queues.push("ai.prompt.submit", { meta: "spike_load" }, "standard");
            }
        }
    }
};
