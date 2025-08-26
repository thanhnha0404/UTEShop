const User = require("../models/user.model");

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
    const { fullName, dob, phone, address } = req.body;
    const newUser = await User.create({ fullName, dob, phone, address });
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi tạo user", error: err });
  }
};
