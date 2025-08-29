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

// Lấy user theo id
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;  
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: `❌ Không tìm thấy user với id = ${id}` });
    }

    const userInfo = {
      id: user.id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      dob: user.dob,
      phone: user.phone,
      address: user.address || "N/A"
    };

    res.json(userInfo);
  } catch (err) {
    res.status(500).json({ error: "Lỗi server: " + err.message });
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
