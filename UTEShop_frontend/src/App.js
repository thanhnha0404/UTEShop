import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";

// Các trang và component
import RegisterPage from "./pages/register.pages";
import LoginPage from "./pages/login.pages";
import ForgotPasswordPage from "./pages/ForgotPassword.pages";
import Login from "./components/Login";
import UserProfile from "./components/UserProfile";
import HomePage from "./pages/Home.pages";
import ProductDetailPage from "./pages/ProductDetail.pages";
import DrinksPage from "./pages/DrinksPage";
import DrinkDetailPage from "./pages/DrinkDetailPage";
import Header from "./components/Header";
import Toast from "./components/Toast";
import ToastNotification from "./components/ToastNotification";
import CheckoutPage from "./pages/CheckoutPage";
import OrdersPage from "./pages/OrdersPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import CartPage from "./pages/CartPage";
import FavoritesPage from "./pages/FavoritesPage";
import NotificationsPage from "./pages/NotificationsPage";
import StatisticsPage from "./pages/StatisticsPage";
import AdminRoute from "./components/AdminRoute";

function AppRoutes() {
  const location = useLocation();
  const hideHeader = ["/login", "/register", "/forgot-password"].includes(location.pathname);
  return (
    <>
      {!hideHeader && <Header />}
      <Toast />
      <ToastNotification />
      <Routes>
        {/* Điều hướng mặc định */}
        <Route path="/" element={<HomePage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/drinks" element={<DrinksPage />} />
        <Route path="/drink/:id" element={<DrinkDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/orders/:orderId" element={<OrderDetailPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/statistics" element={
          <AdminRoute>
            <StatisticsPage />
          </AdminRoute>
        } />
        <Route path="/notifications" element={<NotificationsPage />} />

        {/* Các routes */}
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/custom-login" element={<Login />} />
        <Route path="/profile" element={<UserProfile />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
