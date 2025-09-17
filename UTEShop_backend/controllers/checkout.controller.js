const db = require("../models");

exports.checkoutCOD = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const items = await db.CartItem.findAll({
      where: { user_id: userId },
      include: [{ model: db.Drink, as: "drink" }],
      transaction: t,
      lock: true,
    });

    if (items.length === 0) {
      await t.rollback();
      return res.status(400).json({ message: "Giỏ hàng trống" });
    }

    const mapped = items.map(i => ({
      id: i.id,
      drinkId: i.drink_id,
      quantity: i.quantity,
      price: Number(i?.drink?.salePrice || i?.drink?.price || 0),
      name: i?.drink?.name,
      image_url: i?.drink?.image_url,
    }));

    const subtotal = mapped.reduce((s, it) => s + it.price * it.quantity, 0);
    const shippingFee = mapped.length > 0 ? 20000 : 0;
    const total = subtotal + shippingFee;

    await db.CartItem.destroy({ where: { user_id: userId }, transaction: t });
    await t.commit();

    const order = {
      id: Date.now(),
      userId,
      paymentMethod: "COD",
      subtotal,
      shippingFee,
      total,
      items: mapped,
      createdAt: new Date().toISOString(),
    };

    return res.json({ message: "Checkout thành công", order });
  } catch (err) {
    try { await t.rollback(); } catch (_) {}
    return res.status(500).json({ message: "Checkout lỗi", error: err?.message || String(err) });
  }
};


