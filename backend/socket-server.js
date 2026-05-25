const { Server } = require("socket.io");
const aiRouter = require("./ai/ai-router");

// In-Memory Chat & State Persistence
const chatHistories = new Map(); 
const activeUsers = new Map(); 

let ioIns = null;
let metrics = { connected: 0, messagesProcessed: 0, reconnects: 0 };

// Global In-Memory Database for Multi-Browser Testing
let globalState = {
    users: {},
    services: []
};

module.exports = {
    init(server) {
        ioIns = new Server(server, { cors: { origin: "*" } });

        ioIns.on("connection", (socket) => {
            metrics.connected++;
            console.log(`[Socket] New connection: ${socket.id}`);

            socket.on("room.join", ({ room, user }) => {
                socket.join(room);
                activeUsers.set(socket.id, { ...user, room });
                console.log(`[Socket] Client joined room: ${room}`);

                // Send persistence catch-up
                if (!chatHistories.has(room)) chatHistories.set(room, []);
                socket.emit("room.sync", { history: chatHistories.get(room) });
            });

            // Send full global state to newly connected client
            socket.emit('global.sync', globalState);

            // Handle global state updates from clients
            socket.on('global.state.update', (partialState) => {
                if (partialState.users) globalState.users = partialState.users;
                if (partialState.services) globalState.services = partialState.services;
                
                // Broadcast to everyone else
                socket.broadcast.emit('global.state.sync', partialState);
            });

            socket.on("message.send", (data) => {
                metrics.messagesProcessed++;
                const { room, message } = data;
                
                if (!chatHistories.has(room)) chatHistories.set(room, []);
                chatHistories.get(room).push(message);

                console.log(`[WS] Relaying message to ${room}`);
                socket.to(room).emit("message.new", message);
            });

            socket.on("ai.prompt.submit", (data) => {
                aiRouter.handlePrompt(socket, ioIns, data);
            });

            socket.on("presence.typing", ({ room, isTyping }) => {
                socket.to(room).emit("presence.typing", { isTyping });
            });

            // Dispatch Routing (System -> Craftsman)
            socket.on("dispatch.incoming", (payload) => {
                console.log(`[WS] Relaying dispatch job to all craftsmen: ${payload.id}`);
                socket.broadcast.emit("dispatch.incoming", payload);
            });

            // Dispatch Routing (Craftsman -> System)
            socket.on("craftsman.accept", (payload) => {
                console.log(`[WS] Relaying craftsman acceptance: ${payload.job_id}`);
                socket.broadcast.emit("dispatch.human_accepted", { id: payload.job_id, userId: socket.id, craftsmanProfile: payload.craftsmanProfile });
            });

            // Lifecycle Status Changes
            socket.on("dispatch.status_change", (payload) => {
                console.log(`[WS] Status change for ${payload.id} -> ${payload.status}`);
                socket.broadcast.emit("dispatch.status_change", payload);
            });

            // Live P2P Chat Relay
            socket.on("dispatch.chat_relay", (payload) => {
                console.log(`[WS] Relaying chat message from ${payload.role}`);
                socket.broadcast.emit("dispatch.chat_relay", payload);
            });

            // Referral Network Updates
            socket.on("referral.new_member", (payload) => {
                console.log(`[WS] Relaying new member to partner: ${payload.partnerCode}`);
                socket.broadcast.emit("referral.new_member", payload);
            });

            // Financial & Pricing Relays
            socket.on("dispatch.job_priced", (payload) => {
                socket.broadcast.emit("dispatch.job_priced", payload);
            });
            socket.on("financial.settlement", (payload) => {
                socket.broadcast.emit("financial.settlement", payload);
            });
            socket.on("financial.gift_credit", (payload) => {
                socket.broadcast.emit("financial.gift_credit", payload);
            });

            socket.on("disconnect", () => {
                metrics.connected--;
                activeUsers.delete(socket.id);
            });
        });
        
        // Dev Dashboard Metric Pusher (MPS, Users)
        setInterval(() => {
            ioIns.emit("metrics.server", {
                users: metrics.connected,
                mps: metrics.messagesProcessed,
                rooms: chatHistories.size
            });
            metrics.messagesProcessed = 0; 
        }, 2000);
    }
};
