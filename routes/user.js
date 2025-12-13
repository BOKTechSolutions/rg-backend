const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authenticateToken = require("../middleware/authenticate"); // Option A

// GET /api/user/:id
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    // Ensure user is fetching their own data or admin
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (user._id.toString() !== req.userId && req.role !== "admin") {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    res.status(200).json({ success: true, user });
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
