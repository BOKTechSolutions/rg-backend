const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define User Schema
const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    default: null
  },
  profileImage: {
    type: String, // base64 string or a URL to a file
    default: ''   // optional default image path or empty
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  bookings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  }],
  foods: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Food'
  }],
  shopItems: [{ // Array to hold references to ShopItem documents
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ShopItem'
  }],
  expenses: [{ // Array to hold references to Expense documents
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Expense'
  }],
  drinks: [{ // Array to hold references to Drink documents
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Drink'
  }]
});




// Pre-save hook to hash the password before saving to DB
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10); // Create a salt
    this.password = await bcrypt.hash(this.password, salt); // Hash the password
    console.log("Password hashed for user:", this.email); // Log the password hashing event
    next();
});

// Method to check if entered password matches the hashed one in DB
userSchema.methods.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

// Export the User model once
module.exports = mongoose.model('User', userSchema);
