const express = require('express');
const router = express.Router();
const Active = require('../models/active'); // Make sure model name is capitalized
const authenticateToken = require('../middleware/authenticate');

// GET: Fetch all room statuses
router.get('/status', authenticateToken, async (req, res) => {
  try {
    const rooms = await Active.find({});
    const simplified = rooms.map(room => ({
      _id: room._id,
      room: room.roomBooked,
      status: room.status,
      cleaned: room.cleaned,
      ready: room.ready
    }));
    res.json(simplified);
  } catch (err) {
    console.error('Error fetching room statuses:', err);
    res.status(500).json({ error: 'Failed to fetch room statuses' });
  }
});

// POST: Update room status
router.post('/update', authenticateToken, async (req, res) => {
  const { roomBooked, status, cleaned, ready } = req.body;

  try {
    const updated = await Active.findOneAndUpdate(
      { roomBooked },
      { status, cleaned, ready },
      { upsert: true, new: true }
    );
    res.json({ message: `Room ${roomBooked} updated.`, room: updated });
  } catch (err) {
    console.error('Error updating room:', err);
    res.status(500).json({ error: 'Failed to update room.' });
  }
});

// PUT: Update room by number
router.put('/:roomNumber', async (req, res) => {
  const { roomNumber } = req.params;
  const update = req.body;

  try {
    const room = await Active.findOneAndUpdate({ roomNumber: roomNumber}, update, { new: true });
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    res.json(room);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update room' });
  }
});

module.exports = router;
