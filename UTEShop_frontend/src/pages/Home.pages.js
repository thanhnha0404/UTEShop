import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getLatestProducts, getBestSellers, getMostViewed, getTopDiscount } from "../services/product.services";

function Section({ title, products }) {
  return (
    <section className="mb-10">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((p) => (
          <Link to={`/drink/${p.id}`} key={p.id} className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden">
            <div className="relative">
              <img src={p.image_url || "/logo192.png"} alt={p.name} className="w-full h-40 object-cover" />
              {p.salePrice && p.price && (
                <span className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                  -{Math.round(((p.price - p.salePrice) / p.price) * 100)}%
                </span>
              )}
            </div>
            <div className="p-3">
              <p className="font-semibold line-clamp-2 min-h-[40px]">{p.name}</p>
              <div className="mt-1 mb-2">
                {p.salePrice ? (
                  <>
                    <span className="text-red-600 font-bold mr-2">{Number(p.salePrice).toLocaleString()}₫</span>
                    <span className="text-gray-400 line-through text-sm">{Number(p.price).toLocaleString()}₫</span>
                  </>
                ) : (
                  <span className="text-gray-900 font-bold">{Number(p.price).toLocaleString()}₫</span>
                )}
              </div>
              <button 
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-3 rounded-lg text-sm font-semibold transition"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Đã thêm vào giỏ hàng!');
                }}
              >
                Thêm vào giỏ
              </button>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  const [latest, setLatest] = useState([]);
  const [best, setBest] = useState([]);
  const [viewed, setViewed] = useState([]);
  const [discount, setDiscount] = useState([]);

  useEffect(() => {
    (async () => {
      setLatest(await getLatestProducts());
      setBest(await getBestSellers());
      setViewed(await getMostViewed());
      setDiscount(await getTopDiscount());
    })();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-4">
      <Section title="Đồ uống mới nhất" products={latest} />
      <Section title="Bán chạy" products={best} />
      <Section title="Xem nhiều" products={viewed} />
      <Section title="Khuyến mãi cao" products={discount} />
    </div>
  );
}


