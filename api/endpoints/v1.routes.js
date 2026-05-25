window.App = window.App || {};
App.API_Contracts = App.API_Contracts || {};

App.API_Contracts.Endpoints_V1 = [
    {
        group: "Authentication",
        method: "POST",
        path: "/api/v1/auth/exchange",
        description: "Exchange phone OTP for JWT Session",
        body: { phone: "+905...", code: "123456" },
        response: { token: "eyJhbGc...", refresh_token: "xyz...", user: "{id, role, name}" },
        errors: ["AUTH_ERROR", "RATE_LIMIT"]
    },
    {
        group: "Dispatch Engine",
        method: "POST",
        path: "/api/v1/dispatch/create",
        description: "Initializes cluster matching logic for urgent services",
        body: { service_category: "AC_REPAIR", lat: 41.0, lng: 28.9, urgency: "CRITICAL" },
        response: { dispatch_id: "REQ-9991", initial_radius_km: 5, active_craftsmen_in_range: 12 },
        errors: ["VALIDATION_FAIL", "SERVICE_UNAVAILABLE"]
    },
    {
        group: "Network Economy",
        method: "POST",
        path: "/api/v1/wallet/spend-credit",
        description: "Deduct loyalty/reputation credits securely",
        body: { user_id: "uuid", amount: 50.0, reason: "FAST_TRACK_DISPATCH" },
        response: { success: true, new_balance: 1450.0, transaction_id: "txn_111" },
        errors: ["AUTH_ERROR", "VALIDATION_FAIL"]
    },
    {
        group: "System Meta",
        method: "GET",
        path: "/api/v1/meta/health",
        description: "Check distributed core health",
        body: null,
        response: { status: "operational", services_online: 44, ai_latency: "120ms" },
        errors: []
    }
];

App.API_Contracts.Versioning = {
    current: "v1",
    deprecated: "v0.9-beta",
    future: "v2 (Microservices: gRPC internally, REST/WSS edge)"
};
