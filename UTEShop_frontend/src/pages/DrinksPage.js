import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getAllDrinks, getCategories, addToCart } from "../services/product.services";
import { getFavorites, addFavorite, removeFavorite } from "../services/api.services";
import Modal from "../components/Modal";
import { getToken } from "../utils/authStorage";
import { Heart, ShoppingCart, Star, TrendingUp, Search, Filter } from "lucide-react";

function normalizeImages(imageUrl) {
  if (Array.isArray(imageUrl)) return imageUrl;
  if (typeof imageUrl === "string" && imageUrl.trim().length > 0) {
    return imageUrl.split(",").map(s => s.trim()).filter(Boolean);
  }
  return ["/logo192.png"];
}

function DrinkCard({ drink, favoritesMap, onToggleFavorite }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const isFav = !!favoritesMap[drink.id];
  
  const handleAddToCart = async () => {
    const token = getToken();
    if (!token) {
      navigate('/login');
      return;
    }
    
    setIsAdding(true);
    try {
      await addToCart({ drinkId: drink.id, quantity: 1, token });
      setOpen(true);
      window.dispatchEvent(new Event('cart:updated'));
      setTimeout(() => setOpen(false), 1500);
    } catch (err) {
      alert(err?.response?.data?.message || err?.message || 'Lỗi');
    } finally {
      setIsAdding(false);
    }
  };

  const handleCardClick = () => {
    navigate(`/drink/${drink.id}`);
  };

  return (
    <>
      <div className="product-card bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 transform hover:-translate-y-1">
        <div className="relative overflow-hidden cursor-pointer image-container" onClick={handleCardClick}>
          <img 
            src={normalizeImages(drink.image_url)[0]} 
            alt={drink.name} 
            className="w-full h-56 object-cover transition-transform duration-500 hover:scale-110" 
          />
          
          {/* Sale Badge */}
          {drink.salePrice && drink.price && (
            <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg pointer-events-none">
              -{Math.round(((drink.price - drink.salePrice) / drink.price) * 100)}%
            </div>
          )}
          
          {/* Favorite Button */}
          <button
            type="button"
            onClick={(e) => { 
              e.stopPropagation();
              onToggleFavorite(drink.id, isFav); 
            }}
            className={`favorite-btn absolute top-3 right-3 p-2.5 rounded-full shadow-lg backdrop-blur-sm transition-all duration-300 z-10 ${
              isFav 
                ? 'bg-red-500 text-white scale-110 hover:bg-red-600' 
                : 'bg-white/90 text-gray-400 hover:text-red-500 hover:bg-white hover:scale-110'
            }`}
            title={isFav ? 'Bỏ yêu thích' : 'Thêm yêu thích'}
          >
            <Heart size={18} fill={isFav ? 'currentColor' : 'none'} />
          </button>
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
        </div>
        
        <div className="p-5">
          {/* Category Badge */}
          <div className="mb-2">
            <span className="inline-block text-xs font-semibold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
              {drink.category?.name || 'Đồ uống'}
            </span>
          </div>
          
          {/* Product Name - Clickable */}
          <div onClick={handleCardClick} className="cursor-pointer content-area">
            <h3 className="font-bold text-lg mb-2 line-clamp-2 min-h-[56px] text-gray-800 transition-colors hover:text-purple-600">
              {drink.name}
            </h3>
            
            {/* Size */}
            <p className="text-sm text-gray-500 mb-3 flex items-center gap-1">
              <span className="font-medium">Kích cỡ:</span> M
            </p>
            
            {/* Price */}
            <div className="flex items-center justify-between mb-4">
              <div>
                {drink.salePrice ? (
                  <div className="flex flex-col">
                    <span className="text-red-600 font-bold text-xl">
                      {Number(drink.salePrice).toLocaleString()}₫
                    </span>
                    <span className="text-gray-400 line-through text-sm">
                      {Number(drink.price).toLocaleString()}₫
                    </span>
                  </div>
                ) : (
                  <span className="text-gray-900 font-bold text-xl">
                    {Number(drink.price).toLocaleString()}₫
                  </span>
                )}
              </div>
            </div>
            
            {/* Rating & Sales */}
            <div className="flex items-center justify-between text-sm text-gray-500 mb-4 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-1">
                <Star size={16} className="text-yellow-400 fill-yellow-400" />
                <span className="font-medium">5.0</span>
                <span className="text-gray-400">(0)</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp size={16} className="text-gray-400" />
                <span>{drink.sold || 0} đã bán</span>
              </div>
            </div>
          </div>
          
          {/* Add to Cart Button */}
          <button
            type="button"
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleAddToCart}
            disabled={isAdding}
          >
            {isAdding ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Đang thêm...</span>
              </>
            ) : (
              <>
                <ShoppingCart size={18} />
                <span>Thêm vào giỏ</span>
              </>
            )}
          </button>
        </div>
      </div>
      
      <Modal
        open={open}
        title="Thành công!"
        description="Đã thêm sản phẩm vào giỏ hàng"
        onClose={() => setOpen(false)}
        actions={
          <button 
            onClick={() => setOpen(false)} 
            className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all"
          >
            OK
          </button>
        }
      />
    </>
  );
}

