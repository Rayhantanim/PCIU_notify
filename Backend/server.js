const express = require("express");
const http = require("http");
// const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const bcrypt = require("bcryptjs");

const app = express();

// ✅ Allow both production and development origins
const allowedOrigins = [
  "https://pciunotify.vercel.app",
  "http://localhost:5173",
  "http://localhost:5000"
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use("/api", require("./routes/notice"));
app.use("/api", require("./routes/auth"));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("DB Error:", err));

// ✅ Create HTTP server AFTER app is defined
const server = http.createServer(app);

// ✅ Attach Socket.IO to server (uncomment when needed)
// const io = new Server(server, {
//   cors: { origin: allowedOrigins }
// });

// ✅ Socket.IO connection (uncomment when needed)
// io.on("connection", (socket) => {
//   console.log("Client connected:", socket.id);
// });

app.get("/", (req, res) => {
  res.send("OK");
});

// ✅ IMPORTANT: use server.listen, not app.listen
server.listen(5000, () => {
  console.log("Server running on 5000");
});

module.exports = app;