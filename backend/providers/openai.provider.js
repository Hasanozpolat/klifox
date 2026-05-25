const OpenAI = require('openai');

class OpenAIProvider {
    constructor() {
        // Will throw an error if API key isn't provided, but we wrap it to ensure safe failover
        this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "sk-dummy-key" });
    }

    async *streamCompletion(messages, options = {}) {
        try {
            const stream = await this.client.chat.completions.create({
                model: options.model || "gpt-4o-mini",
                messages,
                stream: true,
                temperature: options.temperature || 0.7,
                max_tokens: options.maxTokens || 300
            });

            for await (const chunk of stream) {
                const delta = chunk.choices[0]?.delta?.content || "";
                if (delta) yield delta;
            }
        } catch (error) {
            console.error("[OpenAI Provider] Hata:", error.message);
            throw new Error(error.status === 429 ? "RATE_LIMIT" : "PROVIDER_FAIL");
        }
    }
}

module.exports = new OpenAIProvider();
