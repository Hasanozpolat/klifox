const express = require('express');
const http = require('http');
const path = require('path');
const compression = require('compression');

// Future-proof real backend configuration
const app = express();
const server = http.createServer(app);

// Initialize Socket.io Backend
const socketServer = require('./backend/socket-server.js');
socketServer.init(server);

// Optimizations for Production
app.use(compression());
app.use(express.json());

// Security headers (Helmet abstraction)
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// Serve frontend static assets (PWA)
app.use(express.static(path.join(__dirname, '/')));

// Health Check for Nginx & PM2
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK', environment: 'production', pilot: 'Gaziantep' });
});

// Fallback to index.html for SPA/PWA routing compatibility
app.get(/^(.*)$/, (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Port Binding
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`[BOOT] KliFox Pilot Node Started on port ${PORT}`);
    console.log(`[BOOT] Environment: ${process.env.NODE_ENV || 'production'}`);
});
