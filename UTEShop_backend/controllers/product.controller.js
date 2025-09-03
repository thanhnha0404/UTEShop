const { Op, fn, col, literal } = require("sequelize");
const Product = require("../models/product.model");
const Category = require("../models/category.model");

const includeCategory = { model: Category, as: "category", attributes: ["id", "name", "slug"] };

exports.getLatest = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 8;
    const items = await Product.findAll({
      include: [includeCategory],
      order: [["created_at", "DESC"]],
      limit,
    });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy sản phẩm mới nhất", error: String(err) });
  }
};

exports.getBestSellers = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 6;
    const items = await Product.findAll({
      include: [includeCategory],
      order: [["sold", "DESC"]],
      limit,
    });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy sản phẩm bán chạy", error: String(err) });
  }
};

exports.getMostViewed = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 8;
    const items = await Product.findAll({
      include: [includeCategory],
      order: [["views", "DESC"]],
      limit,
    });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy sản phẩm xem nhiều", error: String(err) });
  }
};

exports.getTopDiscount = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 4;
    // order by (price - salePrice)/price desc, handle nulls
    const items = await Product.findAll({
      include: [includeCategory],
      order: [
        [literal("CASE WHEN salePrice IS NULL OR salePrice = 0 THEN 0 ELSE (price - salePrice)/price END"), "DESC"],
      ],
      limit,
    });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy sản phẩm khuyến mãi cao", error: String(err) });
  }
};

exports.getDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Product.findByPk(id, { include: [includeCategory] });
    if (!item) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    // increase views async (no await)
    Product.update({ views: (item.views || 0) + 1 }, { where: { id } }).catch(() => {});
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy chi tiết sản phẩm", error: String(err) });
  }
};


