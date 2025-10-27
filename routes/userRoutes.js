import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import User from "../models/User.js"; // adjust path to your model

const router = express.Router();

// === CONFIGURE CLOUDINARY ===
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// === SETUP MULTER WITH CLOUDINARY STORAGE ===
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "profile-images",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

const upload = multer({ storage });

// === UPLOAD PROFILE IMAGE ROUTE ===
router.post("/upload-profile-image", upload.single("profileImage"), async (req, res) => {
  try {
    const { userId } = req.body;

    if (!req.file || !req.file.path)
      return res.status(400).json({ success: false, message: "No image uploaded" });

    const imageUrl = req.file.path; // Cloudinary returns this URL

    await User.findByIdAndUpdate(userId, { profileImage: imageUrl });

    res.json({ success: true, imageUrl });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    res.status(500).json({ success: false, message: "Failed to upload image" });
  }
});

export default router;
