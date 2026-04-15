const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const bcrypt = require("bcryptjs");

const app = express();

app.use(cors({
  origin: "http://localhost:5173"
}));
app.use(express.json());

app.use("/api", require("./routes/auth")); 
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("DB Error:", err));

app.get("/", (req, res) => {
  res.send("OK");
});

app.listen(5000, () => {
  console.log("Server running on 5000");
});
// let isConnected = false;
// async function connectToMongoDB() {
//   try{
//     await mongoose.connect(process.env.MONGO_URI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true
//     });
//     isConnected = true;
//     console.log("MongoDB Connected");
//   } catch(error) {
//     console.error("DB Error:", error)
//   }
// }

// const UserSchema = new mongoose.Schema({
//   firstName: { type: String, required: true },
//   lastName: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   phone: String,
//   department: String,
//   section: String,
//   gender: String,
//   dob: String,
//   password: { type: String, required: true }
// });

// const User = mongoose.model("User", UserSchema);


// app.post("/register", async (req, res) => {
//   try {
//     const {
//       firstName,
//       lastName,
//       email,
//       phone,
//       department,
//       section,
//       gender,
//       dob,
//       password
//     } = req.body;

//     if (!firstName || !lastName || !email || !password) {
//       return res.status(400).json({
//         message: "Required fields missing"
//       });
//     }

//     const userExist = await User.findOne({ email });

//     if (userExist) {
//       return res.status(400).json({
//         message: "Email already registered"
//       });
//     }

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     const user = new User({
//       firstName,
//       lastName,
//       email,
//       phone,
//       department,
//       section,
//       gender,
//       dob,
//       password: hashedPassword
//     });

//     await user.save();

//     res.status(201).json({
//       message: "User Registered Successfully"
//     });

//   } catch (err) {
//     res.status(500).json({
//       error: err.message
//     });
//   }
// });

// // Login API
// app.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const user = await User.findOne({ email });

//     if (!user) {
//       return res.status(400).json({
//         message: "User not found"
//       });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);

//     if (!isMatch) {
//       return res.status(400).json({
//         message: "Invalid password"
//       });
//     }

//     res.json({
//       message: "Login Successful",
//       user: {
//         id: user._id,
//         firstName: user.firstName,
//         lastName: user.lastName,
//         email: user.email,
//         phone: user.phone,
//         department: user.department,
//         section: user.section,
//         gender: user.gender,
//         dob: user.dob
//       }
//     });

//   } catch (err) {
//     res.status(500).json({
//       error: err.message
//     });
//   }
// });

// app.get("/check-email/:email", async (req, res) => {
//   try {
//     const user = await User.findOne({ email: req.params.email });

//     if (user) {
//       return res.json({ exists: true });
//     }

//     res.json({ exists: false });

//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });


// Start Server for local
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

// for vercel
module.exports = app;
// export default app;