require("dotenv").config();
const express = require("express");
const cors = require('cors');
const mongoose = require("mongoose");
const Booking = require("./models/booking");
const Food = require("./models/food");
const Drink = require("./models/drink");
const ShopItem = require("./models/shopItem");
const Expense = require("./models/expense");

const app = express();
const PORT = process.env.PORT || 3000;



// Middleware
app.use(cors());
app.use(express.json());

// ✅ MongoDB Atlas connection
console.log("Connecting to:", process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI, {

})
.then(() => console.log("✅ Successfully connected to MongoDB Atlas"))
.catch(err => console.error("❌ MongoDB connection error:", err));

// ✅ Endpoints
app.post("/api/bookings", async (req, res) => {
    try {
        const booking = new Booking(req.body);
        const savedBooking = await booking.save();
        res.status(201).json({ message: "Booking saved", bookingId: savedBooking._id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to save booking" });
    }
});

app.post("/api/foods", async (req, res) => {
    try {
        const food = new Food(req.body);
        const savedFood = await food.save();
        res.status(201).json({ message: "Food saved", foodId: savedFood._id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to save food" });
    }
});

app.post("/api/drinks", async (req, res) => {
    try {
        const drink = new Drink(req.body);
        const savedDrink = await drink.save();
        res.status(201).json({ message: "Drink saved", drinkId: savedDrink._id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to save drink" });
    }
});

app.post("/api/shop", async (req, res) => {
    try {
        const shopItem = new ShopItem(req.body);
        const savedShopItem = await shopItem.save();
        res.status(201).json({ message: "Shop item saved", shopItemId: savedShopItem._id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to save shop item" });
    }
});

app.post("/api/expenses", async (req, res) => {
    try {
        const expense = new Expense(req.body);
        const savedExpense = await expense.save();
        res.status(201).json({ message: "Expense saved", expenseId: savedExpense._id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to save expense" });
    }
});



// ✅ Start server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
