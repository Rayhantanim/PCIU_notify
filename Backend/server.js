const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// CORS
app.use(cors({
  origin: ["https://pciunotify.vercel.app", "http://localhost:5173"],
  credentials: true
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes - Make sure notice routes are mounted FIRST (before auth if needed)
app.use("/api", require("./routes/notice"));
app.use("/api", require("./routes/auth"));

// Root route
app.get("/", (req, res) => {
  res.send("API is running...");
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("DB Error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;