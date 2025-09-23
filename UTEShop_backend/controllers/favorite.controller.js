const db = require("../models");

exports.addFavorite = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { drinkId } = req.body;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!drinkId) return res.status(400).json({ message: "Thiếu drinkId" });

    const [fav, created] = await db.Favorite.findOrCreate({
      where: { user_id: userId, drink_id: drinkId },
      defaults: { user_id: userId, drink_id: drinkId }
    });

    return res.json({ action: created ? "added" : "exists", message: created ? "Đã thêm vào yêu thích" : "Đã có trong yêu thích", favorite: fav });
  } catch (err) {
    console.error("Favorite add error:", err);
    return res.status(500).json({ message: "Lỗi khi thêm yêu thích", error: err?.message || String(err) });
  }
};

exports.removeFavorite = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { drinkId } = req.params;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!drinkId) return res.status(400).json({ message: "Thiếu drinkId" });

    const deleted = await db.Favorite.destroy({ where: { user_id: userId, drink_id: drinkId } });
    return res.json({ action: deleted ? "removed" : "missing", message: deleted ? "Đã xóa khỏi yêu thích" : "Không tìm thấy trong yêu thích" });
  } catch (err) {
    console.error("Favorite remove error:", err);
    return res.status(500).json({ message: "Lỗi khi xóa yêu thích", error: err?.message || String(err) });
  }
};

exports.getUserFavorites = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const favorites = await db.Favorite.findAll({
      where: { user_id: userId },
      include: [{ model: db.Drink, as: "drink" }],
      order: [["created_at", "DESC"]]
    });
    return res.json({ favorites });
  } catch (err) {
    console.error("Favorite list error:", err);
    return res.status(500).json({ message: "Lỗi khi lấy danh sách yêu thích", error: err?.message || String(err) });
  }
};

exports.toggleFavorite = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { drinkId } = req.body;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!drinkId) return res.status(400).json({ message: "Thiếu drinkId" });

    const existing = await db.Favorite.findOne({ where: { user_id: userId, drink_id: drinkId } });
    if (existing) {
      await existing.destroy();
      return res.json({ action: "removed", message: "Đã xóa khỏi yêu thích" });
    }
    const created = await db.Favorite.create({ user_id: userId, drink_id: drinkId });
    return res.json({ action: "added", favorite: created, message: "Đã thêm vào yêu thích" });
  } catch (err) {
    console.error("Favorite toggle error:", err);
    return res.status(500).json({ message: "Lỗi khi cập nhật yêu thích", error: err?.message || String(err) });
  }
};


