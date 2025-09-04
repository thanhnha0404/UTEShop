import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080/api";

export const getLatestProducts = (limit = 8) =>
  axios.get(`${API_BASE_URL}/products/latest`, { params: { limit } }).then(r => r.data);

export const getBestSellers = (limit = 6) =>
  axios.get(`${API_BASE_URL}/products/best-sellers`, { params: { limit } }).then(r => r.data);

export const getMostViewed = (limit = 8) =>
  axios.get(`${API_BASE_URL}/products/most-viewed`, { params: { limit } }).then(r => r.data);

export const getTopDiscount = (limit = 4) =>
  axios.get(`${API_BASE_URL}/products/top-discount`, { params: { limit } }).then(r => r.data);

export const getProductDetail = (id) =>
  axios.get(`${API_BASE_URL}/products/${id}`).then(r => r.data);


