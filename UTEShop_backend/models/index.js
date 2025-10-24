const { sequelize } = require("../config/db.config");
const User = require("./user.model");
const Category = require("./category.model");
const Drink = require("./drink.model");
const CartItem = require("./cartitem.model");
const Voucher = require("./voucher.model");
const UserVoucher = require("./user_voucher.model");
const Order = require("./order.model");
const OrderItem = require("./orderitem.model");
const Review = require("./review.model");
const LoyaltyPoint = require("./loyaltypoint.model");
const Favorite = require("./favorite.model");
// const Notification = require("./notification.model");
const Notification = require("./notification.model")(sequelize);


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
db.Voucher = Voucher;
db.UserVoucher = UserVoucher;
db.Order = Order;
db.OrderItem = OrderItem;
db.Review = Review;
db.LoyaltyPoint = LoyaltyPoint;
db.Voucher = Voucher;
db.Favorite = Favorite;
db.Notification = Notification;

// Associations
Drink.belongsTo(Category, { foreignKey: "category_id", as: "category" });
Category.hasMany(Drink, { foreignKey: "category_id", as: "drinks" });

CartItem.belongsTo(User, { foreignKey: "user_id", as: "user" });
CartItem.belongsTo(Drink, { foreignKey: "drink_id", as: "drink" });
User.hasMany(CartItem, { foreignKey: "user_id", as: "cartItems" });
Drink.hasMany(CartItem, { foreignKey: "drink_id", as: "cartItems" });

// Voucher associations
Voucher.belongsTo(User, { foreignKey: "user_id", as: "user" });
User.hasMany(Voucher, { foreignKey: "user_id", as: "vouchers" });

// Order associations
Order.belongsTo(User, { foreignKey: "user_id", as: "user" });
Order.hasMany(OrderItem, { foreignKey: "order_id", as: "orderItems" });
User.hasMany(Order, { foreignKey: "user_id", as: "orders" });

OrderItem.belongsTo(Order, { foreignKey: "order_id", as: "order" });
OrderItem.belongsTo(Drink, { foreignKey: "drink_id", as: "drink" });
Drink.hasMany(OrderItem, { foreignKey: "drink_id", as: "orderItems" });

// Review associations
Review.belongsTo(User, { foreignKey: "user_id", as: "user" });
Review.belongsTo(Drink, { foreignKey: "drink_id", as: "drink" });
Review.belongsTo(Order, { foreignKey: "order_id", as: "order" });
User.hasMany(Review, { foreignKey: "user_id", as: "reviews" });
Drink.hasMany(Review, { foreignKey: "drink_id", as: "reviews" });
Order.hasMany(Review, { foreignKey: "order_id", as: "reviews" });

// LoyaltyPoint associations
LoyaltyPoint.belongsTo(User, { foreignKey: "user_id", as: "user" });
LoyaltyPoint.belongsTo(Order, { foreignKey: "earned_from_order_id", as: "earnedFromOrder" });
LoyaltyPoint.belongsTo(Order, { foreignKey: "used_in_order_id", as: "usedInOrder" });
User.hasMany(LoyaltyPoint, { foreignKey: "user_id", as: "loyaltyPoints" });

// Favorite associations
Favorite.belongsTo(User, { foreignKey: "user_id", as: "user" });
Favorite.belongsTo(Drink, { foreignKey: "drink_id", as: "drink" });
User.hasMany(Favorite, { foreignKey: "user_id", as: "favorites" });
Drink.hasMany(Favorite, { foreignKey: "drink_id", as: "favorites" });

// Notification associations
Notification.belongsTo(User, { foreignKey: "user_id", as: "user" });
User.hasMany(Notification, { foreignKey: "user_id", as: "notifications" });

module.exports = db;
