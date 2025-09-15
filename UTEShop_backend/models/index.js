const { sequelize } = require("../config/db.config");
const User = require("./user.model");
const Category = require("./category.model");
const Drink = require("./drink.model");

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

// Associations
Drink.belongsTo(Category, { foreignKey: "category_id", as: "category" });
Category.hasMany(Drink, { foreignKey: "category_id", as: "drinks" });

module.exports = db;
