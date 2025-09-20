const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db.config");

const LoyaltyPoint = sequelize.define("LoyaltyPoint", {
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
  points: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  earned_from_order_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: "orders",
      key: "id",
    },
  },
  used_in_order_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: "orders",
      key: "id",
    },
  },
  transaction_type: {
    type: DataTypes.ENUM("earned", "used"),
    allowNull: false,
  },
  amount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: "Số xu được cộng hoặc trừ trong giao dịch này"
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: "loyalty_points",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
});

module.exports = LoyaltyPoint;
