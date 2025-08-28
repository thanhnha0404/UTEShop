const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller.js")

// GET all users
router.get("/", userController.getAllUsers);

// POST create new user
router.post("/", userController.createUser);

// POST register: gửi OTP qua email
router.post("/register", userController.registerUser);

// POST verify OTP
router.post("/verify-otp", userController.verifyOtp);

module.exports = router;
