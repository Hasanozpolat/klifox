const openAI = require('../providers/openai.provider');
const contextEngine = require('./context-engine');

module.exports = {
    activeStreams: new Map(), // socketId -> isStreaming
    
    async handlePrompt(socket, io, data) {
        const { message, user, history, state, roomId } = data;
        
        // Rate limiting check
        if (this.activeStreams.get(socket.id)) {
            socket.emit("ai.error", { code: "RATE_LIMIT", message: "Yapay zeka şu anda başka bir işlemi işliyor." });
            return;
        }

        try {
            // Context Preparation
            const messages = contextEngine.buildContext(user, history, state);
            messages.push({ role: "user", content: message });
            
            // Broadcast start
            this.activeStreams.set(socket.id, true);
            io.to(roomId).emit("ai.stream.started", { provider: "openai" });

            // Fake API key failsafe (Graceful Fallback mapping)
            const stream = await openAI.streamCompletion(messages);
            
            let fullText = "";
            let tokenCount = 0;

            for await (const chunk of stream) {
                if (!this.activeStreams.get(socket.id)) break; // Interrupt triggered
                
                fullText += chunk;
                tokenCount++;
                io.to(roomId).emit("ai.stream.chunk", { delta: chunk });
            }

            // End Broadcast
            io.to(roomId).emit("ai.stream.end", { complete_text: fullText, usage: { total: tokenCount } });

        } catch (error) {
            console.error(`[AI Router] Fallback Tetiklendi: ${error.message}`);
            // Force Fallback to Simulation Engine mapping on Client
            io.to(roomId).emit("ai.stream.fallback", { reason: error.message });
        } finally {
            this.activeStreams.delete(socket.id);
        }
    },

    interrupt(socketId) {
        this.activeStreams.set(socketId, false);
    }
};
