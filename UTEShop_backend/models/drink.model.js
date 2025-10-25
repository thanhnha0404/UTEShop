const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db.config");

const Drink = sequelize.define(
  "Drink",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: { 
      type: DataTypes.STRING(255), 
      allowNull: false 
    },
    slug: { 
      type: DataTypes.STRING(255), 
      allowNull: false, 
      unique: true 
    },
    description: { 
      type: DataTypes.TEXT,
      allowNull: true 
    },
    price: { 
      type: DataTypes.DECIMAL(12, 2), 
      allowNull: false 
    },
    salePrice: { 
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true 
    },
    size: { 
      type: DataTypes.STRING(255),
      allowNull: true 
    },
    stock: { 
      type: DataTypes.INTEGER, 
      allowNull: true,
      defaultValue: 0 
    },
    views: { 
      type: DataTypes.INTEGER, 
      allowNull: true,
      defaultValue: 0 
    },
    sold: { 
      type: DataTypes.INTEGER, 
      allowNull: true,
      defaultValue: 0 
    },
    image_url: { 
      type: DataTypes.STRING(255),
      allowNull: true 
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'categories',
        key: 'id'
      }
    },
    is_hidden: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
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
