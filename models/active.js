const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  roomBooked: Number,
  status: { type: String, enum: ['booked', 'available'], default: 'available' },
  cleaned: { type: Boolean, default: false },
  ready: { type: Boolean, default: false }
});

// Only define the model if it hasn't been defined already
module.exports = mongoose.models.Active|| mongoose.model('Active', bookingSchema);
