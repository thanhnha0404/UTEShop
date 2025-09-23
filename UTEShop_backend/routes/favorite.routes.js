const express = require("express");
const router = express.Router();
const favoriteController = require("../controllers/favorite.controller");
const { authenticateJWT } = require("../middlewares/auth.middleware");

router.use(authenticateJWT);

router.post("/", favoriteController.addFavorite);
router.delete("/:drinkId", favoriteController.removeFavorite);
router.get("/", favoriteController.getUserFavorites);
router.post("/toggle", favoriteController.toggleFavorite);

module.exports = router;


