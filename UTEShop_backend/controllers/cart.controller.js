const db = require("../models");

exports.addToCart = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { drinkId, bookId, quantity } = req.body || {};
    const targetId = drinkId || bookId;
    const qty = Number(quantity) || 1;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!targetId || qty <= 0) return res.status(400).json({ message: "Invalid payload" });

    const drink = await db.Drink.findByPk(targetId);
    if (!drink) return res.status(404).json({ message: "Drink not found" });
    
    // Kiểm tra hết hàng
    if (drink.stock <= 0) {
      return res.status(400).json({ 
        message: "Sản phẩm đã hết hàng",
        productName: drink.name,
        stock: drink.stock
      });
    }
    
    if (drink.stock < qty) {
      return res.status(400).json({ 
        message: `Chỉ còn ${drink.stock} sản phẩm trong kho`,
        productName: drink.name,
        availableStock: drink.stock,
        requestedQuantity: qty
      });
    }

    const [item, created] = await db.CartItem.findOrCreate({
      where: { user_id: userId, drink_id: targetId },
      defaults: { quantity: qty, checked: true },
    });

    if (!created) {
      const newQty = item.quantity + qty;
      if (newQty > drink.stock) {
        return res.status(400).json({ 
          message: `Chỉ có thể thêm tối đa ${drink.stock} sản phẩm`,
          productName: drink.name,
          availableStock: drink.stock,
          currentInCart: item.quantity,
          requestedToAdd: qty
        });
      }
      item.quantity = newQty;
      await item.save();
    }

    return res.json({ message: "Added to cart" });
  } catch (err) {
    return res.status(500).json({ message: "Add to cart error", error: err?.message || String(err) });
  }
};

exports.getMyCart = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const items = await db.CartItem.findAll({
      where: { user_id: userId },
      include: [{ model: db.Drink, as: "drink" }],
      order: [["updated_at", "DESC"]],
    });
    return res.json({
      items: items.map(i => {
        const drinkData = i.drink ? i.drink.toJSON() : null;
        if (drinkData) {
          drinkData.isOutOfStock = drinkData.stock <= 0;
          drinkData.stockStatus = drinkData.stock <= 0 ? "Hết hàng" : `Còn ${drinkData.stock} sản phẩm`;
        }
        return {
          id: i.id,
          drinkId: i.drink_id,
          quantity: i.quantity,
          checked: i.checked,
          drink: drinkData,
        };
      })
    });
  } catch (err) {
    return res.status(500).json({ message: "Get cart error", error: err?.message || String(err) });
  }
};

exports.updateQuantity = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { drinkId, bookId, quantity } = req.body || {};
    const targetId = drinkId || bookId;
    const qty = Number(quantity);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!targetId || !Number.isFinite(qty) || qty <= 0) return res.status(400).json({ message: "Invalid payload" });

    const item = await db.CartItem.findOne({ where: { user_id: userId, drink_id: targetId } });
    if (!item) return res.status(404).json({ message: "Item not found" });
    const drink = await db.Drink.findByPk(targetId);
    if (!drink) return res.status(404).json({ message: "Drink not found" });
    
    // Kiểm tra hết hàng
    if (drink.stock <= 0) {
      return res.status(400).json({ 
        message: "Sản phẩm đã hết hàng",
        productName: drink.name,
        stock: drink.stock
      });
    }
    
    if (qty > drink.stock) {
      return res.status(400).json({ 
        message: `Chỉ có thể cập nhật tối đa ${drink.stock} sản phẩm`,
        productName: drink.name,
        availableStock: drink.stock,
        requestedQuantity: qty
      });
    }
    
    item.quantity = qty;
    await item.save();
    return res.json({ message: "Updated" });
  } catch (err) {
    return res.status(500).json({ message: "Update cart error", error: err?.message || String(err) });
  }
};

exports.removeItem = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { drinkId, bookId } = req.body || {};
    const targetId = drinkId || bookId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!targetId) return res.status(400).json({ message: "Invalid payload" });
    const deleted = await db.CartItem.destroy({ where: { user_id: userId, drink_id: targetId } });
    if (!deleted) return res.status(404).json({ message: "Item not found" });
    return res.json({ message: "Removed" });
  } catch (err) {
    return res.status(500).json({ message: "Remove cart error", error: err?.message || String(err) });
  }
};



