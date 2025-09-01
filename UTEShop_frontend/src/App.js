import React from "react";
<<<<<<< HEAD
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import RegisterPage from "./pages/register.pages";
import LoginPage from "./pages/login.pages";
=======
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import UserProfile from "./components/UserProfile";
>>>>>>> bccee8695258419678b269516d9170dd038d8ebf


function App() {
  return (
    <Router>
      <Routes>
<<<<<<< HEAD
        <Route path="/" element={<Navigate to="/register" replace />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
=======
        <Route path="/" element={<Login />} />
        <Route path="/profile" element={<UserProfile />} />
>>>>>>> bccee8695258419678b269516d9170dd038d8ebf
      </Routes>
    </Router>
  );
}

export default App;
