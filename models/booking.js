const mongoose = require('mongoose');


const bookingSchema = new mongoose.Schema({
  clientName: String,
  phoneNumber: String,
  daysOfStay: Number,
  paymentMethod: String,
  amountPaid: Number,
  roomBooked: String,
  arrivalDate: Date,
  timeIn: String,
  timeOfDeparture: String,
  departureDate: Date,

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

module.exports = mongoose.model('Booking', bookingSchema);
