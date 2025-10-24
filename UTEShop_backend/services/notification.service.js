const db = require('../models');
const emailService = require('./email.service');

class NotificationService {
  // Tạo thông báo và gửi real-time + email
  async createNotification(userId, type, title, message, sendEmail = true) {
    try {
      // Tạo thông báo trong DB
      const notification = await db.Notification.create({
        user_id: userId,
        type,
        title,
        message,
        status: 'unread'
      });

      // Lấy thông tin user để gửi email
      const user = await db.User.findByPk(userId);
      
      // Gửi email nếu được yêu cầu và có email
      if (sendEmail && user && user.email) {
        await emailService.sendNotificationEmail(user.email, {
          title,
          message
        });
      }

      // Trả về thông báo với thông tin user
      const notificationWithUser = await db.Notification.findByPk(notification.id, {
        include: [{
          model: db.User,
          as: 'user',
          attributes: ['id', 'username', 'email']
        }]
      });

      return {
        success: true,
        notification: notificationWithUser
      };
    } catch (error) {
      console.error('Error creating notification:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Tạo thông báo đơn hàng mới
  async createOrderNotification(userId, orderData) {
    const title = 'Đơn hàng mới';
    const message = `Đơn hàng "${orderData.order_number}" đã được tạo thành công với tổng giá trị ${Number(orderData.total_amount).toLocaleString('vi-VN')} VNĐ.`;
    
    return await this.createNotification(userId, 'order', title, message);
  }

  // Tạo thông báo xác nhận đơn hàng
  async createOrderConfirmationNotification(userId, orderData) {
    const title = 'Đơn hàng đã được xác nhận';
    const message = `Đơn hàng "${orderData.order_number}" của bạn đã được xác nhận và đang được chuẩn bị.`;
    
    return await this.createNotification(userId, 'order', title, message);
  }

  // Tạo thông báo đánh giá mới
  async createReviewNotification(userId, reviewData) {
    const title = 'Có đánh giá mới';
    const message = `Sản phẩm "${reviewData.drink_name}" đã nhận được đánh giá mới.`;
    
    return await this.createNotification(userId, 'review', title, message);
  }

  // Tạo thông báo hệ thống
  async createSystemNotification(userId, title, message) {
    return await this.createNotification(userId, 'system', title, message, false);
  }

  // Tạo thông báo voucher mới
  async createVoucherNotification(userId, voucherData) {
    const title = 'Bạn đã nhận được voucher!';
    const message = `Chúc mừng! Bạn đã nhận được voucher giảm giá ${Number(voucherData.discount_value).toLocaleString('vi-VN')} VNĐ cho đơn hàng tối thiểu ${Number(voucherData.min_order_total).toLocaleString('vi-VN')} VNĐ. Mã voucher: ${voucherData.code}`;
    
    return await this.createNotification(userId, 'voucher', title, message, false); // Không gửi email ở đây
  }

  // Tạo thông báo điểm thưởng
  async createLoyaltyNotification(userId, pointsData) {
    const title = 'Bạn đã nhận được điểm thưởng!';
    const message = `Chúc mừng! Bạn đã nhận được ${pointsData.amount} điểm thưởng cho việc đánh giá sản phẩm. Tổng điểm hiện tại: ${pointsData.totalPoints}`;
    
    return await this.createNotification(userId, 'loyalty', title, message, false); // Không gửi email ở đây
  }

  // Tạo và gửi thông báo voucher hoàn chỉnh
  async createAndSendVoucherNotification(io, userId, voucherData) {
    try {
      // Tạo thông báo
      const result = await this.createVoucherNotification(userId, voucherData);
      
      if (result.success) {
        // Gửi email riêng cho voucher
        const user = await db.User.findByPk(userId);
        if (user && user.email) {
          await emailService.sendVoucherNotificationEmail(user.email, voucherData);
        }
        
        // Gửi real-time notification
        if (io) {
          await this.sendRealTimeNotification(io, userId, result.notification);
        }
        
        return {
          success: true,
          notification: result.notification
        };
      } else {
        return result;
      }
    } catch (error) {
      console.error('Error creating and sending voucher notification:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Tạo và gửi thông báo loyalty hoàn chỉnh
  async createAndSendLoyaltyNotification(io, userId, pointsData) {
    try {
      // Tạo thông báo
      const result = await this.createLoyaltyNotification(userId, pointsData);
      
      if (result.success) {
        // Gửi email riêng cho loyalty
        const user = await db.User.findByPk(userId);
        if (user && user.email) {
          await emailService.sendLoyaltyNotificationEmail(user.email, pointsData);
        }
        
        // Gửi real-time notification
        if (io) {
          await this.sendRealTimeNotification(io, userId, result.notification);
        }
        
        return {
          success: true,
          notification: result.notification
        };
      } else {
        return result;
      }
    } catch (error) {
      console.error('Error creating and sending loyalty notification:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Gửi thông báo real-time qua Socket.IO
  async sendRealTimeNotification(io, userId, notification) {
    try {
      io.to(`user_${userId}`).emit('notification:new', notification);
      console.log(`✅ Real-time notification sent to user ${userId}`);
    } catch (error) {
      console.error('Error sending real-time notification:', error);
    }
  }

  // Tạo và gửi thông báo hoàn chỉnh (DB + Real-time + Email)
  async createAndSendNotification(io, userId, type, title, message, sendEmail = true) {
    try {
      // Tạo thông báo
      const result = await this.createNotification(userId, type, title, message, sendEmail);
      
      if (result.success) {
        // Gửi real-time notification
        await this.sendRealTimeNotification(io, userId, result.notification);
        
        return {
          success: true,
          notification: result.notification
        };
      } else {
        return result;
      }
    } catch (error) {
      console.error('Error creating and sending notification:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new NotificationService();
