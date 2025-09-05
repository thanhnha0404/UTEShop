const { sequelize } = require("../config/db.config");
const User = require("./user.model");
const Category = require("./category.model");
const Product = require("./product.model");

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
db.Product = Product;

// Associations
Product.belongsTo(Category, { foreignKey: "categoryId", as: "category" });
Category.hasMany(Product, { foreignKey: "categoryId", as: "products" });

module.exports = db;
