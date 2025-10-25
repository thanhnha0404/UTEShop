const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db.config");

const CartItem = sequelize.define("CartItem", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false 
  },
  drink_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false 
  },
  quantity: { 
    type: DataTypes.INTEGER, 
    allowNull: false, 
    defaultValue: 1 
  },
  checked: { 
    type: DataTypes.BOOLEAN, 
    allowNull: true,
    defaultValue: true 
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
  isUpsized: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
}, {
  tableName: "cart_items",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
  indexes: [{ unique: true, fields: ["user_id", "drink_id"] }]
});

module.exports = CartItem;



