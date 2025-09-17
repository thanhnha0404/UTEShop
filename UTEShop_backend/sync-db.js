const db = require("./models");

async function syncDatabase() {
  try {
    console.log("🔄 Đang sync database...");
    
    // Sync tất cả models
    await db.sequelize.sync({ force: false });
    
    console.log("✅ Sync database thành công!");
    console.log("📋 Các bảng đã được tạo:");
    
    // Kiểm tra các bảng
    const tables = await db.sequelize.query('SHOW TABLES');
    console.log(tables[0].map(t => Object.values(t)[0]));
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Lỗi sync database:", error);
    process.exit(1);
  }
}

syncDatabase();
