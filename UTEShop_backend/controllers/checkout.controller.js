const db = require("../models");
const orderController = require("./order.controller");

exports.checkoutCOD = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // Lấy thông tin giỏ hàng
    const items = await db.CartItem.findAll({
      where: { user_id: userId },
      include: [{ model: db.Drink, as: "drink" }],
    });

    if (items.length === 0) {
      return res.status(400).json({ message: "Giỏ hàng trống" });
    }

    // Chuyển đổi dữ liệu giỏ hàng thành format cho order
    const orderItems = items.map(i => ({
      drinkId: i.drink_id,
      quantity: i.quantity,
      price: Number(i?.drink?.salePrice || i?.drink?.price || 0),
      size: i.size || null,
      iceLevel: i.ice_level || null,
      sugarLevel: i.sugar_level || null,
      notes: i.notes || null,
    }));

    // Lấy thông tin user để lấy địa chỉ giao hàng
    const user = await db.User.findByPk(userId);
    
    // Tạo request body cho order controller
    const orderRequest = {
      body: {
        items: orderItems,
        shippingAddress: user.address || "Chưa cập nhật địa chỉ",
        shippingPhone: user.phone || "Chưa cập nhật số điện thoại",
        notes: "",
        paymentMethod: "COD",
        loyaltyPointsUsed: req.body.loyaltyPointsUsed || 0
      },
      user: { id: userId }
    };

    // Gọi order controller để tạo đơn hàng
    console.log("🔍 Gọi createOrder với:", orderRequest);
    return await orderController.createOrder(orderRequest, res);

  } catch (err) {
    return res.status(500).json({ 
      message: "Checkout lỗi", 
      error: err?.message || String(err) 
    });
  }
};


