const db = require("./models");

async function testOrder() {
  try {
    console.log("🔍 Kiểm tra đơn hàng trong database...");
    
    // Lấy tất cả đơn hàng
    const orders = await db.Order.findAll({
      include: [
        {
          model: db.OrderItem,
          as: "orderItems",
          include: [
            {
              model: db.Drink,
              as: "drink",
              attributes: ["id", "name", "image_url"]
            }
          ]
        }
      ],
      order: [["created_at", "DESC"]]
    });
    
    console.log(`📦 Tìm thấy ${orders.length} đơn hàng:`);
    
    orders.forEach((order, index) => {
      console.log(`\n--- Đơn hàng ${index + 1} ---`);
      console.log(`ID: ${order.id}`);
      console.log(`Mã đơn: ${order.order_number}`);
      console.log(`User ID: ${order.user_id}`);
      console.log(`Trạng thái: ${order.status}`);
      console.log(`Tổng tiền: ${order.total}`);
      console.log(`Ngày tạo: ${order.created_at}`);
      console.log(`Số sản phẩm: ${order.orderItems?.length || 0}`);
      
      if (order.orderItems && order.orderItems.length > 0) {
        console.log("Sản phẩm:");
        order.orderItems.forEach(item => {
          console.log(`  - ${item.drink?.name || 'N/A'} (SL: ${item.quantity})`);
        });
      }
    });
    
    // Kiểm tra user có đơn hàng không
    const users = await db.User.findAll({
      include: [
        {
          model: db.Order,
          as: "orders"
        }
      ]
    });
    
    console.log(`\n👥 Có ${users.length} user trong hệ thống:`);
    users.forEach(user => {
      console.log(`- User ${user.id} (${user.username}): ${user.orders?.length || 0} đơn hàng`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Lỗi:", error);
    process.exit(1);
  }
}

testOrder();
