const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db.config");

const UserVoucher = sequelize.define("UserVoucher", {
  id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
  },
  user_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false 
  },
  voucher_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false 
  },
  used_at: { 
    type: DataTypes.DATE, 
    allowNull: true 
  },
  order_id: { 
    type: DataTypes.INTEGER, 
    allowNull: true 
  },
  status: {
    type: DataTypes.ENUM("active", "used", "expired"),
    allowNull: true,
    defaultValue: "active"
  }
}, {
  tableName: "user_vouchers",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
  indexes: [{ unique: true, fields: ["user_id", "voucher_id"] }]
});

module.exports = UserVoucher;


