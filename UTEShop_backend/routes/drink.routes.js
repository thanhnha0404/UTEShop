const express = require("express");
const router = express.Router();
const drinkController = require("../controllers/drink.controller");

router.get("/", drinkController.getAll);
router.get("/latest", drinkController.getLatest);
router.get("/best-sellers", drinkController.getBestSellers);
router.get("/most-viewed", drinkController.getMostViewed);
router.get("/top-discount", drinkController.getTopDiscount);
router.get("/:id", drinkController.getDetail);

module.exports = router;


