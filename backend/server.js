require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const userProfileRoutes = require("./routes/userSellListRoutes"); // Reviews and Profile
const userSellListRoutes = require("./routes/user"); // The actual sell list

const app = express();
const PORT = process.env.PORT || 5001;
app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);});

// ── Middleware 
const allowedOrigins = [
  "http://localhost:5173",
  "https://student-market-place-ten.vercel.app", // Replace with your actual Vercel URL
  /\.vercel\.app$/, // Allows any Vercel preview deployment
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.some((o) => (typeof o === "string" ? o === origin : o.test(origin)))) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.send("Backend is running");
});
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/users", userProfileRoutes);
app.use("/api/user-sell-list", userSellListRoutes);

// Health check
app.get("/api/health", (req, res) =>
  res.json({ status: "ok", time: new Date(), env: process.env.NODE_ENV }),
);

// 404 handler
app.use((req, res) => res.status(404).json({ message: "Route not found" }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || "Internal server error" });
});

// ── Connect to MongoDB and start server ───────────────────────────────────────
const startServer = async () => {
    console.log('⏳ Connecting to MongoDB...');
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined in environment variables');
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB connected successfully');
    } catch (err) {
        console.error('❌ MongoDB connection error:', err.message);
        console.log('⚠️ Server starting in degraded mode. Database features will fail.');
    }

    app.listen(PORT, "0.0.0.0", () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`🏥 Health Check: /api/health`);
    });
};

startServer();
