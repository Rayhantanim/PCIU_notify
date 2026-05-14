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

// Create email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Verify email configuration
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Email configuration error:", error);
  } else {
    console.log("✅ Email service is ready to send notifications");
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

// Make transporter and io available to routes
app.set("io", io);
app.set("transporter", transporter);

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

// MongoDB Connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI;
    
    if (!mongoURI) {
      console.error("❌ MONGO_URI is not defined in environment variables");
      console.log("Please set MONGO_URI in your .env file");
      return;
    }
    
    console.log("📡 Connecting to MongoDB...");
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

module.exports = { app, transporter, io };