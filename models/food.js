const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
    name: String,
    price: Number,
    quantity: Number,
});

module.exports = mongoose.model('Food', foodSchema);
