const express = require("express");
const { authenticateJWT } = require("../middlewares/auth.middleware");
const cartController = require("../controllers/cart.controller");

const router = express.Router();

router.post("/add", authenticateJWT, cartController.addToCart);
router.get("/all", authenticateJWT, cartController.getMyCart);
router.put("/update", authenticateJWT, cartController.updateQuantity);
router.post("/remove", authenticateJWT, cartController.removeItem);

module.exports = router;



