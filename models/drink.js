const mongoose = require('mongoose');

const drinkSchema = new mongoose.Schema({
    name: String,
    price: Number,
    quantity: Number,
});

module.exports = mongoose.model('Drink', drinkSchema);
