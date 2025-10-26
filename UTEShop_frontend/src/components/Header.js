import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getUser, clearAuth, getToken, isAdmin } from "../utils/authStorage";
import { getMyCart } from "../services/product.services";
import Modal from "./Modal";
import LoyaltyWallet from "./LoyaltyWallet";
import NotificationBell from "./NotificationBell";

function normalizeImages(imageUrl) {
  if (Array.isArray(imageUrl)) return imageUrl;
  if (typeof imageUrl === "string" && imageUrl.trim().length > 0) {
    return imageUrl.split(",").map(s => s.trim()).filter(Boolean);
  }
  return ["/logo192.png"];
}

export default function Header() {
  const navigate = useNavigate();
  const user = getUser();
  const isLoggedIn = !!user;
  const [showConfirm, setShowConfirm] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const cartRef = useRef(null);
  const userMenuRef = useRef(null);
  const searchRef = useRef(null);

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
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchResults(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  // Detect scroll to add shadow effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/drinks?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearchResults(false);
    }
  };

  const searchProducts = async (query) => {
    if (query.trim().length < 1) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setSearchLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/drinks/search?q=${encodeURIComponent(query)}&limit=8`);
      if (response.ok) {
        const data = await response.json();
        const results = data.drinks || [];
        setSearchResults(results);
        setShowSearchResults(results.length > 0);
      } else {
        const allDrinksResponse = await fetch('http://localhost:8080/api/drinks?page=1&limit=100');
        if (allDrinksResponse.ok) {
          const allData = await allDrinksResponse.json();
          const filtered = (allData.drinks || []).filter(drink => 
            drink.name.toLowerCase().includes(query.toLowerCase()) ||
            drink.category?.name.toLowerCase().includes(query.toLowerCase()) ||
            drink.description?.toLowerCase().includes(query.toLowerCase())
          ).slice(0, 8);
          setSearchResults(filtered);
          setShowSearchResults(filtered.length > 0);
        }
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setShowSearchResults(false);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchInput = (value) => {
    setSearchQuery(value);
    searchProducts(value);
  };

  const selectProduct = (product) => {
    setSearchQuery("");
    setShowSearchResults(false);
    navigate(`/drink/${product.id}`);
  };

  return (
    <>
      <header className={`w-full bg-white border-b sticky top-0 z-50 transition-shadow duration-300 ${isScrolled ? 'shadow-md' : ''}`}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-indigo-600">
            UTE Shop
          </Link>
          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-4 relative" ref={searchRef}>
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchQuery}
                onChange={(e) => handleSearchInput(e.target.value)}
                onFocus={() => {
                  if (searchQuery.trim().length > 0) {
                    searchProducts(searchQuery);
                  }
                }}
                className="w-full px-4 py-2 pl-10 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                autoComplete="off"
              />
              <button
                type="submit"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-indigo-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              
              {/* Clear button */}
              {searchQuery && !searchLoading && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSearchResults([]);
                    setShowSearchResults(false);
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              
              {/* Loading spinner */}
              {searchLoading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </form>
            
            {/* Search Results Dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-[100] max-h-[400px] overflow-y-auto">
                <div className="p-2 text-xs text-gray-500 border-b bg-gray-50">
                  Tìm thấy {searchResults.length} sản phẩm
                </div>
                {searchResults.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => selectProduct(product)}
                    className="w-full px-4 py-3 text-left hover:bg-indigo-50 flex items-center gap-3 border-b last:border-b-0 transition-colors"
                  >
                    <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                      <img 
                        src={normalizeImages(product.image_url)[0]} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => e.target.src = "/logo192.png"}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{product.name}</div>
                      <div className="text-xs text-gray-500">{product.category?.name}</div>
                      <div className="text-sm font-semibold text-red-600 mt-1">
                        {Number(product.salePrice || product.price).toLocaleString()}₫
                      </div>
                    </div>
                  </button>
                ))}
                {searchQuery && (
                  <div className="p-2 border-t bg-gray-50">
                    <button
                      onClick={() => {
                        navigate(`/drinks?search=${encodeURIComponent(searchQuery)}`);
                        setShowSearchResults(false);
                      }}
                      className="w-full text-center text-indigo-600 hover:text-indigo-800 text-sm font-medium py-2 hover:bg-indigo-50 rounded"
                    >
                      Xem tất cả kết quả cho "{searchQuery}" →
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* No results message */}
            {showSearchResults && searchResults.length === 0 && !searchLoading && searchQuery.trim().length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-[100] p-4 text-center">
                <svg className="w-12 h-12 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-500 text-sm">Không tìm thấy sản phẩm "{searchQuery}"</p>
              </div>
            )}
          </div>

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
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1.5 min-w-[20px] h-5 flex items-center justify-center">{cart.length}</span>
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
                            <img src={normalizeImages(item?.drink?.image_url)[0]} alt={item?.drink?.name || 'item'} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold truncate">{item?.drink?.name}</div>
                            <div className="text-xs text-gray-500">SL: {item.quantity}</div>
                            <div className="text-sm text-red-600">
                              {Number(item?.drink?.salePrice || item?.drink?.price || 0).toLocaleString()}₫
                              {item.isUpsized && <span className="text-orange-600"> +5,000₫</span>}
                            </div>
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