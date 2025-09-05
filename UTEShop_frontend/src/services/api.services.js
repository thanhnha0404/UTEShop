import axios from 'axios';

const API_URL = 'http://localhost:8080/users';

export const forgotPassword = async (email) => {
  return await axios.post(`${API_URL}/forgot-password`, { email }, { withCredentials: true });
};

export const verifyForgotOtp = async (email, otp) => {
  return await axios.post(`${API_URL}/verify-forgot-otp`, { email, otp }, { withCredentials: true });
};

export const resetPassword = async (email, otp, newPassword, confirmPassword) => {
  return await axios.post(
    `${API_URL}/reset-password`, 
    { email, otp, newPassword, confirmPassword }, 
    { withCredentials: true }
  );
};