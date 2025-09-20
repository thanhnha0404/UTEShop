const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/review.controller");
const { authenticateJWT } = require("../middlewares/auth.middleware");

// Tất cả routes đều cần xác thực
router.use(authenticateJWT);

// Tạo đánh giá sản phẩm
router.post("/", reviewController.createReview);

// Cập nhật đánh giá
router.put("/:reviewId", reviewController.updateReview);

// Xóa đánh giá
router.delete("/:reviewId", reviewController.deleteReview);

// Lấy đánh giá của sản phẩm
router.get("/product/:drinkId", reviewController.getProductReviews);

// Lấy đánh giá của user
router.get("/user", reviewController.getUserReviews);

module.exports = router;
