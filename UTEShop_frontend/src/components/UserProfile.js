import React, { useEffect, useState } from "react";
import axios from "axios";
import { getUser } from "../utils/authStorage";
import Modal from "./Modal";
import { getUserVouchers, getFavorites } from "../services/api.services";

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
  const [showSuccess, setShowSuccess] = useState(false);
  const [vouchers, setVouchers] = useState([]);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const load = async () => {
      const stored = getUser();
      if (!stored) {
        setErrorMessage("Bạn chưa đăng nhập");
        setIsLoading(false);
        return;
      }

      const baseState = {
        fullName: stored.fullName || stored.name || "",
        address: stored.address || "",
        birthDate: formatDateToDDMMYYYY(stored.birthDate || stored.dob || ""),
        phoneNumber: stored.phoneNumber || stored.phone || "",
        username: stored.username || "",
        email: stored.email || "",
      };

      const needsMore = !baseState.address || !baseState.birthDate || !baseState.phoneNumber;
      if (!needsMore || !stored.id) {
        setUser(baseState);
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get(`http://localhost:8080/api/users/${stored.id}`);
        const data = response?.data || {};
        setUser({
          fullName: baseState.fullName,
          address: data.address || baseState.address,
          birthDate: formatDateToDDMMYYYY(data.birthDate || data.dob || baseState.birthDate),
          phoneNumber: data.phoneNumber || data.phone || baseState.phoneNumber,
          username: baseState.username || data.username || "",
          email: baseState.email || data.email || "",
        });
        setIsLoading(false);
      } catch (error) {
        setUser(baseState);
        setErrorMessage("");
        setIsLoading(false);
      }

      try {
        console.log('🔄 Fetching user vouchers...');
        const res = await getUserVouchers();
        console.log('🎫 Vouchers response:', res);
        if (res.success) {
          console.log('✅ Vouchers loaded:', res.data.vouchers?.length || 0);
          setVouchers(res.data.vouchers || []);
        } else {
          console.error('❌ Error loading vouchers:', res.error);
        }
      } catch (error) {
        console.error('❌ Error fetching vouchers:', error);
      }

      try {
        const favRes = await getFavorites();
        if (favRes.success) setFavorites(favRes.data.favorites || []);
      } catch (_) {}

      const refreshFavs = async () => {
        try {
          const favRes = await getFavorites();
          if (favRes.success) setFavorites(favRes.data.favorites || []);
        } catch (_) {}
      };
      window.addEventListener('favorites:updated', refreshFavs);
      return () => window.removeEventListener('favorites:updated', refreshFavs);
    };

    load();
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
          <form
            id="profile-form"
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                const stored = getUser();
                if (!stored?.id) {
                  setErrorMessage("Không xác định được tài khoản");
                  return;
                }
                const payload = {
                  fullName: user.fullName || "",
                  address: user.address || "",
                  dob: user.birthDate ? new Date(user.birthDate.split('/').reverse().join('-')) : null,
                  phone: user.phoneNumber || "",
                  email: user.email || "",
                };
                // Convert date to yyyy-mm-dd if valid
                if (payload.dob instanceof Date && !Number.isNaN(payload.dob.getTime())) {
                  const y = payload.dob.getFullYear();
                  const m = String(payload.dob.getMonth() + 1).padStart(2, '0');
                  const d = String(payload.dob.getDate()).padStart(2, '0');
                  payload.dob = `${y}-${m}-${d}`;
                } else {
                  delete payload.dob;
                }

                const res = await axios.put(`http://localhost:8080/api/users/${stored.id}`, payload);
                const updated = res?.data || {};
                setUser({
                  fullName: updated.fullName || user.fullName,
                  address: updated.address || user.address,
                  birthDate: formatDateToDDMMYYYY(updated.dob || user.birthDate),
                  phoneNumber: updated.phone || user.phoneNumber,
                  username: updated.username || user.username,
                  email: updated.email || user.email,
                });
                try {
                  const merged = { ...(stored || {}), ...updated };
                  localStorage.setItem('auth_user', JSON.stringify(merged));
                } catch (_) {}
                setShowSuccess(true);
              } catch (err) {
                setErrorMessage(err?.response?.data?.message || err?.message || 'Cập nhật thất bại');
              }
            }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/** Helper for empty values */}
            {/** We keep simple inline mapping for readability */}
            <div>
              <label className="block text-white/90 mb-2">Họ và tên</label>
              <input
                type="text"
                className="w-full p-3 rounded-lg bg-white/90 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={user.fullName || ""}
                onChange={(e) => setUser((u) => ({ ...u, fullName: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-white/90 mb-2">Địa chỉ</label>
              <input
                type="text"
                className="w-full p-3 rounded-lg bg-white/90 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={user.address || ""}
                onChange={(e) => setUser((u) => ({ ...u, address: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-white/90 mb-2">Ngày sinh</label>
              <input
                type="text"
                className="w-full p-3 rounded-lg bg-white/90 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={user.birthDate || ""}
                onChange={(e) => setUser((u) => ({ ...u, birthDate: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-white/90 mb-2">Username</label>
              <input
                type="text"
                className="w-full p-3 rounded-lg bg-white/90 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={user.username || ""}
                readOnly
              />
            </div>

            <div>
              <label className="block text-white/90 mb-2">Số điện thoại</label>
              <input
                type="text"
                className="w-full p-3 rounded-lg bg-white/90 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={user.phoneNumber || ""}
                onChange={(e) => setUser((u) => ({ ...u, phoneNumber: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-white/90 mb-2">Email</label>
              <input
                type="email"
                className="w-full p-3 rounded-lg bg-white/90 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={user.email || ""}
                onChange={(e) => setUser((u) => ({ ...u, email: e.target.value }))}
              />
            </div>
          </form>
        )}

        <div className="mt-8 flex justify-center">
          <button
            type="submit"
            form="profile-form"
            className="px-6 py-3 rounded-lg bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-semibold shadow-md"
          >
            Cập nhật thông tin
          </button>
        </div>

        {/* Vouchers */}
        <div className="mt-8 bg-white/10 rounded-2xl p-6 border border-white/20">
          <h3 className="text-white text-xl font-semibold mb-4">Voucher của bạn</h3>
          {vouchers.length === 0 ? (
            <div className="text-white/80">Chưa có voucher</div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {vouchers.map(v => (
                <div key={v.id} className="bg-white/20 rounded-xl p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-bold">{v.code}</div>
                    <div className="text-sm bg-green-500/20 text-green-200 px-2 py-1 rounded">
                      {v.discount_type === 'percent' ? `${v.discount_value}%` : `${Number(v.discount_value).toLocaleString()}₫`}
                    </div>
                  </div>
                  {v.description && (
                    <div className="text-white/80 mt-1 text-sm">{v.description}</div>
                  )}
                  <div className="mt-2 text-xs text-white/70">
                    {v.min_order_total ? `ĐH tối thiểu: ${Number(v.min_order_total).toLocaleString()}₫` : 'Không yêu cầu đơn tối thiểu'}
                  </div>
                  <div className="text-xs text-white/70">
                    HSD: {v.expires_at ? new Date(v.expires_at).toLocaleDateString('vi-VN') : 'Không thời hạn'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Favorites */}
        <div className="mt-8 bg-white/10 rounded-2xl p-6 border border-white/20">
          <h3 className="text-white text-xl font-semibold mb-4">Sản phẩm yêu thích</h3>
          {favorites.length === 0 ? (
            <div className="text-white/80">Chưa có sản phẩm yêu thích</div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {favorites.map(f => (
                <div key={f.id} className="bg-white/20 rounded-xl p-4 text-white flex items-center gap-3">
                  <img src={f.drink?.image_url || '/logo192.png'} alt={f.drink?.name} className="w-16 h-16 rounded object-cover" />
                  <div>
                    <div className="font-semibold">{f.drink?.name}</div>
                    <div className="text-sm text-white/80">{Number(f.drink?.price || 0).toLocaleString()}₫</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <Modal
          open={showSuccess}
          title="Xin cảm ơn!"
          description="Form đã được gửi thành công."
          onClose={() => setShowSuccess(false)}
          actions={(
            <button
              onClick={() => setShowSuccess(false)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
            >OK</button>
          )}
        />
      </div>
    </div>
  );
}

export default UserProfile;