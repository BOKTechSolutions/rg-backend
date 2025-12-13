
// backend/routes/auth.js

const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const admin = require("../firebase"); // single initialized Firebase Admin instance
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
   🟢 SIGNUP (Backend creates Firebase user + MongoDB entry)
============================================================ */
router.post("/signup", async (req, res) => {
  const { fullName, email, password } = req.body; // backend handles password

  try {
    // 1️⃣ Check if user already exists in MongoDB
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ error: "User already exists" });

    // 2️⃣ Create user in Firebase
    const firebaseUser = await admin.auth().createUser({
      email,
      password,
    });

    // 3️⃣ Create MongoDB user
    const newUser = new User({
      fullName,
      email,
      firebaseUid: firebaseUser.uid,
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
   🔵 LOGIN (Frontend sends Firebase token → Backend verifies → MongoDB)
============================================================ */
router.post("/firebase-login", async (req, res) => {
  const { token, isAdmin } = req.body;

  try {
    // 1️⃣ Verify Firebase token
    const decoded = await admin.auth().verifyIdToken(token);

    if (!decoded || !decoded.uid) {
      return res.status(401).json({ error: "Invalid Firebase token" });
    }

    // 2️⃣ Find MongoDB user via Firebase UID
    const user = await User.findOne({ firebaseUid: decoded.uid });

    if (!user) {
      return res.status(404).json({
        error: "User exists in Firebase but not registered in MongoDB",
      });
    }

    // 3️⃣ Optional admin check
    if (isAdmin && user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized as admin" });
    }

    // 4️⃣ Generate JWT token for dashboard
    const customToken = generateToken(user);

    res.json({
      message: "Login successful",
      token: customToken,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Firebase login error:", error);
    res.status(500).json({ error: "Server error verifying Firebase token" });
  }
});

module.exports = router;
