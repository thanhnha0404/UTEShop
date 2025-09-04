const User = require("../models/user.model");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");

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

// Lấy user theo ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy user" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi lấy dữ liệu user", error: err });
  }
};

// Cập nhật user theo ID
exports.updateUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, email, dob, phone, address } = req.body || {};

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy user" });
    }

    // Không cho phép cập nhật username và password ở endpoint này
    user.fullName = typeof fullName !== "undefined" ? fullName : user.fullName;
    user.email = typeof email !== "undefined" ? email : user.email;
    user.dob = typeof dob !== "undefined" ? dob : user.dob;
    user.phone = typeof phone !== "undefined" ? phone : user.phone;
    user.address = typeof address !== "undefined" ? address : user.address;

    await user.save();

    return res.json({
      id: user.id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      dob: user.dob,
      phone: user.phone,
      address: user.address,
    });
  } catch (err) {
    return res.status(500).json({ message: "Lỗi khi cập nhật user", error: err?.message || String(err) });
  }
};

// Thêm user mới
exports.createUser = async (req, res) => {
  try {
    const { fullName, username, password, email, dob, phone, address } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ 
      fullName, 
      username, 
      password: hashedPassword, 
      email, 
      dob, 
      phone, 
      address 
    });
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
      return res.status(400).json({
        message: "Email đã được sử dụng.",
        errors: { email: "Email đã được sử dụng." },
      });
    }
    // Kiểm tra username đã tồn tại chưa
    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) {
      return res.status(400).json({
        message: "Tên đăng nhập đã được sử dụng.",
        errors: { username: "Tên đăng nhập đã được sử dụng." },
      });
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
    // Tạo user khi xác thực thành công (re-check trùng để tránh race condition)
    const existingEmail = await User.findOne({ where: { email: info.email } });
    if (existingEmail) {
      return res.status(400).json({
        message: "Email đã được sử dụng.",
        errors: { email: "Email đã được sử dụng." },
      });
    }
    const existingUsername = await User.findOne({ where: { username: info.username } });
    if (existingUsername) {
      return res.status(400).json({
        message: "Tên đăng nhập đã được sử dụng.",
        errors: { username: "Tên đăng nhập đã được sử dụng." },
      });
    }
    const hashedPassword = await bcrypt.hash(info.password, 10);
    await User.create({
      fullName: info.fullName,
      username: info.username,
      password: hashedPassword,
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

// Quên mật khẩu: gửi OTP qua email
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    // Kiểm tra email có tồn tại không
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "Email không tồn tại." });
    }
    // Sinh OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 5 * 60 * 1000; // 5 phút
    // Lưu OTP vào session
    req.session.forgotPasswordInfo = {
      email,
      otp,
      otpExpires,
    };
    // Gửi email OTP
    await sendOtpEmail(email, otp);
    res.status(200).json({ message: "Đã gửi OTP tới email. Vui lòng kiểm tra và xác thực." });
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi gửi OTP", error: err });
  }
};

// Xác thực OTP cho quên mật khẩu
exports.verifyForgotOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const info = req.session.forgotPasswordInfo;
    if (!info || info.email !== email) {
      return res.status(400).json({ message: "Không có thông tin quên mật khẩu trong session." });
    }
    if (info.otp !== otp) {
      return res.status(400).json({ message: "OTP không đúng." });
    }
    if (Date.now() > info.otpExpires) {
      return res.status(400).json({ message: "OTP đã hết hạn." });
    }
    res.status(200).json({ message: "OTP hợp lệ." });
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi xác thực OTP", error: err });
  }
};

// Đặt lại mật khẩu
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Mật khẩu xác nhận không khớp." });
    }
    const info = req.session.forgotPasswordInfo;
    if (!info || info.email !== email) {
      return res.status(400).json({ message: "Không có thông tin quên mật khẩu trong session." });
    }
    if (info.otp !== otp) {
      return res.status(400).json({ message: "OTP không đúng." });
    }
    if (Date.now() > info.otpExpires) {
      return res.status(400).json({ message: "OTP đã hết hạn." });
    }
    // Cập nhật mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.update(
      { password: hashedPassword },
      { where: { email } }
    );
    // Xóa thông tin quên mật khẩu khỏi session
    req.session.forgotPasswordInfo = null;
    res.status(200).json({ message: "Đặt lại mật khẩu thành công." });
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi đặt lại mật khẩu", error: err });
  }
};

// Kiểm tra email có khả dụng không
exports.checkEmail = async (req, res) => {
  try {
    const { email } = req.query || {};
    if (!email || !String(email).trim()) {
      return res.status(400).json({ message: "Thiếu email" });
    }
    const user = await User.findOne({ where: { email } });
    return res.json({ available: !user });
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi kiểm tra email", error: err });
  }
};
// Kiểm tra username có khả dụng không
exports.checkUsername = async (req, res) => {
  try {
    const { username } = req.query || {};
    if (!username || !String(username).trim()) {
      return res.status(400).json({ message: "Thiếu username" });
    }
    const user = await User.findOne({ where: { username } });
    return res.json({ available: !user });
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi kiểm tra username", error: err });
  }
};

