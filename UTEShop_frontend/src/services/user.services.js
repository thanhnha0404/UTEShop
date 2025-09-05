import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/users";

export const registerRequestOtp = async (payload) => {
  return axios.post(`${API_BASE_URL}/register`, payload, { withCredentials: true });
};

export const registerConfirm = async (payload) => {
  return axios.post(`${API_BASE_URL}/verify-otp`, payload, { withCredentials: true });
};

export const checkUsernameAvailable = async (username) => {
  const res = await axios.get(`${API_BASE_URL}/check-username`, { params: { username } });
  return res.data;
};

export const checkEmailAvailable = async (email) => {
  const res = await axios.get(`${API_BASE_URL}/check-email`, { params: { email } });
  return res.data;
};