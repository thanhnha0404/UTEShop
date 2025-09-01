import React, { useEffect, useState } from "react";
import axios from "axios";

function formatDateToDDMMYYYY(isoDate) {
  if (!isoDate) return "";
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function UserProfile() {
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [user, setUser] = useState({
    fullName: "",
    address: "",
    birthDate: "",
    phoneNumber: "",
    username: "",
    email: "",
  });

  useEffect(() => {
    let isMounted = true;
    const fetchUser = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/users/1");
        if (!isMounted) return;

        const data = response?.data || {};
        setUser({
          fullName: data.fullName || data.name || "",
          address: data.address || "",
          birthDate: formatDateToDDMMYYYY(data.birthDate || data.dob || ""),
          phoneNumber: data.phoneNumber || data.phone || "",
          username: data.username || "",
          email: data.email || "",
        });
        setIsLoading(false);
      } catch (error) {
        if (!isMounted) return;
        setErrorMessage(error?.response?.data?.message || error?.message || "Failed to load user");
        setIsLoading(false);
      }
    };

    fetchUser();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-4xl bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 p-8 md:p-10">
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-white/30 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="absolute -bottom-1 -right-1 bg-green-500 text-white text-xs font-bold rounded-full px-2 py-0.5">✔</span>
          </div>
          <h2 className="mt-4 text-2xl md:text-3xl font-bold text-white">Hồ sơ cá nhân</h2>
          <p className="text-white/80 mt-1">Quản lý thông tin tài khoản của bạn</p>
        </div>

        {isLoading ? (
          <div className="text-center text-white">Đang tải...</div>
        ) : errorMessage ? (
          <div className="text-center text-red-200">{errorMessage}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/** Helper for empty values */}
            {/** We keep simple inline mapping for readability */}
            <div>
              <label className="block text-white/90 mb-2">Họ và tên</label>
              <input
                type="text"
                className="w-full p-3 rounded-lg bg-white/90 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={user.fullName || "Chưa cập nhật"}
                readOnly
              />
            </div>

            <div>
              <label className="block text-white/90 mb-2">Địa chỉ</label>
              <input
                type="text"
                className="w-full p-3 rounded-lg bg-white/90 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={user.address || "Chưa cập nhật"}
                readOnly
              />
            </div>

            <div>
              <label className="block text-white/90 mb-2">Ngày sinh</label>
              <input
                type="text"
                className="w-full p-3 rounded-lg bg-white/90 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={user.birthDate || "Chưa cập nhật"}
                readOnly
              />
            </div>

            <div>
              <label className="block text-white/90 mb-2">Username</label>
              <input
                type="text"
                className="w-full p-3 rounded-lg bg-white/90 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={user.username || "Chưa cập nhật"}
                readOnly
              />
            </div>

            <div>
              <label className="block text-white/90 mb-2">Số điện thoại</label>
              <input
                type="text"
                className="w-full p-3 rounded-lg bg-white/90 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={user.phoneNumber || "Chưa cập nhật"}
                readOnly
              />
            </div>

            <div>
              <label className="block text-white/90 mb-2">Email</label>
              <input
                type="email"
                className="w-full p-3 rounded-lg bg-white/90 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={user.email || "Chưa cập nhật"}
                readOnly
              />
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <button
            type="button"
            className="px-6 py-3 rounded-lg bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-semibold shadow-md"
          >
            Cập nhật thông tin
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;