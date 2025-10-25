import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// Tạo axios instance với config mặc định
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để thêm token vào header
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Notification API functions
export const notificationApi = {
  // Tạo thông báo mới
  createNotification: async (notificationData) => {
    try {
      const response = await apiClient.post('/notifications', notificationData);
      return response.data;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  },

  // Lấy danh sách thông báo của user
  getNotifications: async (userId, params = {}) => {
    try {
      const response = await apiClient.get(`/notifications/${userId}`, { params });
      return response.data;
    } catch (error) {
      console.error('Error getting notifications:', error);
      throw error;
    }
  },

  // Lấy số lượng thông báo chưa đọc
  getUnreadCount: async (userId) => {
    try {
      const response = await apiClient.get(`/notifications/${userId}/unread-count`);
      return response.data;
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  },

  // Lấy thông báo gần nhất (cho dropdown)
  getRecentNotifications: async (userId, limit = 5) => {
    try {
      const response = await apiClient.get(`/notifications/${userId}/recent`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting recent notifications:', error);
      throw error;
    }
  },

  // Đánh dấu thông báo đã đọc
  markAsRead: async (notificationId) => {
    try {
      const response = await apiClient.patch(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  // Đánh dấu tất cả thông báo đã đọc
  markAllAsRead: async (userId) => {
    try {
      const response = await apiClient.patch(`/notifications/${userId}/read-all`);
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },

  // Xóa thông báo
  deleteNotification: async (notificationId) => {
    try {
      const response = await apiClient.delete(`/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }
};

export default notificationApi;
