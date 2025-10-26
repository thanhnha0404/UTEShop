import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { saveAuth } from "../utils/authStorage";
import { Eye, EyeOff, User, Lock, ArrowRight } from "lucide-react";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const authUrl =
        process.env.REACT_APP_AUTH_BASE_URL || "http://localhost:8080/api/auth";
      const res = await axios.post(`${authUrl}/login`, {
        username,
        password,
      });
      const { token, user } = res.data || {};
      saveAuth(token, user);
      navigate("/");
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "Login failed";
      alert("Login failed: " + message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex">
      {/* Left Side - Image Background with Overlay */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600">
        {/* Animated Background Circles */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        
        {/* Content Overlay */}
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-white">
          <div className="max-w-md text-center">
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center shadow-2xl">
<svg
  className="w-12 h-12 text-white"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  xmlns="http://www.w3.org/2000/svg"
  aria-hidden="true"
>
  <title>Ly nước</title>

  {/* Khung ly */}
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    d="M7 3h10l-1.2 14.4a2 2 0 01-2 1.6H10.2a2 2 0 01-2-1.6L7 3z"
  />

  {/* Mép trong (giúp thấy độ sâu) */}
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={1.2}
    d="M8.2 6.2h7.6"
    opacity="0.6"
  />

  {/* Nước bên trong (màu hiện tại với độ trong suốt) */}
  <path
    fill="currentColor"
    opacity="0.22"
    d="M8.6 11.8c.9-.7 2.3-.7 3.2 0 .9.7 2.3.7 3.2 0v3.1a1.2 1.2 0 01-1.2 1.1H9.8a1.2 1.2 0 01-1.2-1.1v-3.1z"
  />

  {/* Sóng nước — nét mảnh để gợn */}
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={1.2}
    stroke="currentColor"
    d="M9 12.2c.7-.5 1.6-.5 2.3 0 .7.5 1.6.5 2.3 0"
    opacity="0.9"
  />

  {/* Bọt nhỏ */}
  <circle cx="14.4" cy="10.4" r="0.5" fill="currentColor" opacity="0.9" />
  <circle cx="10.6" cy="9.8" r="0.35" fill="currentColor" opacity="0.9" />
</svg>

              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4 drop-shadow-lg">
              Chào mừng trở lại! 🍹
            </h1>
            <p className="text-lg text-white/90 leading-relaxed drop-shadow">
              Khám phá thế giới đồ uống tươi mát và hương vị tuyệt vời. 
              Hãy đăng nhập để tiếp tục hành trình của bạn!
            </p>
            
            {/* Decorative Fruit Icons */}
            <div className="mt-8 flex justify-center gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-2xl animate-bounce">
                🍊
              </div>
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-2xl animate-bounce animation-delay-1000">
                🍋
              </div>
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-2xl animate-bounce animation-delay-2000">
                🍓
              </div>
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-2xl animate-bounce animation-delay-3000">
                🥝
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl mb-4 shadow-lg">
              <span className="text-3xl">🍹</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">UTE Shop</h2>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Đăng nhập
              </h2>
              <p className="text-gray-500">
                Chào mừng bạn quay trở lại! Vui lòng đăng nhập vào tài khoản của bạn.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              {/* Username Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tên đăng nhập
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Nhập tên đăng nhập"
                    className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mật khẩu
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu"
                    className="w-full pl-12 pr-12 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-400"
                  />
                  <span className="ml-2 text-gray-600">Ghi nhớ đăng nhập</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-orange-500 hover:text-orange-600 font-semibold transition-colors"
                >
                  Quên mật khẩu?
                </Link>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white py-3.5 rounded-xl font-semibold hover:from-orange-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Đang đăng nhập...</span>
                  </>
                ) : (
                  <>
                    <span>Đăng nhập</span>
                    <ArrowRight size={20} />
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">hoặc</span>
                </div>
              </div>

              {/* Social Login Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="text-sm font-medium text-gray-700">Google</span>
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span className="text-sm font-medium text-gray-700">Facebook</span>
                </button>
              </div>
            </form>

            {/* Sign Up Link */}
            <p className="mt-6 text-center text-gray-600">
              Chưa có tài khoản?{" "}
              <Link
                to="/register"
                className="text-orange-500 hover:text-orange-600 font-semibold transition-colors"
              >
                Đăng ký ngay
              </Link>
            </p>
          </div>

          {/* Footer Text */}
          <p className="mt-6 text-center text-sm text-gray-500">
            Bằng cách đăng nhập, bạn đồng ý với{" "}
            <a href="#" className="text-orange-500 hover:underline">
              Điều khoản dịch vụ
            </a>{" "}
            và{" "}
            <a href="#" className="text-orange-500 hover:underline">
              Chính sách bảo mật
            </a>
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        .animation-delay-3000 {
          animation-delay: 3s;
        }
      `}</style>
    </div>
  );
}

export default Login;