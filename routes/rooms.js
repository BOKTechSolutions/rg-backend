const express = require('express');
const router = express.Router();
const Active = require('../models/active');
const authenticateToken = require('../middleware/authenticate');

// GET: Fetch all room statuses
router.get('/status', authenticateToken, async (req, res) => {
  const rooms = await active.find({});
  const simplified = rooms.map(room => ({
    room: room.roomBooked,
    status: room.status,
    cleaned: room.cleaned,
    ready: room.ready
  }));
  res.json(simplified);
});

// POST: Update room status
router.post('/update', authenticateToken, async (req, res) => {
  const { roomBooked, status, cleaned, ready } = req.body;

  try {
    const updated = await active.findOneAndUpdate(
      { roomBooked },
      { status, cleaned, ready },
      { upsert: true, new: true }
    );
    res.json({ message: `Room ${roomBooked} updated.`, room: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update room.' });
  }
});



router.put('/:roomNumber', async (req, res) => {
  const { roomNumber } = req.params;
  const update = req.body;
  
  try {
    const room = await Active.findOneAndUpdate({ room: roomNumber }, update, { new: true });
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
