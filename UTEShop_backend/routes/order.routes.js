const express = require("express");
const { authenticateJWT } = require("../middlewares/auth.middleware");
const controller = require("../controllers/order.controller");

const router = express.Router();

// Tạo đơn hàng mới
router.post("/", authenticateJWT, controller.createOrder);

// Lấy danh sách đơn hàng của user
router.get("/my-orders", authenticateJWT, controller.getUserOrders);

// Lấy chi tiết đơn hàng
router.get("/:orderId", authenticateJWT, controller.getOrderDetail);

// Hủy đơn hàng
router.put("/:orderId/cancel", authenticateJWT, controller.cancelOrder);

// Gửi yêu cầu hủy đơn
router.post("/:orderId/request-cancel", authenticateJWT, controller.requestCancelOrder);

// Cập nhật trạng thái đơn hàng (cho admin)
router.put("/:orderId/status", authenticateJWT, controller.updateOrderStatus);

module.exports = router;
