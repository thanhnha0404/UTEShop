const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller.js")

// GET all users
router.get("/", userController.getAllUsers);

// POST create new user
router.post("/", userController.createUser);

module.exports = router;
