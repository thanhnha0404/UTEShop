const { sequelize } = require("../config/db.config");
const User = require("./user.model");
const Category = require("./category.model");
const Drink = require("./drink.model");
const CartItem = require("./cartitem.model");

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

// Associations
Drink.belongsTo(Category, { foreignKey: "category_id", as: "category" });
Category.hasMany(Drink, { foreignKey: "category_id", as: "drinks" });

CartItem.belongsTo(User, { foreignKey: "user_id", as: "user" });
CartItem.belongsTo(Drink, { foreignKey: "drink_id", as: "drink" });
User.hasMany(CartItem, { foreignKey: "user_id", as: "cartItems" });
Drink.hasMany(CartItem, { foreignKey: "drink_id", as: "cartItems" });

module.exports = db;
