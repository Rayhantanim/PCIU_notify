const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();

require("dotenv").config();

app.use(cors());
app.use(express.json());

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// User Schema
const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String
  },
  department: {
    type: String
  },
  section: {
    type: String
  },
  gender: {
    type: String
  },
  dob: {
    type: String
  },
  password: {
    type: String,
    required: true
  }
});



// Register API
app.post("/register", async (req, res) => {
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

  try {
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        message: "Required fields missing"
      });
    }
    // Check email
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).json({
        message: "Email already registered"
      });
    }
    // HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);
    // Save user
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

// LOGIN API //
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    // Check user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "User not found"
      });
    }
    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid password"
      });
    }
    res.status(200).json({
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

// --------------------
// Test Route - Home
// --------------------
app.get("/", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Backend Status</title>
      </head>
      <body style="display:flex;justify-content:center;align-items:center;height:100vh;">
        <h1 style="color:green;">✅ Vercel Server is Running!</h1>
      </body>
    </html>
  `);
});


// Server Start
module.exports = app;
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
