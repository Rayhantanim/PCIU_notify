const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/User");

// Check if email is available
router.post("/check-email", async (req, res) => {
    try {
        const { email } = req.body;
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        res.json({ available: !existingUser });
    } catch (err) {
        console.error(err);
        res.status(500).json({ available: false });
    }
});



// SIGNUP
router.post("/signup", async (req, res) => {
    try {
        const data = req.body;

        // check email
        const existingUser = await User.findOne({ email: data.email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }

        // hash password
        const hashedPassword = await bcrypt.hash(data.password, 10);

        const newUser = new User({
            ...data,
            email: data.email.toLowerCase(),
            password: hashedPassword,
        });

        await newUser.save();

        res.status(201).json({
            message: "User created successfully",
            user: newUser,
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;