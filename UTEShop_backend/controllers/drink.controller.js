const { Op, fn, col, literal } = require("sequelize");
const Drink = require("../models/drink.model");
const Category = require("../models/category.model");

const includeCategory = { model: Category, as: "category", attributes: ["id", "name", "slug"] };

exports.getLatest = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 8;
    const items = await Drink.findAll({
      include: [includeCategory],
      order: [["created_at", "DESC"]],
      limit,
    });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy đồ uống mới nhất", error: String(err) });
  }
};

exports.getBestSellers = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 6;
    const items = await Drink.findAll({
      include: [includeCategory],
      order: [["sold", "DESC"]],
      limit,
    });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy đồ uống bán chạy", error: String(err) });
  }
};

exports.getMostViewed = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 8;
    const items = await Drink.findAll({
      include: [includeCategory],
      order: [["views", "DESC"]],
      limit,
    });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy đồ uống xem nhiều", error: String(err) });
  }
};

exports.getTopDiscount = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 4;
    // order by (price - salePrice)/price desc, handle nulls
    const items = await Drink.findAll({
      include: [includeCategory],
      order: [
        [literal("CASE WHEN salePrice IS NULL OR salePrice = 0 THEN 0 ELSE (price - salePrice)/price END"), "DESC"],
      ],
      limit,
    });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy đồ uống khuyến mãi cao", error: String(err) });
  }
};

exports.getDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Drink.findByPk(id, { include: [includeCategory] });
    if (!item) return res.status(404).json({ message: "Không tìm thấy đồ uống" });
    
    // Thêm thông tin trạng thái tồn kho
    const itemData = item.toJSON();
    itemData.isOutOfStock = item.stock <= 0;
    itemData.stockStatus = item.stock <= 0 ? "Hết hàng" : `Còn ${item.stock} sản phẩm`;
    
    // increase views async (no await)
    Drink.update({ views: (item.views || 0) + 1 }, { where: { id } }).catch(() => {});
    res.json(itemData);
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy chi tiết đồ uống", error: String(err) });
  }
};

exports.getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const categoryId = req.query.categoryId;
    const offset = (page - 1) * limit;

    let whereClause = {};
    if (categoryId) {
      whereClause.category_id = categoryId;
    }

    const { count, rows } = await Drink.findAndCountAll({
      where: whereClause,
      include: [includeCategory],
      order: [["created_at", "DESC"]],
      limit,
      offset,
    });

    res.json({
      drinks: rows,
      totalCount: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      hasMore: page < Math.ceil(count / limit)
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy danh sách đồ uống", error: String(err) });
  }
};


