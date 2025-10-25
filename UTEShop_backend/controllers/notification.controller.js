const db = require('../models');
const { Op } = require('sequelize');

// Tạo thông báo mới
const createNotification = async (req, res) => {
  try {
    const { user_id, type, title, message } = req.body;

    // Validate input
    if (!user_id || !type || !title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc'
      });
    }

    // Kiểm tra user có tồn tại không
    const user = await db.User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Người dùng không tồn tại'
      });
    }

    // Tạo thông báo
    const notification = await db.Notification.create({
      user_id,
      type,
      title,
      message,
      status: 'unread'
    });

    res.status(201).json({
      success: true,
      message: 'Tạo thông báo thành công',
      data: notification
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi tạo thông báo'
    });
  }
};

// Lấy danh sách thông báo của user
const getNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = { user_id: userId };

    // Filter theo status nếu có
    if (status && ['read', 'unread'].includes(status)) {
      whereClause.status = status;
    }

    const notifications = await db.Notification.findAndCountAll({
      where: whereClause,
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [{
        model: db.User,
        as: 'user',
        attributes: ['id', 'username', 'email']
      }]
    });

    res.json({
      success: true,
      data: {
        notifications: notifications.rows,
        total: notifications.count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(notifications.count / limit)
      }
    });
  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách thông báo'
    });
  }
};

// Đánh dấu thông báo đã đọc
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await db.Notification.findByPk(id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Thông báo không tồn tại'
      });
    }

    await notification.update({ status: 'read' });

    res.json({
      success: true,
      message: 'Đánh dấu đã đọc thành công',
      data: notification
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi đánh dấu đã đọc'
    });
  }
};

// Đánh dấu tất cả thông báo đã đọc
const markAllAsRead = async (req, res) => {
  try {
    const { userId } = req.params;

    await db.Notification.update(
      { status: 'read' },
      { where: { user_id: userId, status: 'unread' } }
    );

    res.json({
      success: true,
      message: 'Đánh dấu tất cả đã đọc thành công'
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi đánh dấu tất cả đã đọc'
    });
  }
};

// Xóa thông báo
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await db.Notification.findByPk(id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Thông báo không tồn tại'
      });
    }

    await notification.destroy();

    res.json({
      success: true,
      message: 'Xóa thông báo thành công'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xóa thông báo'
    });
  }
};

// Lấy số lượng thông báo chưa đọc
const getUnreadCount = async (req, res) => {
  try {
    const { userId } = req.params;

    const count = await db.Notification.count({
      where: { user_id: userId, status: 'unread' }
    });

    res.json({
      success: true,
      data: { unreadCount: count }
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy số lượng thông báo chưa đọc'
    });
  }
};

// Lấy thông báo gần nhất (cho dropdown)
const getRecentNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 5 } = req.query;

    const notifications = await db.Notification.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      include: [{
        model: db.User,
        as: 'user',
        attributes: ['id', 'username', 'email']
      }]
    });

    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error('Error getting recent notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thông báo gần nhất'
    });
  }
};

module.exports = {
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
  getRecentNotifications
};
