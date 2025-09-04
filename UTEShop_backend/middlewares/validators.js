const { body, validationResult } = require("express-validator");

// Middleware: validate payload for user registration (request OTP)
const validateRegisterPayload = [
  body("fullName")
    .trim()
    .notEmpty().withMessage("Vui lòng nhập họ và tên"),

  body("username")
    .trim()
    .notEmpty().withMessage("Vui lòng nhập tên đăng nhập"),

  body("email")
    .trim()
    .notEmpty().withMessage("Vui lòng nhập email")
    .isEmail().withMessage("Email không hợp lệ")
    .normalizeEmail(),

  body("phone")
    .trim()
    .notEmpty().withMessage("Vui lòng nhập số điện thoại")
    .matches(/^[0-9]{10,11}$/).withMessage("Số điện thoại không hợp lệ"),

  // dob from frontend is yyyy-mm-dd (input type=date). Accept ISO date string.
  body("dob")
    .notEmpty().withMessage("Vui lòng nhập ngày sinh (yyyy-mm-dd)")
    .matches(/^\d{4}-\d{2}-\d{2}$/).withMessage("Ngày sinh phải theo định dạng yyyy-mm-dd"),

  // address is optional in frontend; do not require
  body("address")
    .optional()
    .isString().withMessage("Địa chỉ không hợp lệ"),

  body("password")
    .notEmpty().withMessage("Vui lòng nhập mật khẩu")
    .isLength({ min: 8 }).withMessage("Mật khẩu phải ít nhất 8 ký tự"),
];

// Middleware: validate OTP payload (6 digits)
const validateOtpPayload = [
  body("otp")
    .notEmpty().withMessage("Vui lòng nhập OTP")
    .matches(/^[0-9]{6}$/).withMessage("OTP phải gồm 6 chữ số"),
];

// Middleware: handle validation result uniformly
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const fieldErrors = {};
  errors.array().forEach((e) => {
    if (!fieldErrors[e.path]) fieldErrors[e.path] = e.msg;
  });

  return res.status(400).json({
    message: "Dữ liệu không hợp lệ",
    errors: fieldErrors,
  });
};

module.exports = {
  validateRegisterPayload,
  validateOtpPayload,
  handleValidationErrors,
};


