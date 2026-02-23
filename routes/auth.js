const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const router = express.Router();

/**
 * Helper to create JWT token for dashboard use
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      issuedAt: Date.now(),
    },
    process.env.JWT_SECRET,
    { expiresIn: "12h" }
  );
};

/* ============================================================
   🟢 SIGNUP (MongoDB + hashed password)
============================================================ */
router.post("/signup", async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    // 1️⃣ Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "User already exists" });


    // 3️⃣ Create MongoDB user
    const newUser = new User({
      fullName,
      email,
      password,
      role: "staff", // default role
    });
    await newUser.save();

    // 4️⃣ Generate JWT token
    const token = generateToken(newUser);

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: error.message });
  }
});

/* ============================================================
   🔵 LOGIN (MongoDB + password check)
============================================================ */
router.post("/login", async (req, res) => {
  const { email, password, isAdmin } = req.body;

  try {
    // 1️⃣ Find user
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    // 2️⃣ Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    // 3️⃣ Optional admin check
    if (isAdmin && user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized as admin" });
    }

    // 4️⃣ Generate JWT token
    const token = generateToken(user);

    res.json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
