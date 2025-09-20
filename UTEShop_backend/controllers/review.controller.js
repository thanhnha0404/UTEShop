const db = require("../models");

// Tạo đánh giá sản phẩm
exports.createReview = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const userId = req.user?.id;
    const { drinkId, rating, comment, orderId } = req.body;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // Kiểm tra user đã mua sản phẩm này chưa
    const hasPurchased = await db.OrderItem.findOne({
      where: {
        drink_id: drinkId
      },
      include: [{
        model: db.Order,
        as: "order",
        where: {
          user_id: userId,
          status: ["pending", "confirmed", "preparing", "shipping", "delivered"]
        }
      }],
      transaction: t
    });

    if (!hasPurchased) {
      await t.rollback();
      return res.status(400).json({ 
        message: "Bạn chỉ có thể đánh giá sản phẩm đã mua" 
      });
    }

    // Kiểm tra đã đánh giá chưa
    const existingReview = await db.Review.findOne({
      where: {
        user_id: userId,
        drink_id: drinkId
      },
      transaction: t
    });

    if (existingReview) {
      await t.rollback();
      return res.status(400).json({ 
        message: "Bạn đã đánh giá sản phẩm này rồi" 
      });
    }

    // Tạo đánh giá
    const review = await db.Review.create({
      user_id: userId,
      drink_id: drinkId,
      rating,
      comment,
      order_id: orderId || null
    }, { transaction: t });

    await t.commit();

    // Lấy thông tin đánh giá đầy đủ
    const fullReview = await db.Review.findByPk(review.id, {
      include: [
        { model: db.User, as: "user", attributes: ["id", "fullName"] },
        { model: db.Drink, as: "drink", attributes: ["id", "name"] }
      ]
    });

    return res.json({
      message: "Đánh giá thành công",
      review: fullReview
    });

  } catch (err) {
    await t.rollback();
    return res.status(500).json({
      message: "Lỗi khi tạo đánh giá",
      error: err?.message || String(err)
    });
  }
};

// Cập nhật đánh giá
exports.updateReview = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const userId = req.user?.id;
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const review = await db.Review.findOne({
      where: {
        id: reviewId,
        user_id: userId
      },
      transaction: t
    });

    if (!review) {
      await t.rollback();
      return res.status(404).json({ message: "Không tìm thấy đánh giá" });
    }

    await review.update({
      rating: rating || review.rating,
      comment: comment !== undefined ? comment : review.comment
    }, { transaction: t });

    await t.commit();

    // Lấy thông tin đánh giá đầy đủ
    const fullReview = await db.Review.findByPk(review.id, {
      include: [
        { model: db.User, as: "user", attributes: ["id", "fullName"] },
        { model: db.Drink, as: "drink", attributes: ["id", "name"] }
      ]
    });

    return res.json({
      message: "Cập nhật đánh giá thành công",
      review: fullReview
    });

  } catch (err) {
    await t.rollback();
    return res.status(500).json({
      message: "Lỗi khi cập nhật đánh giá",
      error: err?.message || String(err)
    });
  }
};

// Xóa đánh giá
exports.deleteReview = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const userId = req.user?.id;
    const { reviewId } = req.params;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const review = await db.Review.findOne({
      where: {
        id: reviewId,
        user_id: userId
      },
      transaction: t
    });

    if (!review) {
      await t.rollback();
      return res.status(404).json({ message: "Không tìm thấy đánh giá" });
    }

    await review.destroy({ transaction: t });
    await t.commit();

    return res.json({ message: "Xóa đánh giá thành công" });

  } catch (err) {
    await t.rollback();
    return res.status(500).json({
      message: "Lỗi khi xóa đánh giá",
      error: err?.message || String(err)
    });
  }
};

// Lấy đánh giá của sản phẩm
exports.getProductReviews = async (req, res) => {
  try {
    const { drinkId } = req.params;
    const { page = 1, limit = 10, rating } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { drink_id: drinkId };
    if (rating && rating !== "all") {
      whereClause.rating = parseInt(rating);
    }

    const reviews = await db.Review.findAndCountAll({
      where: whereClause,
      include: [
        { model: db.User, as: "user", attributes: ["id", "fullName"] }
      ],
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Tính điểm trung bình
    const avgRating = await db.Review.findOne({
      where: { drink_id: drinkId },
      attributes: [
        [db.sequelize.fn('AVG', db.sequelize.col('rating')), 'average']
      ],
      raw: true
    });

    return res.json({
      reviews: reviews.rows,
      total: reviews.count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(reviews.count / limit),
      averageRating: avgRating ? parseFloat(avgRating.average).toFixed(1) : 0
    });

  } catch (err) {
    return res.status(500).json({
      message: "Lỗi khi lấy đánh giá sản phẩm",
      error: err?.message || String(err)
    });
  }
};

// Lấy đánh giá của user
exports.getUserReviews = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const reviews = await db.Review.findAndCountAll({
      where: { user_id: userId },
      include: [
        { model: db.Drink, as: "drink", attributes: ["id", "name", "image_url"] }
      ],
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    return res.json({
      reviews: reviews.rows,
      total: reviews.count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(reviews.count / limit)
    });

  } catch (err) {
    return res.status(500).json({
      message: "Lỗi khi lấy đánh giá của user",
      error: err?.message || String(err)
    });
  }
};
