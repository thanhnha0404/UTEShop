const db = require("../models");
const { Op } = require("sequelize");

// Validate voucher code
exports.validateVoucher = async (req, res) => {
  try {
    const { code, orderTotal } = req.body;
    const userId = req.user?.id;
    
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!code) return res.status(400).json({ message: "Voucher code is required" });

    // Find voucher by code
    const voucher = await db.Voucher.findOne({
      where: { 
        code: code.toUpperCase(),
        status: 'active'
      }
    });

    if (!voucher) {
      return res.status(404).json({ 
        message: "Voucher không tồn tại hoặc đã hết hạn",
        valid: false 
      });
    }

    const now = new Date();
    
    // Check if voucher is expired
    if (voucher.end_date < now) {
      return res.status(400).json({ 
        message: "Voucher đã hết hạn",
        valid: false 
      });
    }

    // Check if voucher is not yet active
    if (voucher.start_date > now) {
      return res.status(400).json({ 
        message: "Voucher chưa có hiệu lực",
        valid: false 
      });
    }

    // Check usage limit
    if (voucher.usage_limit && voucher.used_count >= voucher.usage_limit) {
      return res.status(400).json({ 
        message: "Voucher đã hết lượt sử dụng",
        valid: false 
      });
    }

    // Check minimum order amount
    if (orderTotal && voucher.min_order_amount > orderTotal) {
      return res.status(400).json({ 
        message: `Đơn hàng tối thiểu ${voucher.min_order_amount.toLocaleString('vi-VN')}₫ để sử dụng voucher này`,
        valid: false 
      });
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (voucher.discount_type === 'percentage') {
      discountAmount = Math.floor((orderTotal * voucher.discount_value) / 100);
      if (voucher.max_discount_amount && discountAmount > voucher.max_discount_amount) {
        discountAmount = voucher.max_discount_amount;
      }
    } else {
      discountAmount = Math.min(voucher.discount_value, orderTotal);
    }

    return res.json({
      valid: true,
      voucher: {
        id: voucher.id,
        code: voucher.code,
        name: voucher.name,
        description: voucher.description,
        discount_type: voucher.discount_type,
        discount_value: Number(voucher.discount_value),
        min_order_amount: Number(voucher.min_order_amount),
        max_discount_amount: voucher.max_discount_amount ? Number(voucher.max_discount_amount) : null,
        discount_amount: discountAmount,
        end_date: voucher.end_date
      }
    });

  } catch (err) {
    return res.status(500).json({ 
      message: "Lỗi khi xác thực voucher", 
      error: err?.message || String(err) 
    });
  }
};

exports.getMyVouchers = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // Get user's vouchers through the UserVoucher junction table
    const userVouchers = await db.UserVoucher.findAll({
      where: { 
        user_id: userId,
        status: 'active'
      },
      include: [{
        model: db.Voucher,
        as: 'voucher',
        where: {
          status: 'active',
          start_date: { [Op.lte]: new Date() },
          end_date: { [Op.gte]: new Date() }
        }
      }],
      order: [["created_at", "DESC"]]
    });

    const vouchers = userVouchers.map(uv => ({
      id: uv.voucher.id,
      code: uv.voucher.code,
      name: uv.voucher.name,
      discount_type: uv.voucher.discount_type,
      discount_value: Number(uv.voucher.discount_value),
      min_order_amount: uv.voucher.min_order_amount ? Number(uv.voucher.min_order_amount) : 0,
      max_discount_amount: uv.voucher.max_discount_amount ? Number(uv.voucher.max_discount_amount) : null,
      end_date: uv.voucher.end_date,
      description: uv.voucher.description,
      used_at: uv.used_at,
      status: uv.status
    }));

    return res.json({ vouchers });
  } catch (err) {
    return res.status(500).json({ message: "Không thể lấy danh sách voucher", error: err?.message || String(err) });
  }
};


