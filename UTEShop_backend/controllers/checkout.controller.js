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
    const orderItems = items.map(i => {
      let basePrice = Number(i?.drink?.salePrice || i?.drink?.price || 0);
      
      // Tính phí upsize (+5000)
      if (i.isUpsized) {
        basePrice += 5000;
      }
      
      return {
        drinkId: i.drink_id,
        quantity: i.quantity,
        price: basePrice,
        size: i.size || null,
        iceLevel: i.ice_level || null,
        sugarLevel: i.sugar_level || null,
        notes: i.notes || null,
      };
    });

    // Lấy thông tin user để lấy địa chỉ giao hàng
    const user = await db.User.findByPk(userId);
    
    // Kiểm tra và xử lý địa chỉ
    let shippingAddress = user.address;
    let shippingPhone = user.phone;
    
    if (!shippingAddress || shippingAddress.trim() === '') {
      shippingAddress = "Chưa cập nhật địa chỉ";
    }
    
    if (!shippingPhone || shippingPhone.trim() === '') {
      shippingPhone = "Chưa cập nhật số điện thoại";
    }
    
    console.log("🔍 User address:", shippingAddress);
    console.log("🔍 User phone:", shippingPhone);
    
    // Tạo request body cho order controller
    const orderRequest = {
      body: {
        items: orderItems,
        shippingAddress: shippingAddress,
        shippingPhone: shippingPhone,
        notes: "",
        paymentMethod: "COD",
        loyaltyPointsUsed: req.body.loyaltyPointsUsed || 0,
        shippingMethod: req.body.shippingMethod || 'standard'
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


