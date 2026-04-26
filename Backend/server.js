const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const bcrypt = require("bcryptjs");

const app = express();

// ✅ FIX: Allow multiple origins including localhost
app.use(cors({
  origin: [
    "https://pciunotify.vercel.app",
    "http://localhost:5173",
    "http://localhost:3000"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json());
app.use("/api", require("./routes/notice"));
app.use("/api", require("./routes/auth"));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("DB Error:", err));

app.get("/", (req, res) => {
  res.send("OK");
});

const server = http.createServer(app);

server.listen(5000, () => {
  console.log("Server running on 5000");
});

module.exports = app;