const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db.config");

const Order = sequelize.define("Order", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "users",
      key: "id",
    },
  },
  order_number: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  status: {
    type: DataTypes.ENUM(
      "pending",      // Đơn hàng mới
      "confirmed",    // Đã xác nhận
      "preparing",    // Shop đang chuẩn bị hàng
      "shipping",     // Đang giao hàng
      "delivered",    // Đã giao thành công
      "cancelled"     // Đã hủy
    ),
    defaultValue: "pending",
    allowNull: false,
  },
  payment_method: {
    type: DataTypes.ENUM("COD", "BANKING", "MOMO"),
    allowNull: false,
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  shipping_fee: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  shipping_address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  shipping_phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  cancelled_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  cancelled_reason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  confirmed_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  preparing_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  shipping_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  delivered_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: "orders",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
});

module.exports = Order;
