const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db.config");

const Review = sequelize.define("Review", {
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
  drink_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "drinks",
      key: "id",
    },
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5,
    },
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "orders",
      key: "id",
    },
  },
}, {
  tableName: "reviews",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
  indexes: [
    {
      unique: true,
      fields: ["user_id", "drink_id"],
      name: "unique_user_drink_review"
    }
  ]
});

module.exports = Review;
