import axios from 'axios';
import { getToken } from '../utils/authStorage';

const API_URL = 'http://localhost:8080/api';

// Dashboard overview statistics
export const getDashboardOverview = async (startDate, endDate) => {
  try {
    const token = getToken();
    console.log('Getting dashboard overview with token:', token ? 'Present' : 'Missing');
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const url = `${API_URL}/statistics/overview?${params}`;
    console.log('API URL:', url);
    
    const response = await axios.get(url, {
      withCredentials: true,
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Dashboard overview response:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Dashboard overview error:', error);
    return { success: false, error: error.response?.data?.message || 'Lỗi khi lấy tổng quan dashboard' };
  }
};

// Revenue statistics
export const getRevenueStatistics = async (period = 'day', startDate, endDate) => {
  try {
    const token = getToken();
    const params = new URLSearchParams();
    params.append('period', period);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await axios.get(`${API_URL}/statistics/revenue?${params}`, {
      withCredentials: true,
      headers: { Authorization: `Bearer ${token}` }
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.message || 'Lỗi khi lấy thống kê doanh thu' };
  }
};

// Completed orders
export const getCompletedOrders = async (page = 1, limit = 20, startDate, endDate) => {
  try {
    const token = getToken();
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await axios.get(`${API_URL}/statistics/orders/completed?${params}`, {
      withCredentials: true,
      headers: { Authorization: `Bearer ${token}` }
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.message || 'Lỗi khi lấy danh sách đơn hàng đã hoàn thành' };
  }
};

// Cash flow analysis
export const getCashFlowAnalysis = async (startDate, endDate) => {
  try {
    const token = getToken();
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await axios.get(`${API_URL}/statistics/cashflow?${params}`, {
      withCredentials: true,
      headers: { Authorization: `Bearer ${token}` }
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.message || 'Lỗi khi phân tích dòng tiền' };
  }
};

// New customers count
export const getNewCustomersCount = async (period = 'month', startDate, endDate) => {
  try {
    const token = getToken();
    const params = new URLSearchParams();
    params.append('period', period);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await axios.get(`${API_URL}/statistics/customers/new?${params}`, {
      withCredentials: true,
      headers: { Authorization: `Bearer ${token}` }
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.message || 'Lỗi khi lấy số lượng khách hàng mới' };
  }
};

// Top selling products
export const getTopSellingProducts = async (startDate, endDate, limit = 10) => {
  try {
    const token = getToken();
    const params = new URLSearchParams();
    params.append('limit', limit);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await axios.get(`${API_URL}/statistics/products/top-selling?${params}`, {
      withCredentials: true,
      headers: { Authorization: `Bearer ${token}` }
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.message || 'Lỗi khi lấy sản phẩm bán chạy' };
  }
};

// All orders for status chart
export const getAllOrdersForStatus = async (startDate, endDate) => {
  try {
    const token = getToken();
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await axios.get(`${API_URL}/statistics/orders/all?${params}`, {
      withCredentials: true,
      headers: { Authorization: `Bearer ${token}` }
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.message || 'Lỗi khi lấy danh sách đơn hàng' };
  }
};
