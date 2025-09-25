const express = require("express");
const { authenticateJWT } = require("../middlewares/auth.middleware");
const voucherController = require("../controllers/voucher.controller");

const router = express.Router();

router.get("/my", authenticateJWT, voucherController.getMyVouchers);

module.exports = router;


