const jwt = require('jsonwebtoken');

// Middleware to authenticate the user using JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1]; // Extract the token

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;  // Store the user info in the request
        next();  // Proceed to the next middleware or route handler
    } catch (error) {
        return res.status(400).json({ error: 'Invalid or expired token' });
    }
};

module.exports = authenticateToken;
