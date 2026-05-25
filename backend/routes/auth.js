const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Mock User Database
const users = [
    { id: "CUST-001", phone: "5551234567", role: "customer", name: "Ahmet Yılmaz" },
    { id: "CRAF-999", phone: "5559876543", role: "craftsman", name: "Sistem Ustası" },
    { id: "OP-001", phone: "5550000000", role: "operator", name: "Canlı Destek" }
];

router.post('/login', (req, res) => {
    const { phone } = req.body;
    const user = users.find(u => u.phone === phone);
    
    if (!user) {
        return res.status(401).json({ error: "Kayıtlı kullanıcı bulunamadı." });
    }

    // Sign JWT
    const token = jwt.sign(
        { id: user.id, role: user.role, name: user.name },
        'klifox_secret_key_123',
        { expiresIn: '7d' }
    );

    res.json({ token, user });
});

router.get('/me', require('../middleware/authMiddleware').verifyToken, (req, res) => {
    res.json({ user: req.user });
});

module.exports = router;
