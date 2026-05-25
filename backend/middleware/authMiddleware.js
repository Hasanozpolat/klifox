const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Token eksik" });

    const token = authHeader.split(' ')[1];
    jwt.verify(token, 'klifox_secret_key_123', (err, user) => {
        if (err) return res.status(403).json({ error: "Geçersiz veya süresi dolmuş token" });
        req.user = user;
        next();
    });
};

module.exports = { verifyToken };
