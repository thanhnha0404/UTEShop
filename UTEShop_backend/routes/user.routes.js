const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller.js")

// GET all users
router.get("/", userController.getAllUsers);
<<<<<<< HEAD
=======
router.get("/:id", userController.getUserById);
>>>>>>> bccee8695258419678b269516d9170dd038d8ebf

// POST create new user
router.post("/", userController.createUser);

<<<<<<< HEAD
// POST register: gửi OTP qua email
router.post("/register", userController.registerUser);

// POST verify OTP
router.post("/verify-otp", userController.verifyOtp);

=======
>>>>>>> bccee8695258419678b269516d9170dd038d8ebf
module.exports = router;
