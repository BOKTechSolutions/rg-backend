const mongoose = require('mongoose');

const drinkSchema = new mongoose.Schema({
  name: String,
  price: Number,
  quantity: Number,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

module.exports = mongoose.model('Drink', drinkSchema);
