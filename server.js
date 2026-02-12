require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const path = require("path");

// Routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");

// Models (optional for protected routes)
const Booking = require("./models/booking");
const Food = require("./models/food");
const Drink = require("./models/drink");
const ShopItem = require("./models/shopItem");
const Expense = require("./models/expense");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: ["https://royalsys.netlify.app", "http://127.0.0.1:5500"], // allow your frontend
  credentials: true // if you want to send cookies or auth headers
}));
app.options("*", cors()); // ✅ add this line

app.use(express.json());
app.use(cookieParser());
app.use("/admin", express.static(path.join(__dirname, "../admin")));

// -------------------------
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

// 👇 ADD THIS
app.get("/", (req, res) => {
  res.status(200).send("✅ RG Backend is running");
});

// MongoDB Atlas Connection
// -------------------------
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// -------------------------
// JWT Middleware
// -------------------------
const jwt = require("jsonwebtoken");
const User = require("./models/User");

const authenticateJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    req.userId = user._id;
    req.isAdmin = user.isAdmin || false;
    next();
  } catch (err) {
    console.error("JWT auth error:", err);
    res.status(401).json({ error: "Invalid or expired token" });
  }
};


// -------------------------
// Protected Routes Example
// -------------------------

// POST - Booking
app.post("/api/bookings", authenticateJWT, async (req, res) => {
  try {
    const booking = new Booking({ ...req.body, userId: req.userId });
    const savedBooking = await booking.save();
    await User.findByIdAndUpdate(req.userId, { $push: { bookings: savedBooking._id } });
    res.status(201).json({ message: "Booking saved", bookingId: savedBooking._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save booking" });
  }
});

// POST - Food
app.post("/api/foods", authenticateJWT, async (req, res) => {
  try {
    const food = new Food({ ...req.body, userId: req.userId });
    const savedFood = await food.save();
    await User.findByIdAndUpdate(req.userId, { $push: { foods: savedFood._id } });
    res.status(201).json({ message: "Food saved", foodId: savedFood._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save food" });
  }
});

// POST - Drink
app.post("/api/drinks", authenticateJWT, async (req, res) => {
  try {
    const drink = new Drink({ ...req.body, userId: req.userId });
    const savedDrink = await drink.save();
    await User.findByIdAndUpdate(req.userId, { $push: { drinks: savedDrink._id } });
    res.status(201).json({ message: "Drink saved", drinkId: savedDrink._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save drink" });
  }
});

// POST - Shop Item
app.post("/api/shop", authenticateJWT, async (req, res) => {
  try {
    const shopItem = new ShopItem({ ...req.body, userId: req.userId });
    const savedShopItem = await shopItem.save();
    await User.findByIdAndUpdate(req.userId, { $push: { shopItems: savedShopItem._id } });
    res.status(201).json({ message: "Shop item saved", shopItemId: savedShopItem._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save shop item" });
  }
});

// POST - Expense
app.post("/api/expenses", authenticateJWT, async (req, res) => {
  try {
    const expense = new Expense({ ...req.body, userId: req.userId });
    const savedExpense = await expense.save();
    await User.findByIdAndUpdate(req.userId, { $push: { expenses: savedExpense._id } });
    res.status(201).json({ message: "Expense saved", expenseId: savedExpense._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save expense" });
  }
});

// GET - Search Bookings
app.get("/api/bookings/search", authenticateJWT, async (req, res) => {
  const { clientName } = req.query;
  if (!clientName) return res.status(400).json({ error: "Client name required" });

  try {
    const results = await Booking.find({ clientName: new RegExp(clientName, "i") });
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// -------------------------
// Serve static frontend
// -------------------------
app.use(express.static("public"));

// Start server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
