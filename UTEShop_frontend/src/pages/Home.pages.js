import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getLatestProducts, getBestSellers, getMostViewed, getTopDiscount, addToCart } from "../services/product.services";
import { getToken } from "../utils/authStorage";
import Modal from "../components/Modal";
import { ShoppingCart, Star, TrendingUp, Sparkles, Flame, Eye, Tag, ArrowRight, Heart } from "lucide-react";

function normalizeImages(imageUrl) {
  if (Array.isArray(imageUrl)) return imageUrl;
  if (typeof imageUrl === "string" && imageUrl.trim().length > 0) {
    return imageUrl.split(",").map(s => s.trim()).filter(Boolean);
  }
  return ["/logo192.png"];
}

function ProductCard({ product, onAddToCart }) {
  const [isAdding, setIsAdding] = useState(false);
  
  const handleAddToCart = async (e) => {
    e.preventDefault();
    setIsAdding(true);
    try {
      await onAddToCart(product.id);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Link 
      to={`/drink/${product.id}`} 
      className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 transform hover:-translate-y-2"
    >
      <div className="relative overflow-hidden">
        <img 
          src={normalizeImages(product.image_url)[0]} 
          alt={product.name} 
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500" 
        />
        
        {/* Sale Badge */}
        {product.salePrice && product.price && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
            -{Math.round(((product.price - product.salePrice) / product.price) * 100)}%
          </div>
        )}
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      
      <div className="p-4">
        {/* Product Name */}
        <h3 className="font-bold text-base mb-2 line-clamp-2 min-h-[44px] text-gray-800 group-hover:text-purple-600 transition-colors">
          {product.name}
        </h3>
        
        {/* Price */}
        <div className="mb-3">
          {product.salePrice ? (
            <div className="flex items-center gap-2">
              <span className="text-red-600 font-bold text-lg">
                {Number(product.salePrice).toLocaleString()}₫
              </span>
              <span className="text-gray-400 line-through text-sm">
                {Number(product.price).toLocaleString()}₫
              </span>
            </div>
          ) : (
            <span className="text-gray-900 font-bold text-lg">
              {Number(product.price).toLocaleString()}₫
            </span>
          )}
        </div>
        
        {/* Add to Cart Button */}
        <button 
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-2.5 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform active:scale-95 disabled:opacity-50"
          onClick={handleAddToCart}
          disabled={isAdding}
        >
          {isAdding ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm">Đang thêm...</span>
            </>
          ) : (
            <>
              <ShoppingCart size={16} />
              <span className="text-sm">Thêm vào giỏ</span>
            </>
          )}
        </button>
      </div>
    </Link>
  );
}

