// routes/bookings.js or similar
const express = require('express');
const router = express.Router();
const Booking = require('../models/booking.js'); // Make sure the model name matches
const authenticateJWT = require('../middleware/authenticateJWT'); // JWT middleware

// GET all bookings for authenticated user
router.get('/bookings', authenticateJWT, async (req, res) => {
  try {
    const userId = req.userId; // Comes from JWT middleware
    const bookings = await Booking.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Server error fetching bookings' });
  }
});

// GET a single booking by ID
router.get('/bookings/:id', authenticateJWT, async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, userId: req.userId });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    res.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ error: 'Server error fetching booking' });
  }
});

module.exports = router;

