const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db.config");

const Voucher = sequelize.define("Voucher", {
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
  code: {
    type: DataTypes.STRING(32),
    allowNull: false,
    unique: true,
  },
  discount_type: {
    type: DataTypes.ENUM("percent", "fixed"),
    allowNull: false,
    defaultValue: "fixed",
  },
  discount_value: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  min_order_total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  used_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: "vouchers",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
  indexes: [
    { unique: true, fields: ["code"], name: "unique_code_voucher" }
  ]
});

module.exports = Voucher;



