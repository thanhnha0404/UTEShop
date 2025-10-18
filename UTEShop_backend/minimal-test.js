require("dotenv").config();

async function testMinimal() {
  try {
    console.log("Testing minimal setup...");
    
    const db = require("./models");
    await db.sequelize.authenticate();
    console.log("✅ Database connected");
    
    const { Order } = db;
    const count = await Order.count();
    console.log(`📋 Orders count: ${count}`);
    
    const revenue = await Order.sum('total', {
      where: { status: 'delivered' }
    });
    console.log(`💰 Revenue: ${revenue || 0}`);
    
    console.log("✅ Minimal test passed!");
    
  } catch (error) {
    console.error("❌ Minimal test failed:", error.message);
    console.error("Stack:", error.stack);
  } finally {
    process.exit(0);
  }
}

testMinimal();
