const db = require("../models");
const { Op } = require("sequelize");
const notificationService = require("../services/notification.service");

// Tạo đơn hàng mới
exports.createOrder = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const userId = req.user?.id;
    console.log("🔍 User ID:", userId);
    console.log("🔍 Request body:", req.body);
    
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { items, shippingAddress, shippingPhone, notes, paymentMethod, voucherCode } = req.body;

    if (!items || items.length === 0) {
      await t.rollback();
      return res.status(400).json({ message: "Giỏ hàng trống" });
    }

    // Tính tổng tiền
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Tính phí vận chuyển theo phương thức
    const shippingMethod = req.body.shippingMethod || 'standard';
    const shippingFee = items.length > 0 ? (shippingMethod === 'express' ? 15000 : 10000) : 0;
    
    // Lấy thông tin user để kiểm tra xu hiện có
    const user = await db.User.findByPk(userId);
    const loyaltyPointsUsed = req.body.loyaltyPointsUsed || 0;
    
    // Validate and calculate voucher discount
    let voucherDiscount = 0;
    let appliedVoucher = null;
    
    if (voucherCode) {
      const voucher = await db.Voucher.findOne({
        where: { 
          code: voucherCode.toUpperCase(),
          status: 'active'
        }
      });
      
      if (voucher) {
        const now = new Date();
        
        // Check voucher validity
        if (voucher.end_date >= now && voucher.start_date <= now) {
          // Check usage limit
          if (!voucher.usage_limit || voucher.used_count < voucher.usage_limit) {
            // Check minimum order amount
            if (voucher.min_order_amount <= subtotal) {
              // Calculate discount
              if (voucher.discount_type === 'percentage') {
                voucherDiscount = Math.floor((subtotal * voucher.discount_value) / 100);
                if (voucher.max_discount_amount && voucherDiscount > voucher.max_discount_amount) {
                  voucherDiscount = voucher.max_discount_amount;
                }
              } else {
                voucherDiscount = Math.min(voucher.discount_value, subtotal);
              }
              appliedVoucher = voucher;
            }
          }
        }
      }
    }
    
    // Tính tổng tiền sau khi trừ xu và voucher (1 xu = 1 VNĐ)
    const totalBeforeDiscount = subtotal + shippingFee;
    const total = Math.max(0, totalBeforeDiscount - loyaltyPointsUsed - voucherDiscount);
    
    // Tính xu được tích lũy (20.000 VNĐ = 100 xu) - chỉ tính trên subtotal, không tính shipping fee
    const loyaltyPointsEarned = Math.floor(subtotal / 20000) * 100;

    // Tạo mã đơn hàng
    const orderNumber = `UTE${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Kiểm tra xu có đủ không
    if (loyaltyPointsUsed > user.loyalty_points) {
      await t.rollback();
      return res.status(400).json({ 
        message: "Không đủ xu để sử dụng", 
        currentPoints: user.loyalty_points,
        requestedPoints: loyaltyPointsUsed
      });
    }

    // Kiểm tra tồn kho trước khi tạo đơn hàng
    for (const item of items) {
      const drink = await db.Drink.findByPk(item.drinkId, { transaction: t });
      if (!drink) {
        await t.rollback();
        return res.status(400).json({ message: `Sản phẩm ID ${item.drinkId} không tồn tại` });
      }
      
      if (drink.stock < item.quantity) {
        await t.rollback();
        return res.status(400).json({ 
          message: `Sản phẩm "${drink.name}" chỉ còn ${drink.stock} sản phẩm trong kho`,
          productName: drink.name,
          availableStock: drink.stock,
          requestedQuantity: item.quantity
        });
      }
    }

    // Tạo đơn hàng
    console.log("🔍 Tạo đơn hàng với dữ liệu:", {
      user_id: userId,
      order_number: orderNumber,
      status: "pending",
      payment_method: paymentMethod || "COD",
      subtotal,
      shipping_fee: shippingFee,
      total,
      loyalty_points_used: loyaltyPointsUsed,
      loyalty_points_earned: loyaltyPointsEarned,
      voucher_discount: voucherDiscount,
      shipping_address: shippingAddress,
      shipping_phone: shippingPhone,
      notes,
    });
    
    const order = await db.Order.create({
      user_id: userId,
      order_number: orderNumber,
      status: "pending",
      payment_method: paymentMethod || "COD",
      subtotal,
      shipping_fee: shippingFee,
      total,
      loyalty_points_used: loyaltyPointsUsed,
      loyalty_points_earned: loyaltyPointsEarned,
      voucher_discount: voucherDiscount,
      voucher_code: appliedVoucher ? appliedVoucher.code : null,
      shipping_address: shippingAddress,
      shipping_phone: shippingPhone,
      notes,
    }, { transaction: t });
    
    console.log("✅ Đơn hàng đã tạo:", order.id);

    // Tạo order items
    const orderItems = await Promise.all(
      items.map(item =>
        db.OrderItem.create({
          order_id: order.id,
          drink_id: item.drinkId,
          quantity: item.quantity,
          price: item.price,
          size: item.size,
          ice_level: item.iceLevel,
          sugar_level: item.sugarLevel,
          notes: item.notes,
        }, { transaction: t })
      )
    );

    // Cập nhật stock và sold cho từng sản phẩm
    for (const item of items) {
      await db.Drink.update(
        {
          stock: db.sequelize.literal(`stock - ${item.quantity}`),
          sold: db.sequelize.literal(`sold + ${item.quantity}`)
        },
        {
          where: { id: item.drinkId },
          transaction: t
        }
      );
    }

    // Update voucher usage count if voucher was applied
    if (appliedVoucher) {
      await db.Voucher.update(
        { used_count: db.sequelize.literal(`used_count + 1`) },
        { 
          where: { id: appliedVoucher.id },
          transaction: t 
        }
      );
    }

    // Cập nhật xu của user
    if (loyaltyPointsUsed > 0) {
      // Trừ xu đã sử dụng
      await user.update(
        { loyalty_points: db.sequelize.literal(`loyalty_points - ${loyaltyPointsUsed}`) },
        { transaction: t }
      );

      // Ghi log xu đã sử dụng
      await db.LoyaltyPoint.create({
        user_id: userId,
        points: user.loyalty_points - loyaltyPointsUsed,
        transaction_type: "used",
        amount: -loyaltyPointsUsed,
        used_in_order_id: order.id,
        description: `Sử dụng ${loyaltyPointsUsed} xu cho đơn hàng ${orderNumber}`
      }, { transaction: t });
    }

    // Cộng xu mới vào tài khoản user
    if (loyaltyPointsEarned > 0) {
      // Cập nhật xu trong tài khoản user
      await user.update(
        { loyalty_points: db.sequelize.literal(`loyalty_points + ${loyaltyPointsEarned}`) },
        { transaction: t }
      );

      // Ghi log xu đã tích lũy
      await db.LoyaltyPoint.create({
        user_id: userId,
        points: user.loyalty_points - loyaltyPointsUsed + loyaltyPointsEarned,
        transaction_type: "earned",
        amount: loyaltyPointsEarned,
        earned_from_order_id: order.id,
        description: `Tích lũy ${loyaltyPointsEarned} xu từ đơn hàng ${orderNumber}`
      }, { transaction: t });
    }

    // Xóa giỏ hàng
    await db.CartItem.destroy({
      where: { user_id: userId },
      transaction: t
    });

    await t.commit();

    // Lấy thông tin đơn hàng đầy đủ
    const fullOrder = await db.Order.findByPk(order.id, {
      include: [
        {
          model: db.OrderItem,
          as: "orderItems",
          include: [
            {
              model: db.Drink,
              as: "drink",
              attributes: ["id", "name", "image_url"]
            }
          ]
        }
      ]
    });

    // Chuyển đổi dữ liệu để tương thích với frontend
    const orderData = {
      id: fullOrder.id,
      order_number: fullOrder.order_number,
      status: fullOrder.status,
      payment_method: fullOrder.payment_method,
      subtotal: Number(fullOrder.subtotal),
      shipping_fee: Number(fullOrder.shipping_fee),
      total: Number(fullOrder.total),
      shipping_address: fullOrder.shipping_address,
      shipping_phone: fullOrder.shipping_phone,
      notes: fullOrder.notes,
      created_at: fullOrder.created_at,
      updated_at: fullOrder.updated_at,
      items: fullOrder.orderItems?.map(item => ({
        id: item.id,
        drinkId: item.drink_id,
        quantity: item.quantity,
        price: Number(item.price),
        name: item.drink?.name,
        image_url: item.drink?.image_url,
        size: item.size,
        iceLevel: item.ice_level,
        sugarLevel: item.sugar_level,
        notes: item.notes
      })) || []
    };

    // Tạo thông báo cho user về đơn hàng mới
    try {
      const notificationResult = await notificationService.createOrderNotification(userId, {
        id: order.id,
        order_number: order.order_number,
        total_amount: total
      });
      
      if (notificationResult.success && global.io) {
        await notificationService.sendRealTimeNotification(global.io, userId, notificationResult.notification);
      }
    } catch (notificationError) {
      console.error('Error creating order notification:', notificationError);
      // Không throw error vì đơn hàng đã tạo thành công
    }

    return res.json({
      message: "Đặt hàng thành công",
      order: orderData
    });

  } catch (err) {
    await t.rollback();
    return res.status(500).json({
      message: "Lỗi khi tạo đơn hàng",
      error: err?.message || String(err)
    });
  }
};

// Lấy danh sách đơn hàng của user
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { 
      user_id: userId,
      is_hidden: false  // Chỉ lấy đơn hàng không bị ẩn
    };
    if (status && status !== "all") {
      whereClause.status = status;
    }

    const orders = await db.Order.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: db.OrderItem,
          as: "orderItems",
          include: [
            {
              model: db.Drink,
              as: "drink",
              attributes: ["id", "name", "image_url"]
            }
          ]
        }
      ],
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Chuyển đổi dữ liệu để tương thích với frontend
    const formattedOrders = orders.rows.map(order => ({
      id: order.id,
      order_number: order.order_number,
      status: order.status,
      payment_method: order.payment_method,
      subtotal: Number(order.subtotal),
      shipping_fee: Number(order.shipping_fee),
      total: Number(order.total),
      shipping_address: order.shipping_address,
      shipping_phone: order.shipping_phone,
      notes: order.notes,
      created_at: order.created_at,
      updated_at: order.updated_at,
      orderItems: order.orderItems?.map(item => ({
        id: item.id,
        drink_id: item.drink_id,
        quantity: item.quantity,
        price: Number(item.price),
        size: item.size,
        ice_level: item.ice_level,
        sugar_level: item.sugar_level,
        notes: item.notes,
        drink: item.drink
      })) || []
    }));

    return res.json({
      orders: formattedOrders,
      total: orders.count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(orders.count / limit)
    });

  } catch (err) {
    return res.status(500).json({
      message: "Lỗi khi lấy danh sách đơn hàng",
      error: err?.message || String(err)
    });
  }
};

// Lấy chi tiết đơn hàng
exports.getOrderDetail = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { orderId } = req.params;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const order = await db.Order.findOne({
      where: {
        id: orderId,
        user_id: userId
      },
      include: [
        {
          model: db.OrderItem,
          as: "orderItems",
          include: [
            {
              model: db.Drink,
              as: "drink",
              attributes: ["id", "name", "image_url", "description"]
            }
          ]
        }
      ]
    });

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    return res.json({ order });

  } catch (err) {
    return res.status(500).json({
      message: "Lỗi khi lấy chi tiết đơn hàng",
      error: err?.message || String(err)
    });
  }
};

// Hủy đơn hàng
exports.cancelOrder = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const userId = req.user?.id;
    const { orderId } = req.params;
    const { reason } = req.body;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const order = await db.Order.findOne({
      where: {
        id: orderId,
        user_id: userId
      },
      transaction: t,
      lock: true
    });

    if (!order) {
      await t.rollback();
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    // Kiểm tra thời gian hủy (chỉ được hủy trong 5 phút đầu)
    const orderTime = new Date(order.created_at);
    const now = new Date();
    const timeDiff = (now - orderTime) / (1000 * 60); // phút

    if (timeDiff > 5) {
      await t.rollback();
      return res.status(400).json({
        message: "Không thể hủy đơn hàng sau 5 phút. Vui lòng liên hệ shop để hủy đơn."
      });
    }

    // Kiểm tra trạng thái đơn hàng
    if (order.status === "cancelled") {
      await t.rollback();
      return res.status(400).json({ message: "Đơn hàng đã được hủy" });
    }

    if (["shipping", "delivered"].includes(order.status)) {
      await t.rollback();
      return res.status(400).json({
        message: "Không thể hủy đơn hàng đang giao hoặc đã giao"
      });
    }

    // Cập nhật trạng thái đơn hàng
    await order.update({
      status: "cancelled",
      cancelled_at: new Date(),
      cancelled_reason: reason || "Người dùng hủy đơn"
    }, { transaction: t });

    await t.commit();

    return res.json({ message: "Hủy đơn hàng thành công" });

  } catch (err) {
    await t.rollback();
    return res.status(500).json({
      message: "Lỗi khi hủy đơn hàng",
      error: err?.message || String(err)
    });
  }
};

// Gửi yêu cầu hủy đơn (cho đơn đã chuyển sang bước 3)
exports.requestCancelOrder = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { orderId } = req.params;
    const { reason } = req.body;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const order = await db.Order.findOne({
      where: {
        id: orderId,
        user_id: userId
      }
    });

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    // Chỉ cho phép gửi yêu cầu hủy cho đơn đã chuyển sang bước 3 trở lên
    if (!["preparing", "shipping"].includes(order.status)) {
      return res.status(400).json({
        message: "Chỉ có thể gửi yêu cầu hủy cho đơn hàng đang chuẩn bị hoặc đang giao"
      });
    }

    // TODO: Gửi thông báo cho admin về yêu cầu hủy đơn
    // Có thể lưu vào bảng notifications hoặc gửi email

    return res.json({
      message: "Đã gửi yêu cầu hủy đơn. Shop sẽ xem xét và phản hồi sớm nhất."
    });

  } catch (err) {
    return res.status(500).json({
      message: "Lỗi khi gửi yêu cầu hủy đơn",
      error: err?.message || String(err)
    });
  }
};

// Cập nhật trạng thái đơn hàng (cho admin)
exports.updateOrderStatus = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = ["pending", "confirmed", "preparing", "shipping", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      await t.rollback();
      return res.status(400).json({ message: "Trạng thái không hợp lệ" });
    }

    const order = await db.Order.findByPk(orderId, {
      transaction: t,
      lock: true
    });

    if (!order) {
      await t.rollback();
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    const updateData = { status };
    const now = new Date();

    // Cập nhật thời gian tương ứng với trạng thái
    switch (status) {
      case "confirmed":
        updateData.confirmed_at = now;
        // Cộng xu khi đơn hàng được xác nhận
        if (order.loyalty_points_earned > 0) {
          const user = await db.User.findByPk(order.user_id, { transaction: t });
          await user.update(
            { loyalty_points: db.sequelize.literal(`loyalty_points + ${order.loyalty_points_earned}`) },
            { transaction: t }
          );
        }
        break;
      case "preparing":
        updateData.preparing_at = now;
        break;
      case "shipping":
        updateData.shipping_at = now;
        break;
      case "delivered":
        updateData.delivered_at = now;
        break;
      case "cancelled":
        updateData.cancelled_at = now;
        // Hoàn lại stock và xu khi hủy đơn hàng
        const orderItems = await db.OrderItem.findAll({
          where: { order_id: orderId },
          transaction: t
        });
        
        for (const item of orderItems) {
          await db.Drink.update(
            {
              stock: db.sequelize.literal(`stock + ${item.quantity}`),
              sold: db.sequelize.literal(`sold - ${item.quantity}`)
            },
            {
              where: { id: item.drink_id },
              transaction: t
            }
          );
        }
        
        // Hoàn lại xu đã sử dụng
        if (order.loyalty_points_used > 0) {
          const user = await db.User.findByPk(order.user_id, { transaction: t });
          await user.update(
            { loyalty_points: db.sequelize.literal(`loyalty_points + ${order.loyalty_points_used}`) },
            { transaction: t }
          );
        }
        break;
    }

    await order.update(updateData, { transaction: t });
    await t.commit();

    return res.json({ message: "Cập nhật trạng thái đơn hàng thành công" });

  } catch (err) {
    await t.rollback();
    return res.status(500).json({
      message: "Lỗi khi cập nhật trạng thái đơn hàng",
      error: err?.message || String(err)
    });
  }
};

// Tự động xác nhận đơn hàng sau 5 phút
exports.autoConfirmOrders = async () => {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    const orders = await db.Order.findAll({
      where: {
        status: "pending",
        created_at: {
          [Op.lte]: fiveMinutesAgo
        }
      }
    });

    for (const order of orders) {
      await order.update({
        status: "confirmed",
        confirmed_at: new Date()
      });

      // Tạo thông báo xác nhận đơn hàng
      try {
        const notificationResult = await notificationService.createOrderConfirmationNotification(order.user_id, {
          id: order.id,
          order_number: order.order_number,
          total_amount: order.total_amount
        });
        
        if (notificationResult.success && global.io) {
          await notificationService.sendRealTimeNotification(global.io, order.user_id, notificationResult.notification);
        }
      } catch (notificationError) {
        console.error('Error creating confirmation notification:', notificationError);
      }
    }

    console.log(`✅ Tự động xác nhận ${orders.length} đơn hàng`);
  } catch (err) {
    console.error("❌ Lỗi tự động xác nhận đơn hàng:", err);
  }
};

// // Lấy danh sách đơn hàng của user
// exports.getUserOrders = async (req, res) => {
//   try {
//     const userId = req.user?.id;
//     if (!userId) return res.status(401).json({ message: "Unauthorized" });

//     const orders = await db.Order.findAll({
//       where: { user_id: userId },
//       include: [
//         {
//           model: db.OrderItem,
//           as: "orderItems",
//           include: [
//             {
//               model: db.Drink,
//               as: "drink",
//               attributes: ["id", "name", "image_url"]
//             }
//           ]
//         }
//       ],
//       order: [["created_at", "DESC"]]
//     });

//     return res.json({
//       orders: orders
//     });

//   } catch (err) {
//     return res.status(500).json({
//       message: "Lỗi khi lấy danh sách đơn hàng",
//       error: err?.message || String(err)
//     });
//   }
// };
