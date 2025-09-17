const express = require("express");
const { authenticateJWT } = require("../middlewares/auth.middleware");
const controller = require("../controllers/checkout.controller");

const router = express.Router();

router.post("/cod", authenticateJWT, controller.checkoutCOD);

module.exports = router;


