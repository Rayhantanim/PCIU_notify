const express = require("express");
const http = require("http");
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const server = http.createServer(app);

// Socket.io with proper CORS
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://pciunotify.vercel.app"
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your_email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your_app_password'
  }
});

// Store connected users
const connectedUsers = new Map();

io.on("connection", (socket) => {
  console.log("✅ New client connected:", socket.id);
  connectedUsers.set(socket.id, socket);

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
    connectedUsers.delete(socket.id);
  });
});

app.set("io", io);

// Middleware
app.use(cors({
  origin: [
    "http://localhost:5173", 
    "http://localhost:3000",
    "https://pciunotify.vercel.app"
  ],
  credentials: true,
}));
app.use(express.json());

// Routes
app.use("/api", require("./routes/notice"));
app.use("/api", require("./routes/auth"));
app.use("/api", require("./routes/notifications"));
app.use("/api", require("./routes/Department"));

// MongoDB Connection - WITHOUT deprecated options
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI;
    
    if (!mongoURI) {
      console.error("❌ MONGO_URI is not defined in environment variables");
      console.log("Please set MONGO_URI in your .env file");
      return;
    }
    
    console.log("📡 Connecting to MongoDB...");
    
    // Connect WITHOUT the deprecated options
    await mongoose.connect(mongoURI);
    
    console.log("✅ MongoDB Connected Successfully");
    console.log("📊 Database:", mongoose.connection.db.databaseName);
    
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message);
    console.log("Retrying connection in 5 seconds...");
    setTimeout(connectDB, 5000);
  }
};

// Handle MongoDB connection events
mongoose.connection.on('connected', () => {
  console.log("Mongoose connected to MongoDB");
});

mongoose.connection.on('disconnected', () => {
  console.log("⚠️ MongoDB disconnected, attempting to reconnect...");
  setTimeout(connectDB, 5000);
});

mongoose.connection.on('error', (err) => {
  console.error("MongoDB error:", err);
});

// Start connection
connectDB();

app.get("/", (req, res) => {
  res.send("OK");
});

// Health check endpoints
app.get("/api/health", (req, res) => {
  const dbState = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  res.json({
    status: "running",
    database: states[dbState] || 'unknown',
    socketClients: connectedUsers.size,
    timestamp: new Date().toISOString()
  });
});

app.get("/socket-test", (req, res) => {
  res.json({
    message: "Socket server running",
    connectedClients: connectedUsers.size
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.io ready for connections`);
});