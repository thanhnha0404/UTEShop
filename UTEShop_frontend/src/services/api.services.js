import axios from 'axios';
import { getToken } from '../utils/authStorage';

const API_URL = 'http://localhost:8080/api';

// Auth APIs
export const forgotPassword = async (email) => {
  return await axios.post(`${API_URL}/users/forgot-password`, { email }, { withCredentials: true });
};

export const verifyForgotOtp = async (email, otp) => {
  return await axios.post(`${API_URL}/users/verify-forgot-otp`, { email, otp }, { withCredentials: true });
};

export const resetPassword = async (email, otp, newPassword, confirmPassword) => {
  return await axios.post(
    `${API_URL}/users/reset-password`, 
    { email, otp, newPassword, confirmPassword }, 
    { withCredentials: true }
  );
};

// Loyalty Points APIs
export const getUserLoyaltyPoints = async () => {
  try {
    const token = getToken();
    const response = await axios.get(`${API_URL}/loyalty/points`, { 
      withCredentials: true,
      headers: { Authorization: `Bearer ${token}` }
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.message || 'Lỗi khi lấy thông tin xu' };
  }
};

export const getLoyaltyHistory = async (page = 1, limit = 20) => {
  try {
    const token = getToken();
    const response = await axios.get(`${API_URL}/loyalty/history?page=${page}&limit=${limit}`, { 
      withCredentials: true,
      headers: { Authorization: `Bearer ${token}` }
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.message || 'Lỗi khi lấy lịch sử xu' };
  }
};

export const calculateLoyaltyUsage = async (orderTotal) => {
  try {
    const token = getToken();
    const response = await axios.post(`${API_URL}/loyalty/calculate`, { orderTotal }, { 
      withCredentials: true,
      headers: { Authorization: `Bearer ${token}` }
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.message || 'Lỗi khi tính toán xu' };
  }
};

// Review APIs
export const createReview = async (drinkId, rating, comment, orderId) => {
  try {
    const token = getToken();
    const response = await axios.post(`${API_URL}/reviews`, { drinkId, rating, comment, orderId }, { 
      withCredentials: true,
      headers: { Authorization: `Bearer ${token}` }
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.message || 'Lỗi khi tạo đánh giá' };
  }
};

export const updateReview = async (reviewId, rating, comment) => {
  try {
    const token = getToken();
    const response = await axios.put(`${API_URL}/reviews/${reviewId}`, { rating, comment }, { 
      withCredentials: true,
      headers: { Authorization: `Bearer ${token}` }
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.message || 'Lỗi khi cập nhật đánh giá' };
  }
};

export const deleteReview = async (reviewId) => {
  try {
    const token = getToken();
    const response = await axios.delete(`${API_URL}/reviews/${reviewId}`, { 
      withCredentials: true,
      headers: { Authorization: `Bearer ${token}` }
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.message || 'Lỗi khi xóa đánh giá' };
  }
};

export const getProductReviews = async (drinkId, page = 1, limit = 10, rating = 'all') => {
  try {
    const token = getToken();
    const response = await axios.get(`${API_URL}/reviews/product/${drinkId}?page=${page}&limit=${limit}&rating=${rating}`, { 
      withCredentials: true,
      headers: { Authorization: `Bearer ${token}` }
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.message || 'Lỗi khi lấy đánh giá sản phẩm' };
  }
};

export const getUserReviews = async (page = 1, limit = 10) => {
  try {
    const token = getToken();
    const response = await axios.get(`${API_URL}/reviews/user?page=${page}&limit=${limit}`, { 
      withCredentials: true,
      headers: { Authorization: `Bearer ${token}` }
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.message || 'Lỗi khi lấy đánh giá của user' };
  }
};