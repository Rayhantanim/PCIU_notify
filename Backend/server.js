const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const bcrypt = require("bcryptjs");

const app = express();

app.use(cors({
  origin: "https://pciunotify.vercel.app/"
  // origin: "http://localhost:5173"
}));
app.use(express.json()); 
app.use("/api", require("./routes/notice"))
app.use("/api", require("./routes/auth")); 
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("DB Error:", err));

// ✅ Create HTTP server AFTER app is defined
const server = http.createServer(app);

// ✅ Attach Socket.IO to server
const io = new Server(server, {
  cors: { origin: "http://localhost:5173" } // allow frontend
});

// ✅ Socket.IO connection
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
});

// ✅ Example: emit when notice is created
// In your notice route, after saving:
/// io.emit("newNotice", newNotice);

app.get("/", (req, res) => {
  res.send("OK");
});

// ✅ IMPORTANT: use server.listen, not app.listen
server.listen(5000, () => {
  console.log("Server running on 5000");
});

module.exports = app;
