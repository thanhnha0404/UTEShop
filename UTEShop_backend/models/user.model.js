const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db.config");

// Định nghĩa model User
const User = sequelize.define("User", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  fullName: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  username: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
  },
  role: {
    type: DataTypes.ENUM("user", "admin"),
    allowNull: true,
    defaultValue: "user",
  },
  status: {
    type: DataTypes.ENUM("active", "inactive"),
    allowNull: true,
    defaultValue: "active",
  },
  dob: {
    type: DataTypes.DATEONLY,   // yyyy-mm-dd
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  address: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  loyalty_points: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    comment: "Tổng số điểm tích lũy xu hiện có"
  },
}, {
  tableName: "users", 
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",    
});

module.exports = User;
