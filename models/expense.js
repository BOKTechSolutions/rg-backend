const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  name: String,
  amount: Number,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // 👈 Link to User
});

module.exports = mongoose.model('Expense', expenseSchema);
