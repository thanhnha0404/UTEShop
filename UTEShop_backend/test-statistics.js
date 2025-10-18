require("dotenv").config();
const db = require("./models");
const { Op } = require("sequelize");

async function testStatistics() {
  try {
    console.log("Testing database connection...");
    await db.sequelize.authenticate();
    console.log("✅ Database connected");

    console.log("Testing Order model...");
    const orderCount = await db.Order.count();
    console.log(`📋 Total orders: ${orderCount}`);

    console.log("Testing User model...");
    const userCount = await db.User.count();
    console.log(`👥 Total users: ${userCount}`);

    console.log("Testing delivered orders...");
    const deliveredOrders = await db.Order.count({
      where: { status: 'delivered' }
    });
    console.log(`✅ Delivered orders: ${deliveredOrders}`);

    console.log("Testing revenue calculation...");
    const totalRevenue = await db.Order.sum('total', {
      where: { status: 'delivered' }
    });
    console.log(`💰 Total revenue: ${totalRevenue || 0}`);

    console.log("Testing date filtering...");
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentOrders = await db.Order.count({
      where: {
        status: 'delivered',
        created_at: {
          [Op.gte]: thirtyDaysAgo
        }
      }
    });
    console.log(`📅 Recent delivered orders (30 days): ${recentOrders}`);

    console.log("✅ All tests passed!");
    
  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    await db.sequelize.close();
  }
}

testStatistics();
