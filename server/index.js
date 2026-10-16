const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

dotenv.config();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "public", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const authRoutes = require("./routes/auth.js");
const listingRoutes = require("./routes/listing.js");
const bookingRoutes = require("./routes/booking.js");
const userRoutes = require("./routes/user.js");

/* CORS & PARSERS */
app.use(cors({
  origin: process.env.CLIENT_URL || true,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* STATIC ASSETS */
// Serve static public folder both at root and /public prefix for maximum compatibility
app.use(express.static(path.join(__dirname, "public")));
app.use("/public", express.static(path.join(__dirname, "public")));

/* HEALTH CHECK / ROOT */
app.get("/", (req, res) => {
  res.status(200).json({
    status: "online",
    message: "Dream Nest API is running smoothly",
    timestamp: new Date().toISOString(),
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy", dbState: mongoose.connection.readyState });
});

/* ROUTES */
app.use("/auth", authRoutes);
app.use("/properties", listingRoutes);
app.use("/bookings", bookingRoutes);
app.use("/users", userRoutes);

/* GLOBAL 404 HANDLER */
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

/* GLOBAL ERROR HANDLER */
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === "production" ? {} : err,
  });
});

/* DATABASE & SERVER STARTUP */
const PORT = process.env.PORT || 3001;
const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/dreams_nest";

// Bind port immediately so Render port detection succeeds instantly
app.listen(PORT, () => {
  console.log(`🚀 Dream Nest Server running on Port: ${PORT}`);
});

// Connect to MongoDB with automatic retry
const connectWithRetry = async () => {
  try {
    await mongoose.connect(MONGO_URL, {
      dbName: "Dream_Nest",
      serverSelectionTimeoutMS: 15000,
    });
    console.log("Connected to MongoDB successfully!");
  } catch (err) {
    console.error(`❌ MongoDB connection error: ${err.message}`);
    console.log("Retrying MongoDB connection in 5 seconds...");
    setTimeout(connectWithRetry, 5000);
  }
};

connectWithRetry();