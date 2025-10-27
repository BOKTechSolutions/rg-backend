require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Booking = require("./models/booking");
const Food = require("./models/food");
const Drink = require("./models/drink");
const ShopItem = require("./models/shopItem");
const Expense = require("./models/expense");
const User = require("./models/User");  // Import User model
const authRoutes = require('./routes/auth'); 
const cookieParser = require('cookie-parser');
const path = require('path');
const userRoutes = require("./routes/user");
import userRoutes from "./routes/userRoutes.js"; // adjust path




const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: '*', // Or set this to your frontend URL for security
    credentials: true
  }));
app.use(express.json());  // To parse JSON bodies
app.use(cookieParser()); // Important!
app.use('/admin', express.static(path.join(__dirname, '../admin')));

// ✅ Use auth routes
app.use('/api/auth', authRoutes);
app.use("/api/user", userRoutes);



// ✅ MongoDB Atlas connection
console.log("Connecting to:", process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI, {})
    .then(() => console.log("✅ Successfully connected to MongoDB Atlas"))
    .catch(err => console.error("❌ MongoDB connection error:", err));




// Middleware to authenticate token
function authenticateToken(req, res, next) {
    const token = req.header('Authorization')?.replace('Bearer ', '');  // Extract token from Authorization header

    if (!token) {
        return res.status(401).json({ message: "Unauthorized access, no token provided" });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach user data to the request object
        next(); // Allow the request to proceed
    } catch (error) {
        console.error('Error verifying token:', error);
        return res.status(403).json({ message: "Invalid or expired token" });
    }
}

// ✅ Endpoints (Protected with JWT authentication)

// POST - Booking

app.post("/api/bookings", authenticateToken, async (req, res) => {
    try {
        // Create a new booking and associate it with the user
        const booking = new Booking({ 
            ...req.body, 
            userId: req.user.userId
        });

        // ✅ Save the booking to the database first
        const savedBooking = await booking.save();

        // ✅ Now push the booking ID to the user's bookings array
        await User.findByIdAndUpdate(
            req.user.userId,
            { $push: { bookings: savedBooking._id } }
        );

        // ✅ Send success response with booking ID
        res.status(201).json({ 
            message: "Booking saved", 
            bookingId: savedBooking._id 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to save booking" });
    }
});

// POST - Food
app.post("/api/foods", authenticateToken, async (req, res) => {
    try {
        // Create a new food item and associate it with the user's ID
        const food = new Food({
            ...req.body,
            userId: req.user.userId // Associate the food with the logged-in user
        });

        // Save the food item to the database
        const savedFood = await food.save();

        // Now, push the saved food's ID to the user's 'foods' array
        await User.findByIdAndUpdate(
            req.user.userId, 
            { $push: { foods: savedFood._id } } // Add the food's ID to the user's foods array
        );

        // Send a success response with the saved food ID
        res.status(201).json({ message: "Food saved", foodId: savedFood._id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to save food" });
    }
});

// POST - Drink
app.post("/api/drinks", authenticateToken, async (req, res) => {
    try {
        // Attach userId from authenticated token
        const drink = new Drink({ 
            ...req.body, 
            userId: req.user.userId 
        });

        // Save the drink
        const savedDrink = await drink.save();

        // Push drink ID to the user's drinks array
        await User.findByIdAndUpdate(
            req.user.userId,
            { $push: { drinks: savedDrink._id } }
        );

        res.status(201).json({ message: "Drink saved", drinkId: savedDrink._id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to save drink" });
    }
});

// POST - Shop Item
app.post("/api/shop", authenticateToken, async (req, res) => {
    try {
        // Create new shop item and associate it with the user
        const shopItem = new ShopItem({ 
            ...req.body, 
            userId: req.user.userId 
        });

        // Save the item
        const savedShopItem = await shopItem.save();

        // Push the item's ID into the user's `shopItems` array
        await User.findByIdAndUpdate(
            req.user.userId,
            { $push: { shopItems: savedShopItem._id } }
        );

        res.status(201).json({ message: "Shop item saved", shopItemId: savedShopItem._id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to save shop item" });
    }
});

// POST - Expense
app.post("/api/expenses", authenticateToken, async (req, res) => {
    try {
        // Attach userId to the expense
        const expense = new Expense({
            ...req.body,
            userId: req.user.userId
        });

        // Save the expense
        const savedExpense = await expense.save();

        // Push the expense ID to the user's expenses array
        await User.findByIdAndUpdate(
            req.user.userId,
            { $push: { expenses: savedExpense._id } }
        );

        res.status(201).json({ message: "Expense saved", expenseId: savedExpense._id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to save expense" });
    }
});


// GET - Search Bookings by Client Name
app.get("/api/bookings/search", authenticateToken, async (req, res) => {
    const { clientName } = req.query;
    if (!clientName) return res.status(400).json({ error: "Client name required" });

    try {
        const results = await Booking.find({ clientName: new RegExp(clientName, "i") });
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});


// Update user info
app.post('/api/user/profile', async (req, res) => {
    const { userId, fullName, email, phone, profileImage } = req.body;
  
    try {
      const user = await User.findByIdAndUpdate(userId, {
        fullName,
        email,
        phone,
        ...(profileImage && { profileImage })
      }, { new: true });
  
      res.json({ success: true, user });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });


// Static frontend
app.use(express.static('public'));

// ✅ Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});


