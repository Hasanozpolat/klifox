window.App = window.App || {};
App.API_Contracts = App.API_Contracts || {};

App.API_Contracts.Security = {
    JWT_Payload: {
        header: { alg: "RS256", typ: "JWT" },
        payload: {
            sub: "user_uuid",
            role: "enum(customer, craftsman, operator, admin)",
            acls: "array of specific grants",
            iat: "timestamp",
            exp: "timestamp (+7d)"
        }
    },

    PermissionMatrix: {
        "customer": {
            allowed: ["service:create", "wallet:read", "profile:update", "chat:send"],
            denied: ["service:claim", "network:manage"]
        },
        "craftsman": {
            allowed: ["dispatch:view", "dispatch:accept", "wallet:read", "profile:update"],
            denied: ["dispatch:create", "system:logs"]
        },
        "operator": {
            allowed: ["service:escalate", "user:suspend", "chat:intervene", "dispatch:override"],
            denied: ["economy:modify_globals"]
        },
        "partner": {
            allowed: ["network:view", "referral:create", "economy:metrics"],
            denied: ["dispatch:accept"]
        },
        "admin": {
            allowed: ["*"],
            denied: []
        }
    },

    RateLimiting: {
        "Global_Edge": "1000 req / minute per IP",
        "AI_Endpoints": "20 req / minute per User",
        "Auth_OTP": "3 req / 5 minutes per Phone",
        "Socket_Messages": "50 msgs / 10 seconds per Session"
    }
};
