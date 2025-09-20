const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db.config");

// Định nghĩa model User
const User = sequelize.define("User", {
  fullName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  dob: {
    type: DataTypes.DATEONLY,   // yyyy-mm-dd
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  address: {
    type: DataTypes.STRING,
  },
  loyalty_points: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: "Tổng số điểm tích lũy xu hiện có"
  },
}, {
  tableName: "users", 
  timestamps: false,    
});

module.exports = User;
