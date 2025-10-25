import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080/api";

export const getLatestProducts = (limit = 8) =>
  axios.get(`${API_BASE_URL}/drinks/latest`, { params: { limit } }).then(r => r.data);

export const getBestSellers = (limit = 6) =>
  axios.get(`${API_BASE_URL}/drinks/best-sellers`, { params: { limit } }).then(r => r.data);

export const getMostViewed = (limit = 8) =>
  axios.get(`${API_BASE_URL}/drinks/most-viewed`, { params: { limit } }).then(r => r.data);

export const getTopDiscount = (limit = 4) =>
  axios.get(`${API_BASE_URL}/drinks/top-discount`, { params: { limit } }).then(r => r.data);

export const getProductDetail = (id) =>
  axios.get(`${API_BASE_URL}/drinks/${id}`).then(r => r.data);

export const getAllDrinks = (page = 1, limit = 8, categoryId = null) =>
  axios.get(`${API_BASE_URL}/drinks`, { 
    params: { page, limit, categoryId } 
  }).then(r => r.data);

export const getCategories = () =>
  axios.get(`${API_BASE_URL}/categories`).then(r => r.data);

// ✅ SỬA HÀM NÀY - Đổi size thành isUpsized
export const addToCart = ({ drinkId, quantity, isUpsized, ice_level, sugar_level, notes, token }) =>
  axios.post(
    `${API_BASE_URL}/cart/add`,
    { drinkId, quantity, isUpsized, ice_level, sugar_level, notes },
    { headers: token ? { Authorization: `Bearer ${token}` } : undefined }
  ).then(r => r.data);

export const getMyCart = ({ token }) =>
  axios.get(`${API_BASE_URL}/cart/all`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  }).then(r => r.data);

export const updateCartItem = ({ drinkId, quantity, token }) =>
  axios.put(`${API_BASE_URL}/cart/update`, { drinkId, quantity }, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  }).then(r => r.data);

export const removeFromCart = ({ drinkId, token }) =>
  axios.post(`${API_BASE_URL}/cart/remove`, { drinkId }, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  }).then(r => r.data);

export const getMyVouchers = ({ token }) =>
  axios.get(`${API_BASE_URL}/vouchers/my`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  }).then(r => r.data);

export const checkoutCOD = ({ token }) =>
  axios.post(`${API_BASE_URL}/checkout/cod`, {}, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  }).then(r => r.data);