function Section({ title, products, icon: Icon, gradient, onAddToCart }) {
  return (
    <section className="mb-16">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${gradient} shadow-lg`}>
            <Icon className="text-white" size={24} />
          </div>
          <h2 className="text-3xl font-bold text-gray-800">{title}</h2>
        </div>
        <Link 
          to="/drinks" 
          className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold group transition-colors"
        >
          <span>Xem tất cả</span>
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
      
      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-5">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} />
        ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const [latest, setLatest] = useState([]);
  const [best, setBest] = useState([]);
  const [viewed, setViewed] = useState([]);
  const [discount, setDiscount] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [latestData, bestData, viewedData, discountData] = await Promise.all([
          getLatestProducts(),
          getBestSellers(),
          getMostViewed(),
          getTopDiscount()
        ]);
        setLatest(latestData);
        setBest(bestData);
        setViewed(viewedData);
        setDiscount(discountData);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleAddToCart = async (productId) => {
    const token = getToken();
    if (!token) {
      navigate('/login');
      return;
    }
    
    try {
      await addToCart({ drinkId: productId, quantity: 1, token });
      setOpen(true);
      window.dispatchEvent(new Event('cart:updated'));
      setTimeout(() => setOpen(false), 1500);
    } catch (err) {
      alert(err?.response?.data?.message || err?.message || 'Lỗi');
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
            <p className="mt-6 text-gray-600 text-lg font-medium">Đang tải sản phẩm...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDEzNGg3Ljl2LTEuM2wtNy45IDEuM3ptMTQgMGg3Ljl2LTEuM2wtNy45IDEuM3oiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <div className="text-center">
            <div className="inline-block mb-4">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <Sparkles size={20} />
                <span className="text-sm font-semibold">Chào mừng đến với UTE Shop</span>
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Thưởng Thức Hương Vị<br />
              <span className="text-yellow-300">Tuyệt Vời Mỗi Ngày</span>
            </h1>
            
            <p className="text-xl mb-8 text-purple-100 max-w-2xl mx-auto">
              Khám phá bộ sưu tập đồ uống đa dạng với giá ưu đãi đặc biệt dành riêng cho bạn
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center">
              <Link 
                to="/drinks" 
                className="bg-white text-purple-600 px-8 py-4 rounded-xl font-bold hover:bg-purple-50 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center gap-2"
              >
                <ShoppingCart size={20} />
                <span>Mua sắm ngay</span>
              </Link>
              <a 
                href="#products" 
                className="bg-purple-500/30 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-bold hover:bg-purple-500/40 transition-all duration-300 border-2 border-white/30"
              >
                Khám phá thêm
              </a>
            </div>
          </div>
          
          {/* Floating elements */}
          <div className="absolute top-10 left-10 animate-bounce">
            <div className="w-16 h-16 bg-yellow-400/30 rounded-full blur-xl"></div>
          </div>
          <div className="absolute bottom-10 right-10 animate-pulse">
            <div className="w-20 h-20 bg-pink-400/30 rounded-full blur-xl"></div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-6 -mt-10 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="text-3xl font-bold text-purple-600 mb-2">1000+</div>
            <div className="text-gray-600 font-medium">Sản phẩm</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="text-3xl font-bold text-purple-600 mb-2">5000+</div>
            <div className="text-gray-600 font-medium">Khách hàng</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="text-3xl font-bold text-purple-600 mb-2">4.9★</div>
            <div className="text-gray-600 font-medium">Đánh giá</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="text-3xl font-bold text-purple-600 mb-2">24/7</div>
            <div className="text-gray-600 font-medium">Hỗ trợ</div>
          </div>
        </div>
      </div>

      {/* Products Sections */}
      <div id="products" className="max-w-7xl mx-auto px-6 py-16">
        {latest.length > 0 && (
          <Section 
            title="Đồ uống mới nhất" 
            products={latest} 
            icon={Sparkles}
            gradient="bg-gradient-to-r from-purple-500 to-indigo-500"
            onAddToCart={handleAddToCart}
          />
        )}
        
        {best.length > 0 && (
          <Section 
            title="Bán chạy nhất" 
            products={best} 
            icon={Flame}
            gradient="bg-gradient-to-r from-orange-500 to-red-500"
            onAddToCart={handleAddToCart}
          />
        )}
        
        {viewed.length > 0 && (
          <Section 
            title="Xem nhiều nhất" 
            products={viewed} 
            icon={Eye}
            gradient="bg-gradient-to-r from-blue-500 to-cyan-500"
            onAddToCart={handleAddToCart}
          />
        )}
        
        {discount.length > 0 && (
          <Section 
            title="Khuyến mãi hấp dẫn" 
            products={discount} 
            icon={Tag}
            gradient="bg-gradient-to-r from-pink-500 to-rose-500"
            onAddToCart={handleAddToCart}
          />
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4">Sẵn sàng khám phá?</h2>
          <p className="text-xl mb-8 text-purple-100">
            Hàng trăm sản phẩm đang chờ bạn trải nghiệm
          </p>
          <Link 
            to="/drinks" 
            className="inline-flex items-center gap-2 bg-white text-purple-600 px-8 py-4 rounded-xl font-bold hover:bg-purple-50 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
          >
            <ShoppingCart size={20} />
            <span>Xem tất cả sản phẩm</span>
          </Link>
        </div>
      </div>

      {/* Success Modal */}
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
    </div>
  );
}