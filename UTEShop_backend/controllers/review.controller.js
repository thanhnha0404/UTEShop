const db = require("../models");
const notificationService = require("../services/notification.service");
const emailService = require("../services/email.service");

// Tạo đánh giá sản phẩm
exports.createReview = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const userId = req.user?.id;
    const { drinkId, rating, comment, orderId } = req.body;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // Kiểm tra user đã có đơn (đang chờ hoặc đã hoàn tất) với sản phẩm này chưa
    let hasPurchased = null;
    if (orderId) {
      hasPurchased = await db.OrderItem.findOne({
        where: { drink_id: drinkId, order_id: orderId },
        include: [{
          model: db.Order,
          as: "order",
          where: { user_id: userId, status: ["pending", "confirmed", "preparing", "shipping", "delivered"] }
        }],
        transaction: t
      });
    } else {
      hasPurchased = await db.OrderItem.findOne({
        where: { drink_id: drinkId },
        include: [{
          model: db.Order,
          as: "order",
          where: { user_id: userId, status: ["pending", "confirmed", "preparing", "shipping", "delivered"] }
        }],
        transaction: t
      });
    }

    if (!hasPurchased) {
      await t.rollback();
      return res.status(400).json({ 
        message: "Bạn chỉ có thể đánh giá sản phẩm đã đặt hàng" 
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

    // Reward on review: either voucher or points
    let reward = null;
    // Simple rule: 50% chance voucher, else +50 points
    const rewardVoucher = Math.random() < 0.5;
    if (rewardVoucher) {
      const code = `RVW${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random()*1e3)}`;
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const voucher = await db.Voucher.create({
        user_id: userId,
        code,
        discount_type: "fixed",
        discount_value: 10000, // 10k VND off
        min_order_total: 50000,
        expires_at: expiresAt,
        description: "Quà tặng đánh giá sản phẩm"
      }, { transaction: t });
      reward = { type: "voucher", voucher };
      
      // Lưu voucher data để tạo thông báo sau khi commit
      reward = { type: "voucher", voucher, notificationData: voucher };
    } else {
      const user = await db.User.findByPk(userId, { transaction: t, lock: true });
      const addPoints = 50;
      await user.increment('loyalty_points', { by: addPoints, transaction: t });
      await user.reload({ transaction: t });
      await db.LoyaltyPoint.create({
        user_id: userId,
        points: user.loyalty_points,
        transaction_type: "earned",
        amount: addPoints,
        description: "Thưởng đánh giá sản phẩm"
      }, { transaction: t });
      reward = { type: "points", amount: addPoints };
      
      // Lưu points data để tạo thông báo sau khi commit
      const pointsData = {
        amount: addPoints,
        totalPoints: user.loyalty_points
      };
      reward = { type: "points", amount: addPoints, notificationData: pointsData };
    }

    // Cập nhật trạng thái đơn hàng khi có review
    if (orderId) {
      const order = await db.Order.findByPk(orderId, { transaction: t });
      if (order && order.status === "pending") {
        // Chuyển từ "pending" (mua) thành "shipping" (đang giao) khi có review
        await order.update({
          status: "shipping",
          shipping_at: new Date()
        }, { transaction: t });
        console.log(`📦 Đơn hàng #${order.order_number} chuyển sang trạng thái "shipping" sau khi có review`);
      }
    }

    await t.commit();

    // Tạo thông báo cho user sau khi commit thành công
    if (reward && reward.notificationData) {
      try {
        if (reward.type === "voucher") {
          console.log('🔔 Creating voucher notification for user:', userId);
          const notificationResult = await notificationService.createVoucherNotification(userId, reward.notificationData);
          
          if (notificationResult.success && global.io) {
            console.log('📡 Sending real-time voucher notification to user:', userId);
            await notificationService.sendRealTimeNotification(global.io, userId, notificationResult.notification);
          }
          
          // Gửi email riêng
          const user = await db.User.findByPk(userId);
          if (user && user.email) {
            console.log('📧 Sending voucher email to:', user.email);
            await emailService.sendVoucherNotificationEmail(user.email, reward.notificationData);
          }
        } else if (reward.type === "points") {
          console.log('🔔 Creating loyalty notification for user:', userId);
          const notificationResult = await notificationService.createLoyaltyNotification(userId, reward.notificationData);
          
          if (notificationResult.success && global.io) {
            console.log('📡 Sending real-time loyalty notification to user:', userId);
            await notificationService.sendRealTimeNotification(global.io, userId, notificationResult.notification);
          }
          
          // Gửi email riêng
          const user = await db.User.findByPk(userId);
          if (user && user.email) {
            console.log('📧 Sending loyalty email to:', user.email);
            await emailService.sendLoyaltyNotificationEmail(user.email, reward.notificationData);
          }
        }
      } catch (notificationError) {
        console.error('Error creating user notification:', notificationError);
        // Không throw error vì review đã tạo thành công
      }
    }

    // Lấy thông tin đánh giá đầy đủ
    const fullReview = await db.Review.findByPk(review.id, {
      include: [
        { model: db.User, as: "user", attributes: ["id", "fullName"] },
        { model: db.Drink, as: "drink", attributes: ["id", "name"] }
      ]
    });

    // Tạo thông báo về đánh giá mới (cho admin hoặc shop owner) - CHỈ SAU KHI COMMIT
    try {
      const drink = await db.Drink.findByPk(drinkId);
      if (drink) {
        // Tạo thông báo cho admin (user_id = 1 hoặc admin user)
        const adminUsers = await db.User.findAll({
          where: { role: 'admin' },
          attributes: ['id']
        });
        
        for (const admin of adminUsers) {
          const notificationResult = await notificationService.createReviewNotification(admin.id, {
            drink_name: drink.name,
            rating: rating,
            comment: comment
          });
          
          if (notificationResult.success && global.io) {
            await notificationService.sendRealTimeNotification(global.io, admin.id, notificationResult.notification);
          }
        }
      }
    } catch (notificationError) {
      console.error('Error creating review notification:', notificationError);
      // Không throw error vì review đã tạo thành công
    }

    // Loại bỏ notificationData khỏi response
    const cleanReward = { ...reward };
    delete cleanReward.notificationData;

    return res.json({
      message: "Đánh giá thành công",
      review: fullReview,
      reward: cleanReward
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

    const whereClause = { 
      drink_id: drinkId,
      is_hidden: false  // Chỉ lấy review không bị ẩn
    };
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

    // Tính điểm trung bình (chỉ tính review không bị ẩn)
    const avgRating = await db.Review.findOne({
      where: { 
        drink_id: drinkId,
        is_hidden: false
      },
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
      where: { 
        user_id: userId,
        is_hidden: false  // Chỉ lấy review không bị ẩn
      },
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
