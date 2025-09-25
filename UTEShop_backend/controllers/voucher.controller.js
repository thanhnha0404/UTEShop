const db = require("../models");

exports.getMyVouchers = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const rows = await db.Voucher.findAll({
      where: { user_id: userId },
      order: [["created_at", "DESC"]]
    });

    const vouchers = rows.map(v => ({
      id: v.id,
      code: v.code,
      discount_type: v.discount_type,
      discount_value: Number(v.discount_value),
      min_order_total: v.min_order_total ? Number(v.min_order_total) : 0,
      expires_at: v.expires_at,
      description: v.description,
    }));

    return res.json({ vouchers });
  } catch (err) {
    return res.status(500).json({ message: "Get vouchers error", error: err?.message || String(err) });
  }
};


