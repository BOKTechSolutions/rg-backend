const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define User Schema
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    name: String, // ✅ Optional: Add name or other profile fields
    phone: String,
    bookings: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking' // ✅ Reference to Booking model
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

module.exports = mongoose.model('User', userSchema);
