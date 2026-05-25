App.Adapters.AI = {
    usageStats: { prompt_tokens: 0, completion_tokens: 0, total: 0 },
    
    // Core Complete Function (Called by engine/ai.js)
    async complete(systemPrompt, userText, forceProvider=null) {
        const provider = forceProvider || App.Config.AI.primaryProvider;
        App.Logger.log(`Yönlendirme: Model Engine...`, 'AI_Orchestrator');
        
        if (App.Adapters.EventBus) App.Adapters.EventBus.emit('ai.orchestrator.log', `Yeni Girdi Alındı: Model -> ${provider}`);

        if (App.Config.SIMULATION_MODE || !App.Adapters.Socket.connected) {
            if (App.Adapters.EventBus) App.Adapters.EventBus.emit('ai.orchestrator.log', `[BAĞLANTI YOK] Fallback Node.js kural simülatörü devrede.`);
            App.Logger.log(`[HYBRID AI] Simulation fallback executing...`, 'AI_Orchestrator');
            await App.API.simLatency(800, 1200); 
            const pTokens = Math.floor(userText.length / 3);
            this.updateUsage(pTokens, 45);
            return { provider_used: "LOCAL_RULE_ENGINE", status: "simulated_success" };
        } else {
            App.Logger.log(`[HYBRID AI] Requesting real remote backend streaming inference...`, 'AI_Orchestrator');
            if (App.Adapters.EventBus) App.Adapters.EventBus.emit('ai.orchestrator.log', `Gerçek OpenAI API'sine bağlantı kuruluyor...`);
            
            // Fire and forget payload to real backend. AI Router creates "ai.stream.*" events
            const pTokens = Math.floor(userText.length / 3);
            this.updateUsage(pTokens, 0); // Prompt usage predicted
            
            App.Adapters.Socket.emit('ai.prompt.submit', {
                message: userText,
                user: App.State?.data?.userProfile,
                history: App.State?.data?.chatHistory || [],
                state: App.State?.data?.memoryContext || {},
                roomId: `customer_${App.State?.data?.activeUserId}`
            });

            return {
                provider_used: provider,
                status: "real_streaming_initiated" // UI will now listen to WS chunks 
            };
        }
    },

    updateUsage(pCount, cCount) {
        this.usageStats.prompt_tokens += pCount;
        this.usageStats.completion_tokens += cCount;
        this.usageStats.total = this.usageStats.prompt_tokens + this.usageStats.completion_tokens;
    }
};
