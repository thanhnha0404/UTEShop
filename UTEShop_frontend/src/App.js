import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Các trang và component
import RegisterPage from "./pages/register.pages";
import LoginPage from "./pages/login.pages";
import ForgotPasswordPage from "./pages/ForgotPassword.pages";
import Login from "./components/Login";
import UserProfile from "./components/UserProfile";

function App() {
  return (
    <Router>
      <Routes>
        {/* Điều hướng mặc định */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Các routes */}
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/custom-login" element={<Login />} />
        <Route path="/profile" element={<UserProfile />} />
      </Routes>
    </Router>
  );
}

export default App;
