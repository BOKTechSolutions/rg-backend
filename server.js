require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path"); // <-- add this
const cookieParser = require("cookie-parser");
const Booking = require("./models/booking");
const Food = require("./models/food");
const Drink = require("./models/drink");
const ShopItem = require("./models/shopItem");
const Expense = require("./models/expense");
const User = require("./models/User");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const admin = require("./firebase"); // ✅ correct
const app = express();
const PORT = process.env.PORT || 3000;


// Middleware
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use("/admin", express.static(path.join(__dirname, "../admin")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

// -------------------------
// 🔹 Firebase Token Middleware
// -------------------------
const authenticateFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const idToken = authHeader.split(" ")[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    req.firebaseUid = decodedToken.uid;

    // Attach userId from MongoDB using firebaseUid
    const user = await User.findOne({ firebaseUid: decodedToken.uid });
    if (!user) return res.status(404).json({ message: "User not found" });

    req.userId = user._id; // For endpoints
    next();
  } catch (error) {
    console.error("Firebase token error:", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// -------------------------
// 🔹 MongoDB Atlas connection
// -------------------------
mongoose
  .connect(process.env.MONGODB_URI, {})
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// -------------------------
// 🔹 Protected Endpoints
// -------------------------

// POST - Booking
app.post("/api/bookings", authenticateFirebaseToken, async (req, res) => {
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
app.post("/api/foods", authenticateFirebaseToken, async (req, res) => {
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
app.post("/api/drinks", authenticateFirebaseToken, async (req, res) => {
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
app.post("/api/shop", authenticateFirebaseToken, async (req, res) => {
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
app.post("/api/expenses", authenticateFirebaseToken, async (req, res) => {
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
app.get("/api/bookings/search", authenticateFirebaseToken, async (req, res) => {
  const { clientName } = req.query;
  if (!clientName) return res.status(400).json({ error: "Client name required" });

  try {
    const results = await Booking.find({ clientName: new RegExp(clientName, "i") });
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Update user profile
app.post("/api/user/profile", authenticateFirebaseToken, async (req, res) => {
  const { fullName, email, phone, profileImage } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { fullName, email, phone, ...(profileImage && { profileImage }) },
      { new: true }
    );
    res.json({ success: true, user: updatedUser });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Serve static frontend
app.use(express.static("public"));

// Start server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
