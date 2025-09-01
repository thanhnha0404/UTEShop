import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Từ nhánh HEAD
import RegisterPage from "./pages/register.pages";
import LoginPage from "./pages/login.pages";

// Từ nhánh bccee...
import Login from "./components/Login";
import UserProfile from "./components/UserProfile";

function App() {
  return (
    <Router>
      <Routes>
        {/* Điều hướng mặc định */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Routes từ HEAD */}
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Routes từ bccee... */}
        <Route path="/custom-login" element={<Login />} />
        <Route path="/profile" element={<UserProfile />} />
      </Routes>
    </Router>
  );
}

export default App;
