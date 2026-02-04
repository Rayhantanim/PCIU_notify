const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");

require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("DB Error:", err));

// User Schema
const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: String,
  department: String,
  section: String,
  gender: String,
  dob: String,
  password: { type: String, required: true }
});

const User = mongoose.model("User", UserSchema);

app.get("/", (req, res) => {
  res.send("✅ Server is Running!");
});

// Register API
app.post("/register", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      department,
      section,
      gender,
      dob,
      password
    } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        message: "Required fields missing"
      });
    }

    const userExist = await User.findOne({ email });

    if (userExist) {
      return res.status(400).json({
        message: "Email already registered"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      email,
      phone,
      department,
      section,
      gender,
      dob,
      password: hashedPassword
    });

    await user.save();

    res.status(201).json({
      message: "User Registered Successfully"
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

// Login API
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User not found"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid password"
      });
    }

    res.json({
      message: "Login Successful",
      user: {
        id: user._id,
        name: user.firstName + " " + user.lastName,
        email: user.email
      }
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

// Start Server
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
