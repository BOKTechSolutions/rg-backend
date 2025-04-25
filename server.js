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
const roomsRoutes = require('./routes/rooms');


const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());  // To parse JSON bodies
app.use(cookieParser()); // Important!

// ✅ Use auth routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomsRoutes);

// ✅ MongoDB Atlas connection
console.log("Connecting to:", process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI, {})
    .then(() => console.log("✅ Successfully connected to MongoDB Atlas"))
    .catch(err => console.error("❌ MongoDB connection error:", err));




// ✅ Auth Routes (signup)
app.post("/api/auth/signup", async (req, res) => {
    const { fullName, email, password } = req.body;

    // Debugging log to check received data
    console.log("Signup request received with email:", email);

    // Check if email, password, and fullName are provided
    if (!email || !password || !fullName) {
        return res.status(400).json({ error: "Email, password, and full name are required" });
    }

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }

        // Create a new user with full name, email, and password
        const newUser = new User({ fullName, email, password });

        // Hash the password before saving it
        const salt = await bcrypt.genSalt(10);
        newUser.password = await bcrypt.hash(password, salt);

        // Save the new user
        await newUser.save();
        console.log("New user saved:", newUser);

        // Generate a JWT token for the user
        const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Send response with success message and token
        res.status(201).json({
            message: "User created successfully!",
            token: token,
        });
    } catch (error) {
        console.error("Error during signup:", error);
        res.status(500).json({ error: "Server error" });
    }
});


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
        const food = new Food(req.body);
        const savedFood = await food.save();
        res.status(201).json({ message: "Food saved", foodId: savedFood._id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to save food" });
    }
});

// POST - Drink
app.post("/api/drinks", authenticateToken, async (req, res) => {
    try {
        const drink = new Drink(req.body);
        const savedDrink = await drink.save();
        res.status(201).json({ message: "Drink saved", drinkId: savedDrink._id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to save drink" });
    }
});

// POST - Shop Item
app.post("/api/shop", authenticateToken, async (req, res) => {
    try {
        const shopItem = new ShopItem(req.body);
        const savedShopItem = await shopItem.save();
        res.status(201).json({ message: "Shop item saved", shopItemId: savedShopItem._id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to save shop item" });
    }
});

// POST - Expense
app.post("/api/expenses", authenticateToken, async (req, res) => {
    try {
        const expense = new Expense(req.body);
        const savedExpense = await expense.save();
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
