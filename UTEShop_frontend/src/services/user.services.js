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

export const getUserProfile = async (token) => {
  const res = await axios.get(`${API_BASE_URL}/profile`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  // Backend returns data directly (not nested in { data: {...} })
  const profile = res.data;
  
  console.log('🔍 getUserProfile raw response:', profile);
  
  // Normalize field names (support both camelCase and snake_case)
  const normalized = {
    id: profile?.id,
    username: profile?.username,
    email: profile?.email,
    fullName: profile?.fullName || profile?.full_name || profile?.name,
    phone: profile?.phone || profile?.phoneNumber || profile?.phone_number,
    address: profile?.address,
    birthDate: profile?.birthDate || profile?.birth_date,
    loyaltyPoints: profile?.loyaltyPoints || profile?.loyalty_points || 0,
    role: profile?.role,
    createdAt: profile?.createdAt || profile?.created_at
  };
  
  console.log('🔍 getUserProfile normalized:', normalized);
  return normalized;
};