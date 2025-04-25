const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');  // Import User model
const router = express.Router();

// POST - Signup Route
router.post('/signup', async (req, res) => {
    const { fullName, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const newUser = new User({ fullName, email, password });
        await newUser.save();

        const token = jwt.sign(
            { userId: newUser._id },
            process.env.JWT_SECRET,
            { expiresIn: '10h' }
        );
        const refreshToken = jwt.sign(
            { userId: newUser._id },
            process.env.REFRESH_SECRET,
            { expiresIn: '7d' }
        );
        // Optional: Save refresh token in DB or secure HTTP-only cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        
        

        res.status(201).json({
            message: 'User created successfully!',
            token: token,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST - Login Route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '10h' }
        );
                
        // Refresh token -long lifespan
                
        const refreshToken = jwt.sign(
            { userId: newUser._id },
            process.env.REFRESH_SECRET,
            { expiresIn: '7d' }
        );
        // Optional: Save refresh token in DB or as a secure cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        
        

        res.json({
            message: 'Login successful',
            token: token,
            user: {
                email: user.email,
                _id: user._id,
                fullName: user.fullName
            }
            
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});



router.post('/refresh', (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) return res.status(401).json({ error: 'No refresh token provided' });

    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
        
        const newAccessToken = jwt.sign(
            { userId: decoded.userId },
            process.env.ACCESS_SECRET,
            { expiresIn: '10h' }
        );

        res.json({ accessToken: newAccessToken });
    } catch (err) {
        console.error(err);
        res.status(403).json({ error: 'Invalid refresh token' });
    }
});


module.exports = router;
