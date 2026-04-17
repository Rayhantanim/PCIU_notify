const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/User");




// GET ALL USERS
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password"); // hide password
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


router.get("/user/:id", async (req, res) => {
  try {
   const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
  success: true,
  userId: user._id,  
  role: user.role
});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Check if email is available
router.post("/check-email", async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.json({ available: false });
        }

        const cleanEmail = email.toLowerCase();

        const existingUser = await User.findOne({ email: cleanEmail });

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
        const cleanEmail = data.email.trim().toLowerCase();
        const existingUser = await User.findOne({ email: cleanEmail });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }

        // hash password
        const hashedPassword = await bcrypt.hash(data.password, 10);

        const newUser = new User({
            ...data,
            email:  cleanEmail,
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




router.post("/login", async (req, res) => {
    try {
        const { email, id, password } = req.body;

        let user = null;

        // EMAIL LOGIN
        if (email) {
            const cleanEmail = email.trim().toLowerCase();
            user = await User.findOne({ email: cleanEmail });

            if (!user) {
                return res.json({ success: false, message: "Email not found" });
            }
        }

        // ID LOGIN
        else if (id) {
            user = await User.findOne({
                $or: [
                    { studentId: id },
                    { teacherId: id },
                    { staffId: id }
                ]
            });

            if (!user) {
                return res.json({ success: false, message: "ID not found" });
            }
        }

        // NO USER FOUND
        if (!user) {
            return res.json({ success: false, message: "Invalid login" });
        }

        // PASSWORD CHECK SAFE
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.json({ success: false, message: "Wrong password" });
        }

        res.json({
            success: true,
            role: user.role,
            userId: user.studentId || user.teacherId || user.staffId
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// router.post("/check-id", async (req, res) => {
//     try {
//         const { id } = req.body;

//         const user = await User.findOne({
//             $or: [
//                 { studentId: id },
//                 { teacherId: id },
//                 { staffId: id }
//             ]
//         });

//         res.json({ available: !!user }); // true মানে exists

//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ available: false });
//     }
// old });

router.post("/check-id", async (req, res) => {
    try {
        const { id } = req.body;

        const user = await User.findOne({
            $or: [
                { studentId: id },
                { teacherId: id },
                { staffId: id }
            ]
        });

        res.json({ exists: !!user });

    } catch (err) {
        console.error(err);
        res.status(500).json({ exists: false });
    }
});

module.exports = router;