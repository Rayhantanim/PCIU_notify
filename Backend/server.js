const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const server = http.createServer(app);

// Socket.io with proper CORS
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

// Store connected users (optional for debugging)
const connectedUsers = new Map();

io.on("connection", (socket) => {
  console.log("✅ New client connected:", socket.id);
  connectedUsers.set(socket.id, socket);
  
  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
    connectedUsers.delete(socket.id);
  });
});

// Make io accessible to routes
app.set("io", io);

// Middleware
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000"],
  credentials: true,
}));
app.use(express.json());

// Routes
app.use("/api", require("./routes/notice"));
app.use("/api", require("./routes/auth"));
app.use("/api", require("./routes/notifications"));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ DB Error:", err));

app.get("/", (req, res) => {
  res.send("OK");
});

// Health check for socket
app.get("/socket-test", (req, res) => {
  res.json({ 
    message: "Socket server running", 
    connectedClients: connectedUsers.size 
  });
});

server.listen(5000, () => {
  console.log("🚀 Server running on port 5000");
  console.log("📡 Socket.io ready for connections");
});

// const express = require("express");
// const http = require("http");
// const mongoose = require("mongoose");
// const cors = require("cors");
// require("dotenv").config();

// const app = express();

// // CORS
// app.use(cors({
//   origin: ["https://pciunotify.vercel.app", "http://localhost:5173"],
//   credentials: true
// }));

// // Body parsers
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Routes - Make sure notice routes are mounted FIRST (before auth if needed)
// app.use("/api", require("./routes/notice"));
// app.use("/api", require("./routes/auth"));

// // Root route
// app.get("/", (req, res) => {
//   res.send("API is running...");
// });

// mongoose.connect(process.env.MONGO_URI)
//   .then(() => console.log("MongoDB Connected"))
//   .catch(err => console.log("DB Error:", err));

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

// module.exports = app;