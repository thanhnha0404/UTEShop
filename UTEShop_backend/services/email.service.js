const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
    });
  }

  // Gửi email thông báo
  async sendNotificationEmail(userEmail, notification) {
    try {
      const mailOptions = {
        from: process.env.GMAIL_USER,
        to: userEmail,
        subject: `UTEShop - ${notification.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">UTEShop</h1>
            </div>
            <div style="padding: 30px; background: #f8f9fa;">
              <h2 style="color: #333; margin-bottom: 20px;">${notification.title}</h2>
              <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <p style="color: #666; line-height: 1.6; margin: 0;">${notification.message}</p>
              </div>
              <div style="margin-top: 30px; text-align: center;">
                <a href="${process.env.FRONTEND_ORIGIN || 'http://localhost:3000'}/notifications" 
                   style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Xem chi tiết
                </a>
              </div>
            </div>
            <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 14px;">
              <p style="margin: 0;">© 2024 UTEShop. Tất cả quyền được bảo lưu.</p>
            </div>
          </div>
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('❌ Error sending email:', error);
      return { success: false, error: error.message };
    }
  }

  // Gửi email đơn hàng mới
  async sendOrderNotificationEmail(userEmail, orderData) {
    const notification = {
      title: 'Đơn hàng mới của bạn',
      message: `Đơn hàng "${orderData.order_number}" đã được tạo thành công với tổng giá trị ${Number(orderData.total_amount).toLocaleString('vi-VN')} VNĐ. Chúng tôi sẽ xử lý đơn hàng của bạn trong thời gian sớm nhất.`
    };
    return await this.sendNotificationEmail(userEmail, notification);
  }

  // Gửi email xác nhận đơn hàng
  async sendOrderConfirmationEmail(userEmail, orderData) {
    const notification = {
      title: 'Đơn hàng đã được xác nhận',
      message: `Đơn hàng "${orderData.order_number}" của bạn đã được xác nhận và đang được chuẩn bị. Dự kiến giao hàng trong 1-2 ngày làm việc.`
    };
    return await this.sendNotificationEmail(userEmail, notification);
  }

  // Gửi email đánh giá mới
  async sendReviewNotificationEmail(userEmail, reviewData) {
    const notification = {
      title: 'Có đánh giá mới cho sản phẩm',
      message: `Sản phẩm "${reviewData.drink_name}" đã nhận được đánh giá mới từ khách hàng. Hãy xem chi tiết để cải thiện dịch vụ.`
    };
    return await this.sendNotificationEmail(userEmail, notification);
  }

  // Gửi email thông báo voucher
  async sendVoucherNotificationEmail(userEmail, voucherData) {
    const notification = {
      title: 'Bạn đã nhận được voucher!',
      message: `Chúc mừng! Bạn đã nhận được voucher giảm giá ${Number(voucherData.discount_value).toLocaleString('vi-VN')} VNĐ cho đơn hàng tối thiểu ${Number(voucherData.min_order_total).toLocaleString('vi-VN')} VNĐ. Mã voucher: ${voucherData.code}. Voucher có hiệu lực đến ${new Date(voucherData.expires_at).toLocaleDateString('vi-VN')}.`
    };
    return await this.sendNotificationEmail(userEmail, notification);
  }

  // Gửi email thông báo điểm thưởng
  async sendLoyaltyNotificationEmail(userEmail, pointsData) {
    const notification = {
      title: 'Bạn đã nhận được điểm thưởng!',
      message: `Chúc mừng! Bạn đã nhận được ${pointsData.amount} điểm thưởng cho việc đánh giá sản phẩm. Tổng điểm hiện tại: ${pointsData.totalPoints}. Điểm thưởng có thể được sử dụng để giảm giá đơn hàng.`
    };
    return await this.sendNotificationEmail(userEmail, notification);
  }
}

module.exports = new EmailService();
