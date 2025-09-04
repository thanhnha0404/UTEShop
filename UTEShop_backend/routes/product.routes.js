const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");

router.get("/latest", productController.getLatest);
router.get("/best-sellers", productController.getBestSellers);
router.get("/most-viewed", productController.getMostViewed);
router.get("/top-discount", productController.getTopDiscount);
router.get("/:id", productController.getDetail);

module.exports = router;


