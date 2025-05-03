const mongoose = require('mongoose');

const shopItemSchema = new mongoose.Schema({
  name: String,
  price: Number,
  quantity: Number,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

module.exports = mongoose.model('ShopItem', shopItemSchema);
