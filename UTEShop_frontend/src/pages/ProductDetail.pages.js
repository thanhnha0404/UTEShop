import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProductDetail, addToCart } from "../services/product.services";
import { getToken } from "../utils/authStorage";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Thumbs, FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/free-mode";
import "swiper/css/thumbs";
import ProductReviews from "../components/ProductReviews";
import { getFavorites, addFavorite, removeFavorite } from "../services/api.services";

function normalizeImages(imageUrls) {
  if (Array.isArray(imageUrls)) return imageUrls;
  if (typeof imageUrls === "string" && imageUrls.trim().length > 0) {
    return imageUrls.split(",").map(s => s.trim()).filter(Boolean);
  }
  return ["/logo192.png"];
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [qty, setQty] = useState(1);
  const [isUpsized, setIsUpsized] = useState(false);
  const navigate = useNavigate();
  const [userOrders, setUserOrders] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    (async () => {
      const data = await getProductDetail(id);
      setProduct(data);
      // reset thumbs when product changes
      setThumbsSwiper(null);
    })();
  }, [id]);

  useEffect(() => {
    (async () => {
      try {
        const token = getToken();
        if (!token) return;
        const res = await fetch(`http://localhost:8080/api/orders?status=all&page=1&limit=100`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUserOrders(data.orders || []);
        }
        const favs = await getFavorites();
        if (favs.success) {
          const has = (favs.data.favorites || []).some(f => f.drink?.id === Number(id));
          setIsFavorite(has);
        }
      } catch (_) {}
    })();
  }, [id]);

  if (!product) return <div className="max-w-5xl mx-auto p-4">Đang tải...</div>;

  const images = normalizeImages(product.image_url);

  return (
    <div className="max-w-5xl mx-auto p-4 grid md:grid-cols-2 gap-6">
      <div>
        <div className="rounded-xl overflow-hidden shadow">
          <Swiper
            modules={[Navigation, Thumbs, FreeMode]}
            navigation
            loop={images.length > 1}
            thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
            className="w-full h-80"
          >
            {images.map((src, idx) => (
              <SwiperSlide key={idx}>
                <img src={src} alt={`${product.name}-${idx}`} className="w-full h-80 object-cover" />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
        <div className="mt-3">
          <Swiper
            modules={[FreeMode, Thumbs]}
            onSwiper={setThumbsSwiper}
            spaceBetween={8}
            slidesPerView={Math.min(5, images.length)}
            freeMode
            watchSlidesProgress
            className="thumbs-swiper"
          >
            {images.map((src, idx) => (
              <SwiperSlide key={idx}>
                <div className="w-full h-16 rounded overflow-hidden border">
                  <img src={src} alt={`thumb-${product.name}-${idx}`} className="w-full h-full object-cover" />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      <div>
        <div className="flex items-start justify-between mb-2">
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <button
            onClick={async () => {
              try {
                const token = getToken();
                if (!token) { navigate('/login'); return; }
                if (isFavorite) {
                  const res = await removeFavorite(product.id);
                  if (res.success) setIsFavorite(false);
                } else {
                  const res = await addFavorite(product.id);
                  if (res.success) setIsFavorite(true);
                }
              } catch (e) {
                alert(e?.response?.data?.message || e?.message || 'Lỗi yêu thích');
              }
            }}
            className={`ml-3 p-2 rounded-full ${isFavorite ? 'bg-red-500 text-white' : 'bg-gray-100 text-red-500'}`}
            title={isFavorite ? 'Bỏ yêu thích' : 'Thêm yêu thích'}
          >
            {isFavorite ? '❤️' : '🤍'}
          </button>
        </div>
        {product.category && (
          <p className="text-sm text-gray-500 mb-3">Danh mục: {product.category.name}</p>
        )}
        <div className="mb-4">
          {(() => {
            let basePrice = product.salePrice || product.price;
            let originalPrice = product.price;
            
            // Tính phí upsize
            if (isUpsized) {
              basePrice += 5000;
              originalPrice += 5000;
            }
            
            return product.salePrice ? (
              <>
                <span className="text-red-600 text-2xl font-bold mr-3">
                  {Number(basePrice).toLocaleString()}₫
                </span>
                <span className="text-gray-400 line-through">
                  {Number(originalPrice).toLocaleString()}₫
                </span>
                {isUpsized && (
                  <div className="text-sm text-orange-600 font-medium">
                    (Upsize +5,000₫)
                  </div>
                )}
              </>
            ) : (
              <>
                <span className="text-gray-900 text-2xl font-bold">
                  {Number(basePrice).toLocaleString()}₫
                </span>
                {isUpsized && (
                  <div className="text-sm text-orange-600 font-medium">
                    (Upsize +5,000₫)
                  </div>
                )}
              </>
            );
          })()}
        </div>
        <p className="text-sm text-gray-600 mb-2">Tồn kho: {product.stock}</p>
        
        {/* Size Selection */}
        <div className="mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsUpsized(!isUpsized)}
              className={`px-3 py-1 rounded-lg border-2 transition-all duration-200 text-sm ${
                isUpsized 
                  ? 'border-orange-500 bg-orange-50 text-orange-700 font-medium' 
                  : 'border-gray-300 bg-white text-gray-700 hover:border-orange-300'
              }`}
            >
              {isUpsized ? '✓ Upsize (+5,000₫)' : 'Upsize (+5,000₫)'}
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-3 mb-4">
          <button
            disabled={qty <= 1}
            onClick={() => setQty(q => Math.max(1, q - 1))}
            className="px-3 py-1 bg-gray-100 rounded"
          >
            -
          </button>
          <span>{qty}</span>
          <button
            disabled={qty >= product.stock}
            onClick={() => setQty(q => Math.min(product.stock, q + 1))}
            className="px-3 py-1 bg-gray-100 rounded"
          >
            +
          </button>
        </div>
        <button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold"
          onClick={async () => {
            const token = getToken();
            if (!token) {
              navigate('/login');
              return;
            }
            try {
              await addToCart({ 
                drinkId: product.id, 
                quantity: qty, 
                size: 'M',
                isUpsized: isUpsized,
                token 
              });
              alert('Đã thêm vào giỏ hàng!');
              window.dispatchEvent(new Event('cart:updated'));
            } catch (err) {
              alert(err?.response?.data?.message || err?.message || 'Lỗi');
            }
          }}
        >
          Thêm vào giỏ
        </button>
        <div className="mt-6 text-gray-700 whitespace-pre-line">
          {product.description}
        </div>
      </div>
      <div className="md:col-span-2">
        <ProductReviews drinkId={Number(id)} userOrders={userOrders} />
      </div>
    </div>
  );
}
