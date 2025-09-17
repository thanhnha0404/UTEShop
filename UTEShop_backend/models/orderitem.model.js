const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db.config");

const OrderItem = sequelize.define("OrderItem", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "orders",
      key: "id",
    },
  },
  drink_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "drinks",
      key: "id",
    },
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  size: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  ice_level: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  sugar_level: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: "order_items",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
});

module.exports = OrderItem;
