const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db.config");

const UserVoucher = sequelize.define("UserVoucher", {
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  voucher_id: { type: DataTypes.INTEGER, allowNull: false },
  used: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  tableName: "user_vouchers",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
  indexes: [{ unique: true, fields: ["user_id", "voucher_id"] }]
});

module.exports = UserVoucher;


