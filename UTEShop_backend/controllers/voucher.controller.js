const db = require("../models");

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
          start_date: { [db.Sequelize.Op.lte]: new Date() },
          end_date: { [db.Sequelize.Op.gte]: new Date() }
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


