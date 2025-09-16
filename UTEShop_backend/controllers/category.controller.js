const Category = require("../models/category.model");

exports.getAll = async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [["name", "ASC"]]
    });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy danh sách danh mục", error: String(err) });
  }
};
