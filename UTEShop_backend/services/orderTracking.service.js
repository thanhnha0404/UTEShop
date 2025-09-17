const db = require("../models");
const { Op } = require("sequelize");

class OrderTrackingService {
  constructor() {
    this.isRunning = false;
  }

  // Khởi động service theo dõi đơn hàng
  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log("🚀 Order Tracking Service started");
    
    // Chạy ngay lập tức
    this.processOrders();
    
    // Chạy mỗi 1 phút
    this.interval = setInterval(() => {
      this.processOrders();
    }, 60000); // 60 giây
  }

  // Dừng service
  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.isRunning = false;
    console.log("⏹️ Order Tracking Service stopped");
  }

  // Xử lý cập nhật trạng thái đơn hàng
  async processOrders() {
    try {
      await this.autoConfirmOrders();
      await this.autoUpdateOrderStatus();
    } catch (error) {
      console.error("❌ Lỗi trong Order Tracking Service:", error);
    }
  }

  // Tự động xác nhận đơn hàng sau 5 phút
  async autoConfirmOrders() {
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      
      const orders = await db.Order.findAll({
        where: {
          status: "pending",
          created_at: {
            [Op.lte]: fiveMinutesAgo
          }
        }
      });

      for (const order of orders) {
        await order.update({
          status: "confirmed",
          confirmed_at: new Date()
        });
        
        console.log(`✅ Tự động xác nhận đơn hàng #${order.order_number}`);
      }

      if (orders.length > 0) {
        console.log(`✅ Tự động xác nhận ${orders.length} đơn hàng`);
      }
    } catch (error) {
      console.error("❌ Lỗi tự động xác nhận đơn hàng:", error);
    }
  }

  // Tự động cập nhật trạng thái đơn hàng theo thời gian
  async autoUpdateOrderStatus() {
    try {
      const now = new Date();
      
      // Đơn hàng đã xác nhận 30 phút -> chuyển sang chuẩn bị
      const thirtyMinutesAgo = new Date(now - 30 * 60 * 1000);
      const confirmedOrders = await db.Order.findAll({
        where: {
          status: "confirmed",
          confirmed_at: {
            [Op.lte]: thirtyMinutesAgo
          }
        }
      });

      for (const order of confirmedOrders) {
        await order.update({
          status: "preparing",
          preparing_at: new Date()
        });
        
        console.log(`👨‍🍳 Đơn hàng #${order.order_number} chuyển sang trạng thái chuẩn bị`);
      }

      // Đơn hàng đang chuẩn bị 60 phút -> chuyển sang giao hàng
      const ninetyMinutesAgo = new Date(now - 90 * 60 * 1000);
      const preparingOrders = await db.Order.findAll({
        where: {
          status: "preparing",
          preparing_at: {
            [Op.lte]: ninetyMinutesAgo
          }
        }
      });

      for (const order of preparingOrders) {
        await order.update({
          status: "shipping",
          shipping_at: new Date()
        });
        
        console.log(`🚚 Đơn hàng #${order.order_number} chuyển sang trạng thái giao hàng`);
      }

      // Đơn hàng đang giao 120 phút -> chuyển sang đã giao
      const twoHoursAgo = new Date(now - 120 * 60 * 1000);
      const shippingOrders = await db.Order.findAll({
        where: {
          status: "shipping",
          shipping_at: {
            [Op.lte]: twoHoursAgo
          }
        }
      });

      for (const order of shippingOrders) {
        await order.update({
          status: "delivered",
          delivered_at: new Date()
        });
        
        console.log(`🎉 Đơn hàng #${order.order_number} chuyển sang trạng thái đã giao`);
      }

    } catch (error) {
      console.error("❌ Lỗi tự động cập nhật trạng thái đơn hàng:", error);
    }
  }

  // Cập nhật trạng thái đơn hàng thủ công (cho admin)
  async updateOrderStatus(orderId, status, adminId = null) {
    try {
      const order = await db.Order.findByPk(orderId);
      if (!order) {
        throw new Error("Không tìm thấy đơn hàng");
      }

      const validStatuses = ["pending", "confirmed", "preparing", "shipping", "delivered", "cancelled"];
      if (!validStatuses.includes(status)) {
        throw new Error("Trạng thái không hợp lệ");
      }

      const updateData = { status };
      const now = new Date();

      // Cập nhật thời gian tương ứng với trạng thái
      switch (status) {
        case "confirmed":
          updateData.confirmed_at = now;
          break;
        case "preparing":
          updateData.preparing_at = now;
          break;
        case "shipping":
          updateData.shipping_at = now;
          break;
        case "delivered":
          updateData.delivered_at = now;
          break;
        case "cancelled":
          updateData.cancelled_at = now;
          break;
      }

      await order.update(updateData);
      
      console.log(`📝 Admin ${adminId || 'system'} cập nhật đơn hàng #${order.order_number} sang trạng thái ${status}`);
      
      return order;
    } catch (error) {
      console.error("❌ Lỗi cập nhật trạng thái đơn hàng:", error);
      throw error;
    }
  }

  // Lấy thống kê đơn hàng
  async getOrderStats() {
    try {
      const stats = await db.Order.findAll({
        attributes: [
          'status',
          [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
        ],
        group: ['status'],
        raw: true
      });

      const totalOrders = await db.Order.count();
      const todayOrders = await db.Order.count({
        where: {
          created_at: {
            [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      });

      return {
        totalOrders,
        todayOrders,
        statusBreakdown: stats.reduce((acc, stat) => {
          acc[stat.status] = parseInt(stat.count);
          return acc;
        }, {})
      };
    } catch (error) {
      console.error("❌ Lỗi lấy thống kê đơn hàng:", error);
      throw error;
    }
  }
}

// Tạo singleton instance
const orderTrackingService = new OrderTrackingService();

module.exports = orderTrackingService;
