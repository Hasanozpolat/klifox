const express = require('express');
const cors = require('cors');
const http = require('http');
const authRoutes = require('./routes/auth');
const socketServer = require('./socket-server');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1/auth', authRoutes);

// Health check endpoint for fallback detection
app.get('/api/v1/health', (req, res) => {
    res.json({ status: "operational", service: "klifox-core", timestamp: Date.now() });
});

const server = http.createServer(app);

// Initialize Socket.io
socketServer.init(server);

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`======= KLIFOX REAL BACKEND =======`);
    console.log(`=> REST API: http://localhost:${PORT}`);
    console.log(`=> WebSocket: ws://localhost:${PORT}`);
    console.log(`===================================`);
});
