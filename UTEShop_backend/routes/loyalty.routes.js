const express = require("express");
const router = express.Router();
const loyaltyController = require("../controllers/loyalty.controller");
const { authenticateJWT } = require("../middlewares/auth.middleware");

// Tất cả routes đều cần xác thực
router.use(authenticateJWT);

// Lấy thông tin xu của user
router.get("/points", loyaltyController.getUserLoyaltyPoints);

// Lấy lịch sử giao dịch xu
router.get("/history", loyaltyController.getLoyaltyHistory);

// Tính toán xu có thể sử dụng cho đơn hàng
router.post("/calculate", loyaltyController.calculateLoyaltyUsage);

module.exports = router;