function CategoryFilter({ categories, selectedCategory, onCategoryChange }) {
  return (
    <div className="mb-10">
      <div className="flex items-center gap-2 mb-4">
        <Filter size={20} className="text-gray-600" />
        <h3 className="text-lg font-bold text-gray-800">Lọc theo danh mục</h3>
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => onCategoryChange(null)}
          className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
            selectedCategory === null
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg scale-105'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
          }`}
        >
          ✨ Tất cả
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
              selectedCategory === category.id
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg scale-105'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
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
  const navigate = useNavigate();
  const location = useLocation();
  const [drinks, setDrinks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [favoritesMap, setFavoritesMap] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

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

  // Xử lý tìm kiếm từ URL
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchParam = urlParams.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [location.search]);

  useEffect(() => {
    loadCategories();
    loadDrinks(1, null);
    (async () => {
      try {
        const res = await getFavorites();
        if (res.success) {
          const map = {};
          (res.data.favorites || []).forEach(f => { if (f.drink?.id) map[f.drink.id] = true; });
          setFavoritesMap(map);
        }
      } catch (_) {}
    })();
  }, []);

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
    loadDrinks(1, categoryId, false);
  };

  const handleLoadMore = () => {
    loadDrinks(currentPage + 1, selectedCategory, true);
  };

  const onToggleFavorite = async (drinkId, isFav) => {
    try {
      if (!getToken()) { navigate('/login'); return; }
      // Optimistic
      setFavoritesMap(prev => ({ ...prev, [drinkId]: !isFav }));
      if (!isFav) {
        const res = await addFavorite(drinkId);
        if (!res.success) throw new Error(res.error);
      } else {
        const res = await removeFavorite(drinkId);
        if (!res.success) throw new Error(res.error);
      }
      window.dispatchEvent(new Event('favorites:updated'));
    } catch (e) {
      // revert
      setFavoritesMap(prev => ({ ...prev, [drinkId]: isFav }));
      window.dispatchEvent(new CustomEvent('toast:show', { detail: { message: 'Không thể cập nhật yêu thích. Vui lòng thử lại.', type: 'error' } }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
        <div className="max-w-7xl mx-auto p-6">
          <div className="text-center py-20">
            <div className="relative inline-block">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <ShoppingCart className="text-purple-600 animate-pulse" size={24} />
              </div>
            </div>
            <p className="mt-6 text-gray-600 text-lg font-medium">Đang tải đồ uống tuyệt vời...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto p-6 py-10">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <div className="flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2 rounded-full shadow-lg">
              <ShoppingCart size={20} />
              <span className="font-semibold">Cửa hàng</span>
            </div>
          </div>
          <h1 className="text-5xl font-bold text-purple-600 mb-4">
            Đồ Uống UTE Shop
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Khám phá bộ sưu tập đồ uống thơm ngon, tươi mát với giá ưu đãi đặc biệt 🍹✨
          </p>
        </div>
        
        {/* Search Result Banner */}
        {searchQuery && (
          <div className="mb-8 bg-white rounded-2xl shadow-md p-6 border border-purple-100">
            <div className="flex items-center gap-3">
              <Search className="text-purple-600" size={24} />
              <div>
                <h3 className="font-bold text-gray-800">Kết quả tìm kiếm cho:</h3>
                <p className="text-purple-600 font-semibold text-lg">"{searchQuery}"</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Category Filter */}
        <CategoryFilter 
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
        />

        {/* Product Count */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 inline-block">
            <p className="text-gray-700 font-medium">
              Hiển thị <span className="text-purple-600 font-bold">{drinks.length}</span> / <span className="font-bold">{totalCount}</span> sản phẩm
            </p>
          </div>
        </div>

        {/* Products Grid */}
        {drinks.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <Search className="text-gray-400" size={40} />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Không tìm thấy sản phẩm</h3>
            <p className="text-gray-600">Hãy thử tìm kiếm với từ khóa khác</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {drinks.map((drink) => (
              <DrinkCard key={drink.id} drink={drink} favoritesMap={favoritesMap} onToggleFavorite={onToggleFavorite} />
            ))}
          </div>
        )}

        {/* Load More Button */}
        {hasMore && (
          <div className="text-center">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 text-white px-10 py-4 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 disabled:transform-none"
            >
              {loadingMore ? (
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Đang tải thêm...</span>
                </div>
              ) : (
                <span>Xem thêm sản phẩm →</span>
              )}
            </button>
          </div>
        )}

        {/* End Message */}
        {!hasMore && drinks.length > 0 && (
          <div className="text-center py-12">
            <div className="inline-block bg-white rounded-2xl shadow-md px-8 py-6 border border-gray-100">
              <p className="text-gray-600 font-medium text-lg">
                🎉 Bạn đã xem hết tất cả sản phẩm
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}