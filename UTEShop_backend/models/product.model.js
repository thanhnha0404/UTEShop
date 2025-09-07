const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db.config");

const Product = sequelize.define(
  "Product",
  {
    name: { type: DataTypes.STRING, allowNull: false },
    slug: { type: DataTypes.STRING, allowNull: false, unique: true },
    description: { type: DataTypes.TEXT },
    price: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    salePrice: { type: DataTypes.DECIMAL(12, 2) },
    stock: { type: DataTypes.INTEGER, defaultValue: 0 },
    views: { type: DataTypes.INTEGER, defaultValue: 0 },
    sold: { type: DataTypes.INTEGER, defaultValue: 0 },
    imageUrls: {
      type: DataTypes.JSON,   // dùng JSON thay vì TEXT
      allowNull: false,
      defaultValue: []        // mặc định là mảng rỗng
    }
  },
  {
    tableName: "products",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Product;
