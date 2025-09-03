const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller.js");
const {
  validateRegisterPayload,
  validateOtpPayload,
  handleValidationErrors,
} = require("../middlewares/validators");

// GET all users
router.get("/", userController.getAllUsers);

// GET user by id (chỉ có ở nhánh mới, không trùng nên giữ lại)
router.get("/:id", userController.getUserById);

// POST create new user
router.post("/", userController.createUser);

// POST register: gửi OTP qua email (chỉ có ở nhánh cũ, giữ lại)
router.post(
  "/register",
  validateRegisterPayload,
  handleValidationErrors,
  userController.registerUser
);

// POST verify OTP (chỉ có ở nhánh cũ, giữ lại)
router.post(
  "/verify-otp",
  validateOtpPayload,
  handleValidationErrors,
  userController.verifyOtp
);

// Check username availability
router.get("/check-username", userController.checkUsername);
// Check email availability
router.get("/check-email", userController.checkEmail);

// POST forgot password: gửi OTP
router.post("/forgot-password", userController.forgotPassword);

// POST verify OTP cho quên mật khẩu
router.post("/verify-forgot-otp", userController.verifyForgotOtp);

// POST reset password
router.post("/reset-password", userController.resetPassword);

module.exports = router;