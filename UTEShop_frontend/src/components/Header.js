import React from "react";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="w-full bg-white border-b">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-indigo-600">UTE Shop</Link>
        <nav className="flex items-center gap-3">
          <Link to="/login" className="px-4 py-2 text-indigo-600 font-semibold hover:underline">Đăng nhập</Link>
          <Link to="/register" className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700">Đăng ký</Link>
        </nav>
      </div>
    </header>
  );
}


