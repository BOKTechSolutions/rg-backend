const mongoose = require('mongoose');

const shopItemSchema = new mongoose.Schema({
  name: String,
  price: Number,
  quantity: Number,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // 👈 Link to User
});

module.exports = mongoose.model('ShopItem', shopItemSchema);
