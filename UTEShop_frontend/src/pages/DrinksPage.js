import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAllDrinks, getCategories, addToCart } from "../services/product.services";
import Modal from "../components/Modal";
import { getToken } from "../utils/authStorage";

function DrinkCard({ drink }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  return (
    <Link to={`/drink/${drink.id}`} className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden">
      <div className="relative">
        <img src={drink.image_url || "/logo192.png"} alt={drink.name} className="w-full h-48 object-cover" />
        {drink.salePrice && drink.price && (
          <span className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
            -{Math.round(((drink.price - drink.salePrice) / drink.price) * 100)}%
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2 min-h-[48px]">{drink.name}</h3>
        <p className="text-sm text-gray-600 mb-2">{drink.category?.name}</p>
        {drink.size && (
          <p className="text-sm text-gray-500 mb-2">Kích cỡ: {drink.size}</p>
        )}
        <div className="flex items-center justify-between mb-3">
          <div>
            {drink.salePrice ? (
              <>
                <span className="text-red-600 font-bold text-lg mr-2">{Number(drink.salePrice).toLocaleString()}₫</span>
                <span className="text-gray-400 line-through text-sm">{Number(drink.price).toLocaleString()}₫</span>
              </>
            ) : (
              <span className="text-gray-900 font-bold text-lg">{Number(drink.price).toLocaleString()}₫</span>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <div className="flex items-center">
            <span className="text-yellow-500">★★★★★</span>
            <span className="ml-1">(0)</span>
          </div>
          <span>Đã bán {drink.sold || 0}</span>
        </div>
        <button 
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-semibold transition"
          onClick={(e) => {
            e.preventDefault();
            const token = getToken();
            if (!token) {
              navigate('/login');
              return;
            }
            addToCart({ drinkId: drink.id, quantity: 1, token })
              .then(() => {
                setOpen(true);
                window.dispatchEvent(new Event('cart:updated'));
                setTimeout(() => setOpen(false), 1200);
              })
              .catch(err => alert(err?.response?.data?.message || err?.message || 'Lỗi'));
          }}
        >
          Thêm vào giỏ hàng
        </button>
        <Modal
          open={open}
          title="Thành công"
          description="Đã thêm vào giỏ hàng!"
          onClose={() => setOpen(false)}
          actions={<button onClick={() => setOpen(false)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">OK</button>}
        />
      </div>
    </Link>
  );
}

function CategoryFilter({ categories, selectedCategory, onCategoryChange }) {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4 text-gray-700">Lọc theo danh mục:</h3>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onCategoryChange(null)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition ${
            selectedCategory === null
              ? 'bg-purple-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Tất cả
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              selectedCategory === category.id
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function DrinksPage() {
  const [drinks, setDrinks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const loadDrinks = async (page = 1, categoryId = null, append = false) => {
    try {
      if (page === 1) setLoading(true);
      else setLoadingMore(true);

      const data = await getAllDrinks(page, 8, categoryId);
      
      if (append) {
        setDrinks(prev => [...prev, ...data.drinks]);
      } else {
        setDrinks(data.drinks);
      }
      
      setCurrentPage(data.currentPage);
      setHasMore(data.hasMore);
      setTotalCount(data.totalCount);
    } catch (error) {
      console.error('Lỗi tải dữ liệu:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Lỗi tải danh mục:', error);
    }
  };

  useEffect(() => {
    loadCategories();
    loadDrinks(1, null);
  }, []);

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
    loadDrinks(1, categoryId, false);
  };

  const handleLoadMore = () => {
    loadDrinks(currentPage + 1, selectedCategory, true);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải đồ uống...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Các đồ uống của UTE Shop</h1>
        <p className="text-gray-600 text-lg">Khám phá các loại đồ uống thơm ngon và bổ dưỡng</p>
      </div>
      
      <CategoryFilter 
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
      />

      <div className="mb-6">
        <p className="text-gray-600">
          Hiển thị {drinks.length} / {totalCount} sản phẩm
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {drinks.map((drink) => (
          <DrinkCard key={drink.id} drink={drink} />
        ))}
      </div>

      {hasMore && (
        <div className="text-center">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-semibold transition"
          >
            {loadingMore ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Đang tải...
              </div>
            ) : (
              'Xem thêm'
            )}
          </button>
        </div>
      )}

      {!hasMore && drinks.length > 0 && (
        <div className="text-center text-gray-500 py-8">
          <p>Đã hiển thị tất cả sản phẩm</p>
        </div>
      )}
    </div>
  );
}
