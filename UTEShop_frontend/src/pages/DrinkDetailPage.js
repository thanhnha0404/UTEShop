import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProductDetail, addToCart } from "../services/product.services";
import { getToken } from "../utils/authStorage";
import { useNavigate } from "react-router-dom";
import Modal from "../components/Modal";
import ProductReviews from "../components/ProductReviews";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Thumbs, FreeMode, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/free-mode";
import "swiper/css/thumbs";
import "swiper/css/pagination";

function normalizeImages(imageUrl) {
  if (Array.isArray(imageUrl)) return imageUrl;
  if (typeof imageUrl === "string" && imageUrl.trim().length > 0) {
    return imageUrl.split(",").map(s => s.trim()).filter(Boolean);
  }
  return ["/logo192.png"];
}

export default function DrinkDetailPage() {
  const { id } = useParams();
  const [drink, setDrink] = useState(null);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [userOrders, setUserOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getProductDetail(id);
        setDrink(data);
        setThumbsSwiper(null);
        
        // Lấy đơn hàng của user để kiểm tra quyền đánh giá
        const token = getToken();
        if (token) {
          try {
            const response = await fetch('http://localhost:8080/api/orders/my-orders', {
              credentials: 'include',
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            if (response.ok) {
              const ordersData = await response.json();
              setUserOrders(ordersData.orders || []);
            }
          } catch (error) {
            console.error('Lỗi khi lấy đơn hàng:', error);
          }
        }
      } catch (error) {
        console.error('Lỗi tải chi tiết đồ uống:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải chi tiết đồ uống...</p>
        </div>
      </div>
    );
  }

  if (!drink) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-gray-600">Không tìm thấy đồ uống</p>
        </div>
      </div>
    );
  }

  const images = normalizeImages(drink.image_url);
  console.log('Drink data:', drink);
  console.log('Normalized images:', images);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Hình ảnh với Swiper */}
        <div>
          <div className="rounded-xl overflow-hidden shadow-lg">
            <Swiper
              modules={[Navigation, Thumbs, FreeMode, Pagination]}
              navigation
              pagination={{ clickable: true }}
              loop={images.length > 1}
              thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
              className="w-full h-96"
            >
              {images.map((src, idx) => (
                <SwiperSlide key={idx}>
                  <img 
                    src={src} 
                    alt={`${drink.name}-${idx}`} 
                    className="w-full h-96 object-cover" 
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
          
          {/* Thumbnail Swiper */}
          {images.length > 1 && (
            <div className="mt-4">
              <Swiper
                modules={[FreeMode, Thumbs]}
                onSwiper={setThumbsSwiper}
                spaceBetween={8}
                slidesPerView={Math.min(4, images.length)}
                freeMode
                watchSlidesProgress
                className="thumbs-swiper"
              >
                {images.map((src, idx) => (
                  <SwiperSlide key={idx}>
                    <div className="w-full h-20 rounded-lg overflow-hidden border-2 border-transparent hover:border-purple-500 transition cursor-pointer">
                      <img 
                        src={src} 
                        alt={`thumb-${drink.name}-${idx}`} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          )}
        </div>

        {/* Thông tin chi tiết */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{drink.name}</h1>
            {drink.category && (
              <p className="text-lg text-gray-600 mb-4">Danh mục: {drink.category.name}</p>
            )}
            {drink.size && (
              <p className="text-lg text-gray-600 mb-4">Kích cỡ: {drink.size}</p>
            )}
          </div>

          {/* Giá */}
          <div className="bg-gray-50 p-4 rounded-lg">
            {drink.salePrice ? (
              <div className="flex items-center space-x-4">
                <span className="text-red-600 text-3xl font-bold">
                  {Number(drink.salePrice).toLocaleString()}₫
                </span>
                <span className="text-gray-400 line-through text-xl">
                  {Number(drink.price).toLocaleString()}₫
                </span>
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-semibold">
                  -{Math.round(((drink.price - drink.salePrice) / drink.price) * 100)}%
                </span>
              </div>
            ) : (
              <span className="text-gray-900 text-3xl font-bold">
                {Number(drink.price).toLocaleString()}₫
              </span>
            )}
          </div>

          {/* Thông tin bổ sung */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className={`p-3 rounded-lg ${drink.stock <= 0 ? 'bg-red-50' : 'bg-blue-50'}`}>
              <p className={`font-semibold ${drink.stock <= 0 ? 'text-red-600' : 'text-blue-600'}`}>
                Tồn kho
              </p>
              <p className={drink.stock <= 0 ? 'text-red-800' : 'text-blue-800'}>
                {drink.stock <= 0 ? 'Hết hàng' : `${drink.stock} sản phẩm`}
              </p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-green-600 font-semibold">Đã bán</p>
              <p className="text-green-800">{drink.sold || 0} sản phẩm</p>
            </div>
          </div>

          {/* Đánh giá */}
          <div className="flex items-center space-x-2">
            <div className="flex text-yellow-500">
              ★★★★★
            </div>
            <span className="text-gray-600">(0 đánh giá)</span>
          </div>

          {/* Chọn số lượng */}
          <div className="flex items-center space-x-4">
            <span className="text-gray-700 font-semibold">Số lượng:</span>
            <div className="flex items-center space-x-2">
              <button
                disabled={qty <= 1}
                onClick={() => setQty(q => Math.max(1, q - 1))}
                className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                -
              </button>
              <span className="w-12 text-center font-semibold">{qty}</span>
              <button
                disabled={qty >= drink.stock || drink.stock <= 0}
                onClick={() => setQty(q => Math.min(drink.stock, q + 1))}
                className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                +
              </button>
            </div>
          </div>

          {/* Nút thêm vào giỏ */}
          <button 
            disabled={drink.stock <= 0}
            className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition ${
              drink.stock <= 0 
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
            onClick={async () => {
              if (drink.stock <= 0) return;
              
              const token = getToken();
              if (!token) {
                navigate('/login');
                return;
              }
              try {
                await addToCart({ drinkId: drink.id, quantity: qty, token });
                setOpen(true);
                window.dispatchEvent(new Event('cart:updated'));
                setTimeout(() => setOpen(false), 1200);
              } catch (err) {
                alert(err?.response?.data?.message || err?.message || 'Lỗi');
              }
            }}
          >
            {drink.stock <= 0 ? 'Hết hàng' : 'Thêm vào giỏ hàng'}
          </button>

          <Modal
            open={open}
            title="Thành công"
            description="Đã thêm vào giỏ hàng!"
            onClose={() => setOpen(false)}
            actions={<button onClick={() => setOpen(false)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">OK</button>}
          />

          {/* Mô tả */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">Mô tả sản phẩm</h3>
            <p className="text-gray-700 whitespace-pre-line">
              {drink.description || 'Chưa có mô tả chi tiết.'}
            </p>
          </div>
        </div>
      </div>

      {/* Đánh giá sản phẩm */}
      <div className="mt-8">
        <ProductReviews drinkId={drink.id} userOrders={userOrders} />
      </div>
    </div>
  );
}
