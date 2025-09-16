const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db.config");

const Drink = sequelize.define(
  "Drink",
  {
    name: { type: DataTypes.STRING, allowNull: false },
    slug: { type: DataTypes.STRING, allowNull: false, unique: true },
    description: { type: DataTypes.TEXT },
    price: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    salePrice: { type: DataTypes.DECIMAL(12, 2) },
    size: { type: DataTypes.STRING }, // Kích cỡ (S/M/L)
    stock: { type: DataTypes.INTEGER, defaultValue: 0 },
    views: { type: DataTypes.INTEGER, defaultValue: 0 },
    sold: { type: DataTypes.INTEGER, defaultValue: 0 },
    image_url: { type: DataTypes.STRING }, // Ảnh đại diện
    category_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Categories',
        key: 'id'
      }
    }
  },
  {
    tableName: "drinks",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Drink;
