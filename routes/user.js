const express = require("express");
const router = express.Router();
const User = require("../models/User");
const admin = require("firebase-admin");

// 🔐 Middleware to verify Firebase ID Token
const verifyFirebaseToken = async (req, res, next) => {
  try {
    // Expect token in Authorization header: "Bearer <token>"
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const idToken = authHeader.split(" ")[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.firebaseUid = decodedToken.uid; // attach UID to request
    next();
  } catch (err) {
    console.error("Firebase token verification error:", err);
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

// GET /api/user/:id
router.get("/:id", verifyFirebaseToken, async (req, res) => {
  try {
    // Ensure user is fetching their own data
    const user = await User.findById(req.params.id).select("-firebaseUid");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (user.firebaseUid !== req.firebaseUid) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    res.status(200).json({ success: true, user });
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
