const User = require("../models/user.model");
const nodemailer = require("nodemailer");

// Cấu hình transporter cho Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER, 
    pass: process.env.GMAIL_PASS, 
  },
});

// Hàm gửi OTP qua email
async function sendOtpEmail(email, otp) {
  const mailOptions = {
    from: process.env.GMAIL_USER || "phuongthiennhan04@gmail.com",
    to: email,
    subject: "UTEShop - Mã xác thực OTP",
    text: `Mã OTP của bạn là: ${otp}. OTP có hiệu lực trong 5 phút.`,
  };
  await transporter.sendMail(mailOptions);
}

// Lấy danh sách tất cả user
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi lấy dữ liệu", error: err });
  }
};

// Thêm user mới
exports.createUser = async (req, res) => {
  try {
    const { fullName, username, password, email, dob, phone, address } = req.body;
    const newUser = await User.create({ fullName, username, password, email, dob, phone, address });
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi tạo user", error: err });
  }
};

// Đăng ký: gửi OTP qua email
exports.registerUser = async (req, res) => {
  try {
    const { fullName, username, password, email, dob, phone, address } = req.body;
    // Kiểm tra email đã tồn tại chưa
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email đã được sử dụng." });
    }
    // Sinh OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 5 * 60 * 1000; // 5 phút
    // Lưu thông tin đăng ký và OTP vào session
    req.session.registerInfo = {
      fullName,
      username,
      password,
      email,
      dob,
      phone,
      address,
      otp,
      otpExpires,
    };
    // Gửi email OTP
    await sendOtpEmail(email, otp);
    res.status(201).json({ message: "Đã gửi OTP tới email. Vui lòng kiểm tra và xác thực." });
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi đăng ký và gửi OTP", error: err });
  }
};

// Xác thực OTP
exports.verifyOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    const info = req.session.registerInfo;
    if (!info) {
      return res.status(400).json({ message: "Không có thông tin đăng ký trong session." });
    }
    if (info.otp !== otp) {
      return res.status(400).json({ message: "OTP không đúng." });
    }
    if (Date.now() > info.otpExpires) {
      return res.status(400).json({ message: "OTP đã hết hạn." });
    }
    // Tạo user khi xác thực thành công
    await User.create({
      fullName: info.fullName,
      username: info.username,
      password: info.password,
      email: info.email,
      dob: info.dob,
      phone: info.phone,
      address: info.address,
    });
    // Xóa thông tin đăng ký khỏi session
    req.session.registerInfo = null;
    res.json({ message: "Xác thực thành công!" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi xác thực OTP", error: err });
  }
};
