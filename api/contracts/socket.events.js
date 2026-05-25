window.App = window.App || {};
App.API_Contracts = App.API_Contracts || {};

App.API_Contracts.SocketEvents = {
    Namespaces: {
        ChatManager: "/chat",
        DispatchEngine: "/dispatch",
        OperationsSync: "/operations"
    },
    
    // Core Websocket Operations
    ClientToServer: [
        { event: "service.create", payload: { urgency: "string", description: "string", location: "object" } },
        { event: "craftsman.accept", payload: { dispatch_id: "uuid", eta_minutes: "int" } },
        { event: "operator.join", payload: { room_id: "uuid" } },
        { event: "ai.prompt.submit", payload: { message: "string", session_id: "uuid" } }
    ],
    
    ServerToClient: [
        { event: "service.created", payload: { request_id: "uuid", status: "string" } },
        { event: "dispatch.started", payload: { radius_km: "int", eligible_count: "int" } },
        { event: "craftsman.joined", payload: { craftsman_profile: "object", distance: "float" } },
        { event: "operator.escalated", payload: { reason: "string", operator_name: "string" } }
    ],

    // Realtime AI Streaming Architecture
    AI_Streaming: {
        start: { event: "ai.stream.started", payload: { response_id: "uuid", provider: "string" } },
        chunk: { event: "ai.stream.chunk", payload: { delta: "string", token_index: "int" } },
        end: { event: "ai.stream.end", payload: { total_tokens: "int", complete_text: "string", usage: "object" } },
        interrupt: { event: "ai.stream.interrupt", payload: { reason: "string" } },
        fallback: { event: "ai.stream.fallback", payload: { previous_provider: "string", new_provider: "string" } }
    },
    
    // Session Contracts
    Session: {
        Authenticate: { event: "session.auth", payload: { token: "JWT" } },
        Recover: { event: "session.recover", payload: { reconnect_token: "string", last_msg_id: "uuid" } },
        RoomSync: { event: "room.sync", payload: { room_id: "uuid", missing_logs: "array" } }
    }
};
