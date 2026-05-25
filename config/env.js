App.Config = {
    ENV: 'production', // Switched to production for Pilot deployment
    MVP_MODE: true, // Freeze non-core MVP systems
    
    PILOT: {
        active: true,
        regions: ['Gaziantep', 'Şahinbey', 'Şehitkamil'],
        fallbackRadiusKm: 15, // Max distance for dispatch
        strictGeofence: true // Reject requests outside pilot zones
    },

    API: {
        baseURL: 'https://api.klifox.com/v1',
        timeoutMs: 8000, // Faster timeout for mobile
        retryCount: 3
    },
    
    AI: {
        primaryProvider: 'OpenAI', // 'OpenAI', 'Claude', 'Local'
        fallbackProvider: 'Claude',
        models: {
            OpenAI: 'gpt-4o-mini',
            Claude: 'claude-3-haiku'
        },
        temperature: 0.7,
        maxTokens: 500
    },

    SIMULATION_MODE: true, // Auto-switched to false by Socket client if backend is reachable
    
    Realtime: {
        enabled: true,
        host: 'http://localhost:3000', // Points to local Express/Socket.io backend
        pingInterval: 15000,
        reconnectionDelay: 2000,
        maxRetries: 2,
        namespaces: ['/chat', '/dispatch', '/operations', '/presence']
    },

    Security: {
        enableRateLimit: true, // 100 requests / 15m
        jwtExpiryDays: 7,
        cookieSecure: true,
        corsOrigins: ['https://klifox.com', 'https://admin.klifox.com']
    }
};
