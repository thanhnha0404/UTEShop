const express = require("express");
const cors = require("cors");
const db = require("./models");
const { getDashboardOverview } = require("./controllers/statistics.controller");

const app = express();
app.use(cors());
app.use(express.json());

// Test route
app.get("/api/statistics/overview", getDashboardOverview);

app.get("/api/statistics/test", (req, res) => {
  res.json({ success: true, message: "Test endpoint working!" });
});

const PORT = 8081;

app.listen(PORT, async () => {
  console.log(`🚀 Test server running on http://localhost:${PORT}`);
  
  try {
    await db.sequelize.authenticate();
    console.log("✅ Database connected");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
  }
});
