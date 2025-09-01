import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const authUrl = process.env.REACT_APP_AUTH_BASE_URL || "http://localhost:8080/api/auth";
      const res = await axios.post(`${authUrl}/login`, {
        username,
        password,
      });
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || "Login failed";
      alert("Login failed: " + message);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-r from-blue-400 to-indigo-600">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-2xl shadow-xl w-96"
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Login</h2>
        <input
          type="text"
          placeholder="Username"
          className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="submit"
          className="w-full bg-indigo-500 text-white p-3 rounded-lg font-semibold hover:bg-indigo-600 transition"
        >
          Login
        </button>
        <p className="mt-4 text-center text-gray-600">
          Don't have an account?{" "}
          <Link to="/register" className="text-indigo-500 font-semibold">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
