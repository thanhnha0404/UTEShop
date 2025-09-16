const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db.config");

const CartItem = sequelize.define("CartItem", {
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  drink_id: { type: DataTypes.INTEGER, allowNull: false },
  quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  checked: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: "cart_items",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
  indexes: [{ unique: true, fields: ["user_id", "drink_id"] }]
});

module.exports = CartItem;



