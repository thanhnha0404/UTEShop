const { sequelize } = require("../config/db.config");
const User = require("./user.model");
const Category = require("./category.model");
const Drink = require("./drink.model");
const CartItem = require("./cartitem.model");
const Order = require("./order.model");
const OrderItem = require("./orderitem.model");

(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Kết nối MySQL thành công");
  } catch (err) {
    console.error("❌ Lỗi kết nối MySQL:", err);
  }
})();


const db = {};
db.sequelize = sequelize;
db.User = User;
db.Category = Category;
db.Drink = Drink;
db.CartItem = CartItem;
db.Order = Order;
db.OrderItem = OrderItem;

// Associations
Drink.belongsTo(Category, { foreignKey: "category_id", as: "category" });
Category.hasMany(Drink, { foreignKey: "category_id", as: "drinks" });

CartItem.belongsTo(User, { foreignKey: "user_id", as: "user" });
CartItem.belongsTo(Drink, { foreignKey: "drink_id", as: "drink" });
User.hasMany(CartItem, { foreignKey: "user_id", as: "cartItems" });
Drink.hasMany(CartItem, { foreignKey: "drink_id", as: "cartItems" });

// Order associations
Order.belongsTo(User, { foreignKey: "user_id", as: "user" });
Order.hasMany(OrderItem, { foreignKey: "order_id", as: "orderItems" });
User.hasMany(Order, { foreignKey: "user_id", as: "orders" });

OrderItem.belongsTo(Order, { foreignKey: "order_id", as: "order" });
OrderItem.belongsTo(Drink, { foreignKey: "drink_id", as: "drink" });
Drink.hasMany(OrderItem, { foreignKey: "drink_id", as: "orderItems" });

module.exports = db;
