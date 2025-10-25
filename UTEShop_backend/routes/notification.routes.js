const express = require('express');
const router = express.Router();
const {
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
  getRecentNotifications
} = require('../controllers/notification.controller');

// Tạo thông báo mới
router.post('/', createNotification);

// Lấy danh sách thông báo của user
router.get('/:userId', getNotifications);

// Lấy số lượng thông báo chưa đọc
router.get('/:userId/unread-count', getUnreadCount);

// Lấy thông báo gần nhất (cho dropdown)
router.get('/:userId/recent', getRecentNotifications);

// Đánh dấu thông báo đã đọc
router.patch('/:id/read', markAsRead);

// Đánh dấu tất cả thông báo đã đọc
router.patch('/:userId/read-all', markAllAsRead);

// Xóa thông báo
router.delete('/:id', deleteNotification);

module.exports = router;
