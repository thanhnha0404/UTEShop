import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProductDetail } from "../services/product.services";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Thumbs, FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/free-mode";
import "swiper/css/thumbs";

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

  useEffect(() => {
    (async () => {
      const data = await getProductDetail(id);
      setProduct(data);
      // reset thumbs when product changes
      setThumbsSwiper(null);
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
        <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
        {product.category && (
          <p className="text-sm text-gray-500 mb-3">Danh mục: {product.category.name}</p>
        )}
        <div className="mb-4">
          {product.salePrice ? (
            <>
              <span className="text-red-600 text-2xl font-bold mr-3">
                {Number(product.salePrice).toLocaleString()}₫
              </span>
              <span className="text-gray-400 line-through">
                {Number(product.price).toLocaleString()}₫
              </span>
            </>
          ) : (
            <span className="text-gray-900 text-2xl font-bold">
              {Number(product.price).toLocaleString()}₫
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600 mb-2">Tồn kho: {product.stock}</p>
        {product.size && (
          <p className="text-sm text-gray-600 mb-2">Kích cỡ: {product.size}</p>
        )}
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
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold">
          Thêm vào giỏ
        </button>
        <div className="mt-6 text-gray-700 whitespace-pre-line">
          {product.description}
        </div>
      </div>
    </div>
  );
}
