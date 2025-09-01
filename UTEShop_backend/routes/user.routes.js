const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller.js");

// GET all users
router.get("/", userController.getAllUsers);

// GET user by id (chỉ có ở nhánh mới, không trùng nên giữ lại)
router.get("/:id", userController.getUserById);

// POST create new user
router.post("/", userController.createUser);

// POST register: gửi OTP qua email (chỉ có ở nhánh cũ, giữ lại)
router.post("/register", userController.registerUser);

// POST verify OTP (chỉ có ở nhánh cũ, giữ lại)
router.post("/verify-otp", userController.verifyOtp);

module.exports = router;
