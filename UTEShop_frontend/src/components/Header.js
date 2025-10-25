import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getUser, clearAuth, getToken, isAdmin } from "../utils/authStorage";
import { getMyCart } from "../services/product.services";
import Modal from "./Modal";
import LoyaltyWallet from "./LoyaltyWallet";
import NotificationBell from "./NotificationBell";

export default function Header() {
  const navigate = useNavigate();
  const user = getUser();
  const isLoggedIn = !!user;
  const [showConfirm, setShowConfirm] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [cart, setCart] = useState([]);
  const cartRef = useRef(null);
  const userMenuRef = useRef(null);

  const fetchCart = async () => {
    try {
      const token = getToken();
      if (!token) return;
      const data = await getMyCart({ token });
      setCart(Array.isArray(data.items) ? data.items : []);
    } catch (_) {}
  };

  useEffect(() => {
    function onClickOutside(e) {
      if (cartRef.current && !cartRef.current.contains(e.target)) {
        setShowCart(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    if (isLoggedIn) fetchCart();
  }, [isLoggedIn]);

  useEffect(() => {
    function onCartUpdated() { fetchCart(); }
    window.addEventListener('cart:updated', onCartUpdated);
    return () => window.removeEventListener('cart:updated', onCartUpdated);
  }, []);

  const handleLogout = () => {
    clearAuth();
    setShowConfirm(false);
    navigate("/");
  };

  return (
    <>
      <header className="w-full bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-indigo-600">
            UTE Shop
          </Link>
          <nav className="flex items-center gap-3">
            <Link
              to="/drinks"
              className="px-4 py-2 text-indigo-600 font-semibold hover:underline"
            >
              Đồ uống
            </Link>
            {/* Cart icon */}
            <div className="relative" ref={cartRef}>
              <button
                className="px-3 py-2 rounded-lg hover:bg-gray-100 relative"
                onClick={() => { setShowCart(s => !s); if (!showCart) fetchCart(); }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-6 h-6 align-middle text-gray-800"
                  aria-hidden="true"
                >
                  <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2S15.9 22 17 22s2-.9 2-2-.9-2-2-2zM7.17 14h9.66c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1 1 0 0 0 21.33 5H6.21l-.94-2H2v2h2l3.6 7.59-1.35 2.45C5.52 15.37 6.12 16 6.91 16H20v-2H7.42l.75-1.35z" />
                </svg>
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1">{cart.length}</span>
                )}
              </button>
              {showCart && (
                <div className="absolute right-0 mt-2 w-80 bg-white border rounded-lg shadow-xl z-50">
                  <div className="p-3 border-b font-semibold">Giỏ hàng</div>
                  <div className="max-h-80 overflow-auto">
                    {cart.length === 0 ? (
                      <div className="p-4 text-sm text-gray-500">Chưa có sản phẩm</div>
                    ) : (
                      cart.map(item => (
                        <div key={item.id} className="p-3 flex gap-3 border-b last:border-b-0">
                          <div className="w-14 h-14 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                            <img src={item?.drink?.image_url || '/logo192.png'} alt={item?.drink?.name || 'item'} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold truncate">{item?.drink?.name}</div>
                            <div className="text-xs text-gray-500">SL: {item.quantity}</div>
                            <div className="text-sm text-red-600">{Number(item?.drink?.salePrice || item?.drink?.price || 0).toLocaleString()}₫</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-3 border-t">
                    <Link
                      to="/cart"
                      className="w-full inline-block text-center px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700"
                      onClick={() => setShowCart(false)}
                    >
                      Xem giỏ hàng
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {isLoggedIn ? (
              <>
                {/* Notification Bell */}
                <NotificationBell />
                
                {/* Loyalty Wallet */}
                <LoyaltyWallet />
                
                {/* User menu dropdown */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                  >
                    <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-5 h-5 text-white"
                      >
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                      </svg>
                    </div>
                    <span className="text-indigo-600 font-semibold">
                      {user.fullName || user.username || "Tài khoản"}
                    </span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className={`w-4 h-4 text-gray-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`}
                    >
                      <path d="M7 10l5 5 5-5z"/>
                    </svg>
                  </button>
                  
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-xl z-50">
                      <div className="py-1">
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowUserMenu(false)}
                        >
                          Tài khoản của tôi
                        </Link>
                        <Link
                          to="/orders"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowUserMenu(false)}
                        >
                          Đơn hàng của tôi
                        </Link>
                        <Link
                          to="/favorites"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowUserMenu(false)}
                        >
                          Danh sách yêu thích
                        </Link>
                        {isAdmin() && (
                          <Link
                            to="/statistics"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setShowUserMenu(false)}
                          >
                            Thống kê & Doanh thu
                          </Link>
                        )}
                        <hr className="my-1" />
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            setShowConfirm(true);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        >
                          Đăng xuất
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-indigo-600 font-semibold hover:underline"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700"
                >
                  Đăng ký
                </Link>
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
        actions={
          <>
            <button
              onClick={() => setShowConfirm(false)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg"
            >
              Hủy
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
            >
              Đăng xuất
            </button>
          </>
        }
      />
    </>
  );
}
