// routes/bookings.js or similar

const express = require('express');
const router = express.Router();
const Booking = require('../models/booking'); // Adjust path as needed
const authenticate = require('../middleware/authenticateToken'); // Your auth middleware

// GET all bookings for authenticated user
router.get('/', authenticate, async (req, res) => {
    try {
        const userId = req.user.id; // Extracted from token by auth middleware
        const bookings = await Booking.find({ userId });
        res.status(200).json(bookings);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ error: 'Server error fetching bookings' });
    }
});

module.exports = router;
