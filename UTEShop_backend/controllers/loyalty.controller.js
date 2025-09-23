const db = require("../models");

// Lấy thông tin xu của user
exports.getUserLoyaltyPoints = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const user = await db.User.findByPk(userId, {
      attributes: ["id", "fullName", "loyalty_points"],
      include: [{ model: db.Voucher, as: "vouchers", attributes: ["id", "code", "discount_type", "discount_value", "min_order_total", "expires_at", "used_at", "description", "created_at"] }]
    });

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy user" });
    }

    return res.json({
      userId: user.id,
      userName: user.fullName,
      currentPoints: user.loyalty_points,
      vouchers: (user.vouchers || []).filter(v => !v.used_at && (!v.expires_at || new Date(v.expires_at) > new Date())),
      conversionRate: {
        vndToPoints: "20,000 VNĐ = 100 xu",
        pointsToVnd: "1 xu = 1 VNĐ"
      }
    });

  } catch (err) {
    return res.status(500).json({
      message: "Lỗi khi lấy thông tin xu",
      error: err?.message || String(err)
    });
  }
};

// Lấy lịch sử giao dịch xu
exports.getLoyaltyHistory = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const transactions = await db.LoyaltyPoint.findAndCountAll({
      where: { user_id: userId },
      include: [
        {
          model: db.Order,
          as: "earnedFromOrder",
          attributes: ["id", "order_number", "total"],
          required: false
        },
        {
          model: db.Order,
          as: "usedInOrder",
          attributes: ["id", "order_number", "total"],
          required: false
        }
      ],
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const formattedTransactions = transactions.rows.map(transaction => ({
      id: transaction.id,
      type: transaction.transaction_type,
      amount: transaction.amount,
      points: transaction.points,
      description: transaction.description,
      createdAt: transaction.created_at,
      orderNumber: transaction.earnedFromOrder?.order_number || transaction.usedInOrder?.order_number
    }));

    return res.json({
      transactions: formattedTransactions,
      total: transactions.count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(transactions.count / limit)
    });

  } catch (err) {
    return res.status(500).json({
      message: "Lỗi khi lấy lịch sử xu",
      error: err?.message || String(err)
    });
  }
};

// Lấy danh sách voucher của user
exports.getUserVouchers = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const vouchers = await db.Voucher.findAll({
      where: { user_id: userId },
      order: [["created_at", "DESC"]]
    });

    return res.json({ vouchers });
  } catch (err) {
    return res.status(500).json({
      message: "Lỗi khi lấy danh sách voucher",
      error: err?.message || String(err)
    });
  }
};

// Tính toán xu có thể sử dụng cho đơn hàng
exports.calculateLoyaltyUsage = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { orderTotal } = req.body;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const user = await db.User.findByPk(userId, {
      attributes: ["loyalty_points"]
    });

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy user" });
    }

    const maxUsablePoints = Math.min(user.loyalty_points, orderTotal);
    // Tính xu chỉ dựa trên subtotal, không tính shipping fee
    const pointsToEarn = Math.floor(orderTotal / 20000) * 100;

    return res.json({
      currentPoints: user.loyalty_points,
      orderTotal: orderTotal,
      maxUsablePoints: maxUsablePoints,
      pointsToEarn: pointsToEarn,
      finalAmount: orderTotal - maxUsablePoints
    });

  } catch (err) {
    return res.status(500).json({
      message: "Lỗi khi tính toán xu",
      error: err?.message || String(err)
    });
  }
};
