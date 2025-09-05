import axios from "axios";

const API_BASE_URL = "http://localhost:8080/users";

export const registerRequestOtp = async (payload) => {
  return axios.post(`${API_BASE_URL}/register`, payload, { withCredentials: true });
};

export const registerConfirm = async (payload) => {
  return axios.post(`${API_BASE_URL}/verify-otp`, payload, { withCredentials: true });
};
