const express = require("express");
const router = express.Router();
const { authenticateJWT } = require("../middlewares/auth.middleware");
const {
  getRevenueStatistics,
  getCompletedOrders,
  getCashFlowAnalysis,
  getNewCustomersCount,
  getTopSellingProducts,
  getDashboardOverview,
  getAllOrdersForStatus
} = require("../controllers/statistics.controller");

// Dashboard overview
router.get("/overview", getDashboardOverview);

// Revenue statistics
router.get("/revenue", getRevenueStatistics);

// Completed orders
router.get("/orders/completed", getCompletedOrders);

// Cash flow analysis
router.get("/cashflow", getCashFlowAnalysis);

// New customers count
router.get("/customers/new", getNewCustomersCount);

// Top selling products
router.get("/products/top-selling", getTopSellingProducts);

// All orders for status chart
router.get("/orders/all", getAllOrdersForStatus);

// Test endpoint (no auth required)
router.get("/test", (req, res) => {
  res.json({ success: true, message: "Statistics API is working!" });
});

module.exports = router;
