require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./models");

// Import statistics controller
const { getDashboardOverview } = require("./controllers/statistics.controller");

const app = express();
const PORT = 8080;

// Middleware
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
app.use(express.json());

// Test route
app.get("/api/statistics/test", (req, res) => {
  res.json({ success: true, message: "Statistics API is working!" });
});

// Statistics routes
app.get("/api/statistics/overview", getDashboardOverview);

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  
  try {
    await db.sequelize.authenticate();
    console.log("✅ Database connected");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
  }
});
