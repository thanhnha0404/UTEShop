import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getUser, clearAuth } from "../utils/authStorage";
import Modal from "./Modal";

export default function Header() {
  const navigate = useNavigate();
  const user = getUser();
  const isLoggedIn = !!user;
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLogout = () => {
    clearAuth();
    setShowConfirm(false)
    navigate("/");
  };

  return (
    <>
    <header className="w-full bg-white border-b">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-indigo-600">UTE Shop</Link>
        <nav className="flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <Link to="/profile" className="px-4 py-2 text-indigo-600 font-semibold hover:underline">
                {user.fullName || user.username || "Tài khoản"}
              </Link>
              <button onClick={() => setShowConfirm(true)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200">Đăng xuất</button>
            </>
          ) : (
            <>
              <Link to="/login" className="px-4 py-2 text-indigo-600 font-semibold hover:underline">Đăng nhập</Link>
              <Link to="/register" className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700">Đăng ký</Link>
            </>
          )}
        </nav>
      </div>
    </header>
    <Modal
      open={showConfirm}
      title="Xác nhận"
      description="Bạn có chắc chắn muốn đăng xuất?"
      onClose={() => setShowConfirm(false)}
      actions={(
        <>
          <button onClick={() => setShowConfirm(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg">Hủy</button>
          <button onClick={handleLogout} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg">Đăng xuất</button>
        </>
      )}
    />
    </>
  );
}


