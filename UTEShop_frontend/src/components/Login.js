import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { saveAuth } from "../utils/authStorage";
import { Eye, EyeOff } from "lucide-react";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
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
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-gradient-to-r from-blue-400 to-indigo-600">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-2xl shadow-xl w-96"
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Đăng nhập
        </h2>
        <input
          type="text"
          placeholder="Username"
          className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <div className="w-full mb-4 relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 pr-10"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-3 flex items-center text-gray-500"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <button
          type="submit"
          className="w-full bg-indigo-500 text-white p-3 rounded-lg font-semibold hover:bg-indigo-600 transition"
        >
          Đăng nhập
        </button>
        <div className="mt-3 text-right text-sm">
          <Link to="/forgot-password" className="text-indigo-500 font-semibold">
            Quên mật khẩu?
          </Link>
        </div>
        <p className="mt-2 text-center text-gray-600">
          Chưa có tài khoản?{" "}
          <Link to="/register" className="text-indigo-500 font-semibold">
            Đăng ký
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
