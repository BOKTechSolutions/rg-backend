const mongoose = require('mongoose');

const shopItemSchema = new mongoose.Schema({
    name: String,
    price: Number,
    quantity: Number,
});

module.exports = mongoose.model('ShopItem', shopItemSchema);
