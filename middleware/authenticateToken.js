const jwt = require('jsonwebtoken');

// Middleware to authenticate the user using JWT token
const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;  // Store the user info in the request
        next();  // Proceed to the next middleware or route handler
    } catch (error) {
        return res.status(400).json({ error: 'Invalid or expired token' });
    }
};

module.exports = authenticateToken;
